import { createClient } from '@/lib/supabase/server'
import { regenerateCoachInvitation, createDirectInvitation } from './actions'
import { updateUserProfile, deleteUserProfile } from './update-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  UserPlus,
  Search,
  ShieldCheck,
  Mail,
  Users,
  CheckCircle2,
  Lock,
  Save,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Accès & Permissions · GBA Dashboard',
}

type Params = { invite?: string; status?: string; q?: string; ok?: string; err?: string }

function toDateLabel(value: string | null) {
  if (!value) return '—'
  return value.split('T')[0]
}

export default async function DashboardCoachAccessPage({
  searchParams,
}: {
  searchParams?: Promise<Params>
}) {
  const supabase = await createClient()
  const params = (await searchParams) ?? {}

  const statusFilter = params.status ?? 'pending'

  // 1. Charger les profils existants
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, updated_at')
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  const existingEmails = new Set((users ?? []).map((u) => u.email.toLowerCase()))

  // 2. Invitation-only workflow: coach access requests disabled

  // 3. Invitations : Filtrées par emails déjà présents
  const { data: rawInvitations } = await supabase
    .from('coach_invitations')
    .select('id, email, full_name, role, created_at, expires_at, used_at')
    .is('used_at', null)
    .order('created_at', { ascending: false })

  const latestInvitations = (rawInvitations ?? []).filter(
    (inv) => !existingEmails.has(inv.email.toLowerCase())
  )

  // 4. Équipes
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, coach_id, category, pole')
    .order('name', { ascending: true })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">
            Système
          </p>
          <h2 className="font-[var(--font-teko)] text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-none">
            Accès & <span className="text-blue-600">Permissions</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md font-medium">
            Gérez les rôles, validez les membres et configurez les droits d&apos;accès.
          </p>
        </div>
      </div>

      {params.ok === '1' && (
        <Card className="rounded-3xl border-emerald-100 bg-emerald-50/50 overflow-hidden shadow-sm">
          <CardContent className="p-4 text-xs font-black uppercase tracking-wider text-emerald-700">
            Mise à jour enregistrée.
          </CardContent>
        </Card>
      )}

      {params.err && (
        <Card className="rounded-3xl border-rose-100 bg-rose-50/50 overflow-hidden shadow-sm">
          <CardContent className="p-4 text-xs font-black uppercase tracking-wider text-rose-700">
            Erreur : {params.err}
          </CardContent>
        </Card>
      )}

      {params.invite && (
        <Card className="rounded-3xl border-blue-100 bg-blue-50/50 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4 text-blue-700">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black uppercase tracking-widest text-xs">
                  Lien de sécurité généré
                </p>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                  Valable 72 heures • Usage unique
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4 font-mono text-xs text-slate-700 break-all mb-4 select-all shadow-inner">
              {params.invite}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:?subject=${encodeURIComponent('Activation compte GBA')}&body=${encodeURIComponent(`Bonjour,\n\nVoici ton lien d’activation :\n${params.invite}\n\nCe lien expire dans 72h.`)}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Mail className="mr-2 h-4 w-4" />
                Transmettre par Mail
              </a>
              <Link href="/dashboard/acces">
                <Button
                  variant="ghost"
                  className="rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest"
                >
                  Fermer
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden border-t-4 border-t-blue-600">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Nouvel Accès
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form action={createDirectInvitation} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Identité
                  </label>
                  <input
                    name="fullName"
                    required
                    placeholder="Nom et Prénom"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Email Professionnel
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="nom@exemple.com"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Rôle
                  </label>
                  <select
                    name="role"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                  >
                    <option value="coach">COACH</option>
                    <option value="staff">STAFF</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Pré-assigner équipes
                  </label>
                  <div className="max-h-32 overflow-y-auto p-2 rounded-2xl border border-slate-100 bg-slate-50 grid grid-cols-1 gap-1">
                    {(teams ?? []).map((t) => (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-white rounded-lg cursor-pointer transition-colors group"
                      >
                        <input
                          type="checkbox"
                          name="targetTeamIds"
                          value={t.id}
                          className="h-3 w-3 accent-blue-600"
                        />
                        <span className="text-[9px] font-black text-slate-500 group-hover:text-slate-900 uppercase truncate">
                          {t.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-2xl py-7 font-black uppercase tracking-widest text-[10px] bg-[#070A11] hover:bg-blue-600 text-white shadow-xl shadow-slate-900/10 transition-all border-none"
                >
                  Générer l&apos;Invitation
                </Button>
              </form>
            </CardContent>
          </Card>

          {latestInvitations.length > 0 && (
            <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Invitations actives ({latestInvitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                  {latestInvitations.map((inv) => (
                    <div key={inv.id} className="p-4 flex items-center justify-between group">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 uppercase truncate leading-none mb-1">
                          {inv.full_name || inv.email}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          Expire le {toDateLabel(inv.expires_at)}
                        </p>
                      </div>
                      <form action={regenerateCoachInvitation}>
                        <input type="hidden" name="invitationId" value={inv.id} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl h-8 px-2 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50"
                        >
                          Relancer
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <form className="space-y-4" method="get">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="q"
                    defaultValue={params.q ?? ''}
                    placeholder="Rechercher..."
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 pl-11 pr-4 py-3 text-sm font-medium outline-none text-slate-900"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    name="status"
                    defaultValue={statusFilter}
                    className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none"
                  >
                    <option value="pending">En attente</option>
                    <option value="all">Tous</option>
                  </select>
                  <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    className="rounded-xl px-4 font-black text-slate-900 border-slate-200"
                  >
                    OK
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-2xl border-slate-100 bg-white/60">
            <CardContent className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Workflow invitation-only actif : demandes publiques désactivées.
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2 px-2">
              <Users className="h-4 w-4" /> Annuaire Staff ({users?.length})
            </h3>

            <div className="space-y-6">
              {users?.map((user) => {
                const assignedTeams = (teams ?? []).filter((t) => t.coach_id === user.id)
                const isActive = user.is_active !== false

                return (
                  <Card
                    key={user.id}
                    className="rounded-[2rem] border-slate-100 bg-white shadow-sm overflow-hidden hover:border-blue-100 transition-all"
                  >
                    <CardContent className="p-0">
                      <div className="p-6 space-y-6">
                        <form action={updateUserProfile}>
                          <input type="hidden" name="userId" value={user.id} />

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div
                                  className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
                                >
                                  {user.full_name?.slice(0, 2)}
                                </div>
                                <div
                                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-slate-900 uppercase tracking-widest leading-none text-base truncate">
                                  {user.full_name || 'Sans Nom'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                                <span className="text-[9px] font-black uppercase text-slate-400">
                                  Rôle:
                                </span>
                                <select
                                  name="role"
                                  defaultValue={user.role ?? 'coach'}
                                  className="bg-transparent text-[10px] font-black uppercase text-slate-900 outline-none cursor-pointer"
                                >
                                  <option value="admin">Admin</option>
                                  <option value="staff">Staff</option>
                                  <option value="coach">Coach</option>
                                </select>
                              </div>

                              <label className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="isActive"
                                  defaultChecked={isActive}
                                  className="h-3.5 w-3.5 accent-emerald-500"
                                />
                                <span className="text-[9px] font-black uppercase text-slate-900">
                                  Actif
                                </span>
                              </label>

                              <Button
                                type="submit"
                                size="sm"
                                className="rounded-xl bg-[#070A11] hover:bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest h-10 px-4 border-none"
                              >
                                <Save className="mr-2 h-3.5 w-3.5 text-white" /> Enregistrer
                              </Button>
                            </div>
                          </div>

                          {user.role === 'coach' && (
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                  Équipes assignées ({assignedTeams.length})
                                </p>
                              </div>
                              <div className="p-2 max-h-40 overflow-y-auto">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                  {(teams ?? []).map((team) => (
                                    <label
                                      key={team.id}
                                      className={`group relative flex items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer select-none ${team.coach_id === user.id ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'}`}
                                    >
                                      <input
                                        type="checkbox"
                                        name="teamIds"
                                        value={team.id}
                                        defaultChecked={team.coach_id === user.id}
                                        className="sr-only"
                                      />
                                      <span className="text-[8px] font-black uppercase tracking-tighter truncate">
                                        {team.name}
                                      </span>
                                      {team.coach_id === user.id && (
                                        <CheckCircle2 className="h-2 w-2 text-white" />
                                      )}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {user.role === 'staff' && (
                            <div className="bg-amber-50/30 rounded-2xl p-4 border border-amber-100 border-dashed flex items-center gap-3">
                              <Lock className="h-4 w-4 text-amber-400" />
                              <p className="text-[10px] text-amber-800/60 font-black uppercase tracking-widest">
                                Droits STAFF : Gestion Boutique & Finances
                              </p>
                            </div>
                          )}
                        </form>

                        <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                          <p className="text-[9px] font-bold text-slate-300 uppercase italic px-2">
                            ID: {user.id.slice(0, 12)}...
                          </p>
                          <form action={deleteUserProfile}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-all group px-2"
                            >
                              <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                              Supprimer le profil
                            </button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
