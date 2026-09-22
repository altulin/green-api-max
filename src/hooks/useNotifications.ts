import { useEffect } from 'react'
import {
  ApiError,
  deleteNotification,
  receiveNotification,
} from '../api/greenApi'
import { useAppDispatch, useAppSelector } from '../store'
import { logout } from '../store/authSlice'
import { messageReceived } from '../store/chatsSlice'
import { parseNotification } from '../utils/parseNotification'

const RECEIVE_TIMEOUT = 20 // секунд держим запрос открытым
const EMPTY_QUEUE_DELAY = 1000
const MIN_ERROR_DELAY = 1000
const MAX_ERROR_DELAY = 30_000

// пауза, которая прерывается вместе с остальными запросами
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })
}

export function useNotifications() {
  const dispatch = useAppDispatch()
  const credentials = useAppSelector((state) => state.auth.credentials)

  useEffect(() => {
    if (credentials === null) return

    // TypeScript не переносит сужение типа внутрь вложенной функции poll,
    // поэтому проверенное значение кладём в отдельную константу
    const activeCredentials = credentials
    let cancelled = false
    const controller = new AbortController()
    const { signal } = controller
    let errorDelay = MIN_ERROR_DELAY

    async function poll() {
      while (!cancelled) {
        try {
          const notification = await receiveNotification(
            activeCredentials,
            RECEIVE_TIMEOUT,
            signal,
          )

          if (cancelled) return

          if (notification === null) {
            await delay(EMPTY_QUEUE_DELAY, signal)
            continue
          }

          const parsed = parseNotification(notification.body)
          if (parsed !== null) {
            dispatch(messageReceived(parsed))
          }

          // удаляем любое уведомление, иначе очередь встанет на нём
          await deleteNotification(
            activeCredentials,
            notification.receiptId,
            signal,
          )
          errorDelay = MIN_ERROR_DELAY
        } catch (error) {
          if (cancelled || signal.aborted) return

          // учётные данные больше не годятся — продолжать бессмысленно
          if (
            error instanceof ApiError &&
            (error.status === 401 || error.status === 403)
          ) {
            dispatch(logout())
            return
          }

          await delay(errorDelay, signal)
          errorDelay = Math.min(errorDelay * 2, MAX_ERROR_DELAY)
        }
      }
    }

    void poll()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [credentials, dispatch])
}
