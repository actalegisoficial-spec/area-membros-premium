-- ============================================================
-- SQL1: Estrutura base da tabela users + RLS
-- Execute PRIMEIRO este bloco no Supabase > SQL Editor
-- ============================================================

-- 1. Cria a coluna 'id' vinculada ao auth
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- 2. Vincula usuários existentes do login à tabela pelo e-mail
UPDATE public.users u
SET id = au.id
FROM auth.users au
WHERE LOWER(u.email) = LOWER(au.email) AND u.id IS NULL;

-- 3. Garante que o email seja único
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);

-- 4. Ativa as regras de segurança (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.users;
CREATE POLICY "Usuários podem ver todos os perfis"
ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem inserir o próprio perfil" ON public.users;
CREATE POLICY "Usuários podem inserir o próprio perfil"
ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Define você como administrador
UPDATE public.users SET role = 'Administrador' WHERE email = 'charlesnunes77@yahoo.com.br';


-- ============================================================
-- SQL2: Colunas extras + Políticas UPDATE do Admin
-- Execute DEPOIS do SQL1
-- ============================================================

-- 1. Colunas extras (seguro rodar múltiplas vezes)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- 2. Remove TODAS as policies UPDATE existentes (resolve qualquer conflito de nome/encoding)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE tablename = 'users' AND schemaname = 'public' AND cmd = 'UPDATE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

-- 3. Recria as policies UPDATE limpas
-- Permite que cada usuário atualize o próprio perfil
CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Permite que Administrador atualize qualquer usuário
CREATE POLICY "admins_update_all"
ON public.users FOR UPDATE
USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'Administrador'
);


-- ============================================================
-- Verificação final: lista todas as políticas criadas
-- ============================================================
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd, policyname;
