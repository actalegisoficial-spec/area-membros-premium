-- ============================================================
-- LOTE 2 - Segurança do banco (Supabase > SQL Editor > Run)
-- Seguro rodar mais de uma vez (idempotente).
-- ============================================================
-- Problema encontrado em 2026-11-19: existe uma regra "Acesso Total"
-- em 6 tabelas que deixa QUALQUER usuário logado alterar ou apagar
-- QUALQUER linha (virar Administrador, desbloquear-se, apagar posts
-- e perfis dos outros). Como o cadastro é aberto, isso vale para
-- qualquer pessoa da internet que crie uma conta.
--
-- Este script:
--  1. Cria funções auxiliares is_admin() e is_active().
--  2. Remove as regras "Acesso Total".
--  3. Recria regras certas: cada um mexe no que é seu; admin modera tudo;
--     bloqueado não escreve.
--  4. Curtidas no Mural continuam funcionando, mas quem não é dono do post
--     só consegue colocar/tirar a PRÓPRIA curtida.
--  5. Ativa os gatilhos do Lote 1 (protege role, is_blocked, verified).
-- O front-end (app.js) não precisa mudar para este script.
-- ============================================================

BEGIN;

-- ---------- 1. Funções auxiliares ----------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'Administrador' AND COALESCE(is_blocked, false) = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_blocked = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_me(e text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT e IS NOT NULL AND LOWER(e) = LOWER(auth.email());
$$;

-- ---------- 2. Remove "Acesso Total" ----------
DROP POLICY IF EXISTS "Acesso Total" ON public.users;
DROP POLICY IF EXISTS "Acesso Total" ON public.community_topics;
DROP POLICY IF EXISTS "Acesso Total" ON public.community_replies;
DROP POLICY IF EXISTS "Acesso Total" ON public.mural_posts;
DROP POLICY IF EXISTS "Acesso Total" ON public.servicos_posts;
DROP POLICY IF EXISTS "Acesso Total" ON public.servicos_replies;

-- ---------- 3a. users ----------
-- (SELECT público e INSERT do próprio perfil continuam como estão)
DROP POLICY IF EXISTS "admins_update_all" ON public.users;
CREATE POLICY "admins_update_all" ON public.users FOR UPDATE
  USING (public.is_admin());

-- ---------- 3b. Comunidade, Mural, Serviços ----------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['community_topics','community_replies','mural_posts','servicos_posts','servicos_replies'] LOOP
    -- INSERT: logado, não bloqueado, e só em nome de si mesmo
    EXECUTE format('DROP POLICY IF EXISTS "lote2_insert" ON public.%I', t);
    EXECUTE format('CREATE POLICY "lote2_insert" ON public.%I FOR INSERT TO authenticated
                    WITH CHECK (public.is_active() AND public.is_me(user_email))', t);
    -- DELETE: o próprio autor (não bloqueado) ou um admin
    EXECUTE format('DROP POLICY IF EXISTS "lote2_delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "lote2_delete" ON public.%I FOR DELETE TO authenticated
                    USING ((public.is_active() AND public.is_me(user_email)) OR public.is_admin())', t);
  END LOOP;
END $$;

-- Regras antigas substituídas pelas de cima
DROP POLICY IF EXISTS "Authenticated users can create topics"   ON public.community_topics;
DROP POLICY IF EXISTS "Users can delete own topics"             ON public.community_topics;
DROP POLICY IF EXISTS "Authenticated users can reply"           ON public.community_replies;
DROP POLICY IF EXISTS "Users can delete own replies"            ON public.community_replies;
DROP POLICY IF EXISTS "Authenticated users can post to mural"   ON public.mural_posts;
DROP POLICY IF EXISTS "Users can delete own mural posts"        ON public.mural_posts;
DROP POLICY IF EXISTS "Authenticated users can post services"   ON public.servicos_posts;
DROP POLICY IF EXISTS "Users can delete own services"           ON public.servicos_posts;
DROP POLICY IF EXISTS "Users can update/finalize own services"  ON public.servicos_posts;

-- servicos_replies só tinha "Acesso Total": precisa de leitura para logados
DROP POLICY IF EXISTS "lote2_select" ON public.servicos_replies;
CREATE POLICY "lote2_select" ON public.servicos_replies FOR SELECT TO authenticated USING (true);

-- servicos_posts: autor finaliza/reativa o próprio anúncio; admin também
DROP POLICY IF EXISTS "lote2_update" ON public.servicos_posts;
CREATE POLICY "lote2_update" ON public.servicos_posts FOR UPDATE TO authenticated
  USING ((public.is_active() AND public.is_me(user_email)) OR public.is_admin());

-- mural_posts: qualquer logado ativo pode atualizar (para curtir),
-- e o gatilho abaixo limita o que quem não é dono pode mudar
DROP POLICY IF EXISTS "lote2_update" ON public.mural_posts;
CREATE POLICY "lote2_update" ON public.mural_posts FOR UPDATE TO authenticated
  USING (public.is_active());

-- Quem não é dono do post só pode colocar/tirar a própria curtida
CREATE OR REPLACE FUNCTION public.mural_protect_likes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me text := LOWER(auth.email());
  wants_like boolean;
  base text[];
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() OR public.is_me(OLD.user_email) THEN
    NEW.likes := COALESCE(cardinality(NEW.liked_by), 0);
    RETURN NEW;
  END IF;
  wants_like := EXISTS (SELECT 1 FROM unnest(COALESCE(NEW.liked_by, '{}')) x WHERE LOWER(x) = me);
  base := ARRAY(SELECT x FROM unnest(COALESCE(OLD.liked_by, '{}')) x WHERE LOWER(x) <> me);
  NEW := OLD;  -- nada além da curtida muda
  NEW.liked_by := CASE WHEN wants_like THEN base || me ELSE base END;
  NEW.likes := cardinality(NEW.liked_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mural_protect_likes ON public.mural_posts;
CREATE TRIGGER trg_mural_protect_likes
BEFORE UPDATE ON public.mural_posts
FOR EACH ROW EXECUTE FUNCTION public.mural_protect_likes();

-- ---------- 5. Gatilhos do Lote 1 (users) ----------
CREATE OR REPLACE FUNCTION public.protect_admin_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;  -- SQL Editor / service role
  IF NOT public.is_admin() THEN
    NEW.role       := OLD.role;
    NEW.is_blocked := OLD.is_blocked;
    NEW.verified   := OLD.verified;
    NEW.email      := OLD.email;
    NEW.id         := OLD.id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_admin_fields ON public.users;
CREATE TRIGGER trg_protect_admin_fields
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.protect_admin_fields();

CREATE OR REPLACE FUNCTION public.protect_admin_fields_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND LOWER(NEW.email) <> 'charlesnunes77@yahoo.com.br' THEN
    NEW.role       := 'Aluno';
    NEW.is_blocked := false;
    NEW.verified   := false;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_admin_fields_insert ON public.users;
CREATE TRIGGER trg_protect_admin_fields_insert
BEFORE INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.protect_admin_fields_insert();

COMMIT;

-- ---------- Verificação: lista regras e gatilhos ----------
SELECT 'regra' AS tipo, tablename || ' / ' || policyname || ' (' || cmd || ')' AS item
FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 'gatilho', tgrelid::regclass::text || ' / ' || tgname
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relnamespace = 'public'::regnamespace AND NOT t.tgisinternal
ORDER BY 1, 2;
