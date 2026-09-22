import { useState, type KeyboardEvent, type SubmitEvent } from 'react'
import { useAppDispatch } from '../../store'
import { sendTextMessage } from '../../store/chatsSlice'
import styles from './MessageInput.module.scss'

const MAX_LENGTH = 4000 // ограничение метода SendMessage

type Props = {
  chatId: string
}

export function MessageInput({ chatId }: Props) {
  const dispatch = useAppDispatch()
  const [text, setText] = useState('')

  const trimmed = text.trim()
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_LENGTH

  function send() {
    if (!canSend) return

    void dispatch(sendTextMessage({ chatId, text: trimmed }))
    setText('')
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    send()
  }

  // Enter отправляет, Shift+Enter переносит строку
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.pill}>
        <textarea
          className={styles.input}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
          rows={1}
          aria-label="Текст сообщения"
        />

        {trimmed.length > MAX_LENGTH && (
          <span className={styles.counter}>
            {trimmed.length} из {MAX_LENGTH}
          </span>
        )}

        <button
          className={styles.send}
          type="submit"
          disabled={!canSend}
          aria-label="Отправить"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z"
              fill="currentColor"
            ></path>
          </svg>
        </button>
      </div>
    </form>
  )
}
