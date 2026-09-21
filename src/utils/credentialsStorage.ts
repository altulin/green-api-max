import type { Credentials } from '../api/types'

const STORAGE_KEY = 'green-api-credentials'

function isCredentials(value: unknown): value is Credentials {
  if (typeof value !== 'object' || value === null) return false

  const { apiUrl, idInstance, apiTokenInstance } = value as Record<
    string,
    unknown
  >

  return (
    typeof apiUrl === 'string' &&
    apiUrl.length > 0 &&
    typeof idInstance === 'string' &&
    idInstance.length > 0 &&
    typeof apiTokenInstance === 'string' &&
    apiTokenInstance.length > 0
  )
}

export function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isCredentials(parsed)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function saveCredentials(credentials: Credentials): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
  } catch {
    //
  }
}

export function clearCredentials(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    //
  }
}
