-- ============================================================
-- Permite que ADMINISTRADORES excluam pedidos de franquia
-- (lixeira na tabela "Possíveis Parceiros" da aba Usuários - v2.4)
-- Seguro rodar mais de uma vez. Depende de public.is_admin() (seguranca_lote2.sql).
-- ============================================================
DROP POLICY IF EXISTS "Admins can delete franchise requests" ON public.franchise_requests;
CREATE POLICY "Admins can delete franchise requests" ON public.franchise_requests
  FOR DELETE TO authenticated
  USING (public.is_admin());

SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'franchise_requests'
ORDER BY cmd, policyname;
