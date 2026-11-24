import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { Day, Activity, Obstacle, ObstacleCategory, DayProgress } from '@/types'

// ---- Days ----

export function useDays(periodId: string) {
  return useQuery({
    queryKey: QK.days(periodId),
    queryFn:  () => api.get<Day[]>(`/days?period_id=${periodId}`),
    enabled: !!periodId,
  })
}

export function useDay(id: string) {
  return useQuery({
    queryKey: QK.day(id),
    queryFn:  () => api.get<Day>(`/days/${id}`),
    enabled: !!id,
  })
}

export function useUpdateDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Day> & { id: string }) =>
      api.patch<Day>(`/days/${id}`, data),
    onSuccess: (day) => {
      qc.invalidateQueries({ queryKey: QK.day(day.id) })
      qc.invalidateQueries({ queryKey: QK.dayProgress(day.period_id) })
      qc.invalidateQueries({ queryKey: QK.periodSummary(day.period_id) })
    },
  })
}

export function useDayProgress(periodId: string) {
  return useQuery({
    queryKey: QK.dayProgress(periodId),
    queryFn:  () => api.get<DayProgress[]>(`/days/progress?period_id=${periodId}`),
    enabled: !!periodId,
  })
}

// ---- Activities ----

export function useActivities(dayId: string) {
  return useQuery({
    queryKey: QK.activities(dayId),
    queryFn:  () => api.get<Activity[]>(`/activities?day_id=${dayId}`),
    enabled: !!dayId,
  })
}

export function useUpdateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Activity> & { id: string }) =>
      api.patch<Activity>(`/activities/${id}`, data),
    onSuccess: (activity) => {
      qc.invalidateQueries({ queryKey: QK.activities(activity.day_id) })
    },
  })
}

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Activity, 'id' | 'updated_at'>) =>
      api.post<Activity>('/activities', data),
    onSuccess: (activity) => {
      qc.invalidateQueries({ queryKey: QK.activities(activity.day_id) })
    },
  })
}

export function useDeleteActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dayId }: { id: string; dayId: string }) =>
      api.delete(`/activities/${id}`).then(() => ({ dayId })),
    onSuccess: ({ dayId }) => {
      qc.invalidateQueries({ queryKey: QK.activities(dayId) })
    },
  })
}

export function useReorderActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, urutan }: { id: string; urutan: number; dayId: string }) =>
      api.patch<Activity>(`/activities/${id}`, { urutan }),
    onSuccess: (activity) => {
      qc.invalidateQueries({ queryKey: QK.activities(activity.day_id) })
    },
  })
}

// ---- Obstacles ----

export function useObstacles(activityId: string) {
  return useQuery({
    queryKey: QK.obstacles(activityId),
    queryFn:  () => api.get<Obstacle[]>(`/obstacles?activity_id=${activityId}`),
    enabled: !!activityId,
  })
}

export function useUpsertObstacle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Obstacle> & { activity_id: string }) =>
      api.post<Obstacle>('/obstacles/upsert', data),
    onSuccess: (obs) => {
      qc.invalidateQueries({ queryKey: QK.obstacles(obs.activity_id) })
    },
  })
}

// ---- Obstacle Categories ----

export function useObstacleCategories() {
  return useQuery({
    queryKey: QK.obstacleCategories(),
    queryFn:  () => api.get<ObstacleCategory[]>('/obstacle-categories'),
    staleTime: Infinity,
  })
}
