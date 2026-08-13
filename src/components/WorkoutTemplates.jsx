import GlassBackground from '../design-system/components/GlassBackground'
import { useState } from 'react'
import { Plus, X, Play, Save, ChevronLeft, Edit, Trash2, Search, Copy } from 'lucide-react'
import useStore from '../store/useStore'
import exercises from '../data/exercises'
import FeatureGuide from './FeatureGuide'

export default function WorkoutTemplates() {
  const { workoutTemplates, addWorkoutTemplate, updateWorkoutTemplate, deleteWorkoutTemplate, pushView, setCurrentView, setPendingDailyWorkout } = useStore()
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('list')

  const filteredExercises = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.muscleGroup?.toLowerCase().includes(search.toLowerCase())
  )

  const groupedByMuscle = {}
  filteredExercises.forEach((e) => {
    const g = e.muscleGroup || 'Autre'
    if (!groupedByMuscle[g]) groupedByMuscle[g] = []
    groupedByMuscle[g].push(e)
  })

  const startNewTemplate = () => {
    const newTemplate = { name: 'Nouveau template', exercises: [], id: `temp_${Date.now()}` }
    setEditing(newTemplate)
    setTab('edit')
  }

  const addExerciseToTemplate = (ex) => {
    if (!editing) return
    setEditing({
      ...editing,
      exercises: [...editing.exercises, { ...ex, sets: 3, reps: '10' }],
    })
  }

  const removeFromTemplate = (idx) => {
    if (!editing) return
    setEditing({
      ...editing,
      exercises: editing.exercises.filter((_, i) => i !== idx),
    })
  }

  const updateExerciseField = (idx, field, value) => {
    if (!editing) return
    setEditing({
      ...editing,
      exercises: editing.exercises.map((ex, i) =>
        i === idx ? { ...ex, [field]: field === 'sets' ? Math.max(1, parseInt(value) || 1) : value } : ex
      ),
    })
  }

  const duplicateTemplate = (t) => {
    addWorkoutTemplate({ name: `${t.name} (copie)`, exercises: t.exercises })
  }

  const saveTemplate = () => {
    if (!editing) return
    if (editing.id && editing.id.startsWith('temp_')) {
      addWorkoutTemplate({ name: editing.name, exercises: editing.exercises })
    } else {
      updateWorkoutTemplate(editing.id, { name: editing.name, exercises: editing.exercises })
    }
    setEditing(null)
    setTab('list')
  }

  const startSession = (template) => {
    setPendingDailyWorkout(template)
    pushView('daily-workout')
  }

  return (
    <GlassBackground>
    <div className="nirika-page">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 rounded-xl bg-dark-card flex items-center justify-center text-white border border-dark-border">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Templates</h2>
      </div>

      <FeatureGuide type="templates" />

      {tab === 'edit' && editing ? (
        <div className="space-y-4">
          <input
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-white/30"
            placeholder="Nom du template"
          />

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3.5 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-white/30"
              placeholder="Rechercher un exercice..."
            />
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto">
            {Object.entries(groupedByMuscle).map(([group, exs]) => (
              <div key={group}>
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider py-2">{group}</p>
                {exs.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addExerciseToTemplate(ex)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-dark-card/60 text-white text-sm"
                  >
                    <span>{ex.name}</span>
                    <Plus size={16} className="text-lime" />
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">
              Exercices sélectionnés ({editing.exercises.length})
            </p>
            {editing.exercises.map((ex, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-dark-card border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm font-medium">{ex.name}</p>
                  <button onClick={() => removeFromTemplate(idx)} className="text-red-400 p-1">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/30 mb-1">Séries</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={ex.sets || 3}
                      onChange={(e) => updateExerciseField(idx, 'sets', e.target.value)}
                      className="w-16 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-center"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] text-white/30 mb-1">Reps</span>
                    <input
                      type="text"
                      value={ex.reps || '10'}
                      onChange={(e) => updateExerciseField(idx, 'reps', e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      placeholder="10, 8-12, 45s..."
                    />
                  </div>
                  <span className="text-[10px] text-white/20 mt-4">{ex.muscleGroup}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={saveTemplate}
            disabled={editing.exercises.length === 0}
            className="w-full py-3 rounded-xl bg-lime text-dark-bg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} /> Enregistrer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={startNewTemplate}
            className="w-full py-3 rounded-xl border-2 border-dashed border-dark-border text-white/50 font-medium hover:border-lime/50 hover:text-lime transition-colors"
          >
            <Plus size={20} className="inline mr-2" /> Nouveau template
          </button>

          {workoutTemplates.length === 0 ? (
            <p className="text-center text-white/30 py-8">Aucun template pour le moment</p>
          ) : (
            workoutTemplates.map((t) => {
              const totalSets = (t.exercises || []).reduce((sum, ex) => sum + (ex.sets || 0), 0)
              return (
                <div key={t.id} className="p-4 rounded-xl bg-dark-card border border-dark-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold">{t.name || 'Template'}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startSession(t)} className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center text-lime">
                        <Play size={16} fill="currentColor" />
                      </button>
                      <button onClick={() => duplicateTemplate(t)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white">
                        <Copy size={15} />
                      </button>
                      <button onClick={() => { setEditing(t); setTab('edit') }} className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteWorkoutTemplate(t.id)} className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">
                    {t.exercises?.length || 0} exercices · {totalSets} séries
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(t.exercises || []).slice(0, 4).map((e, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                        {e.name}
                      </span>
                    ))}
                    {(t.exercises || []).length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/20">
                        +{(t.exercises || []).length - 4}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[...new Set(t.exercises?.map(e => e.muscleGroup) || [])].map((g) => (
                      <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-lime/5 text-lime/50 border border-lime/10">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
    </GlassBackground>
  )
}