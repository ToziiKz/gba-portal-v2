"use client";

import * as React from "react";

import { Modal } from "@/components/ui/Modal";
import { Button, type ButtonProps } from "@/components/ui/Button";

type Props = {
  label: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: NonNullable<ButtonProps["variant"]>;
  size?: NonNullable<ButtonProps["size"]>;
};

export function ComingSoonButton({
  label,
  title = "Bientôt disponible",
  description = "Cette action est prévue dans une prochaine itération. Pour l’instant, l’UI sert à valider les écrans et les parcours.",
  className,
  variant = "ghost",
  size = "sm",
}: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        variant={variant}
        size={size}
      >
        {label}
      </Button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-4">
          <p className="text-sm text-white/70">{description}</p>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              variant="secondary"
              size="sm"
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
