const API_HOST_SUFFIX = '.api.green-api.com'

// Адрес сервера GREEN-API совпадает с первыми четырьмя цифрами idInstance:
// 1101000001 → https://1101.api.green-api.com
export function buildApiUrl(idInstance: string): string {
  return `https://${idInstance.slice(0, 4)}${API_HOST_SUFFIX}`
}
