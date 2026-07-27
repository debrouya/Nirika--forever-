import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react'
import { onboardingQuestions, recommendationEngine, programs } from '../data/programs'
import useStore from '../store/useStore'
import GlassCard from './GlassCard'

function ProgressBar({ current, total }) {
  const pct = ((current + 1) / total) * 100
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-[10px] uppercase tracking-wide">
          Étape {current + 1} / {total}
        </span>
        <span className="text-white/40 text-[10px]">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-mint-500 to-mint-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function SelectionCard({ option, selected, onClick, type }) {
  const isSelected = type === 'multiple'
    ? Array.isArray(selected) && selected.includes(option.value)
    : selected === option.value

  return (
    <button
      onClick={onClick}
      className={`w-full glass rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-[0.98] ${
        isSelected ? 'border-2 border-mint-400 bg-mint-500/10' : 'hover:bg-white/10'
      }`}
    >
      <span className="text-2xl">{option.icon}</span>
      <div className="text-left flex-1">
        <p className="text-white font-medium text-sm">{option.label}</p>
        {option.subtitle && (
          <p className="text-white/40 text-xs">{option.subtitle}</p>
        )}
      </div>
      {isSelected && (
        <div className="w-6 h-6 rounded-full bg-mint-500 flex items-center justify-center">
          <Check size={14} className="text-black" />
        </div>
      )}
    </button>
  )
}

export default function Onboarding({ onDone }) {
  const { setProfile, profile } = useStore()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    goal: profile.goals?.[0] || null,
    experience: profile.level || null,
    frequency: profile.frequency || null,
    equipment: profile.location || null,
  })
  const [recommendations, setRecommendations] = useState(null)

  const totalSteps = onboardingQuestions.length
  const currentQuestion = onboardingQuestions[step]
  const isLastStep = step === totalSteps - 1
  const canProceed = currentQuestion.type === 'multiple'
    ? Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length > 0
    : answers[currentQuestion.id] !== null

  const handleSelect = useCallback(
    (value) => {
      setAnswers((prev) => {
        if (currentQuestion.type === 'multiple') {
          const current = Array.isArray(prev[currentQuestion.id]) ? prev[currentQuestion.id] : []
          const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value]
          return { ...prev, [currentQuestion.id]: updated.length > 0 ? updated : prev[currentQuestion.id] }
        }
        return { ...prev, [currentQuestion.id]: value }
      })
    },
    [currentQuestion]
  )

  const handleNext = useCallback(() => {
    if (isLastStep) {
      const recs = recommendationEngine(answers)
      const recommended = recs.map((id) => programs.find((p) => p.id === id)).filter(Boolean)
      setRecommendations(recommended)
      setProfile({
        goals: [answers.goal],
        level: answers.experience,
        frequency: answers.frequency,
        location: answers.equipment,
        availableDays: profile.availableDays,
      })
    } else {
      setStep((s) => s + 1)
    }
  }, [isLastStep, answers, setProfile, profile.availableDays])

  const handlePrev = useCallback(() => setStep((s) => Math.max(0, s - 1)), [])

  if (recommendations) {
    return (
      <div className="space-y-4 p-4">
        <GlassCard className="p-6 text-center space-y-4">
          <Sparkles size={40} className="text-mint-400 mx-auto" />
          <h2 className="text-white font-bold text-lg">Programmes Recommandés</h2>
          <p className="text-white/50 text-xs">
            {recommendations.length} programmes adaptés à ton profil
          </p>
        </GlassCard>

        <div className="space-y-2">
          {recommendations.map((program, i) => (
            <GlassCard key={program.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-mint-400 font-black text-lg">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{program.name}</p>
                  <p className="text-white/40 text-xs">{program.description.slice(0, 80)}...</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="bg-white/5 rounded-full px-2 py-0.5 text-[10px] text-white/50">
                  {program.level}
                </span>
                <span className="bg-white/5 rounded-full px-2 py-0.5 text-[10px] text-white/50">
                  {program.daysPerWeek}x / sem
                </span>
                <span className="bg-white/5 rounded-full px-2 py-0.5 text-[10px] text-white/50">
                  {program.durationWeeks} sem
                </span>
              </div>
            </GlassCard>
          ))}
        </div>

        <button
          onClick={onDone}
          className="w-full bg-mint-500 hover:bg-mint-400 text-black font-semibold rounded-xl py-3 text-sm transition-all"
        >
          C'est parti !
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <ProgressBar current={step} total={totalSteps} />

      <GlassCard className="p-5 space-y-4">
        <h2 className="text-white font-bold text-base text-center leading-snug">
          {currentQuestion.question}
        </h2>

        <div className="space-y-2">
          {currentQuestion.options.map((option) => (
            <SelectionCard
              key={option.value}
              option={option}
              selected={answers[currentQuestion.id]}
              onClick={() => handleSelect(option.value)}
              type={currentQuestion.type}
            />
          ))}
        </div>
      </GlassCard>

      <div className="flex gap-2">
        {step > 0 && (
          <button
            onClick={handlePrev}
            className="flex-1 glass rounded-xl py-3 text-white/50 hover:text-white text-sm font-medium transition-all flex items-center justify-center gap-1"
          >
            <ChevronLeft size={16} /> Précédent
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
            canProceed
              ? 'bg-mint-500 hover:bg-mint-400 text-black'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {isLastStep ? (
            <>
              <Sparkles size={16} /> Recommander
            </>
          ) : (
            <>
              Suivant <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
