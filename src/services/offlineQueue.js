const KEY = 'nirika_offline_session_queue'

export function enqueue(table, payload) {
  try {
    const raw = localStorage.getItem(KEY)
    const q = raw ? JSON.parse(raw) : []
    q.push({ table, payload, ts: Date.now() })
    localStorage.setItem(KEY, JSON.stringify(q))
  } catch {}
}

export function getQueue() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function clearQueue() {
  try { localStorage.removeItem(KEY) } catch {}
}

export async function flush(supabase) {
  if (!supabase || !navigator.onLine) return
  const q = getQueue()
  if (q.length === 0) return

  const remaining = []
  for (const item of q) {
    try {
      const { error } = await supabase.from(item.table).insert(item.payload)
      if (error) throw error
    } catch {
      remaining.push(item)
    }
  }

  try { localStorage.setItem(KEY, JSON.stringify(remaining)) } catch {}
}
