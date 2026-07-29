import { useMemo } from 'react'
import exercises from '../data/exercises'
import useStore from '../store/useStore'

export default function useExercises() {
  const customExercises = useStore(s => s.customExercises)
  return useMemo(() => [...exercises, ...customExercises], [customExercises])
}
