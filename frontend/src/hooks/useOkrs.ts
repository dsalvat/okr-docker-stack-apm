import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchOkrs, fetchOkr, evaluateObjective, evaluateKr } from '@/lib/api'

export function useOkrs() {
  return useQuery({ queryKey: ['okrs'], queryFn: fetchOkrs })
}

export function useOkr(id: string) {
  return useQuery({ queryKey: ['okr', id], queryFn: () => fetchOkr(id) })
}

export function useEvaluateObjective() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (objective: string) => evaluateObjective(objective),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['okrs'] })
  })
}

export function useEvaluateKr() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: evaluateKr,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['okrs'] })
  })
}
