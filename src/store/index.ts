import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { clearCredentials, saveCredentials } from '../utils/credentialsStorage'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// Учётные данные храним в localStorage здесь, а не в редьюсерах:
// редьюсер обязан оставаться чистой функцией.
let storedCredentials = store.getState().auth.credentials

store.subscribe(() => {
  const { credentials } = store.getState().auth
  if (credentials === storedCredentials) return

  storedCredentials = credentials

  if (credentials === null) {
    clearCredentials()
  } else {
    saveCredentials(credentials)
  }
})
