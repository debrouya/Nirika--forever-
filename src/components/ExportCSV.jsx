import { Download } from 'lucide-react'
import useStore from '../store/useStore'

export default function ExportCSV() {
  const { workoutHistory, sessionHistory, exerciseHistory, weightHistory } = useStore()

  const exportData = () => {
    const lines = []

    // Header
    lines.push('Date,Type,Nom,Duration(min),Calories,Muscle Group,Exercises')

    // Workout history
    workoutHistory.forEach(w => {
      const date = new Date(w.completedAt || w.date).toLocaleDateString('fr-FR')
      lines.push([
        date,
        w.type || 'workout',
        w.programName || w.activityName || w.exerciseName || '',
        w.duration || w.durationMinutes || 0,
        w.calories || 0,
        w.muscleGroup || '',
        w.exerciseCount || '',
      ].join(','))
    })

    // Session history
    sessionHistory.forEach(s => {
      const date = new Date(s.date || s.startedAt).toLocaleDateString('fr-FR')
      lines.push([
        date,
        'session',
        s.exerciseName || '',
        Math.round((s.duration || 0) / 60),
        s.calories || 0,
        s.muscleGroup || '',
        s.sets?.length || 0,
      ].join(','))
    })

    // Weight history
    if (weightHistory.length > 0) {
      lines.push('')
      lines.push('--- POIDS ---')
      lines.push('Date,Poids(kg),Note')
      weightHistory.forEach(w => {
        const date = new Date(w.date).toLocaleDateString('fr-FR')
        lines.push(`${date},${w.weight},"${w.note || ''}"`)
      })
    }

    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nirika-export-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={exportData}
      className="bg-dark-card rounded-2xl p-4 border border-dark-border w-full text-left active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <Download size={22} className="text-muted" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Exporter les données</p>
          <p className="text-muted text-xs">CSV avec toutes tes séances</p>
        </div>
      </div>
    </button>
  )
}
