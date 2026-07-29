import { useState, useEffect, useCallback } from 'react'
import { Activity, Heart, Flame, Footprints, RefreshCw, ChevronRight, Smartphone } from 'lucide-react'

const SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read'

function FitStat({ icon: Icon, label, value, unit, color = 'text-lime' }) {
  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-muted text-[10px] uppercase">{label}</span>
      </div>
      <p className="text-white text-xl font-bold">
        {value !== null ? value : '—'}
        {value !== null && <span className="text-muted text-xs font-normal ml-1">{unit}</span>}
      </p>
    </div>
  )
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h${m}min`
  return `${m}min`
}

export default function GoogleFit() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [data, setData] = useState(null)
  const [tokenClient, setTokenClient] = useState(null)

  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID,
        scope: SCOPES,
        callback: () => {},
      })
      setTokenClient(client)
    }
  }, [])

  const handleConnect = useCallback(() => {
    if (!tokenClient) return
    setLoading(true)
    tokenClient.callback = (response) => {
      if (response.access_token) {
        setConnected(true)
        setLoading(false)
        fetchFitData(response.access_token)
      } else {
        setLoading(false)
      }
    }
    tokenClient.requestAccessToken({ prompt: 'consent' })
  }, [tokenClient])

  const fetchFitData = async (token) => {
    setSyncing(true)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const nanoNow = now.getTime() * 1e6
    const nanoPast = sevenDaysAgo.getTime() * 1e6

    try {
      const [stepsRes, caloriesRes, heartRes, activityRes] = await Promise.allSettled([
        fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: sevenDaysAgo.getTime(),
            endTimeMillis: now.getTime(),
          }),
        }).then(r => r.json()),
        fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aggregateBy: [{ dataTypeName: 'com.google.calories.expended' }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: sevenDaysAgo.getTime(),
            endTimeMillis: now.getTime(),
          }),
        }).then(r => r.json()),
        fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aggregateBy: [{ dataTypeName: 'com.google.heart_rate.bpm' }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: sevenDaysAgo.getTime(),
            endTimeMillis: now.getTime(),
          }),
        }).then(r => r.json()),
        fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aggregateBy: [{ dataTypeName: 'com.google.activity.segment' }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: sevenDaysAgo.getTime(),
            endTimeMillis: now.getTime(),
          }),
        }).then(r => r.json()),
      ])

      const totalSteps = stepsRes.value?.bucket?.reduce((sum, b) => {
        const val = b.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0
        return sum + val
      }, 0) || 0

      const totalCalories = Math.round(caloriesRes.value?.bucket?.reduce((sum, b) => {
        const val = b.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0
        return sum + val
      }, 0) || 0)

      let avgHeartRate = null
      const heartPoints = heartRes.value?.bucket?.flatMap(b => b.dataset?.[0]?.point || []) || []
      if (heartPoints.length > 0) {
        const values = heartPoints.flatMap(p => p.value?.map(v => v.fpVal) || [])
        if (values.length > 0) {
          avgHeartRate = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        }
      }

      let activeMinutes = 0
      activityRes.value?.bucket?.forEach(b => {
        b.dataset?.[0]?.point?.forEach(p => {
          const name = p.value?.[0]?.stringVal || ''
          const ns = p.startTimeNanos
          const endNs = p.endTimeNanos
          if (name.toLowerCase() !== 'still' && ns && endNs) {
            activeMinutes += Math.round((parseInt(endNs) - parseInt(ns)) / 6e10)
          }
        })
      })

      setData({
        steps: totalSteps,
        calories: totalCalories,
        heartRate: avgHeartRate,
        activeMinutes,
        days: 7,
      })
    } catch {}
    setSyncing(false)
  }

  const handleSync = () => {
    if (!tokenClient) return
    tokenClient.callback = (response) => {
      if (response.access_token) fetchFitData(response.access_token)
    }
    tokenClient.requestAccessToken({ prompt: '' })
  }

  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-lime" />
          <h3 className="text-white font-semibold text-sm">Google Fit</h3>
        </div>
        {connected && (
          <button onClick={handleSync} disabled={syncing} className="text-muted hover:text-white transition-colors">
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {!connected ? (
        <div className="text-center py-4 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-lime/10 flex items-center justify-center mx-auto">
            <Smartphone size={28} className="text-lime" />
          </div>
          <p className="text-white/80 text-xs">
            Connecte tes données Google Fit pour un suivi précis de tes activités, calories et fréquence cardiaque
          </p>
          <button
            onClick={handleConnect}
            disabled={loading || !tokenClient}
            className="px-6 py-2.5 rounded-xl bg-lime text-dark-bg text-xs font-bold hover:bg-lime/90 transition-all disabled:opacity-40"
          >
            {loading ? 'Connexion...' : !tokenClient ? 'Chargement...' : 'Connecter Google Fit'}
          </button>
        </div>
      ) : syncing ? (
        <div className="flex items-center justify-center py-6">
          <RefreshCw size={20} className="text-muted animate-spin" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-2">
          <FitStat icon={Footprints} label="Pas (7j)" value={data.steps.toLocaleString('fr-FR')} unit="pas" />
          <FitStat icon={Flame} label="Calories (7j)" value={data.calories.toLocaleString('fr-FR')} unit="kcal" />
          <FitStat icon={Heart} label="FC moyenne" value={data.heartRate} unit="bpm" color="text-red-400" />
          <FitStat icon={Activity} label="Temps actif (7j)" value={formatDuration(data.activeMinutes * 60)} unit="" />
        </div>
      ) : (
        <p className="text-muted text-xs text-center py-2">Aucune donnée récupérée</p>
      )}

      {connected && (
        <p className="text-muted text-[10px] text-center">
          Données des 7 derniers jours • <button onClick={handleSync} className="text-lime hover:underline">Synchroniser</button>
        </p>
      )}
    </div>
  )
}
