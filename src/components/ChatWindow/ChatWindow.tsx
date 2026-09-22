import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { chatClosed, loadChatHistory } from '../../store/chatsSlice'
import type { Message } from '../../types/chat'
import { formatPhone } from '../../utils/phone'
import { Avatar } from '../Avatar/Avatar'
import { MessageInput } from '../MessageInput/MessageInput'
import { MessageList } from '../MessageList/MessageList'
import styles from './ChatWindow.module.scss'

// одна и та же ссылка на пустой массив: иначе при каждом показе чата
// без сообщений создавался бы новый массив
const EMPTY_MESSAGES: Message[] = []

export function ChatWindow() {
  const dispatch = useAppDispatch()
  const activeChatId = useAppSelector((state) => state.chats.activeChatId)
  const chats = useAppSelector((state) => state.chats.chats)
  const messagesByChat = useAppSelector((state) => state.chats.messagesByChat)

  // историю подгружаем при первом открытии чата, повторы отсекает сам thunk
  useEffect(() => {
    if (activeChatId !== null) {
      void dispatch(loadChatHistory(activeChatId))
    }
  }, [activeChatId, dispatch])

  const chat = chats.find((item) => item.chatId === activeChatId)

  if (chat === undefined) {
    return (
      <section className={styles.window}>
        <p className={styles.placeholder}>
          Выберите чат слева или создайте новый по номеру телефона
        </p>
      </section>
    )
  }

  const title = chat.name ?? formatPhone(chat.phone)
  const messages = messagesByChat[chat.chatId] ?? EMPTY_MESSAGES

  return (
    <section className={styles.window}>
      <header className={styles.header}>
        <button
          className={styles.back}
          type="button"
          onClick={() => dispatch(chatClosed())}
          aria-label="К списку чатов"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Avatar
          title={title}
          chatId={chat.chatId}
          src={chat.avatarUrl}
          size="small"
        />
        <div className={styles.headerText}>
          <span className={styles.name}>{title}</span>
          <span className={styles.subtitle}>
            {chat.name === null ? 'MAX' : formatPhone(chat.phone)}
          </span>
        </div>
      </header>

      <MessageList messages={messages} />
      <MessageInput chatId={chat.chatId} />
    </section>
  )
}
