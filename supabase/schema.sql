-- =====================================================
-- NIRIKA FOREVER - Supabase Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== FUNCTIONS ====================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.users.raw_user_meta_data ->> 'role') = 'admin',
      FALSE
    )
    FROM auth.users
    WHERE auth.users.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-update profile email
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- ==================== TABLES ====================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT DEFAULT '',
  age INTEGER DEFAULT 25,
  sex TEXT DEFAULT 'Homme',
  weight NUMERIC DEFAULT 70,
  height NUMERIC DEFAULT 175,
  level TEXT DEFAULT 'debutant',
  frequency INTEGER DEFAULT 3,
  goals JSONB DEFAULT '[]'::jsonb,
  injuries JSONB DEFAULT '[]'::jsonb,
  location TEXT DEFAULT 'salle',
  equipment JSONB DEFAULT '[]'::jsonb,
  available_days JSONB DEFAULT '["Lun","Mar","Mer"]'::jsonb,
  session_duration INTEGER DEFAULT 60,
  medical_history TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  units TEXT DEFAULT 'metric',
  language TEXT DEFAULT 'fr',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  rest_timer_seconds INTEGER DEFAULT 90,
  auto_log BOOLEAN DEFAULT TRUE,
  share_progress BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises table
CREATE TABLE public.exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT DEFAULT 'none',
  difficulty TEXT DEFAULT 'moyen',
  description TEXT DEFAULT '',
  youtube_id TEXT DEFAULT '',
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs table
CREATE TABLE public.programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  level TEXT DEFAULT 'debutant',
  duration_weeks INTEGER DEFAULT 8,
  days_per_week INTEGER DEFAULT 3,
  goals JSONB DEFAULT '[]'::jsonb,
  structure JSONB DEFAULT '{}'::jsonb,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table (muscle training)
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL DEFAULT '',
  sets JSONB DEFAULT '[]'::jsonb,
  duration INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cardio sessions table
CREATE TABLE public.cardio_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  activity_name TEXT NOT NULL DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 0,
  calories INTEGER DEFAULT 0,
  distance NUMERIC DEFAULT 0,
  heart_rate_avg INTEGER,
  level_value NUMERIC DEFAULT 5,
  level_type TEXT DEFAULT 'resistance',
  notes TEXT DEFAULT '',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User programs table
CREATE TABLE public.user_programs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  program_name TEXT DEFAULT '',
  current_week INTEGER DEFAULT 1,
  current_day TEXT DEFAULT '',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_weeks JSONB DEFAULT '[]'::jsonb,
  custom_structure JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machine settings table
CREATE TABLE public.machine_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bench_angle INTEGER DEFAULT 0,
  squat_depth TEXT DEFAULT 'parallel',
  bar_type TEXT DEFAULT 'olympic',
  weights_available JSONB DEFAULT '[1.25,2.5,5,10,15,20,25]'::jsonb,
  rest_presets JSONB DEFAULT '{"compact":60,"normal":90,"long":120}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (Stripe)
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);

-- ==================== INDEXES ====================

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_exercise_id ON public.sessions(exercise_id);
CREATE INDEX idx_sessions_completed_at ON public.sessions(completed_at);
CREATE INDEX idx_sessions_user_date ON public.sessions(user_id, completed_at DESC);

CREATE INDEX idx_cardio_sessions_user_id ON public.cardio_sessions(user_id);
CREATE INDEX idx_cardio_sessions_activity_id ON public.cardio_sessions(activity_id);
CREATE INDEX idx_cardio_sessions_completed_at ON public.cardio_sessions(completed_at);
CREATE INDEX idx_cardio_sessions_user_date ON public.cardio_sessions(user_id, completed_at DESC);

CREATE INDEX idx_user_programs_program_id ON public.user_programs(program_id);

CREATE INDEX idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON public.exercises(equipment);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty);

CREATE INDEX idx_programs_level ON public.programs(level);
CREATE INDEX idx_programs_goals ON public.programs USING gin(goals);

-- ==================== UPDATED_AT TRIGGER ====================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_programs_updated_at
  BEFORE UPDATE ON public.user_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_machine_settings_updated_at
  BEFORE UPDATE ON public.machine_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_settings ENABLE ROW LEVEL SECURITY;

-- SUBSCRIPTIONS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (public.is_admin());

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- USER_SETTINGS
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all settings"
  ON public.user_settings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all settings"
  ON public.user_settings FOR UPDATE
  USING (public.is_admin());

-- EXERCISES
CREATE POLICY "Anyone can view exercises"
  ON public.exercises FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can insert exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update exercises"
  ON public.exercises FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete exercises"
  ON public.exercises FOR DELETE
  USING (public.is_admin());

CREATE POLICY "Users can insert custom exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = TRUE);

CREATE POLICY "Users can update own custom exercises"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = created_by AND is_custom = TRUE);

CREATE POLICY "Users can delete own custom exercises"
  ON public.exercises FOR DELETE
  USING (auth.uid() = created_by AND is_custom = TRUE);

-- PROGRAMS
CREATE POLICY "Anyone can view programs"
  ON public.programs FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can insert programs"
  ON public.programs FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update programs"
  ON public.programs FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete programs"
  ON public.programs FOR DELETE
  USING (public.is_admin());

CREATE POLICY "Users can insert custom programs"
  ON public.programs FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = TRUE);

CREATE POLICY "Users can update own custom programs"
  ON public.programs FOR UPDATE
  USING (auth.uid() = created_by AND is_custom = TRUE);

CREATE POLICY "Users can delete own custom programs"
  ON public.programs FOR DELETE
  USING (auth.uid() = created_by AND is_custom = TRUE);

-- SESSIONS
CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.sessions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can delete all sessions"
  ON public.sessions FOR DELETE
  USING (public.is_admin());

-- CARDIO_SESSIONS
CREATE POLICY "Users can view own cardio sessions"
  ON public.cardio_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cardio sessions"
  ON public.cardio_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cardio sessions"
  ON public.cardio_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all cardio sessions"
  ON public.cardio_sessions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can delete all cardio sessions"
  ON public.cardio_sessions FOR DELETE
  USING (public.is_admin());

-- USER_PROGRAMS
CREATE POLICY "Users can view own program"
  ON public.user_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own program"
  ON public.user_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own program"
  ON public.user_programs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own program"
  ON public.user_programs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user programs"
  ON public.user_programs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all user programs"
  ON public.user_programs FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete all user programs"
  ON public.user_programs FOR DELETE
  USING (public.is_admin());

-- MACHINE_SETTINGS
CREATE POLICY "Users can view own machine settings"
  ON public.machine_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own machine settings"
  ON public.machine_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own machine settings"
  ON public.machine_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all machine settings"
  ON public.machine_settings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all machine settings"
  ON public.machine_settings FOR UPDATE
  USING (public.is_admin());

-- ==================== ADMIN RPC FUNCTIONS ====================

CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  RETURN QUERY
  SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data ->> 'full_name', '') AS full_name,
    COALESCE(au.raw_user_meta_data ->> 'role', 'user') AS role,
    au.created_at,
    au.last_sign_in_at AS last_sign_in
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_get_user_stats(target_user_id UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  total_cardio BIGINT,
  total_volume NUMERIC,
  last_session TIMESTAMPTZ,
  streak INTEGER
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.sessions WHERE user_id = target_user_id) AS total_sessions,
    (SELECT COUNT(*) FROM public.cardio_sessions WHERE user_id = target_user_id) AS total_cardio,
    (SELECT COALESCE(SUM(
      (elem->>'reps')::NUMERIC * COALESCE((elem->>'weight')::NUMERIC, 0)
    ), 0)
    FROM public.sessions s,
         jsonb_array_elements(s.sets) elem
    WHERE s.user_id = target_user_id
    ) AS total_volume,
    (SELECT MAX(completed_at) FROM public.sessions WHERE user_id = target_user_id) AS last_session,
    0 AS streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', new_role)
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== PUSH NOTIFICATIONS ====================

CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Admin stats view (defined after all tables)
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT COUNT(*) FROM auth.users) AS total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE level IS NOT NULL) AS profiles_with_data,
  (SELECT COUNT(*) FROM public.sessions) AS total_sessions,
  (SELECT COUNT(*) FROM public.cardio_sessions) AS total_cardio_sessions,
  (SELECT AVG(sessions_count) FROM (
    SELECT user_id, COUNT(*) AS sessions_count
    FROM public.sessions
    GROUP BY user_id
  ) sub) AS avg_sessions_per_user,
  (SELECT MAX(created_at) FROM public.sessions) AS last_session_at;

CREATE OR REPLACE FUNCTION public.admin_send_push(
  title TEXT,
  body TEXT,
  target_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  -- Actual sending is done via Edge Function
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
