'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { LicenceRow } from '@/app/dashboard/licences/actions'

type PaymentMethod = 'CB' | 'Espèces' | 'Chèque' | 'Virement' | 'Autre'

const paymentMethods: PaymentMethod[] = ['CB', 'Espèces', 'Chèque', 'Virement', 'Autre']

interface LicencePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  row: LicenceRow | null
  remainingEur: number
  onPaymentSubmit: (
    amountEur: number,
    method: PaymentMethod,
    note: string,
    sendReceipt: boolean
  ) => void
}

function formatEur(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function inputBaseClassName() {
  return 'h-10 w-full rounded-[var(--ui-radius-sm)] border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25'
}

export function LicencePaymentModal({
  isOpen,
  onClose,
  row,
  remainingEur,
  onPaymentSubmit,
}: LicencePaymentModalProps) {
  const [amountEur, setAmountEur] = React.useState<number>(0)
  const [method, setMethod] = React.useState<PaymentMethod>('CB')
  const [note, setNote] = React.useState('')
  const [sendReceipt, setSendReceipt] = React.useState(true)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (isOpen && row) {
      setAmountEur(remainingEur)
      const raw = row.lastPaymentMethod
      const next = paymentMethods.includes(raw as PaymentMethod) ? (raw as PaymentMethod) : 'CB'
      setMethod(next)
      setNote('')
      setSendReceipt(true)
      setCopied(false)
    }
  }, [isOpen, row, remainingEur])

  if (!row) return null

  const receiptText = [
    `GBA — Reçu (mock)`,
    `Joueur : ${row.playerName} (${row.team})`,
    `Montant : ${formatEur(amountEur)}`,
    `Moyen : ${method}`,
    `Date : ${new Date().toLocaleDateString('fr-FR')}`,
    note ? `Note : ${note}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const handleSubmit = () => {
    onPaymentSubmit(amountEur, method, note, sendReceipt)
  }

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receiptText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Paiement: ${row.playerName}`}
      description={`${row.team} · ${row.category} · Reste à payer: ${formatEur(remainingEur)}`}
      className="max-w-4xl"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
              Nouveau versement
            </h4>
            <div className="space-y-4">
              <label className="grid gap-1.5">
                <span className="text-xs text-white/70">Montant (€)</span>
                <input
                  type="number"
                  value={amountEur || ''}
                  onChange={(e) => setAmountEur(Number(e.target.value))}
                  className={inputBaseClassName()}
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs text-white/70">Moyen de paiement</span>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className={inputBaseClassName()}
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs text-white/70">Note interne</span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: chèque n°123..."
                  className={inputBaseClassName()}
                />
              </label>

              <label className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={sendReceipt}
                  onChange={(e) => setSendReceipt(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-white accent-white"
                />
                <span className="text-xs text-white/70">Envoyer le reçu par email (mock)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleSubmit} disabled={amountEur <= 0}>
              Enregistrer
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
              Aperçu reçu
            </h4>
            <div className="relative rounded-xl border border-white/10 bg-black p-4 font-mono text-xs text-white/80 shadow-inner">
              <pre className="whitespace-pre-wrap">{receiptText}</pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyReceipt}
                className="absolute right-2 top-2 h-6 px-2 text-[10px]"
              >
                {copied ? 'Copié !' : 'Copier'}
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
              Historique (Mock)
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              {row.amountPaidEur > 0 ? (
                <li className="flex justify-between rounded bg-white/5 px-2 py-1.5">
                  <span>Paiement précédent</span>
                  <span className="text-white">{formatEur(row.amountPaidEur)}</span>
                </li>
              ) : (
                <li className="italic opacity-50">Aucun historique disponible</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  )
}
