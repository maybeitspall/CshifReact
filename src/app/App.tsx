import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppShell from './AppShell'
import Skeleton from '@/components/ui/Skeleton'

// Lazy load semua layar kecuali HariIni (rute default)
const HariIni    = lazy(() => import('@/features/day/HariIni'))
const Kalender   = lazy(() => import('@/features/day/Kalender'))
const Dashboard  = lazy(() => import('@/features/dashboard/Dashboard'))
const Analisis   = lazy(() => import('@/features/dashboard/Analisis'))
const Sintesis   = lazy(() => import('@/features/synthesis/Sintesis'))
const Pengaturan = lazy(() => import('@/features/settings/Pengaturan'))
const DetailHari = lazy(() => import('@/features/day/DetailHari'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Skeleton />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/hari-ini" replace />} />
            <Route path="/hari-ini"    element={<HariIni />} />
            <Route path="/kalender"    element={<Kalender />} />
            <Route path="/hari/:id"    element={<DetailHari />} />
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/analisis"    element={<Analisis />} />
            <Route path="/sintesis"    element={<Sintesis />} />
            <Route path="/pengaturan"  element={<Pengaturan />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
