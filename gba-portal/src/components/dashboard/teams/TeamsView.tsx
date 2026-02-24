'use client'

import * as React from 'react'
import type { DashboardRole } from '@/lib/dashboardRole'
import { Card, CardContent } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { CreateTeamModal } from './CreateTeamModal'

export type TeamWithCoach = {
  id: string
  name: string
  category: string
  pole: string | null
  gender: string | null
  coach_id: string | null
  coach?: { full_name: string | null } | null
  players?: { count: number }[] | null
}

type Props = {
  initialTeams: TeamWithCoach[]
  role?: DashboardRole
}

export function TeamsView({ initialTeams, role = 'coach' }: Props) {
  // ... (keep existing logic)
  const [teams, setTeams] = React.useState(initialTeams)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  // Only Admin can modify teams structure
  const canWrite = role === 'admin'

  return (
    <div className="grid gap-6">
      {canWrite && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateOpen(true)}>Ajouter une équipe</Button>
          <CreateTeamModal 
            isOpen={isCreateOpen} 
            onClose={() => setIsCreateOpen(false)}
            onCreated={() => window.location.reload()} 
          />
        </div>
      )}

      {/* Team Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id} className="card-shell premium-card rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{team.name}</h3>
                  <p className="text-xs uppercase tracking-widest text-white/50 mt-1">
                    {team.category} • {team.pole || 'SANS PÔLE'}
                  </p>
                </div>
                {team.players?.[0]?.count ? (
                  <Pill variant="neutral">
                    {team.players[0].count} joueurs
                  </Pill>
                ) : null}
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span className="w-16 text-xs uppercase tracking-wider text-white/40">Coach</span>
                  {team.coach?.full_name ? (
                    <span className="font-medium text-white">{team.coach.full_name}</span>
                  ) : (
                    <span className="italic text-white/30">Non assigné</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span className="w-16 text-xs uppercase tracking-wider text-white/40">Genre</span>
                  <span>{team.gender || 'Mixte'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
