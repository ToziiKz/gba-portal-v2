import * as React from 'react'

import { cn } from './cn'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--ui-radius-md)] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] shadow-[var(--ui-shadow-sm)]',
        className
      )}
      {...props}
    />
  )
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn('flex flex-col gap-1 p-5', className)} {...props} />
}

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn('text-base font-semibold leading-tight', className)} {...props} />
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn('text-sm text-[color:var(--ui-muted)]', className)} {...props} />
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 border-t border-[color:var(--ui-border)] px-5 py-4',
        className
      )}
      {...props}
    />
  )
}
