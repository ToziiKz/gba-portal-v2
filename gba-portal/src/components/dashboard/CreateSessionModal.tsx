'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  planningPoles,
  planningDays,
  type PlanningDay,
  type PlanningPole,
  type PlanningSession,
} from '@/lib/mocks/dashboardPlanning'

type CreateSessionModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (session: Omit<PlanningSession, 'id' | 'updatedAtLabel'>) => void
}

function inputClassName() {
  return 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/20'
}

function labelClassName() {
  return 'block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5'
}

const planningDayLabels: Record<PlanningDay, string> = {
  Lun: 'Lundi',
  Mar: 'Mardi',
  Mer: 'Mercredi',
  Jeu: 'Jeudi',
  Ven: 'Vendredi',
  Sam: 'Samedi',
  Dim: 'Dimanche',
}

export function CreateSessionModal({ isOpen, onClose, onCreate }: CreateSessionModalProps) {
  const [pole, setPole] = React.useState<PlanningPole>('Formation')
  const [team, setTeam] = React.useState('')
  const [day, setDay] = React.useState<PlanningDay>('Lun')
  const [startTime, setStartTime] = React.useState('18:00')
  const [endTime, setEndTime] = React.useState('19:30')
  const [location, setLocation] = React.useState('Synthétique')
  const [staffInput, setStaffInput] = React.useState('')
  const [note, setNote] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!team || !startTime || !endTime) return

    onCreate({
      pole,
      team,
      day,
      start: startTime,
      end: endTime,
      location,
      staff: staffInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      note: note || undefined,
    })
    onClose()
    // Reset form
    setTeam('')
    setStaffInput('')
    setNote('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une séance"
      description="Créez un nouveau créneau dans le planning."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClassName()}>Pôle</label>
            <select
              value={pole}
              onChange={(e) => setPole(e.target.value as PlanningPole)}
              className={inputClassName()}
            >
              {planningPoles.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClassName()}>Jour</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as PlanningDay)}
              className={inputClassName()}
            >
              {planningDays.map((d) => (
                <option key={d} value={d}>
                  {planningDayLabels[d]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClassName()}>Équipe / Groupe</label>
          <input
            type="text"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Ex: U17 R1"
            className={inputClassName()}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClassName()}>Début</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClassName()}
              required
            />
          </div>
          <div>
            <label className={labelClassName()}>Fin</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClassName()}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClassName()}>Lieu</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex: Synthétique"
            className={inputClassName()}
          />
        </div>

        <div>
          <label className={labelClassName()}>Staff (séparer par virgules)</label>
          <input
            type="text"
            value={staffInput}
            onChange={(e) => setStaffInput(e.target.value)}
            placeholder="Ex: Coach A, Coach B"
            className={inputClassName()}
          />
        </div>

        <div>
          <label className={labelClassName()}>Note (optionnel)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Détails spécifiques..."
            className={`${inputClassName()} min-h-[80px]`}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            Créer la séance
          </Button>
        </div>
      </form>
    </Modal>
  )
}
