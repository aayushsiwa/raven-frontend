import { useMemo, useState, type FormEvent } from 'react'
import type { FieldValidation } from '../../features/auth/useAuth'

type AuthMode = 'login' | 'signup'
type OAuthProvider = 'google' | 'github' | 'discord'

type OnboardingPageProps = {
  loading: boolean
  errorText: string | null
  onLogin: (username: string, password: string) => Promise<boolean>
  onSignup: (username: string, password: string) => Promise<boolean>
  onOAuth: (provider: OAuthProvider, username: string) => Promise<boolean>
  validateFields: (username: string, password: string, mode: AuthMode) => FieldValidation
}

export function OnboardingPage(props: OnboardingPageProps) {
  const [mode, setMode] = useState<AuthMode>('signup')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const validation = useMemo(() => props.validateFields(username, password, mode), [props, username, password, mode])
  const canSubmit = !validation.username && !validation.password

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!canSubmit) {
      return
    }

    if (mode === 'login') {
      await props.onLogin(username, password)
      return
    }
    await props.onSignup(username, password)
  }

  return (
    <section className="onboarding-wrap">
      <div className="onboarding-card">
        <p className="mobile-eyebrow onboarding-brand">The Collector</p>
        <h1>Curate signal. Ignore noise.</h1>
        <p className="muted">Build personal reading room with local account or connected identity.</p>

        <div className="onboarding-switch">
          <button
            className={mode === 'signup' ? 'btn onboarding-primary' : 'btn ghost'}
            onClick={() => setMode('signup')}
            type="button"
          >
            Sign up
          </button>
          <button
            className={mode === 'login' ? 'btn onboarding-primary' : 'btn ghost'}
            onClick={() => setMode('login')}
            type="button"
          >
            Log in
          </button>
        </div>

        <form className="onboarding-form" onSubmit={submit}>
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="neo_reader"
              autoComplete="username"
            />
            {submitted && validation.username ? <small className="field-error">{validation.username}</small> : null}
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Minimum 8 chars"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {submitted && validation.password ? <small className="field-error">{validation.password}</small> : null}
          </label>

          <button className="btn onboarding-primary" type="submit" disabled={props.loading || !canSubmit}>
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div className="oauth-grid">
          <button
            type="button"
            className="btn ghost onboarding-oauth"
            disabled={props.loading || Boolean(validation.username)}
            onClick={() => {
              void props.onOAuth('google', username)
            }}
          >
            Continue with Google
          </button>
          <button
            type="button"
            className="btn ghost onboarding-oauth"
            disabled={props.loading || Boolean(validation.username)}
            onClick={() => {
              void props.onOAuth('github', username)
            }}
          >
            Continue with GitHub
          </button>
          <button
            type="button"
            className="btn ghost onboarding-oauth"
            disabled={props.loading || Boolean(validation.username)}
            onClick={() => {
              void props.onOAuth('discord', username)
            }}
          >
            Continue with Discord
          </button>
        </div>

        {props.errorText ? <p className="error">{props.errorText}</p> : null}
      </div>
    </section>
  )
}
