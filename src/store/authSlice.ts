import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getErrorMessage, getStateInstance } from '../api/greenApi'
import type { Credentials, StateInstance } from '../api/types'
import { loadCredentials } from '../utils/credentialsStorage'

export type AuthState = {
  credentials: Credentials | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  credentials: loadCredentials(),
  status: 'idle',
  error: null,
}

const stateMessages: Record<Exclude<StateInstance, 'authorized'>, string> = {
  notAuthorized: 'Инстанс не авторизован. Отсканируйте QR-код.',
  blocked: 'Инстанс заблокирован.',
  starting: 'Инстанс запускается, подождите.',
  suspended: 'Инстанс приостановлен.',
  pendingPassword: 'Ожидается ввод пароля.',
}

export const login = createAsyncThunk<
  Credentials,
  Credentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { stateInstance } = await getStateInstance(credentials)
    if (stateInstance !== 'authorized') {
      return rejectWithValue(stateMessages[stateInstance])
    }

    return credentials
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.credentials = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.credentials = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Не удалось войти'
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
