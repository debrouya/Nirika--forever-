import GlassBackground from '../design-system/components/GlassBackground'
import { useState, useMemo } from 'react'
import { Search, Plus, X, Apple, UtensilsCrossed, Target, ChevronLeft, Settings2 } from 'lucide-react'
import useStore from '../store/useStore'
import aliments from '../data/aliments'
import FeatureGuide from './FeatureGuide'

export default function NutritionTracker() {
  const store = useStore()
  const nutritionPlan = store.nutritionPlan || { dailyCalories: 2000, protein: 150, carbs: 200, fat: 65 }
  const setNutritionPlan = store.setNutritionPlan
  const nutritionMeals = store.nutritionMeals || []
  const addNutritionMeal = store.addNutritionMeal || (() => {})
  const removeNutritionMeal = store.removeNutritionMeal || (() => {})
  const pushView = store.pushView
  const [tab, setTab] = useState('journal')
  const [search, setSearch] = useState('')
  const [editingCalories, setEditingCalories] = useState(false)
  const [calInput, setCalInput] = useState(() => String(nutritionPlan?.dailyCalories || 2000))

  const filteredAliments = aliments.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = {}
  filteredAliments.forEach((a) => {
    if (!grouped[a.category]) grouped[a.category] = []
    grouped[a.category].push(a)
  })

  const addToMeal = (aliment) => {
    addNutritionMeal({ ...aliment, quantity: 1, mealType: 'snack' })
  }

  const removeFromMeal = (id) => removeNutritionMeal(id)

  const today = new Date().toISOString().slice(0, 10)
  const todayMeals = nutritionMeals.filter((m) => m.date === today)

  const totals = useMemo(() => {
    const cals = todayMeals.reduce((s, m) => s + m.calories * m.quantity, 0)
    const prots = todayMeals.reduce((s, m) => s + m.protein * m.quantity, 0)
    const carbs = todayMeals.reduce((s, m) => s + m.carbs * m.quantity, 0)
    const fats = todayMeals.reduce((s, m) => s + m.fat * m.quantity, 0)
    return {
      calories: Math.round(cals),
      protein: Math.round(prots * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fats * 10) / 10,
    }
  }, [todayMeals])

  const remaining = {
    calories: nutritionPlan.dailyCalories - totals.calories,
    protein: nutritionPlan.protein - totals.protein,
    carbs: nutritionPlan.carbs - totals.carbs,
    fat: nutritionPlan.fat - totals.fat,
  }

  const saveCalories = () => {
    const val = parseInt(calInput) || 2000
    setNutritionPlan({
      dailyCalories: val,
      protein: Math.round(val * 0.3 / 4),
      carbs: Math.round(val * 0.4 / 4),
      fat: Math.round(val * 0.3 / 9),
    })
    setEditingCalories(false)
  }

  return (
    <GlassBackground>
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => pushView('dashboard')} className="w-10 h-10 rounded-xl bg-dark-card flex items-center justify-center text-white border border-dark-border">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Nutrition</h2>
      </div>

      <FeatureGuide type="nutrition" />

      <div className="flex gap-2 mb-6">
        {['journal', 'aliments', 'objectifs'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-lime text-dark-bg' : 'bg-dark-card text-white/50 border border-dark-border'
            }`}
          >
            {t === 'journal' ? 'Journal' : t === 'aliments' ? 'Aliments' : 'Objectifs'}
          </button>
        ))}
      </div>

      {tab === 'journal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
              <p className="text-xs text-white/50">Calories</p>
              <p className="text-2xl font-bold text-white">{totals.calories}</p>
              <div className="h-2 rounded-full bg-white/10 mt-2">
                <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${Math.min(100, (totals.calories / nutritionPlan.dailyCalories) * 100)}%` }} />
              </div>
              <p className="text-xs text-white/40 mt-1">{remaining.calories > 0 ? `+${remaining.calories}` : remaining.calories} restantes</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
              <p className="text-xs text-white/50">Protéines</p>
              <p className="text-2xl font-bold text-blue-400">{totals.protein}g</p>
              <div className="h-2 rounded-full bg-white/10 mt-2">
                <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${Math.min(100, (totals.protein / nutritionPlan.protein) * 100)}%` }} />
              </div>
              <p className="text-xs text-white/40 mt-1">{nutritionPlan.protein - totals.protein}g restantes</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">Aliments ajoutés aujourd'hui</p>
            {todayMeals.length === 0 ? (
              <p className="text-center text-white/20 py-6 text-sm">Ajoute des aliments depuis l'onglet "Aliments"</p>
            ) : (
              todayMeals.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-card border border-dark-border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{m.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-white/50">
                        {Math.round(m.calories * m.quantity)} kcal · P{Math.round(m.protein * m.quantity)} · G{Math.round(m.carbs * m.quantity)} · L{Math.round(m.fat * m.quantity)}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeFromMeal(m.id)} className="text-red-400 p-1">
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'aliments' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3.5 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-white/30"
              placeholder="Rechercher un aliment..."
            />
          </div>

          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider py-2">
                  {category === 'viande' ? 'Viandes & Poissons' : category === 'féculent' ? 'Féculents' : category === 'legume' ? 'Légumes' : category === 'fruit' ? 'Fruits' : category === 'produit_laitier' ? 'Produits laitiers' : category === 'autre' ? 'Autres' : category}
                </p>
                {items.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => addToMeal(a)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-dark-card/60 text-white text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.icon}</span>
                      <span>{a.name}</span>
                      <span className="text-xs text-white/40 ml-1">({a.portion})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">{a.calories} kcal</span>
                      <Plus size={14} className="text-lime" />
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'objectifs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">Calories quotidiennes</p>
              <button onClick={() => { setEditingCalories(!editingCalories); setCalInput(nutritionPlan.dailyCalories.toString()) }}>
                <Settings2 size={16} className="text-white/40" />
              </button>
            </div>
            {editingCalories ? (
              <div className="flex gap-2">
                <input
                  value={calInput}
                  onChange={(e) => setCalInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white"
                  type="number"
                />
                <button onClick={saveCalories} className="px-4 py-2 rounded-lg bg-lime text-dark-bg font-medium text-sm">
                  OK
                </button>
              </div>
            ) : (
              <p className="text-3xl font-black text-lime">{nutritionPlan.dailyCalories}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Protéines', value: nutritionPlan.protein, unit: 'g', color: 'text-blue-400' },
              { label: 'Glucides', value: nutritionPlan.carbs, unit: 'g', color: 'text-orange-400' },
              { label: 'Lipides', value: nutritionPlan.fat, unit: 'g', color: 'text-yellow-400' },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-dark-card border border-dark-border text-center">
                <p className="text-xs text-white/50">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}{m.unit}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </GlassBackground>
  )
}
