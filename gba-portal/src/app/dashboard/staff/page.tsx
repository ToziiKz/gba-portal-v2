import { Suspense } from 'react'
import { getStaffMembers } from './actions'
import { StaffClient } from './StaffClient'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export default async function DashboardStaffPage() {
  const staffMembers = await getStaffMembers()

  return (
    <Suspense fallback={<StaffLoading />}>
      <StaffClient initialMembers={staffMembers} />
    </Suspense>
  )
}

function StaffLoading() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">Module</p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Staff (annuaire)
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">Chargement de l’effectif…</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="premium-card card-shell rounded-3xl">
            <CardHeader>
              <CardDescription className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <CardTitle className="h-8 w-16 animate-pulse rounded bg-white/10" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="premium-card card-shell rounded-3xl h-[600px] flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="h-6 w-32 animate-pulse rounded bg-white/10" />
          </CardHeader>
          <div className="p-4 grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-white/5 border border-white/10"
              />
            ))}
          </div>
        </Card>
        <Card className="premium-card card-shell rounded-3xl h-[600px] flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/10 animate-pulse" />
          </div>
        </Card>
      </div>
    </div>
  )
}
