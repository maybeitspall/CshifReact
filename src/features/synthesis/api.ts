import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { Synthesis } from '@/types'

export function useSyntheses(periodId: string) {
  return useQuery({
    queryKey: QK.syntheses(periodId),
    queryFn:  () => api.get<Synthesis[]>(`/syntheses?period_id=${periodId}`),
    enabled: !!periodId,
  })
}

export function useUpsertSynthesis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { period_id: string; jenis: Synthesis['jenis']; isi: string }) =>
      api.post<Synthesis>('/syntheses/upsert', data),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: QK.syntheses(s.period_id) })
    },
  })
}
