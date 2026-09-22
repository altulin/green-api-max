const timeFormat = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
})

const dayFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp)
}

function toDayNumber(date: Date): number {
  return Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() /
      86_400_000,
  )
}

// ключ дня для группировки сообщений: одинаковый у всех сообщений одних суток
export function getDayKey(timestamp: number): number {
  return toDayNumber(new Date(timestamp))
}

export function formatDayLabel(timestamp: number): string {
  const diff = toDayNumber(new Date()) - getDayKey(timestamp)

  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Вчера'

  return dayFormat.format(timestamp)
}

// в списке чатов: сегодняшние сообщения показываем временем, остальные — датой
export function formatlistTime(timestamp: number): string {
  const date = new Date(timestamp)
  const today = new Date()

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  return isToday ? timeFormat.format(date) : dateFormat.format(date)
}
