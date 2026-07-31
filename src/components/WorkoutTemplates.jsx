import { useState } from 'react'
import { Plus, X, Play, Save, ChevronLeft, Edit, Trash2, Search } from 'lucide-react'
import useStore from '../store/useStore'
import exercises from '../data/exercises'
import FeatureGuide from './FeatureGuide'

export default function WorkoutTemplates() {
  const { workoutTemplates, addWorkoutTemplate, updateWorkoutTemplate, deleteWorkoutTemplate, pushView, setCurrentView, setCurrentWorkoutTemplate } = useStore()
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
    setCurrentWorkoutTemplate(template)
    pushView('daily-workout')
  }

  return (
    <div className="p-4">
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
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-dark-card border border-dark-border">
                <div>
                  <p className="text-white text-sm font-medium">{ex.name}</p>
                  <p className="text-xs text-white/50">{ex.sets}x{ex.reps}</p>
                </div>
                <button onClick={() => removeFromTemplate(idx)} className="text-red-400 p-1">
                  <X size={16} />
                </button>
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
            workoutTemplates.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-dark-card border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold">{t.name || 'Template'}</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startSession(t)} className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center text-lime">
                      <Play size={16} fill="currentColor" />
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
                  {t.exercises?.length || 0} exercices
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {[...new Set(t.exercises?.map(e => e.muscleGroup) || [])].map((g) => (
                    <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
