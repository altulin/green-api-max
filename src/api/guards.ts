import type {
  ExtendedTextMessageData,
  MessageData,
  TextMessageData,
  MessageNotification,
  NotificationBody,
} from './types'

export function isTextMessage(data: MessageData): data is TextMessageData {
  return data.typeMessage === 'textMessage'
}

export function isExtendedTextMessage(
  data: MessageData,
): data is ExtendedTextMessageData {
  return data.typeMessage === 'extendedTextMessage'
}

export function isMessageNotification(
  body: NotificationBody,
): body is MessageNotification {
  return (
    body.typeWebhook === 'incomingMessageReceived' ||
    body.typeWebhook === 'outgoingMessageReceived' ||
    body.typeWebhook === 'outgoingAPIMessageReceived'
  )
}
