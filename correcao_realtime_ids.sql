-- ============================================================
-- Correção 2026-11-19 (seguro rodar mais de uma vez)
-- 1. Liga o "tempo real" (Realtime) nas tabelas que o site escuta.
--    Só franchise_requests estava ligada: tópicos/posts apagados ou criados
--    não sumiam/apareciam na tela até recarregar a página.
-- 2. Corrige perfis cujo users.id não bate com o id do login (auth.users).
--    Esses usuários não conseguiam salvar perfil/progresso, e um admin nessa
--    situação não era reconhecido como admin pelo banco.
-- ============================================================

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','community_topics','community_replies','mural_posts','servicos_posts','servicos_replies','franchise_requests'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

UPDATE public.users u
SET id = au.id
FROM auth.users au
WHERE LOWER(au.email) = LOWER(u.email)
  AND u.id IS DISTINCT FROM au.id
  AND NOT EXISTS (SELECT 1 FROM public.users x WHERE x.id = au.id);

-- Verificação
SELECT 'realtime' AS tipo, tablename AS item FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
UNION ALL
SELECT 'id_ainda_errado', u.email FROM public.users u JOIN auth.users au ON LOWER(au.email) = LOWER(u.email)
WHERE u.id IS DISTINCT FROM au.id
ORDER BY 1, 2;
