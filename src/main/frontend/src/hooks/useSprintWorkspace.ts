import { useEffect, useState } from 'react'
import { getApiError, sprintApi } from '../api/client'
import type { SprintWorkspace } from '../types/sprint'

export function useSprintWorkspace(sprintId: string | null, refreshKey: number) {
  const [workspace, setWorkspace] = useState<SprintWorkspace | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sprintId) {
      setWorkspace(null)
      setLoading(false)
      setError(null)
      return
    }
    let current = true
    setLoading(true)
    setError(null)
    Promise.all([
      sprintApi.getSprint(sprintId),
      sprintApi.getAnalysis(sprintId),
      sprintApi.getHealth(sprintId),
      sprintApi.getPrediction(sprintId),
      sprintApi.getRisks(sprintId),
      sprintApi.getRecommendations(sprintId),
    ]).then(([sprint, analysis, health, prediction, risks, recommendations]) => {
      if (current) setWorkspace({ sprint, analysis, health, prediction, risks, recommendations })
    }).catch((reason: unknown) => {
      if (current) setError(getApiError(reason))
    }).finally(() => {
      if (current) setLoading(false)
    })
    return () => { current = false }
  }, [sprintId, refreshKey])

  return { workspace, loading, error }
}
