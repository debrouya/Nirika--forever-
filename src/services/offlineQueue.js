const KEY = 'nirika_offline_session_queue'
const MAX_QUEUE = 200

export function enqueue(table, payload) {
  try {
    const raw = localStorage.getItem(KEY)
    const q = raw ? JSON.parse(raw) : []
    const dup = q.find(i => i.table === table && i.payload.completed_at === payload.completed_at)
    if (dup) return
    q.push({ table, payload, ts: Date.now() })
    if (q.length > MAX_QUEUE) q.splice(0, q.length - MAX_QUEUE)
    try { localStorage.setItem(KEY, JSON.stringify(q)) } catch { /* quota exceeded */ }
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
  const byTable = {}
  for (const item of q) {
    if (!byTable[item.table]) byTable[item.table] = []
    byTable[item.table].push(item.payload)
  }

  for (const [table, rows] of Object.entries(byTable)) {
    try {
      const { error } = await supabase.from(table).insert(rows)
      if (error) throw error
    } catch {
      for (const row of rows) remaining.push(...q.filter(i => i.table === table && i.payload === row))
    }
  }

  try { localStorage.setItem(KEY, JSON.stringify(remaining)) } catch {}
}
