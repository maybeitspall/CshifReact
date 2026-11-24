// Query keys terpusat — semua key React Query di sini
// Pola: ['entity', ...params]

export const QK = {
  periods: () => ['periods'] as const,
  period: (id: string) => ['periods', id] as const,

  days: (periodId: string) => ['days', periodId] as const,
  day: (id: string) => ['days', 'detail', id] as const,
  dayByNomor: (periodId: string, nomor: number) =>
    ['days', periodId, 'nomor', nomor] as const,

  activities: (dayId: string) => ['activities', dayId] as const,

  obstacles: (activityId: string) => ['obstacles', activityId] as const,

  obstacleCategories: () => ['obstacle-categories'] as const,

  syntheses: (periodId: string) => ['syntheses', periodId] as const,

  dayProgress: (periodId: string) => ['day-progress', periodId] as const,

  periodSummary: (periodId: string) => ['period-summary', periodId] as const,

  notifPrefs: () => ['notif-prefs'] as const,
} as const
