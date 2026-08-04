import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ==================== AUTH ====================

export async function signUp(email, password, metadata = {}) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.auth.signUp({ email, password, options: { data: metadata } })
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.auth.signOut()
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

export async function getSession() {
  if (!isSupabaseConfigured()) {
    return { data: { session: null }, error: null }
  }
  return await supabase.auth.getSession()
}

export async function getUser() {
  if (!isSupabaseConfigured()) {
    return { data: { user: null }, error: null }
  }
  return await supabase.auth.getUser()
}

// ==================== PROFILE ====================

export async function getProfile(userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function updateProfile(userId, updates) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('profiles').update(updates).eq('id', userId).select().single()
}

// ==================== SETTINGS ====================

export async function getSettings(userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('user_settings').select('*').eq('user_id', userId).single()
}

export async function upsertSettings(userId, settings) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' })
    .select()
    .single()
}

// ==================== SESSIONS ====================

export async function getSessions(userId, options = {}) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: 'Supabase not configured' } }
  }
  let query = supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options.from) query = query.gte('created_at', options.from)
  if (options.to) query = query.lte('created_at', options.to)
  if (options.exerciseId) query = query.eq('exercise_id', options.exerciseId)
  if (options.limit) query = query.limit(options.limit)

  return await query
}

export async function addSession(session) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('sessions').insert(session).select().single()
}

export async function deleteSession(sessionId, userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('sessions').delete().eq('id', sessionId).eq('user_id', userId)
}

// ==================== CARDIO ====================

export async function getCardioSessions(userId, options = {}) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: 'Supabase not configured' } }
  }
  let query = supabase
    .from('cardio_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options.from) query = query.gte('created_at', options.from)
  if (options.to) query = query.lte('created_at', options.to)
  if (options.activityId) query = query.eq('activity_id', options.activityId)
  if (options.limit) query = query.limit(options.limit)

  return await query
}

export async function addCardioSession(session) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('cardio_sessions').insert(session).select().single()
}

export async function deleteCardioSession(sessionId, userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('cardio_sessions').delete().eq('id', sessionId).eq('user_id', userId)
}

// ==================== PROGRAMS ====================

export async function getUserProgram(userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase
    .from('user_programs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
}

export async function upsertUserProgram(userId, programData) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase
    .from('user_programs')
    .upsert({ user_id: userId, ...programData }, { onConflict: 'user_id' })
    .select()
    .single()
}

export async function deleteUserProgram(userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('user_programs').delete().eq('user_id', userId)
}

// ==================== MACHINE SETTINGS ====================

export async function getMachineSettings(userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase
    .from('machine_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export async function upsertMachineSetting(userId, settings) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase
    .from('machine_settings')
    .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' })
    .select()
    .single()
}

// ==================== ADMIN ====================

export async function adminGetAllUsers() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: 'Supabase not configured' } }
  }
  return await supabase.rpc('admin_get_all_users')
}

export async function adminGetUserStats(userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.rpc('admin_get_user_stats', { target_user_id: userId })
}

export async function adminUpdateUserRole(userId, role) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.rpc('admin_update_user_role', {
    target_user_id: userId,
    new_role: role,
  })
}

export async function adminUpdateUserPermissions(userId, permissions) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase
    .from('profiles')
    .update({ permissions })
    .eq('id', userId)
    .select('permissions')
    .single()
}

export async function adminDeleteUser(userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.rpc('admin_delete_user', { target_user_id: userId })
}

export async function adminGetExercises() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('exercises').select('*').order('muscle_group')
}

export async function adminUpsertExercise(exercise) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase
    .from('exercises')
    .upsert(exercise, { onConflict: 'id' })
    .select()
    .single()
}

export async function adminDeleteExercise(exerciseId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('exercises').delete().eq('id', exerciseId)
}

export async function adminGetPrograms() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('programs').select('*').order('name')
}

export async function adminUpsertProgram(program) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase
    .from('programs')
    .upsert(program, { onConflict: 'id' })
    .select()
    .single()
}

export async function adminDeleteProgram(programId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  return await supabase.from('programs').delete().eq('id', programId)
}

// ==================== SUBSCRIPTIONS ====================

export async function getSubscription(userId) {
  if (!isSupabaseConfigured()) {
    return { data: { tier: 'free', status: 'active' }, error: null }
  }
  return await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export async function createCheckoutSession(priceId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { data: null, error: { message: 'Non connecté' } }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ priceId }),
  })

  if (!response.ok) throw new Error(`Stripe checkout failed: ${response.status}`)
  return await response.json()
}

export async function openCustomerPortal() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { data: null, error: { message: 'Non connecté' } }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const response = await fetch(`${supabaseUrl}/functions/v1/stripe-customer-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
  })
  if (!response.ok) throw new Error(`Stripe portal failed: ${response.status}`)
  return await response.json()
}

// ==================== ADMIN ====================

export async function adminUpdateSecret(name, value) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { data: null, error: { message: 'Non connecté' } }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-update-secret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ name, value }),
    })
    if (!response.ok) throw new Error(`Admin secret failed: ${response.status}`)
    return await response.json()
  } catch {
    return { error: 'Erreur de connexion' }
  }
}

// ==================== AI COACH ====================

export async function analyzeExercise(name, description, muscleGroup) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { data: null, error: { message: 'Non connecté' } }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const response = await fetch(`${supabaseUrl}/functions/v1/ai-coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ message: { name, description, muscleGroup }, type: 'analyze' }),
  })
  if (!response.ok) throw new Error(`AI coach analyze failed: ${response.status}`)

  return await response.json()
}

export async function askCoach(message, profile, history = []) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { data: null, error: { message: 'Non connecté' } }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const response = await fetch(`${supabaseUrl}/functions/v1/ai-coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ message, profile, history }),
  })
  if (!response.ok) throw new Error(`AI coach ask failed: ${response.status}`)

  return await response.json()
}
