import Link from 'next/link'
import { Search, UserRound, ArrowUpRight } from 'lucide-react'

import { getScopedRosterData } from '@/lib/dashboard/server-data'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  requestCreatePlayer,
  requestDeletePlayer,
  requestMovePlayer,
  requestUpdatePlayer,
} from '@/app/dashboard/effectif/actions'

type TeamRow = {
  id: string
  name: string
  category: string | null
  pole: string | null
}

type PlayerRow = {
  id: string
  firstname: string | null
  lastname: string | null
  team_id: string | null
  category?: string | null
  club_name?: string | null
  license_number?: string | null
  mobile_phone?: string | null
  email?: string | null
  gender?: string | null
  status_label?: string | null
  legal_guardian_name?: string | null
  address_street?: string | null
  address_zipcode?: string | null
  address_city?: string | null
}

function fullName(p: PlayerRow) {
  return `${p.firstname ?? ''} ${p.lastname ?? ''}`.trim() || 'Joueur sans nom'
}

function byName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
}

function formatPhone(phone?: string | null) {
  const raw = (phone ?? '').trim()
  if (!raw) return '—'
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 9 && (digits.startsWith('6') || digits.startsWith('7'))) return `0${digits}`
  if (digits.length === 11 && digits.startsWith('33') && (digits[2] === '6' || digits[2] === '7'))
    return `0${digits.slice(2)}`
  return raw
}

export default async function EffectifPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  const params = (await searchParams) ?? {}
  const q = (params.q ?? '').trim().toLowerCase()

  const { scope, teams, players } = await getScopedRosterData()
  const supabase = await createClient()
  const admin = createAdminClient()
  const db = scope.role === 'admin' || scope.role.startsWith('resp_') ? admin : supabase
  const { data: allTeams } = await db.from('teams').select('id, name').order('name')

  const teamList = (teams as TeamRow[]).map((t) => ({
    ...t,
    name: t.name ?? 'Équipe sans nom',
    category: t.category ?? '—',
    pole: t.pole ?? 'Pôle non défini',
  }))

  const playersByTeam = new Map<string, PlayerRow[]>()
  for (const p of players as PlayerRow[]) {
    if (!p.team_id) continue
    const arr = playersByTeam.get(p.team_id) ?? []
    arr.push(p)
    playersByTeam.set(p.team_id, arr)
  }

  const teamsWithPlayers = teamList
    .map((team) => {
      const roster = (playersByTeam.get(team.id) ?? [])
        .slice()
        .sort((a, b) => fullName(a).localeCompare(fullName(b), 'fr', { sensitivity: 'base' }))
      return {
        id: team.id,
        name: team.name,
        category: team.category,
        pole: team.pole,
        players: roster,
      }
    })
    .sort(byName)

  const teamOptions = ((allTeams as { id: string; name: string }[] | null) ?? teamList).map(
    (t) => ({
      id: t.id,
      name: t.name,
    })
  )

  const filteredTeams = teamsWithPlayers
    .map((team) => {
      if (!q) return team
      const teamMatch = `${team.name} ${team.category} ${team.pole}`.toLowerCase().includes(q)
      const filteredPlayers = team.players.filter((p) => fullName(p).toLowerCase().includes(q))
      if (teamMatch) return team
      return { ...team, players: filteredPlayers }
    })
    .filter(
      (team) =>
        !q ||
        team.players.length > 0 ||
        `${team.name} ${team.category} ${team.pole}`.toLowerCase().includes(q)
    )

  const totalPlayers = filteredTeams.reduce((acc, t) => acc + t.players.length, 0)

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.32em] text-slate-400">Module</p>
        <h2 className="mt-2 font-[var(--font-teko)] text-4xl font-black uppercase tracking-[0.04em] text-slate-900">
          Effectif
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Vue par équipe uniquement. Clique sur un joueur pour ouvrir sa fiche détaillée.
        </p>
      </div>

      <Card className="rounded-3xl border-slate-100 bg-white">
        <CardContent className="pt-6">
          <form method="get" className="w-full max-w-md">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={params.q ?? ''}
                placeholder="Rechercher un joueur ou une équipe..."
                className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </label>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {filteredTeams.length} équipe(s)
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              {totalPlayers} joueur(s)
            </span>
            {q ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                Filtre: “{params.q}”
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="rounded-3xl border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">{team.name}</CardTitle>
              <CardDescription>
                {team.category} • {team.pole} • {team.players.length} joueur(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <details className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 open:bg-slate-50/80">
                <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                  + Ajouter un joueur (soumis à validation admin)
                </summary>
                <form action={requestCreatePlayer} className="border-t border-slate-200 p-3">
                  <input type="hidden" name="teamId" value={team.id} />
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input
                      name="firstname"
                      required
                      placeholder="Prénom"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                    />
                    <input
                      name="lastname"
                      required
                      placeholder="Nom"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                    />
                    <input
                      name="gender"
                      placeholder="Genre (M/F)"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                    />
                    <input
                      name="category"
                      placeholder="Catégorie (ex: U11)"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                    />
                    <input
                      name="club_name"
                      placeholder="Club"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                    />
                    <input
                      name="license_number"
                      placeholder="N° licence"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                    />
                    <input
                      name="mobile_phone"
                      placeholder="Téléphone"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                    />
                    <input
                      name="email"
                      placeholder="Email"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                    />
                    <input
                      name="legal_guardian_name"
                      placeholder="Responsable légal"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                    />
                    <input
                      name="address_street"
                      placeholder="Adresse"
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 md:col-span-2"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="address_zipcode"
                        placeholder="Code postal"
                        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                      />
                      <input
                        name="address_city"
                        placeholder="Ville"
                        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-2 h-9 rounded-xl bg-blue-600 px-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700"
                  >
                    Ajouter (validation admin)
                  </button>
                </form>
              </details>

              {team.players.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun joueur dans cet effectif.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {team.players.map((p) => (
                    <li key={p.id}>
                      <details className="group rounded-xl border border-slate-200 bg-slate-50 open:border-blue-200 open:bg-blue-50/50">
                        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium text-slate-700">
                          <span className="inline-flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-slate-400 group-open:text-blue-600" />
                            {fullName(p)}
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-slate-300 group-open:text-blue-600" />
                        </summary>

                        <div className="border-t border-slate-200 px-3 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Infos joueur
                          </p>

                          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                            <div>
                              <dt className="text-slate-400">Prénom</dt>
                              <dd className="font-semibold text-slate-700">{p.firstname ?? '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">Nom</dt>
                              <dd className="font-semibold text-slate-700">{p.lastname ?? '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">Équipe</dt>
                              <dd className="font-semibold text-slate-700">{team.name}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">Catégorie</dt>
                              <dd className="font-semibold text-slate-700">
                                {p.category ?? team.category ?? '—'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">Club</dt>
                              <dd className="font-semibold text-slate-700">{p.club_name ?? '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">Licence</dt>
                              <dd className="font-semibold text-slate-700">
                                {p.license_number ?? '—'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">Téléphone</dt>
                              <dd className="font-semibold text-slate-700">
                                {formatPhone(p.mobile_phone)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">Email</dt>
                              <dd className="font-semibold text-slate-700">{p.email ?? '—'}</dd>
                            </div>
                            <div className="col-span-2">
                              <dt className="text-slate-400">Responsable légal</dt>
                              <dd className="font-semibold text-slate-700">
                                {p.legal_guardian_name ?? '—'}
                              </dd>
                            </div>
                            <div className="col-span-2">
                              <dt className="text-slate-400">Adresse</dt>
                              <dd className="font-semibold text-slate-700">
                                {p.address_street
                                  ? `${p.address_street}${p.address_zipcode || p.address_city ? ', ' : ''}${p.address_zipcode ?? ''} ${p.address_city ?? ''}`.trim()
                                  : '—'}
                              </dd>
                            </div>
                            <div className="col-span-2">
                              <dt className="text-slate-400">Statut</dt>
                              <dd className="font-semibold text-slate-700">
                                {p.status_label ?? 'Actif'}
                              </dd>
                            </div>
                          </dl>

                          <form
                            action={requestUpdatePlayer}
                            className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-2 md:grid-cols-2"
                          >
                            <input type="hidden" name="playerId" value={p.id} />
                            <input type="hidden" name="teamId" value={team.id} />
                            <input
                              name="firstname"
                              defaultValue={p.firstname ?? ''}
                              required
                              className="h-8 rounded-lg border border-slate-200 px-2 text-xs"
                            />
                            <input
                              name="lastname"
                              defaultValue={p.lastname ?? ''}
                              required
                              className="h-8 rounded-lg border border-slate-200 px-2 text-xs"
                            />
                            <input
                              name="gender"
                              defaultValue={p.gender ?? ''}
                              placeholder="M/F"
                              className="h-8 rounded-lg border border-slate-200 px-2 text-xs"
                            />
                            <input
                              name="mobile_phone"
                              defaultValue={p.mobile_phone ?? ''}
                              placeholder="Mobile"
                              className="h-8 rounded-lg border border-slate-200 px-2 text-xs"
                            />
                            <input
                              name="email"
                              defaultValue={p.email ?? ''}
                              placeholder="Email"
                              className="h-8 rounded-lg border border-slate-200 px-2 text-xs md:col-span-2"
                            />
                            <input
                              name="legal_guardian_name"
                              defaultValue={p.legal_guardian_name ?? ''}
                              placeholder="Responsable légal"
                              className="h-8 rounded-lg border border-slate-200 px-2 text-xs md:col-span-2"
                            />
                            <button
                              type="submit"
                              className="h-8 rounded-lg bg-blue-600 px-2 text-[11px] font-bold text-white hover:bg-blue-700 md:col-span-2"
                            >
                              Demander modification
                            </button>
                          </form>

                          <form
                            action={requestMovePlayer}
                            className="mt-2 flex flex-wrap items-center gap-2"
                          >
                            <input type="hidden" name="playerId" value={p.id} />
                            <input type="hidden" name="fromTeamId" value={team.id} />
                            <select
                              name="toTeamId"
                              defaultValue={team.id}
                              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs"
                            >
                              {teamOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="h-8 rounded-lg border border-blue-200 bg-blue-50 px-2 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                            >
                              Déplacer (validation admin)
                            </button>
                          </form>

                          <form action={requestDeletePlayer} className="mt-2">
                            <input type="hidden" name="playerId" value={p.id} />
                            <input type="hidden" name="teamId" value={team.id} />
                            <button
                              type="submit"
                              className="h-8 rounded-lg border border-rose-200 bg-rose-50 px-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                            >
                              Supprimer (validation admin)
                            </button>
                          </form>

                          <div className="mt-2">
                            <Link
                              href={`/dashboard/joueurs?playerId=${encodeURIComponent(p.id)}&q=${encodeURIComponent(fullName(p))}`}
                              className="text-xs font-semibold text-blue-700 hover:underline"
                            >
                              Voir la fiche complète →
                            </Link>
                          </div>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
