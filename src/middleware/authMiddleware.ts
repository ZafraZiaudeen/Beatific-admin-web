import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { loginUser, registerUser, fetchUserProfile, logoutUser } from '@/actions/authAction'
import { setAuthToken } from '@/api/api'
import type { RootState } from '@/api/store'
import { clearPersistedAuth } from '@/utils/persistedAuth'

export const authListenerMiddleware = createListenerMiddleware()

// Set token on successful auth
authListenerMiddleware.startListening({
  matcher: isAnyOf(loginUser.fulfilled, registerUser.fulfilled, fetchUserProfile.fulfilled),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const token = state.auth.token
    if (token) {
      setAuthToken(token)
    }
  },
})

// Clear token on logout
authListenerMiddleware.startListening({
  matcher: isAnyOf(logoutUser.fulfilled, logoutUser.rejected),
  effect: () => {
    setAuthToken(null)
    clearPersistedAuth()
  },
})
