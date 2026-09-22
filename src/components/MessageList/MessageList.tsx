import { useEffect, useRef } from 'react'
import type { Message } from '../../types/chat'
import { formatDayLabel, formatTime, getDayKey } from '../../utils/formatTime'
import styles from './MessageList.module.scss'

type Props = {
  messages: Message[]
}

export function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // при каждом новом сообщении прокручиваем переписку вниз
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className={styles.list}>
        <p className={styles.empty}>
          Сообщений пока нет. Напишите первым — сообщение уйдёт в MAX.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {/* прижимает переписку к низу, как в MAX */}
      <div className={styles.inner}>
        {messages.map((message, index) => {
          const previous = messages[index - 1]
          const isNewDay =
            previous === undefined ||
            getDayKey(previous.timestamp) !== getDayKey(message.timestamp)

          return (
            <div key={message.id}>
              {isNewDay && (
                <div className={styles.dayRow}>
                  <span className={styles.day}>
                    {formatDayLabel(message.timestamp)}
                  </span>
                </div>
              )}

              <div
                className={`${styles.row} ${message.direction === 'outgoing' ? styles.rowOutgoing : ''}`}
              >
                <div
                  className={`${styles.bubble} ${
                    message.direction === 'outgoing'
                      ? styles.bubbleOutgoing
                      : styles.bubbleIncoming
                  }`}
                >
                  <span className={styles.text}>{message.text}</span>

                  <span className={styles.meta}>
                    <time dateTime={new Date(message.timestamp).toISOString()}>
                      {formatTime(message.timestamp)}
                    </time>

                    {message.direction === 'outgoing' &&
                      (message.status === 'failed' ? (
                        <span
                          className={styles.failed}
                          title="Сообщение не отправлено"
                        >
                          !
                        </span>
                      ) : (
                        <span
                          className={
                            message.status === 'pending' ? styles.pending : ''
                          }
                          title={
                            message.status === 'pending'
                              ? 'Отправляется'
                              : 'Отправлено'
                          }
                        >
                          ✓
                        </span>
                      ))}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
