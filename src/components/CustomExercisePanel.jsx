import { useState } from 'react'
import { Plus, X, Edit, Trash2, Save, Dumbbell, ChevronRight, Sparkles, Clock, Target, Lightbulb } from 'lucide-react'
import useStore from '../store/useStore'
import { analyzeExercise } from '../services/supabaseService'

const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Jambes', 'Epaules', 'Bras', 'Abdominaux', 'Cardio']
const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'bands', 'other']
const DIFFICULTY_OPTIONS = ['facile', 'moyen', 'difficile']

const EQUIPMENT_LABELS = {
  barbell: 'Barre', dumbbell: 'Haltères', machine: 'Machine',
  cable: 'Câble', bodyweight: 'Poids du corps', bands: 'Élastiques', other: 'Autre',
}

function ExerciseForm({ exercise, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: exercise?.name || '',
    muscleGroup: exercise?.muscleGroup || 'Pectoraux',
    equipment: exercise?.equipment || 'bodyweight',
    difficulty: exercise?.difficulty || 'moyen',
    description: exercise?.description || '',
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, analysis })
  }

  const handleAnalyze = async () => {
    if (!form.name.trim()) return
    setAnalyzing(true)
    setAnalysis(null)
    try {
      const res = await analyzeExercise(form.name, form.description, form.muscleGroup)
      if (res?.analysis) setAnalysis(res.analysis)
    } catch {}
    setAnalyzing(false)
  }

  function formatRestTime(seconds) {
    if (seconds >= 60) return `${Math.floor(seconds / 60)}min${seconds % 60 > 0 ? ` ${seconds % 60}s` : ''}`
    return `${seconds}s`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Nom de l'exercice"
        className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-white text-sm placeholder:text-muted focus:outline-none focus:border-lime/50"
        autoFocus
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.muscleGroup}
          onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
          className="bg-dark-bg border border-dark-border rounded-xl py-3 px-3 text-white text-sm focus:outline-none focus:border-lime/50"
        >
          {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={form.equipment}
          onChange={(e) => setForm({ ...form, equipment: e.target.value })}
          className="bg-dark-bg border border-dark-border rounded-xl py-3 px-3 text-white text-sm focus:outline-none focus:border-lime/50"
        >
          {EQUIPMENT_OPTIONS.map((e) => <option key={e} value={e}>{EQUIPMENT_LABELS[e]}</option>)}
        </select>
      </div>
      <select
        value={form.difficulty}
        onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
        className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-3 text-white text-sm focus:outline-none focus:border-lime/50"
      >
        {DIFFICULTY_OPTIONS.map((d) => (
          <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
        ))}
      </select>
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description (optionnelle)"
        rows={3}
        className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-white text-sm placeholder:text-muted focus:outline-none focus:border-lime/50 resize-none"
      />

      {analysis && (
        <div className="bg-dark-bg rounded-xl p-3 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-lime" />
            <span className="text-lime text-[10px] font-semibold uppercase">Analyse IA</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock size={12} className="text-muted" />
            <span className="text-white/70">Repos : <strong className="text-white">{formatRestTime(analysis.restTime)}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Target size={12} className="text-muted" />
            <span className="text-white/70">Reps : <strong className="text-white">{analysis.recommendedReps}</strong></span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Lightbulb size={12} className="text-muted" />
              <span className="text-white/70">Conseils :</span>
            </div>
            {analysis.tips?.map((tip, i) => (
              <p key={i} className="text-white/50 text-[11px] pl-5">• {tip}</p>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing || !form.name.trim()}
          className="py-3 px-3 rounded-xl bg-lime/10 border border-lime/20 text-lime text-xs font-medium hover:bg-lime/20 transition-all disabled:opacity-30 flex items-center gap-1.5"
        >
          <Sparkles size={14} className={analyzing ? 'animate-pulse' : ''} />
          {analyzing ? 'Analyse...' : 'IA'}
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-lime text-dark-bg text-xs font-bold hover:bg-lime/90 transition-all flex items-center justify-center gap-2"
        >
          <Save size={14} /> {exercise ? 'Modifier' : 'Créer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-3 px-4 rounded-xl bg-dark-bg border border-dark-border text-muted text-xs hover:text-white transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}

export default function CustomExercisePanel({ onClose }) {
  const { customExercises, addCustomExercise, updateCustomExercise, deleteCustomExercise } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg animate-fade-in flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-dark-card flex items-center justify-center">
          <X size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-sm">Mes exercices</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null) }}
          className="w-10 h-10 rounded-full bg-lime flex items-center justify-center"
        >
          <Plus size={20} className="text-dark-bg" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showForm && (
          <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
            <ExerciseForm
              exercise={editingId ? customExercises.find((e) => e.id === editingId) : null}
              onSave={(data) => {
                if (editingId) updateCustomExercise(editingId, data)
                else addCustomExercise(data)
                setShowForm(false)
                setEditingId(null)
              }}
              onCancel={() => { setShowForm(false); setEditingId(null) }}
            />
          </div>
        )}

        {customExercises.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-lime/10 flex items-center justify-center mx-auto mb-4">
              <Dumbbell size={28} className="text-lime" />
            </div>
            <p className="text-white font-semibold text-sm mb-1">Aucun exercice personnalisé</p>
            <p className="text-muted text-xs">Crée tes propres exercices avec le bouton +</p>
          </div>
        )}

        {customExercises.map((ex) => (
          <div key={ex.id} className="bg-dark-card rounded-2xl p-4 border border-dark-border">
            {editingId === ex.id ? (
              <ExerciseForm
                exercise={ex}
                onSave={(data) => { updateCustomExercise(ex.id, data); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{ex.name}</h3>
                    <p className="text-muted text-[10px]">{ex.muscleGroup} · {EQUIPMENT_LABELS[ex.equipment] || ex.equipment}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(ex.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Edit size={14} className="text-muted" />
                    </button>
                    <button onClick={() => deleteCustomExercise(ex.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
                {ex.description && (
                  <p className="text-white/50 text-xs leading-relaxed">{ex.description}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
