import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { Period } from '@/types'

export function usePeriods() {
  return useQuery({
    queryKey: QK.periods(),
    queryFn:  () => api.get<Period[]>('/periods'),
  })
}

export function useActivePeriod() {
  return useQuery({
    queryKey: [...QK.periods(), 'active'],
    queryFn:  () => api.get<Period | null>('/periods/active'),
  })
}

export function useCreatePeriod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Period, 'id' | 'created_at'>) =>
      api.post<Period>('/periods', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.periods() }),
  })
}

export function useUpdatePeriod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Period> & { id: string }) =>
      api.patch<Period>(`/periods/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.periods() }),
  })
}

export function useDeletePeriod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/periods/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.periods() }),
  })
}
