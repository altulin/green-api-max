import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import {
  checkAccount,
  getChatHistory,
  getContactInfo,
  getErrorMessage,
  sendMessage as sendMessageRequest,
} from '../api/greenApi'
import type { Chat, Message } from '../types/chat'
import { loadChats } from '../utils/chatsStorage'
import { loadCredentials } from '../utils/credentialsStorage'
import { parseHistoryMessage } from '../utils/parseHistoryMessage'
import { normalizePhone } from '../utils/phone'
import { logout } from './authSlice'
import type { RootState } from './index'

type HistoryStatus = 'loading' | 'loaded' | 'failed'

type ChatsState = {
  chats: Chat[]
  messagesByChat: Record<string, Message[]>
  historyStatus: Record<string, HistoryStatus>
  activeChatId: string | null
  createStatus: 'idle' | 'loading' | 'failed'
  createError: string | null
}

const initialState: ChatsState = {
  chats: loadChats(loadCredentials()?.idInstance ?? null),
  messagesByChat: {},
  historyStatus: {},
  activeChatId: null,
  createStatus: 'idle',
  createError: null,
}

// Номер → chatId через checkAccount. Отправлять сообщения по '79...@c.us' нельзя:
// входящие приходят с числовым chatId, и ответ не удастся сопоставить с чатом.
export const createChat = createAsyncThunk<
  Chat,
  string,
  { state: RootState; rejectValue: string }
>('chats/createChat', async (rawPhone, { getState, rejectWithValue }) => {
  const { credentials } = getState().auth
  if (credentials === null) {
    return rejectWithValue('Нет учётных данных')
  }

  const phone = normalizePhone(rawPhone)
  if (phone === null) {
    return rejectWithValue('Номер должен начинаться с 7 или 375')
  }

  try {
    const { exist, chatId } = await checkAccount(credentials, Number(phone))
    if (!exist) {
      return rejectWithValue('Этот номер не зарегистрирован в MAX')
    }

    // имя и аватар необязательны: их может не быть или они закрыты
    // настройками приватности, поэтому ошибку здесь просто гасим
    let name: string | null = null
    let avatarUrl: string | null = null

    try {
      const contact = await getContactInfo(credentials, chatId)
      name = contact.contactName || contact.name || null
      avatarUrl = contact.avatar || null
    } catch {
      name = null
    }

    return { chatId, phone, name, avatarUrl }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

// История чата: грузим один раз при первом открытии.
// Повторный запрос отсекается через condition, чтобы не дёргать API
// при каждом переключении между чатами.
export const loadChatHistory = createAsyncThunk<
  { chatId: string; messages: Message[] },
  string,
  { state: RootState; rejectValue: string }
>(
  'chats/loadChatHistory',
  async (chatId, { getState, rejectWithValue }) => {
    const { credentials } = getState().auth
    if (credentials === null) {
      return rejectWithValue('Нет учётных данных')
    }

    try {
      const history = await getChatHistory(credentials, chatId)
      const messages = history
        .map(parseHistoryMessage)
        .filter((message): message is Message => message !== null)

      return { chatId, messages }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
  {
    condition: (chatId, { getState }) => {
      const status = getState().chats.historyStatus[chatId]
      return status !== 'loading' && status !== 'loaded'
    },
  },
)

type SendResult = { tempId: string; chatId: string; idMessage: string }
type SendError = { tempId: string; chatId: string; error: string }

export const sendTextMessage = createAsyncThunk<
  SendResult,
  { chatId: string; text: string },
  { state: RootState; rejectValue: SendError }
>(
  'chats/sendTextMessage',
  async ({ chatId, text }, { getState, dispatch, rejectWithValue }) => {
    const { credentials } = getState().auth
    const tempId = crypto.randomUUID()

    if (credentials === null) {
      return rejectWithValue({ tempId, chatId, error: 'Нет учётных данных' })
    }

    // показываем сообщение сразу, не дожидаясь ответа сервера
    dispatch(
      messageAdded({
        id: tempId,
        chatId,
        text,
        timestamp: Date.now(),
        direction: 'outgoing',
        status: 'pending',
      }),
    )

    try {
      const { idMessage } = await sendMessageRequest(credentials, chatId, text)
      return { tempId, chatId, idMessage }
    } catch (error) {
      return rejectWithValue({ tempId, chatId, error: getErrorMessage(error) })
    }
  },
)

function findMessage(
  state: ChatsState,
  chatId: string,
  id: string,
): Message | undefined {
  return state.messagesByChat[chatId]?.find((message) => message.id === id)
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    chatSelected(state, action: PayloadAction<string>) {
      state.activeChatId = action.payload
    },

    createErrorCleared(state) {
      state.createStatus = 'idle'
      state.createError = null
    },

    messageAdded(state, action: PayloadAction<Message>) {
      const message = action.payload
      const messages = state.messagesByChat[message.chatId]

      if (messages === undefined) {
        state.messagesByChat[message.chatId] = [message]
        return
      }

      // один и тот же idMessage может прийти повторно, если уведомление
      // не удалилось из очереди с первого раза
      if (messages.some((item) => item.id === message.id)) return

      messages.push(message)
    },

    // сообщение из уведомления: чужие чаты и каналы игнорируем
    messageReceived(
      state,
      action: PayloadAction<{ message: Message; chatName: string | null }>,
    ) {
      const { message, chatName } = action.payload
      const chat = state.chats.find((item) => item.chatId === message.chatId)
      if (chat === undefined) return

      if (chat.name === null && chatName !== null) {
        chat.name = chatName
      }

      chatsSlice.caseReducers.messageAdded(state, {
        type: 'chats/messageAdded',
        payload: message,
      })
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createChat.pending, (state) => {
        state.createStatus = 'loading'
        state.createError = null
      })
      .addCase(createChat.fulfilled, (state, action) => {
        const chat = action.payload
        state.createStatus = 'idle'

        if (!state.chats.some((item) => item.chatId === chat.chatId)) {
          state.chats.unshift(chat)
        }

        state.activeChatId = chat.chatId
      })
      .addCase(createChat.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = action.payload ?? 'Не удалось создать чат'
      })

      .addCase(loadChatHistory.pending, (state, action) => {
        state.historyStatus[action.meta.arg] = 'loading'
      })
      .addCase(loadChatHistory.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload
        state.historyStatus[chatId] = 'loaded'

        // история приходит от новых к старым; свои сообщения, отправленные
        // до её загрузки, уже лежат в чате — их не трогаем
        const existing = state.messagesByChat[chatId] ?? []
        const existingIds = new Set(existing.map((message) => message.id))

        const merged = [
          ...messages.filter((message) => !existingIds.has(message.id)),
          ...existing,
        ]

        merged.sort((a, b) => a.timestamp - b.timestamp)
        state.messagesByChat[chatId] = merged
      })
      .addCase(loadChatHistory.rejected, (state, action) => {
        state.historyStatus[action.meta.arg] = 'failed'
      })

      .addCase(sendTextMessage.fulfilled, (state, action) => {
        const { tempId, chatId, idMessage } = action.payload
        const message = findMessage(state, chatId, tempId)
        if (message === undefined) return

        message.id = idMessage
        message.status = 'sent'
      })
      .addCase(sendTextMessage.rejected, (state, action) => {
        if (action.payload === undefined) return

        const { tempId, chatId } = action.payload
        const message = findMessage(state, chatId, tempId)
        if (message === undefined) return

        message.status = 'failed'
      })

      // при выходе из аккаунта чаты чужого инстанса показывать нельзя
      .addCase(logout, () => ({ ...initialState, chats: [] }))
  },
})

export const {
  chatSelected,
  createErrorCleared,
  messageAdded,
  messageReceived,
} = chatsSlice.actions

export default chatsSlice.reducer
