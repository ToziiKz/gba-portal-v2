"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
type StockMovementItem = {
  label: string;
  qty: number;
};
import { cn } from "@/components/ui/cn";

type MovementType = "entry" | "exit";

const REASONS = {
  entry: [
    "Achat fournisseur",
    "Retour prêt",
    "Don",
    "Correction inventaire",
    "Autre",
  ],
  exit: [
    "Dotation joueur",
    "Perte / Vol",
    "Usure / Casse",
    "Correction inventaire",
    "Autre",
  ],
};

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockMovementItem | null;
  onConfirm: (payload: {
    type: MovementType;
    amount: number;
    reason: string;
    note: string;
  }) => void;
}

export function StockMovementModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: StockMovementModalProps) {
  const [type, setType] = React.useState<MovementType>("exit");
  const [amount, setAmount] = React.useState(1);
  const [reason, setReason] = React.useState(REASONS.exit[0]);
  const [note, setNote] = React.useState("");

  // Reset state when modal opens/closes or item changes
  React.useEffect(() => {
    if (isOpen) {
      setType("exit");
      setAmount(1);
      setReason(REASONS.exit[0]);
      setNote("");
    }
  }, [isOpen, item]);

  // Update reasons when type changes
  React.useEffect(() => {
    setReason(REASONS[type][0]);
  }, [type]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ type, amount, reason, note });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mouvement de stock"
      description={`Enregistrer une entrée ou sortie pour : ${item.label}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setType("entry")}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold transition-all",
              type === "entry"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-white/40 hover:text-white/70",
            )}
          >
            Entrée (+)
          </button>
          <button
            type="button"
            onClick={() => setType("exit")}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold transition-all",
              type === "exit"
                ? "bg-red-500/20 text-red-400"
                : "text-white/40 hover:text-white/70",
            )}
          >
            Sortie (-)
          </button>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="text-xs font-semibold uppercase tracking-wider text-white/60"
          >
            Quantité
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setAmount(Math.max(1, amount - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
            >
              -
            </button>
            <input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
              className="h-10 w-24 rounded-lg border border-white/10 bg-white/5 text-center text-lg font-bold text-white outline-none focus:border-white/30"
            />
            <button
              type="button"
              onClick={() => setAmount(amount + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
            >
              +
            </button>
            <span className="text-sm text-white/40">unités</span>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label
            htmlFor="reason"
            className="text-xs font-semibold uppercase tracking-wider text-white/60"
          >
            Motif
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-white/30"
          >
            {REASONS[type].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <label
            htmlFor="note"
            className="text-xs font-semibold uppercase tracking-wider text-white/60"
          >
            Note (optionnel)
          </label>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Détails supplémentaires..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30"
          />
        </div>

        {/* Summary & Submit */}
        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Nouveau stock estimé :</span>
            <span className="font-mono font-bold text-white">
              {item.qty} {type === "entry" ? "+" : "-"} {amount} ={" "}
              {type === "entry"
                ? item.qty + amount
                : Math.max(0, item.qty - amount)}
            </span>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full py-6 text-base"
          >
            Valider le mouvement
          </Button>
        </div>
      </form>
    </Modal>
  );
}
