import * as React from "react";

import { cn } from "./cn";

type PillVariant = "neutral" | "primary" | "success" | "warning" | "danger";

export type PillProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: PillVariant;
};

const variantClasses: Record<PillVariant, string> = {
  neutral:
    "border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] text-[color:var(--ui-fg)]",
  primary:
    "border-[color:color-mix(in_oklab,var(--ui-primary),white_20%)] bg-[color:color-mix(in_oklab,var(--ui-primary),black_65%)] text-white",
  success:
    "border-[color:color-mix(in_oklab,var(--ui-success),white_20%)] bg-[color:color-mix(in_oklab,var(--ui-success),black_75%)] text-white",
  warning:
    "border-[color:color-mix(in_oklab,var(--ui-warning),white_20%)] bg-[color:color-mix(in_oklab,var(--ui-warning),black_78%)] text-white",
  danger:
    "border-[color:color-mix(in_oklab,var(--ui-danger),white_20%)] bg-[color:color-mix(in_oklab,var(--ui-danger),black_78%)] text-white",
};

export function Pill({ className, variant = "neutral", ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
