import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { logout } from '../../store/authSlice'
import { chatSelected } from '../../store/chatsSlice'
import { formatlistTime } from '../../utils/formatTime'
import { formatPhone } from '../../utils/phone'
import { Avatar } from '../Avatar/Avatar'
import { NewChatForm } from '../NewChatForm/NewChatForm'
import styles from './Sidebar.module.scss'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const chats = useAppSelector((state) => state.chats.chats)
  const messagesByChat = useAppSelector((state) => state.chats.messagesByChat)
  const activeChatId = useAppSelector((state) => state.chats.activeChatId)

  // форма открыта сразу: с пустым списком иначе непонятно, с чего начинать
  const [isFormVisible, setIsFormVisible] = useState(true)

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <h1 className={styles.title}>Чаты</h1>

        <button
          className={styles.logout}
          type="button"
          onClick={() => dispatch(logout())}
        >
          Выйти
        </button>

        <button
          className={`${styles.add} ${isFormVisible ? styles.addOpen : ''}`}
          type="button"
          onClick={() => setIsFormVisible((value) => !value)}
          aria-expanded={isFormVisible}
          aria-label={isFormVisible ? 'Скрыть форму' : 'Новый чат'}
          title={isFormVisible ? 'Скрыть форму' : 'Новый чат'}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      {isFormVisible && (
        <NewChatForm onCreated={() => setIsFormVisible(false)} />
      )}

      {chats.length === 0 ? (
        <p className={styles.empty}>
          Чатов пока нет. Введите номер телефона получателя, чтобы начать
          переписку.
        </p>
      ) : (
        <ul className={styles.list}>
          {chats.map((chat) => {
            const messages = messagesByChat[chat.chatId] ?? []
            const lastMessage = messages[messages.length - 1]
            const title = chat.name ?? formatPhone(chat.phone)

            return (
              <li key={chat.chatId}>
                <button
                  className={`${styles.item} ${chat.chatId === activeChatId ? styles.itemActive : ''}`}
                  type="button"
                  onClick={() => dispatch(chatSelected(chat.chatId))}
                >
                  <Avatar
                    title={title}
                    chatId={chat.chatId}
                    src={chat.avatarUrl}
                  />

                  <span className={styles.itemBody}>
                    <span className={styles.itemTop}>
                      <span className={styles.itemName}>{title}</span>
                      {lastMessage && (
                        <span className={styles.itemTime}>
                          {formatlistTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </span>

                    <span className={styles.itemPreview}>
                      {lastMessage
                        ? `${lastMessage.direction === 'outgoing' ? 'Вы: ' : ''}${lastMessage.text}`
                        : 'Нет сообщений'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
