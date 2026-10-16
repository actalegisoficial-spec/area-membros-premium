-- Tabela de Solicitações de Franquia (Para rodar no Supabase no futuro)

CREATE TABLE IF NOT EXISTS public.franchise_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configuração de RLS (Row Level Security)
ALTER TABLE public.franchise_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
-- 1. Qualquer usuário autenticado (Membro) pode criar SUA PRÓPRIA solicitação
CREATE POLICY "Users can insert their own franchise requests"
ON public.franchise_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Membros só podem ver as suas próprias solicitações (para status)
CREATE POLICY "Users can view their own requests"
ON public.franchise_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Apenas Administradores podem ler todas as solicitações
CREATE POLICY "Admins can view all franchise requests"
ON public.franchise_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'Administrador'
  )
);

-- 4. Apenas Administradores podem atualizar as solicitações (aprovar/recusar)
CREATE POLICY "Admins can update franchise requests"
ON public.franchise_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'Administrador'
  )
);
