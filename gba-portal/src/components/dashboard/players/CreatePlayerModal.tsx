'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { createPlayer } from '@/app/dashboard/joueurs/actions'

interface Props {
  isOpen: boolean
  onClose: () => void
  teams: { id: string; name: string }[]
}

export function CreatePlayerModal({ isOpen, onClose, teams }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    try {
      const result = await createPlayer(null, formData)

      if (result?.success) {
        onClose()
      } else {
        setError(result?.message || 'Erreur inconnue')
      }
    } catch {
      setError('Erreur technique')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau joueur"
      description="Ajoutez un joueur à l'effectif."
    >
      <form action={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-xs uppercase tracking-widest text-white/50">
              Prénom
            </label>
            <input
              name="firstName"
              id="firstName"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-xs uppercase tracking-widest text-white/50">
              Nom
            </label>
            <input
              name="lastName"
              id="lastName"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="teamId" className="text-xs uppercase tracking-widest text-white/50">
            Équipe
          </label>
          <select
            name="teamId"
            id="teamId"
            required
            className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2 text-white focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          >
            <option value="">Sélectionner une équipe</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading} type="button">
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
