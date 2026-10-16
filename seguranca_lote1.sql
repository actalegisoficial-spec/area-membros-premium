-- ============================================================
-- LOTE 1 - Seguranca: impede que alunos alterem campos de admin
-- Cole no Supabase > SQL Editor > New query > Run
-- Seguro rodar mais de uma vez.
-- ============================================================
-- Problema: a regra "users_update_own" deixa cada aluno editar a
-- propria linha INTEIRA - inclusive is_blocked, role e verified.
-- Ou seja, um aluno bloqueado (ou curioso) poderia se desbloquear
-- ou se tornar Administrador pelo console do navegador.
--
-- Solucao: um gatilho que, para quem NAO e administrador,
-- mantem os valores antigos desses campos.
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_role TEXT;
BEGIN
    -- Sem usuario logado (SQL Editor / service role): permite tudo
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT role INTO caller_role FROM public.users WHERE id = auth.uid();

    IF caller_role IS DISTINCT FROM 'Administrador' THEN
        NEW.role       := OLD.role;
        NEW.is_blocked := OLD.is_blocked;
        NEW.verified   := OLD.verified;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_admin_fields ON public.users;
CREATE TRIGGER trg_protect_admin_fields
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.protect_admin_fields();

-- Novos cadastros sempre entram como Aluno e desbloqueados
CREATE OR REPLACE FUNCTION public.protect_admin_fields_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL
       AND LOWER(NEW.email) <> 'charlesnunes77@yahoo.com.br' THEN
        NEW.role       := 'Aluno';
        NEW.is_blocked := false;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_admin_fields_insert ON public.users;
CREATE TRIGGER trg_protect_admin_fields_insert
BEFORE INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.protect_admin_fields_insert();

-- Verificacao: deve listar os 2 gatilhos
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.users'::regclass AND NOT tgisinternal;
