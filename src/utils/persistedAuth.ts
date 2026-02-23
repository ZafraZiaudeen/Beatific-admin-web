interface PersistedUser {
  id?: string
  _id?: string
  name?: string
  email?: string
  role?: string
}

interface PersistedAuthState {
  user: PersistedUser | null
  token: string | null
  isAuthenticated: boolean
}

export const getPersistedAuthState = (): PersistedAuthState | null => {
  try {
    const persistedAuth = localStorage.getItem('persist:auth')
    if (persistedAuth) {
      const authState = JSON.parse(persistedAuth)
      return {
        user: JSON.parse(authState.user),
        token: JSON.parse(authState.token),
        isAuthenticated: JSON.parse(authState.isAuthenticated),
      }
    }
    return null
  } catch {
    return null
  }
}

export const getPersistedToken = (): string | null => {
  const authState = getPersistedAuthState()
  return authState?.token || null
}

export const getPersistedUser = (): PersistedUser | null => {
  const authState = getPersistedAuthState()
  return authState?.user || null
}

export const clearPersistedAuth = (): void => {
  try {
    localStorage.removeItem('persist:auth')
  } catch {
    // no-op
  }
}
