export type Chat = {
  chatId: string
  phone: string
  name: string | null
  avatarUrl: string | null
}

export type MessageDirection = 'incoming' | 'outgoing'

export type MessageStatus = 'pending' | 'sent' | 'failed'

export type Message = {
  id: string
  chatId: string
  text: string
  timestamp: number // миллисекунды
  direction: MessageDirection
  status: MessageStatus
}
