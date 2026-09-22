import { useState } from 'react'
import styles from './Avatar.module.scss'

// градиенты аватаров из палитры web.max.ru
const GRADIENTS = ['sky', 'violet', 'green', 'orange', 'coral'] as const

type Props = {
  title: string
  chatId: string
  src?: string | null
  size?: 'small' | 'medium'
}

function pickGradient(chatId: string): (typeof GRADIENTS)[number] {
  let sum = 0
  for (const char of chatId) {
    sum += char.charCodeAt(0)
  }

  return GRADIENTS[sum % GRADIENTS.length]
}

// первая буква имени, а для чатов без имени — две последние цифры номера
function getInitials(title: string): string {
  const letter = title.match(/\p{L}/u)?.[0]
  if (letter !== undefined) return letter.toUpperCase()

  const digits = title.replace(/\D/g, '')
  return digits.slice(-2) || '#'
}

export function Avatar({ title, chatId, src, size = 'medium' }: Props) {
  const [isBroken, setIsBroken] = useState(false)

  const className = `${styles.avatar} ${styles[size]}`

  // ссылка на аватар живёт недолго и может перестать открываться —
  // тогда молча показываем букву
  if (src && !isBroken) {
    return (
      <img
        className={className}
        src={src}
        alt=""
        loading="lazy"
        onError={() => setIsBroken(true)}
      />
    )
  }

  return (
    <div
      className={`${className} ${styles[pickGradient(chatId)]}`}
      aria-hidden="true"
    >
      {getInitials(title)}
    </div>
  )
}
