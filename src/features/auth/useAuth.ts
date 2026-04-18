import { useMemo, useState } from 'react'
import { ApiError, api, type AuthUser, type OAuthLoginBody } from '../../lib/api'

const AUTH_STORE_KEY = 'raven.auth.v1'

type AuthStore = {
  token: string
  user: AuthUser
}

type OAuthProvider = 'google' | 'github' | 'discord'

export type FieldValidation = {
  username: string | null
  password: string | null
}

type ValidationMode = 'login' | 'signup'

export type AuthState = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  errorText: string | null
  validateFields: (username: string, password: string, mode: ValidationMode) => FieldValidation
  login: (username: string, password: string) => Promise<boolean>
  signup: (username: string, password: string) => Promise<boolean>
  oauthLogin: (provider: OAuthProvider, username: string) => Promise<boolean>
  logout: () => void
}

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/

function validateFields(username: string, password: string, mode: ValidationMode): FieldValidation {
  const uname = username.trim()
  let usernameErr: string | null = null
  let passwordErr: string | null = null

  if (!USERNAME_RE.test(uname)) {
    usernameErr = 'Username must be 3-32 chars: letters, digits, _, -, .'
  }

  if (password.length < 8 || password.length > 128) {
    passwordErr = 'Password must be 8-128 chars'
  } else if (/\s/.test(password)) {
    passwordErr = 'Password must not contain spaces'
  } else if (mode === 'signup' && !/[A-Z]/.test(password)) {
    passwordErr = 'Password needs uppercase letter'
  } else if (mode === 'signup' && !/[a-z]/.test(password)) {
    passwordErr = 'Password needs lowercase letter'
  } else if (mode === 'signup' && !/\d/.test(password)) {
    passwordErr = 'Password needs digit'
  } else if (mode === 'signup' && !/[^A-Za-z0-9]/.test(password)) {
    passwordErr = 'Password needs symbol'
  }

  return { username: usernameErr, password: passwordErr }
}

function readAuthStore(): AuthStore | null {
  try {
    const raw = localStorage.getItem(AUTH_STORE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as AuthStore
    if (!parsed?.token || !parsed?.user) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeAuthStore(value: AuthStore | null) {
  if (!value) {
    localStorage.removeItem(AUTH_STORE_KEY)
    return
  }
  localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(value))
}

function toErrorText(err: unknown): string {
  if (err instanceof ApiError) {
    return `${err.message} [${err.status}]`
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'Unknown auth error'
}

function fakeProviderUserId(provider: OAuthProvider, username: string): string {
  return `${provider}:${username.toLowerCase()}`
}

export function useAuth(baseUrl: string): AuthState {
  const [session, setSession] = useState<AuthStore | null>(readAuthStore)
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const client = useMemo(() => api(baseUrl), [baseUrl])

  const setSessionAndPersist = (value: AuthStore | null) => {
    setSession(value)
    writeAuthStore(value)
  }

  const login = async (username: string, password: string) => {
    setLoading(true)
    setErrorText(null)
    try {
      const res = await client.login({ username, password })
      setSessionAndPersist({ token: res.token, user: res.user })
      return true
    } catch (err) {
      setErrorText(toErrorText(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  const signup = async (username: string, password: string) => {
    setLoading(true)
    setErrorText(null)
    try {
      const res = await client.signup({ username, password })
      setSessionAndPersist({ token: res.token, user: res.user })
      return true
    } catch (err) {
      setErrorText(toErrorText(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  const oauthLogin = async (provider: OAuthProvider, username: string) => {
    setLoading(true)
    setErrorText(null)
    const payload: OAuthLoginBody = {
      provider,
      provider_user_id: fakeProviderUserId(provider, username),
      username,
      display_name: username,
    }

    try {
      const res = await client.oauthLogin(payload)
      setSessionAndPersist({ token: res.token, user: res.user })
      return true
    } catch (err) {
      setErrorText(toErrorText(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setErrorText(null)
    setSessionAndPersist(null)
  }

  return {
    user: session?.user ?? null,
    token: session?.token ?? null,
    loading,
    errorText,
    validateFields,
    login,
    signup,
    oauthLogin,
    logout,
  }
}
