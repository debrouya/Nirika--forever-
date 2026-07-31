import useNotifications from '../store/useNotifications'

const ICONS = {
  success: '✅',
  error: '❌',
  info: '💪',
  badge: '🏆',
  workout: '🏋️',
}

const COLORS = {
  success: 'border-lime/30 bg-lime/10 text-lime',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  badge: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  workout: 'border-lime/30 bg-lime/10 text-lime',
}

export default function Toasts() {
  const { toasts, removeToast } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-3 right-3 z-[100] max-w-lg mx-auto space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg animate-fade-in ${COLORS[t.type] || COLORS.info}`}
          onClick={() => removeToast(t.id)}
        >
          <span className="text-lg">{ICONS[t.type] || ICONS.info}</span>
          <p className="text-sm font-medium flex-1">{t.message}</p>
        </div>
      ))}
    </div>
  )
}
