import useStore from '../../store/useStore'
import { shallow } from 'zustand/shallow'

export const useSession = () => useStore(s => s.activeSession)

export const useProgram = () => useStore(s => s.activeProgram)

export const useWorkout = () => useStore(s => ({ sets: s.activeSession?.sets || [], exercise: s.activeSession?.exerciseName }), shallow)
