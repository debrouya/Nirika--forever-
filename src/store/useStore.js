import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      setCurrentView: (view) => set({ currentView: view }),

      profile: {
        name: '',
        age: 25,
        sex: 'Homme',
        weight: 70,
        height: 175,
        level: 'debutant',
        frequency: 3,
        goals: [],
        injuries: [],
        location: 'salle',
        equipment: [],
        availableDays: ['Lun', 'Mar', 'Mer'],
        sessionDuration: 60,
        medicalHistory: '',
      },
      setProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      workoutHistory: [],
      addWorkout: (workout) =>
        set((state) => ({
          workoutHistory: [
            ...state.workoutHistory,
            { ...workout, id: Date.now(), completedAt: new Date().toISOString() },
          ],
        })),
      removeWorkout: (id) =>
        set((state) => ({
          workoutHistory: state.workoutHistory.filter((w) => w.id !== id),
        })),

      getStreak: () => {
        const { workoutHistory } = get()
        if (workoutHistory.length === 0) return 0

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const completedDates = [
          ...new Set(
            workoutHistory
              .map((w) => {
                const d = new Date(w.completedAt)
                d.setHours(0, 0, 0, 0)
                return d.getTime()
              })
              .sort((a, b) => b - a)
          ),
        ]

        let streak = 0
        let checkDate = new Date(today)

        for (let i = 0; i < completedDates.length; i++) {
          if (completedDates[i] === checkDate.getTime()) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else if (i === 0 && completedDates[i] < checkDate.getTime()) {
            break
          } else {
            break
          }
        }

        return streak
      },

      activeSession: null,
      startSession: (exerciseId, exerciseName) =>
        set({
          activeSession: {
            exerciseId,
            exerciseName,
            sets: [],
            startedAt: new Date().toISOString(),
          },
        }),
      endSession: () => {
        const { activeSession, sessionHistory } = get()
        if (activeSession) {
          const completed = {
            ...activeSession,
            endedAt: new Date().toISOString(),
            duration: Math.round(
              (Date.now() - new Date(activeSession.startedAt).getTime()) / 1000
            ),
          }
          set({
            activeSession: null,
            sessionHistory: [...sessionHistory, completed],
          })
        }
      },
      cancelSession: () => set({ activeSession: null }),
      addSetToSession: (setData) =>
        set((state) => {
          if (!state.activeSession) return state
          return {
            activeSession: {
              ...state.activeSession,
              sets: [...state.activeSession.sets, { ...setData, timestamp: new Date().toISOString() }],
            },
          }
        }),
      activeSessionDuration: () => {
        const { activeSession } = get()
        if (!activeSession) return 0
        return Math.round(
          (Date.now() - new Date(activeSession.startedAt).getTime()) / 1000
        )
      },

      sessionHistory: [],
      addSessionToHistory: (session) =>
        set((state) => ({
          sessionHistory: [...state.sessionHistory, session],
        })),
      clearSessionHistory: () => set({ sessionHistory: [] }),

      getSessionsForDay: (year, month, day) => {
        const { sessionHistory } = get()
        return sessionHistory.filter((s) => {
          const d = new Date(s.startedAt)
          return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
        })
      },

      // ==================== EXERCISE HISTORY ====================
      exerciseHistory: {},
      addExerciseRecord: (exerciseId, record) =>
        set((state) => {
          const existing = state.exerciseHistory[exerciseId] || []
          return {
            exerciseHistory: {
              ...state.exerciseHistory,
              [exerciseId]: [...existing, { ...record, id: Date.now(), date: new Date().toISOString() }],
            },
          }
        }),
      getExerciseHistory: (exerciseId) => {
        return get().exerciseHistory[exerciseId] || []
      },
      getLatestRecord: (exerciseId) => {
        const history = get().exerciseHistory[exerciseId] || []
        return history.length > 0 ? history[history.length - 1] : null
      },

      // ==================== RECOMMENDATIONS ENGINE ====================
      getRecommendations: () => {
        const { workoutHistory, sessionHistory, exerciseHistory, profile } = get()
        const allSessions = [...workoutHistory, ...sessionHistory]
        const recommendations = []

        if (allSessions.length === 0) {
          recommendations.push({
            type: 'motivation',
            priority: 'high',
            title: 'Commence ta première séance !',
            desc: 'Ouvre les Exercices ou Cardio et lance ta première séance.',
            icon: '🚀',
          })
          return recommendations
        }

        // 1. Missing muscle groups this week
        const now = new Date()
        const weekAgo = new Date(now - 7 * 86400000)
        const thisWeekSessions = allSessions.filter((s) => new Date(s.completedAt || s.date) >= weekAgo)
        const muscleGroupsWorked = new Set(thisWeekSessions.map((s) => s.muscleGroup || s.exerciseName).filter(Boolean))
        const allMuscles = ['Pectoraux', 'Dos', 'Epaules', 'Jambes', 'Abdominaux', 'Bras']
        const missing = allMuscles.filter((m) => !muscleGroupsWorked.has(m))

        if (missing.length > 0 && missing.length < 5) {
          recommendations.push({
            type: 'coverage',
            priority: 'high',
            title: `${missing.length} groupe${missing.length > 1 ? 's' : ''} non travaillé${missing.length > 1 ? 's' : ''} cette semaine`,
            desc: `${missing.join(', ')} — essaie de les inclure dans tes prochaines séances.`,
            icon: '⚠️',
          })
        }

        // 2. Consistency check
        const completedDates = new Set(
          allSessions.map((s) => new Date(s.completedAt || s.date).toISOString().slice(0, 10))
        )
        const daysSinceFirstSession = Math.max(1, Math.floor((now - new Date(Math.min(...[...completedDates].map(d => new Date(d).getTime())))) / 86400000))
        const frequency = completedDates.size / Math.max(1, daysSinceFirstSession) * 7
        const targetFreq = profile.frequency || 3

        if (frequency < targetFreq * 0.7) {
          recommendations.push({
            type: 'consistency',
            priority: 'high',
            title: 'Régularité en baisse',
            desc: `Tu t'entraînes ~${Math.round(frequency)}x/semaine vs ${targetFreq}x objectif. Reprends le rythme !`,
            icon: '📅',
          })
        }

        // 3. Volume progression
        const exerciseIds = Object.keys(exerciseHistory)
        exerciseIds.forEach((exId) => {
          const history = exerciseHistory[exId]
          if (history.length < 2) return
          const last = history[history.length - 1]
          const prev = history[history.length - 2]
          if (last.totalVolume && prev.totalVolume) {
            const change = ((last.totalVolume - prev.totalVolume) / prev.totalVolume) * 100
            if (change > 10) {
              recommendations.push({
                type: 'progression',
                priority: 'medium',
                title: `Progression sur ${last.exerciseName || exId}`,
                desc: `Volume +${Math.round(change)}% — tu progresses, continue !`,
                icon: '📈',
              })
            } else if (change < -15) {
              recommendations.push({
                type: 'regression',
                priority: 'medium',
                title: `Baisse de performance`,
                desc: `${last.exerciseName || exId} — volume ${Math.round(change)}%. Vérifie ta récupération.`,
                icon: '⚠️',
              })
            }
          }
        })

        // 4. Recovery check
        const lastSession = allSessions[allSessions.length - 1]
        if (lastSession) {
          const hoursSince = (now - new Date(lastSession.completedAt || lastSession.date)) / 3600000
          if (hoursSince < 24) {
            recommendations.push({
              type: 'recovery',
              priority: 'low',
              title: 'Récupère bien',
              desc: `Dernière séance il y a ${Math.round(hoursSince)}h. Hydrate-toi et repose-toi.`,
              icon: '😴',
            })
          }
        }

        // 5. Streak motivation
        const streak = get().getStreak()
        if (streak >= 3) {
          recommendations.push({
            type: 'motivation',
            priority: 'low',
            title: `${streak} jours d'affilée ! 🔥`,
            desc: 'Continue comme ça, tu es sur une belle série.',
            icon: '🏆',
          })
        }

        // 6. No session today
        const todayStr = now.toISOString().slice(0, 10)
        if (!completedDates.has(todayStr)) {
          recommendations.push({
            type: 'motivation',
            priority: 'medium',
            title: 'Pas encore de séance aujourd\'hui',
            desc: 'Une petite séance même courte fait toujours du bien.',
            icon: '💪',
          })
        }

        return recommendations.sort((a, b) => {
          const p = { high: 0, medium: 1, low: 2 }
          return (p[a.priority] || 2) - (p[b.priority] || 2)
        }).slice(0, 6)
      },

      subscription: null,
      setSubscription: (sub) => set({ subscription: sub }),
    }),
    {
      name: 'nf-storage',
      version: 1,
      partialize: (state) => {
        const { activeSession, ...rest } = state
        return rest
      },
    }
  )
)

export default useStore
