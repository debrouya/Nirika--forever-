import { supabase, isSupabaseConfigured } from '../lib/supabase'

const SUPPRESSED = ''

function canTrack() {
  try { return localStorage.getItem('nirika_analytics_optout') !== 'true' } catch { return false }
}

function sanitize(data = {}) {
  const clean = {}
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string' && (v.includes('@') || v.length > 200)) continue
    if (typeof v === 'number' || typeof v === 'boolean' || (typeof v === 'string' && v.length < 200)) clean[k] = v
  }
  return clean
}

export function track(event, data = {}) {
  if (!canTrack()) return
  try {
    const payload = { event, data: sanitize(data), ts: Date.now(), ua: navigator.userAgent.slice(0, 100) || SUPPRESSED }
    if (isSupabaseConfigured()) {
      supabase.from('analytics_events').insert(payload).then(() => {}).catch(() => {})
    }
  } catch {}
}

export function setOptOut(optOut) {
  try { localStorage.setItem('nirika_analytics_optout', optOut ? 'true' : 'false') } catch {}
}

export function getOptOut() {
  try { return localStorage.getItem('nirika_analytics_optout') === 'true' } catch { return false }
}
