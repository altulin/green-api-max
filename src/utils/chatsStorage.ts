import type { Chat } from '../types/chat'

// список чатов хранится отдельно для каждого инстанса:
// после входа под другим idInstance чужие чаты показывать нельзя
function getStorageKey(idInstance: string): string {
  return `green-api-chats:${idInstance}`
}

function isChat(value: unknown): value is Chat {
  if (typeof value !== 'object' || value === null) return false

  const { chatId, phone, name, avatarUrl } = value as Record<string, unknown>

  return (
    typeof chatId === 'string' &&
    chatId.length > 0 &&
    typeof phone === 'string' &&
    (name === null || typeof name === 'string') &&
    (avatarUrl === null || typeof avatarUrl === 'string')
  )
}

export function loadChats(idInstance: string | null): Chat[] {
  if (idInstance === null) return []

  try {
    const raw = localStorage.getItem(getStorageKey(idInstance))
    if (raw === null) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isChat)
  } catch {
    return []
  }
}

export function saveChats(idInstance: string, chats: Chat[]): void {
  try {
    localStorage.setItem(getStorageKey(idInstance), JSON.stringify(chats))
  } catch {
    //
  }
}

export function clearChats(idInstance: string): void {
  try {
    localStorage.removeItem(getStorageKey(idInstance))
  } catch {
    //
  }
}
