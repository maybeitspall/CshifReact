import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { PeriodSummary } from '@/types'

export function usePeriodSummary(periodId?: string) {
  return useQuery({
    queryKey: QK.periodSummary(periodId ?? ''),
    queryFn:  () => api.get<PeriodSummary>(periodId ? `/summary/${periodId}` : '/summary'),
    enabled: true,
  })
}
