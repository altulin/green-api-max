export type Credentials = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type StateInstance =
  | 'authorized'
  | 'notAuthorized'
  | 'blocked'
  | 'starting'
  | 'suspended'
  | 'pendingPassword'

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

export type SendMessageRequest = {
  chatId: string
  message: string
}

export type SendMessageResponse = {
  idMessage: string
}

export type DeleteNotificationResponse = { result: boolean; reason: string }

export type ReceiveNotificationResponse = {
  receiptId: number
  body: NotificationBody
}

export type SenderData = {
  chatType: 'user' | 'group' | 'channel'
  chatId: string
  senderName: string
  chatName: string
}

export type TextMessageData = {
  typeMessage: 'textMessage'
  textMessageData: { textMessage: string }
}

export type OtherMessageData = { typeMessage: string }

export type ExtendedTextMessageData = {
  typeMessage: 'extendedTextMessage'
  extendedTextMessageData: { text: string }
}

export type MessageData =
  TextMessageData | OtherMessageData | ExtendedTextMessageData

export type MessageNotification = {
  typeWebhook:
    | 'incomingMessageReceived'
    | 'outgoingMessageReceived'
    | 'outgoingAPIMessageReceived'
  idMessage: string
  timestamp: number // секунды
  senderData: SenderData
  messageData: MessageData
}

export type OtherNotification = { typeWebhook: string }

export type NotificationBody = MessageNotification | OtherNotification
