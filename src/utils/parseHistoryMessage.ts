import type { ChatHistoryMessage } from '../api/types'
import type { Message } from '../types/chat'

// null означает «в чате показывать нечего»
function extractText(item: ChatHistoryMessage): string | null {
  switch (item.typeMessage) {
    // пустой текст тоже считаем «показывать нечего», поэтому || , а не ??
    case 'textMessage':
      return item.textMessage || null

    case 'extendedTextMessage':
    case 'quotedMessage':
      return item.extendedTextMessage?.text || item.textMessage || null

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
      return item.caption || '[Вложение]'

    case 'locationMessage':
      return '[Геопозиция]'

    case 'contactMessage':
      return '[Контакт]'

    case 'pollMessage':
      return '[Опрос]'

    default:
      return '[Сообщение неподдерживаемого типа]'
  }
}

export function parseHistoryMessage(item: ChatHistoryMessage): Message | null {
  const text = extractText(item)
  if (text === null) return null

  return {
    id: item.idMessage,
    chatId: item.chatId,
    text,
    timestamp: item.timestamp * 1000, // в ответе секунды
    direction: item.type === 'incoming' ? 'incoming' : 'outgoing',
    status: 'sent',
  }
}
