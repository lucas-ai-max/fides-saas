-- Tabela user_favorites: preferências de orações favoritas por usuário (Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, prayer_id)
);

-- Índice para listar favoritos por usuário
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites (user_id);

-- RLS: usuário só acessa seus próprios favoritos
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_favorites_select_own"
  ON public.user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_favorites_insert_own"
  ON public.user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_favorites_delete_own"
  ON public.user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
