'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [resent, setResent] = React.useState(false)
  const [resendLoading, setResendLoading] = React.useState(false)

  const isEmailNotConfirmed = (error ?? '').toLowerCase().includes('email not confirmed')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResent(false)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.refresh()
      router.push('/dashboard')
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Saisis ton email pour renvoyer la confirmation.')
      return
    }

    setResendLoading(true)
    setResent(false)

    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      setError(error.message)
    } else {
      setResent(true)
    }

    setResendLoading(false)
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      {isEmailNotConfirmed ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <p>Ton email n’est pas confirmé. Clique ci-dessous pour renvoyer l’email.</p>
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={resendLoading}
            className="mt-2 rounded-full border border-amber-400/40 px-3 py-1 text-xs font-semibold hover:bg-amber-500/20 disabled:opacity-60"
          >
            {resendLoading ? 'Envoi...' : 'Renvoyer l’email de confirmation'}
          </button>
          {resent ? <p className="mt-2 text-xs text-amber-200">Email renvoyé ✅</p> : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-white/50" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF]"
          placeholder="coach@gba.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-white/50" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF]"
          placeholder="••••••••"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-[#00a1ff] to-[#0065bd] py-6 text-base font-bold shadow-[0_15px_50px_rgba(0,161,255,0.45)] hover:opacity-90"
      >
        {loading ? 'Accès staff...' : 'Accéder'}
      </Button>
    </form>
  )
}
