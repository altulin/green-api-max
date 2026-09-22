import { useState, type SubmitEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { createChat, createErrorCleared } from '../../store/chatsSlice'
import styles from './NewChatForm.module.scss'

type Props = {
  onCreated?: () => void
}

export function NewChatForm({ onCreated }: Props) {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.chats.createStatus)
  const error = useAppSelector((state) => state.chats.createError)

  const [phone, setPhone] = useState('')

  const isLoading = status === 'loading'

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (phone.trim().length === 0) return

    void dispatch(createChat(phone))
      .unwrap()
      .then(() => {
        setPhone('')
        onCreated?.()
      })
      .catch(() => {
        // текст ошибки уже лежит в состоянии среза
      })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <input
          className={styles.input}
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value)
            if (error !== null) dispatch(createErrorCleared())
          }}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="Номер телефона: 79001234567"
          disabled={isLoading}
          aria-label="Номер телефона получателя"
        />
        <button
          className={styles.button}
          type="submit"
          disabled={isLoading || phone.trim().length === 0}
        >
          {isLoading ? '…' : 'Создать'}
        </button>
      </div>

      {error !== null && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
