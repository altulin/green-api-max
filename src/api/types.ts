export type Credentials = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type StateInstance =
  | 'notAuthorized'
  | 'authorized'
  | 'blocked'
  | 'starting'
  | 'suspended'
  | 'pendingPassword'

export type WebhookType =
  | 'incomingMessageReceived'
  | 'outgoingMessageReceived'
  | 'outgoingAPIMessageReceived'
  | 'outgoingMessageStatus'
  | 'stateInstanceChanged'
  | 'quotaExceeded'

export type SenderData = {
  chatId: string
  chatName: string
  chatType: 'user' | 'group' | 'channel' | 'bot'
  sender: string
  senderName: string
  senderType: 'user' | 'group' | 'channel' | 'bot'
  senderContactName: string
  senderPhoneNumber: number
}

export type QuotedMessage = {
  stanzaId: string
  participant: string
}

export type TextMessageData = {
  typeMessage: 'textMessage'
  textMessageData: {
    textMessage: string
    isForwarded?: boolean
    forwardingScore?: number
  }
  quotedMessage?: QuotedMessage
}

export type ExtendedTextMessageData = {
  typeMessage: 'extendedTextMessage'
  extendedTextMessageData: {
    text: string
    description?: string
    title?: string
    jpegThumbnail?: string
    isForwarded?: boolean
    forwardingScore?: number
  }
  quotedMessage?: QuotedMessage
}

export type QuotedMessageData = {
  typeMessage: 'quotedMessage'
  extendedTextMessageData: {
    text: string
    stanzaId: string
    participant: string
  }
}

export type ReactionMessageData = {
  typeMessage: 'reactionMessage'
  extendedTextMessageData: {
    text: string
  }
  quotedMessage?: QuotedMessage
}

export type FileMessageData = {
  typeMessage:
    | 'imageMessage'
    | 'videoMessage'
    | 'documentMessage'
    | 'audioMessage'
    | 'stickerMessage'
  fileMessageData: {
    downloadUrl: string
    downloadUrlJpeg?: string
    caption?: string
    fileName?: string
    jpegThumbnail?: string
    mimeType?: string
    isAnimated?: boolean
    isForwarded?: boolean
    forwardingScore?: number
  }
  quotedMessage?: QuotedMessage
}

export type LocationMessageData = {
  typeMessage: 'locationMessage'
  locationMessageData: {
    latitude: number
    longitude: number
    isForwarded?: boolean
    forwardingScore?: number
  }
}

export type ContactMessageData = {
  typeMessage: 'contactMessage'
  contactMessageData: {
    chatId: string
    urlAvatar: string
    phoneNumber: string
    displayName: string
    vcard: string
    isForwarded?: boolean
    forwardingScore?: number
  }
}

export type PollMessageData = {
  typeMessage: 'pollMessage'
  pollMessageData: {
    name: string
    options: { optionName: string }[]
    allowToChangeAnswer: boolean
  }
  quotedMessage?: QuotedMessage
}

export type EditedMessageData = {
  typeMessage: 'editedMessage'
  editedMessageData: {
    textMessage: string
    stanzaId: string
  }
}

export type DeletedMessageData = {
  typeMessage: 'deletedMessage'
  deletedMessageData: {
    stanzaId: string
  }
}

export type MessageData =
  | TextMessageData
  | ExtendedTextMessageData
  | FileMessageData
  | LocationMessageData
  | ContactMessageData
  | PollMessageData
  | EditedMessageData
  | DeletedMessageData
  | QuotedMessageData
  | ReactionMessageData

export type NotificationBase<T extends WebhookType, Extra> = {
  typeWebhook: T
  instanceData: { idInstance: number; wid: string; typeInstance: string }
  timestamp: number // секунды Unix
} & Extra

export type MessageWebhookType =
  | 'incomingMessageReceived'
  | 'outgoingMessageReceived'
  | 'outgoingAPIMessageReceived'

export type MessageNotification = NotificationBase<
  MessageWebhookType,
  { idMessage: string; senderData: SenderData; messageData: MessageData }
>

export type OutgoingMessageStatusNotification = NotificationBase<
  'outgoingMessageStatus',
  {
    chatId: string
    idMessage: string
    status: 'delivered' | 'read' | 'failed' | 'noAccount' | 'notInGroup'
    description?: string
  }
>

export type StateInstanceChangedNotification = NotificationBase<
  'stateInstanceChanged',
  {
    stateInstance: StateInstance
  }
>

export type QuotaExceededNotification = NotificationBase<
  'quotaExceeded',
  {
    quotaData: {
      method: 'correspondents'
      used: string
      total: string
      status: string
      description: string
    }
  }
>

export type NotificationBody =
  | MessageNotification
  | OutgoingMessageStatusNotification
  | StateInstanceChangedNotification
  | QuotaExceededNotification

export type GetStateInstanceResponse = {
  stateInstance: StateInstance
}

export type CheckAccountRequest = {
  phoneNumber: number
  force?: boolean
}

export type CheckAccountResponse = {
  exist: boolean
  chatId: string
  fromCache: boolean
}

export type GetContactInfoRequest = {
  chatId: string
}

export type GetContactInfoResponse = {
  chatId: string
  avatar: string // пустая строка, если аватара нет
  name: string // имя из профиля MAX
  contactName: string // имя из записной книжки аккаунта
  chatType: 'user' | 'group' | 'channel' | 'bot'
  phoneNumber: number
}

// История чата приходит в плоском формате, не таком, как уведомления:
// направление лежит в type, а текст — прямо в textMessage.
export type ChatHistoryMessage = {
  type: 'incoming' | 'outgoing'
  idMessage: string
  timestamp: number // секунды
  chatId: string
  typeMessage: string
  textMessage?: string
  extendedTextMessage?: { text?: string }
  caption?: string
  senderName?: string
  statusMessage?: 'sent' | 'delivered' | 'read'
}

export type GetChatHistoryRequest = {
  chatId: string
  count?: number
}

export type GetChatHistoryResponse = ChatHistoryMessage[]

export type SendMessageRequest = {
  chatId: string
  message: string
  typingTime?: number
  quotedMessageId?: string
}

export type SendMessageResponse = {
  idMessage: string
}

export type ReceiveNotificationRequest = {
  receiveTimeout?: number
}

export type ReceiveNotificationResponse = {
  receiptId: number
  body: NotificationBody
}

export type DeleteNotificationRequest = {
  receiptId: number
}

export type DeleteNotificationResponse = {
  result: boolean
  reason: string
}
