import type { MessageNotification, NotificationBody } from '../api/types'
import type { Message } from '../types/chat'

export type ParsedNotification = {
  message: Message
  chatName: string | null
}

// null означает «в чате показывать нечего»
function extractText(
  messageData: MessageNotification['messageData'],
): string | null {
  switch (messageData.typeMessage) {
    // пустой текст тоже считаем «показывать нечего», поэтому || , а не ??
    case 'textMessage':
      return messageData.textMessageData.textMessage || null

    case 'extendedTextMessage':
    case 'quotedMessage':
      return messageData.extendedTextMessageData.text || null

    // действия над уже существующим сообщением, а не новое сообщение
    case 'reactionMessage':
    case 'editedMessage':
    case 'deletedMessage':
      return null

    case 'imageMessage':
    case 'videoMessage':
    case 'documentMessage':
    case 'audioMessage':
    case 'stickerMessage':
      return messageData.fileMessageData.caption || '[Вложение]'

    case 'locationMessage':
      return '[Геопозиция]'

    case 'contactMessage':
      return '[Контакт]'

    case 'pollMessage':
      return `[Опрос] ${messageData.pollMessageData.name}`

    // тип, которого не было в документации на момент написания
    default:
      return '[Сообщение неподдерживаемого типа]'
  }
}

export function parseNotification(
  body: NotificationBody,
): ParsedNotification | null {
  switch (body.typeWebhook) {
    case 'incomingMessageReceived':
    case 'outgoingMessageReceived':
    case 'outgoingAPIMessageReceived':
      break

    // статусы доставки, смена состояния инстанса, превышение лимита
    default:
      return null
  }

  const text = extractText(body.messageData)
  if (text === null) return null

  const { chatId, chatName, senderName } = body.senderData

  return {
    message: {
      id: body.idMessage,
      chatId,
      text,
      timestamp: body.timestamp * 1000, // в уведомлении секунды
      direction:
        body.typeWebhook === 'incomingMessageReceived'
          ? 'incoming'
          : 'outgoing',
      status: 'sent',
    },
    chatName: chatName || senderName || null,
  }
}
