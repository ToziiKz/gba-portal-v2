import { PlayersView, type PlayerWithTeam } from '@/components/dashboard/players/PlayersView'
import { getScopedRosterData } from '@/lib/dashboard/server-data'

export const metadata = {
  title: 'Joueurs · GBA Dashboard',
}

export default async function PlayersPage() {
  const { scope, players, teams } = await getScopedRosterData()

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">Module</p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Joueurs
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          {scope.role === 'coach'
            ? 'Effectif de votre pôle (lecture).'
            : "Gestion de l'effectif complet."}
        </p>
      </div>

      <PlayersView
        initialPlayers={(players ?? []) as unknown as PlayerWithTeam[]}
        teams={(teams ?? []).map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  )
}
