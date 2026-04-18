import { useMemo, useState } from 'react'
import { ApiError, api, type AuthUser, type OAuthLoginBody } from '../../lib/api'

const AUTH_STORE_KEY = 'raven.auth.v1'

type AuthStore = {
  token: string
  user: AuthUser
}

type OAuthProvider = 'google' | 'github' | 'discord'

export type AuthState = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  errorText: string | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (username: string, password: string) => Promise<boolean>
  oauthLogin: (provider: OAuthProvider, username: string) => Promise<boolean>
  logout: () => void
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
    login,
    signup,
    oauthLogin,
    logout,
  }
}
