import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from '../slices/authSlice'
import uiReducer from '../slices/uiSlice'
import usersReducer from '../slices/usersSlice'
import contentReducer from '../slices/contentSlice'
import settingsReducer from '../slices/settingsSlice'
import profileReducer from '../slices/profileSlice'
import templateReducer from '../slices/templateSlice'
import stickerReducer from '../slices/stickerSlice'
import { authListenerMiddleware } from '../middleware/authMiddleware'

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'],
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    ui: uiReducer,
    users: usersReducer,
    content: contentReducer,
    settings: settingsReducer,
    profile: profileReducer,
    templates: templateReducer,
    stickers: stickerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        warnAfter: 100,
      },
      immutableCheck: {
        warnAfter: 100,
      },
    })
    .prepend(authListenerMiddleware.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
