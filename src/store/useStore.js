import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import exercises from '../data/exercises.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { track } from '../services/analytics'
import { enqueue } from '../services/offlineQueue'

function safeSave(table, payload) {
  if (!isSupabaseConfigured()) return
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return
    supabase.from(table).insert({ ...payload, user_id: user.id }).then(({ error }) => {
      if (error) enqueue(table, { ...payload, user_id: user.id })
    }).catch(() => enqueue(table, { ...payload, user_id: user.id }))
  }).catch(() => {})
}

const useStore = create(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      viewHistory: [],
      setCurrentView: (view) => { set({ currentView: view, viewHistory: [] }); requestAnimationFrame(() => { document.body.style.transform = 'translateZ(0)'; requestAnimationFrame(() => { document.body.style.transform = '' }) }) },
      pushView: (view) => set((state) => ({ currentView: view, viewHistory: [...state.viewHistory, state.currentView] })),
      popView: () => set((state) => {
        if (state.viewHistory.length === 0) return { currentView: 'dashboard' }
        const prev = state.viewHistory[state.viewHistory.length - 1]
        return { currentView: prev, viewHistory: state.viewHistory.slice(0, -1) }
      }),

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
      addWorkout: (workout) => {
        const completed = { ...workout, id: Date.now(), completedAt: new Date().toISOString() }
        safeSave('sessions', { type: 'workout', data: completed, completed_at: completed.completedAt })
        set((state) => ({
          workoutHistory: [...state.workoutHistory, completed],
        }))
      },
      removeWorkout: (id) =>
        set((state) => ({
          workoutHistory: state.workoutHistory.filter((w) => w.id !== id),
        })),

      getStreak: () => {
        const { workoutHistory, sessionHistory } = get()
        const all = [...workoutHistory, ...sessionHistory]
        if (all.length === 0) return 0

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const completedDates = [
          ...new Set(
            all
              .map((w) => {
                const d = new Date(w.completedAt || w.date || w.endedAt || w.startedAt)
                if (isNaN(d)) return null
                d.setHours(0, 0, 0, 0)
                return d.getTime()
              })
              .filter(Boolean)
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
      savedProgramState: null,
      setSavedProgramState: (state) => set({ savedProgramState: state }),
      startSession: (exerciseId, exerciseName, sessionType = 'exercise') => {
        const { activeSession } = get()
        if (activeSession) get().endSession()
        track('seance_lancee', { exerciseId, exerciseName, sessionType })
        set({
          activeSession: {
            exerciseId,
            exerciseName,
            sessionType,
            sets: [],
            startedAt: Date.now(),
            paused: false,
            pausedAt: null,
            totalPausedMs: 0,
          },
        })
      },
      pauseSession: () =>
        set((state) => {
          if (!state.activeSession || state.activeSession.paused) return state
          return { activeSession: { ...state.activeSession, paused: true, pausedAt: Date.now() } }
        }),
      resumeSession: () =>
        set((state) => {
          if (!state.activeSession || !state.activeSession.paused) return state
          const pauseDuration = state.activeSession.pausedAt ? Date.now() - state.activeSession.pausedAt : 0
          return { activeSession: { ...state.activeSession, paused: false, pausedAt: null, totalPausedMs: (state.activeSession.totalPausedMs || 0) + pauseDuration } }
        }),
      getElapsed: () => {
        const s = get().activeSession
        if (!s) return 0
        let extra = 0
        if (s.paused && s.pausedAt) extra = Date.now() - s.pausedAt
        return Math.floor((Date.now() - s.startedAt - (s.totalPausedMs || 0) - extra) / 1000)
      },
      endSession: () => {
        const { activeSession, sessionHistory } = get()
        if (activeSession) {
          const elapsed = Math.floor((Date.now() - activeSession.startedAt - (activeSession.totalPausedMs || 0)) / 1000)
          track('seance_terminee', { exerciseId: activeSession.exerciseId, exerciseName: activeSession.exerciseName, duration: elapsed })
          const completed = {
            ...activeSession,
            endedAt: new Date().toISOString(),
            duration: elapsed,
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
      addSessionToHistory: (session) => {
        const completed = { ...session, id: Date.now(), date: new Date().toISOString() }
        safeSave('sessions', { type: 'exercise', data: completed, completed_at: completed.date })
        set((state) => ({
          sessionHistory: [...state.sessionHistory, completed],
        }))
      },
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
      addExerciseRecord: (exerciseId, record) => {
        const completed = { ...record, id: Date.now(), date: new Date().toISOString() }
        safeSave('sessions', { type: 'exercise_record', exercise_id: exerciseId, data: completed, completed_at: completed.date })
        set((state) => {
          const existing = state.exerciseHistory[exerciseId] || []
          return {
            exerciseHistory: {
              ...state.exerciseHistory,
              [exerciseId]: [...existing, completed],
            },
          }
        })
      },
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
        const thisWeekSessions = allSessions.filter((s) => {
          try { const d = new Date(s.completedAt || s.date || s.endedAt || s.startedAt); return !isNaN(d) && d >= weekAgo } catch { return false }
        })
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
          allSessions.map((s) => {
            const d = s.completedAt || s.date || s.endedAt || s.startedAt
            if (!d) return null
            try { return new Date(d).toISOString().slice(0, 10) } catch { return null }
          }).filter(Boolean)
        )
        if (completedDates.size === 0) return recommendations
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

      // ==================== BADGES / ACHIEVEMENTS ====================
      badges: {},
      unlockBadge: (badgeId) =>
        set((state) => {
          if (state.badges[badgeId]) return state
          return {
            badges: {
              ...state.badges,
              [badgeId]: { unlockedAt: new Date().toISOString(), seen: false },
            },
          }
        }),
      markBadgeSeen: (badgeId) =>
        set((state) => ({
          badges: {
            ...state.badges,
            [badgeId]: { ...state.badges[badgeId], seen: true },
          },
        })),
      checkBadges: () => {
        const s = get()
        const allSessions = [...s.workoutHistory, ...s.sessionHistory]
        const totalSessions = allSessions.length
        const streak = s.getStreak()
        const exerciseCount = Object.keys(s.exerciseHistory).length
        const totalCalories = allSessions.reduce((sum, x) => sum + (x.calories || 0), 0)
        const totalDuration = allSessions.reduce((sum, x) => sum + (x.duration || x.durationMinutes || 0), 0)
        const firstSessionDate = allSessions.length > 0 ? new Date(Math.min(...allSessions.map(x => new Date(x.completedAt || x.date).getTime()))) : null
        const daysSinceFirst = firstSessionDate ? Math.floor((Date.now() - firstSessionDate.getTime()) / 86400000) : 0

        const definitions = {
          first_session: { condition: totalSessions >= 1, title: 'Premier Pas', desc: 'Première séance terminée', icon: '🎯', rarity: 'common' },
          five_sessions: { condition: totalSessions >= 5, title: 'En Route', desc: '5 séances terminées', icon: '🚀', rarity: 'common' },
          ten_sessions: { condition: totalSessions >= 10, title: 'Régulier', desc: '10 séances terminées', icon: '💪', rarity: 'common' },
          twenty_five_sessions: { condition: totalSessions >= 25, title: 'Déterminé', desc: '25 séances terminées', icon: '⚡', rarity: 'rare' },
          fifty_sessions: { condition: totalSessions >= 50, title: 'Infatigable', desc: '50 séances terminées', icon: '🔥', rarity: 'rare' },
          hundred_sessions: { condition: totalSessions >= 100, title: 'Centurion', desc: '100 séances terminées', icon: '👑', rarity: 'epic' },
          streak_3: { condition: streak >= 3, title: 'Série de 3', desc: '3 jours consécutifs', icon: '🔗', rarity: 'common' },
          streak_7: { condition: streak >= 7, title: 'Une Semaine', desc: '7 jours consécutifs', icon: '🗓️', rarity: 'rare' },
          streak_14: { condition: streak >= 14, title: 'Deux Semaines', desc: '14 jours consécutifs', icon: '💎', rarity: 'epic' },
          streak_30: { condition: streak >= 30, title: 'Légende', desc: '30 jours consécutifs', icon: '🏆', rarity: 'legendary' },
          calorie_1000: { condition: totalCalories >= 1000, title: 'Fournaise', desc: '1000 kcal brûlées', icon: '🔥', rarity: 'common' },
          calorie_5000: { condition: totalCalories >= 5000, title: 'Brûleur', desc: '5000 kcal brûlées', icon: '💥', rarity: 'rare' },
          calorie_10000: { condition: totalCalories >= 10000, title: 'Inferno', desc: '10 000 kcal brûlées', icon: '🌋', rarity: 'epic' },
          duration_10h: { condition: totalDuration >= 600, title: 'Endurant', desc: '10h d\'entraînement', icon: '⏱️', rarity: 'common' },
          duration_50h: { condition: totalDuration >= 3000, title: 'Marathonien', desc: '50h d\'entraînement', icon: '🏅', rarity: 'rare' },
          exercises_10: { condition: exerciseCount >= 10, title: 'Explorateur', desc: '10 exercices différents', icon: '🗺️', rarity: 'common' },
          exercises_30: { condition: exerciseCount >= 30, title: 'Polyvalent', desc: '30 exercices différents', icon: '🎨', rarity: 'rare' },
          week_4: { condition: daysSinceFirst >= 28, title: 'Un Mois', desc: '4 semaines d\'inscription', icon: '📅', rarity: 'common' },
          week_12: { condition: daysSinceFirst >= 84, title: 'Trimestre', desc: '3 mois d\'inscription', icon: '🌟', rarity: 'rare' },
        }

        let newUnlocked = []
        Object.entries(definitions).forEach(([id, def]) => {
          if (def.condition && !s.badges[id]) {
            newUnlocked.push({ id, ...def })
          }
        })

        if (newUnlocked.length > 0) {
          const newBadges = { ...s.badges }
          newUnlocked.forEach((b) => {
            newBadges[b.id] = { unlockedAt: new Date().toISOString(), seen: false }
          })
          set({ badges: newBadges })
        }
        return newUnlocked
      },
      getNewBadgeCount: () => {
        const { badges } = get()
        return Object.values(badges).filter((b) => !b.seen).length
      },

      // ==================== RECORDS PERSONNELS ====================
      getPersonalRecords: () => {
        const { exerciseHistory } = get()
        const records = {}

        Object.entries(exerciseHistory).forEach(([exerciseId, history]) => {
          if (!history || history.length === 0) return

          let maxWeight = 0
          let maxVolume = 0
          let maxReps = 0
          let bestDuration = 0
          let totalSessions = history.length

          history.forEach((record) => {
            const weight = record.weight || 0
            const reps = record.reps || 0
            const sets = record.sets || 1
            const volume = record.totalVolume || weight * reps * sets
            const duration = record.duration || 0

            if (weight > maxWeight) maxWeight = weight
            if (volume > maxVolume) maxVolume = volume
            if (reps > maxReps) maxReps = reps
            if (duration > bestDuration) bestDuration = duration
          })

          records[exerciseId] = {
            exerciseName: history[history.length - 1]?.exerciseName || exerciseId,
            maxWeight,
            maxVolume,
            maxReps,
            bestDuration,
            totalSessions,
            firstDate: history[0]?.date,
            lastDate: history[history.length - 1]?.date,
          }
        })

        return records
      },

      // ==================== POIDS CORPOREL ====================
      weightHistory: [],
      addWeightEntry: (weight, note) =>
        set((state) => ({
          weightHistory: [
            ...state.weightHistory,
            { weight, note: note || '', date: new Date().toISOString(), id: Date.now() },
          ],
        })),

      // ==================== NOTES DE SEANCE ====================
      sessionNotes: {},
      addSessionNote: (sessionId, note) =>
        set((state) => ({
          sessionNotes: {
            ...state.sessionNotes,
            [sessionId]: { ...note, date: new Date().toISOString() },
          },
        })),

      // ==================== WORKOUT DU JOUR ====================
      dailyWorkout: null,
      dailyWorkoutDate: null,
      pendingDailyWorkout: null,
      setPendingDailyWorkout: (w) => set({ pendingDailyWorkout: w }),
      clearPendingDailyWorkout: () => set({ pendingDailyWorkout: null }),
      generateDailyWorkout: () => {
        const s = get()
        const { profile, workoutHistory } = s
        const today = new Date().toISOString().slice(0, 10)

        if (s.dailyWorkoutDate === today && s.dailyWorkout) return s.dailyWorkout

        const last7Days = new Date(Date.now() - 7 * 86400000)
        const recentSessions = workoutHistory.filter(w => new Date(w.completedAt) >= last7Days)
        const recentMuscles = recentSessions.map(w => w.muscleGroup).filter(Boolean)
        const muscleCounts = {}
        recentMuscles.forEach(m => { muscleCounts[m] = (muscleCounts[m] || 0) + 1 })

        const allMuscles = ['Pectoraux', 'Dos', 'Epaules', 'Jambes', 'Abdominaux', 'Bras']
        const leastWorked = [...allMuscles].sort((a, b) => (muscleCounts[a] || 0) - (muscleCounts[b] || 0))

        const allExercises = s.getAllExercises ? s.getAllExercises() : exercises
        const targetCount = Math.min(8, Math.max(5, (profile?.frequency || 3) + 2))

        const selected = []
        let muscleIdx = 0
        while (selected.length < targetCount) {
          const muscle = leastWorked[muscleIdx % leastWorked.length]
          const pool = allExercises.filter(e => e.muscleGroup === muscle)
          const unused = pool.filter(e => !selected.find(se => se.id === e.id))
          if (unused.length > 0) {
            const pick = unused[Math.floor(Math.random() * unused.length)]
            selected.push({ ...pick, sets: 3, reps: '8-12' })
          }
          muscleIdx++
          if (muscleIdx > targetCount * 2) break
        }

        const targetMuscles = [...new Set(selected.map(e => e.muscleGroup))]

        const workout = {
          date: today,
          name: `Suggestion du ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`,
          targetMuscles,
          exercises: selected,
          estimatedDuration: selected.length * 8,
          estimatedCalories: selected.length * 40,
        }

        set({ dailyWorkout: workout, dailyWorkoutDate: today })
        return workout
      },

      subscription: null,
      setSubscription: (sub) => set({ subscription: sub }),

      // 30-Day Calisthenics Program Tracker
      calisthenie30: {
        startDate: null,
        completedDays: {},
        currentPhase: 1,
      },
      startCalisthenie30: () => {
        const today = new Date().toISOString().slice(0, 10)
        set({
          calisthenie30: {
            startDate: today,
            completedDays: {},
            currentPhase: 1,
          },
        })
      },
      completeCalisthenie30Day: (dayNumber, exercises) =>
        set((state) => {
          const completed = { ...state.calisthenie30.completedDays, [dayNumber]: new Date().toISOString() }
          const totalDone = Object.keys(completed).length
          const nextDay = totalDone + 1
          let currentPhase = 1
          if (nextDay > 20) currentPhase = 3
          else if (nextDay > 10) currentPhase = 2

          // Save to workoutHistory for Stats/Calendar
          const newWorkout = {
            id: Date.now(),
            type: 'calisthenie30',
            day: dayNumber,
            phase: currentPhase,
            exerciseCount: exercises?.length || 0,
            completedAt: new Date().toISOString(),
            duration: 30,
            calories: Math.round((exercises?.length || 6) * 8),
          }

          // Save individual exercises to exerciseHistory
          const newExerciseHistory = { ...state.exerciseHistory }
          if (exercises) {
            exercises.forEach(ex => {
              const existing = newExerciseHistory[ex.id] || []
              newExerciseHistory[ex.id] = [...existing, {
                id: Date.now() + Math.random(),
                date: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                exerciseName: ex.name,
                sets: 1,
                reps: 1,
                duration: 30,
                totalVolume: 0,
                source: 'calisthenie30',
                day: dayNumber,
              }]
            })
          }

          return {
            calisthenie30: {
              ...state.calisthenie30,
              completedDays: completed,
              currentPhase,
            },
            workoutHistory: [...state.workoutHistory, newWorkout],
            exerciseHistory: newExerciseHistory,
          }
        }),
      uncompleteCalisthenie30Day: (dayNumber) =>
        set((state) => {
          const completed = { ...state.calisthenie30.completedDays }
          delete completed[dayNumber]
          const totalDone = Object.keys(completed).length
          const nextDay = totalDone + 1
          let currentPhase = 1
          if (nextDay > 20) currentPhase = 3
          else if (nextDay > 10) currentPhase = 2
          return {
            calisthenie30: {
              ...state.calisthenie30,
              completedDays: completed,
              currentPhase,
            },
          }
        }),
      resetCalisthenie30: () =>
        set({
          calisthenie30: { startDate: null, completedDays: {}, currentPhase: 1 },
        }),

      activeProgram: null,
      startProgram: (program) => set({
        activeProgram: { ...program, currentDay: 0, currentStep: 0, startedAt: Date.now() }
      }),
      nextProgramExercise: () => set((state) => {
        if (!state.activeProgram) return state
        const p = state.activeProgram
        if (!p.days?.length) return state
        const day = p.days[p.currentDay]
        if (!day?.exercises?.length) return state
        const steps = day.exercises
        const next = Math.max(0, p.currentStep) + 1
        if (next < steps.length) return { activeProgram: { ...p, currentStep: next } }
        const nextDay = p.currentDay + 1
        if (nextDay >= (p.totalDays || 30)) return { activeProgram: null }
        return { activeProgram: { ...p, currentDay: nextDay, currentStep: 0 } }
      }),
      completeProgramDay: () => set((state) => {
        if (!state.activeProgram) return state
        const d = Math.round((Date.now() - state.activeProgram.startedAt) / 1000)
        const w = { exerciseName: `${state.activeProgram.name} Jour ${state.activeProgram.currentDay+1}`, duration: Math.floor(d/60), calories: Math.round(d*.15), type: 'program' }
        return { workoutHistory: [...state.workoutHistory, { ...w, id: Date.now(), completedAt: new Date().toISOString() }], activeProgram: { ...state.activeProgram, currentDay: state.activeProgram.currentDay+1, currentStep: 0 } }
      }),

      customExercises: [],
      addCustomExercise: (ex) =>
        set((state) => ({
          customExercises: [...state.customExercises, { ...ex, id: `custom_${Date.now()}` }],
        })),
      updateCustomExercise: (id, updates) =>
        set((state) => ({
          customExercises: state.customExercises.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      deleteCustomExercise: (id) =>
        set((state) => ({
          customExercises: state.customExercises.filter((e) => e.id !== id),
        })),
      getAllExercises: () => {
        const state = get()
        return [...exercises, ...state.customExercises]
      },

      plannedSessions: [],
      addPlannedWeek: (sessions) =>
        set((state) => {
          const dates = new Set(sessions.map((s) => s.date))
          const filtered = state.plannedSessions.filter((s) => !dates.has(s.date))
          return { plannedSessions: [...filtered, ...sessions] }
        }),

      workoutTemplates: [],
      addWorkoutTemplate: (template) =>
        set((state) => ({
          workoutTemplates: [...state.workoutTemplates, { ...template, id: `template_${Date.now()}` }],
        })),
      updateWorkoutTemplate: (id, updates) =>
        set((state) => ({
          workoutTemplates: state.workoutTemplates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteWorkoutTemplate: (id) =>
        set((state) => ({
          workoutTemplates: state.workoutTemplates.filter((t) => t.id !== id),
        })),
      currentWorkoutTemplate: null,
      setCurrentWorkoutTemplate: (template) => set({ currentWorkoutTemplate: template }),

      nutritionPlan: { dailyCalories: 2000, protein: 150, carbs: 200, fat: 65 },
      setNutritionPlan: (plan) => set({ nutritionPlan: { ...plan } }),

      progressPhotos: [],
      addProgressPhoto: (photo) =>
        set((state) => ({
          progressPhotos: [...state.progressPhotos, { ...photo, id: Date.now(), date: new Date().toISOString() }],
        })),
      deleteProgressPhoto: (id) =>
        set((state) => ({
          progressPhotos: state.progressPhotos.filter((p) => p.id !== id),
        })),

      nutritionMeals: [],
      addNutritionMeal: (aliment) =>
        set((state) => ({
          nutritionMeals: [...state.nutritionMeals, { ...aliment, id: Date.now(), date: new Date().toISOString().slice(0, 10) }],
        })),
      removeNutritionMeal: (id) =>
        set((state) => ({
          nutritionMeals: state.nutritionMeals.filter((m) => m.id !== id),
        })),

      formCheckNotes: [],
      addFormCheckNote: (exerciseName, note) =>
        set((state) => ({
          formCheckNotes: [...state.formCheckNotes, { exerciseName, note, date: new Date().toISOString(), id: Date.now() }],
        })),

      warmupHistory: [],
      addWarmupSession: (type) =>
        set((state) => ({
          warmupHistory: [...state.warmupHistory, { type, date: new Date().toISOString(), id: Date.now() }],
        })),
    }),
    {
      name: 'nf-storage',
      version: 1,
      onRehydrateStorage: () => (state, error) => {
        if (error) { console.warn('Storage corrupted, resetting.'); try { localStorage.removeItem('nf-storage') } catch {} }
        try {
          const snap = JSON.parse(sessionStorage.getItem('lv_snap'))
          if (snap && snap.startedAt && Date.now() - snap.startedAt < 4 * 60 * 60 * 1000 && snap.exerciseId) {
            useStore.setState({ activeSession: { exerciseId: snap.exerciseId, exerciseName: snap.exerciseName, sessionType: 'exercise', sets: snap.sets || [], startedAt: snap.startedAt, paused: true, pausedAt: Date.now(), totalPausedMs: snap.totalPausedMs || 0 } })
          }
        } catch {}
      },
      partialize: (state) => {
        const { activeSession, ...rest } = state
        return rest
      },
    }
  )
)

export default useStore
