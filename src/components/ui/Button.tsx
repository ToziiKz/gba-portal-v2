import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--ui-primary)] text-[color:var(--ui-primary-foreground)] hover:opacity-90",
  secondary:
    "bg-[color:var(--ui-surface)] text-[color:var(--ui-fg)] border border-[color:var(--ui-border)] hover:bg-[color:var(--ui-surface-2)]",
  ghost:
    "bg-transparent text-[color:var(--ui-fg)] hover:bg-[color:var(--ui-surface)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      disabled,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        disabled={asChild ? undefined : disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--ui-radius-sm)] font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ui-bg)]",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
