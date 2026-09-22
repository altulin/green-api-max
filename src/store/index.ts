import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { clearChats, saveChats } from '../utils/chatsStorage'
import { clearCredentials, saveCredentials } from '../utils/credentialsStorage'
import authReducer from './authSlice'
import chatsReducer from './chatsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chats: chatsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// Учётные данные и список чатов храним в localStorage здесь, а не в
// редьюсерах: редьюсер обязан оставаться чистой функцией.
let storedCredentials = store.getState().auth.credentials
let storedChats = store.getState().chats.chats

store.subscribe(() => {
  const { auth, chats } = store.getState()

  if (auth.credentials !== storedCredentials) {
    const previous = storedCredentials
    storedCredentials = auth.credentials

    if (auth.credentials === null) {
      clearCredentials()
      // вместе с выходом убираем и чаты этого инстанса
      if (previous !== null) clearChats(previous.idInstance)
    } else {
      saveCredentials(auth.credentials)
    }
  }

  if (chats.chats !== storedChats) {
    storedChats = chats.chats
    if (auth.credentials !== null) {
      saveChats(auth.credentials.idInstance, chats.chats)
    }
  }
})
