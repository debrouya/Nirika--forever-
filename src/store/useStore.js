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
      addSetToSession: (set) =>
        set((state) => {
          if (!state.activeSession) return state
          return {
            activeSession: {
              ...state.activeSession,
              sets: [...state.activeSession.sets, { ...set, timestamp: new Date().toISOString() }],
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

      subscription: null,
      setSubscription: (sub) => set({ subscription: sub }),
    }),
    {
      name: 'nf-storage',
      version: 1,
    }
  )
)

export default useStore
