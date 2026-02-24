'use client'

import * as React from 'react'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

import { createPlanningSession } from '@/app/dashboard/planning/actions'

type TeamOption = { id: string; name: string; category: string }

type Props = {
  isOpen: boolean
  onClose: () => void
  teams: TeamOption[]
}

function inputClassName() {
  return 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/20'
}

function labelClassName() {
  return 'block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5'
}

export function CreatePlanningSessionModal({ isOpen, onClose, teams }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [selectedTeamId, setSelectedTeamId] = React.useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await createPlanningSession(null, formData)
      if (res?.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
        }, 3000)
      } else {
        setError(res?.message ?? 'Erreur')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter un évènement"
      description="Créez un évènement planning (soumis à validation)."
    >
      <form action={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20 flex flex-col items-center text-center gap-2">
            <p className="font-bold uppercase tracking-widest">Demande envoyée !</p>
            <p className="opacity-80 text-xs">
              Votre séance est en attente d&apos;approbation par un administrateur.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className={labelClassName()}>Équipe</label>
              <select
                name="teamId"
                className={inputClassName()}
                required
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                <option value="" disabled>
                  Sélectionner…
                </option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="text-black">
                    {t.category} • {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName()}>Date</label>
                <input name="sessionDate" type="date" className={inputClassName()} required />
              </div>
              <div>
                <label className={labelClassName()}>Type d&apos;évènement</label>
                <select
                  name="eventType"
                  className={inputClassName()}
                  defaultValue="training"
                  required
                >
                  <option value="training" className="text-black">
                    Séance
                  </option>
                  <option value="match_championnat" className="text-black">
                    Match championnat
                  </option>
                  <option value="match_coupe" className="text-black">
                    Match coupe
                  </option>
                  <option value="match_amical" className="text-black">
                    Match amical
                  </option>
                  <option value="plateau" className="text-black">
                    Plateau
                  </option>
                  <option value="competition" className="text-black">
                    Compétition
                  </option>
                  <option value="event" className="text-black">
                    Autre évènement
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClassName()}>Début</label>
                <input
                  name="startTime"
                  type="time"
                  className={inputClassName()}
                  defaultValue="18:00"
                  required
                />
              </div>
              <div>
                <label className={labelClassName()}>Fin</label>
                <input
                  name="endTime"
                  type="time"
                  className={inputClassName()}
                  defaultValue="19:30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClassName()}>Site</label>
                <select name="site" className={inputClassName()} defaultValue="Ittenheim" required>
                  <option value="Ittenheim" className="text-black">
                    Ittenheim
                  </option>
                  <option value="Achenheim" className="text-black">
                    Achenheim
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClassName()}>Terrain</label>
                <select
                  name="location"
                  className={inputClassName()}
                  defaultValue="Synthétique"
                  required
                >
                  <option value="Synthétique" className="text-black">
                    Synthétique
                  </option>
                  <option value="Herbe" className="text-black">
                    Herbe
                  </option>
                  <option value="Clubhouse" className="text-black">
                    Clubhouse
                  </option>
                  <option value="Tout" className="text-black">
                    Tout
                  </option>
                  <option value="Autre" className="text-black">
                    Autre
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClassName()}>Staff (virgules)</label>
              <input name="staff" className={inputClassName()} placeholder="Coach A, Coach B" />
            </div>

            <div>
              <label className={labelClassName()}>Note</label>
              <textarea
                name="note"
                className={`${inputClassName()} min-h-[80px]`}
                placeholder="Optionnel"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Envoi…' : 'Demander validation'}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
