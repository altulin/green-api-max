import type {
  CheckAccountResponse,
  Credentials,
  DeleteNotificationResponse,
  GetStateInstanceResponse,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from './types'

export class ApiError extends Error {
  status: number
  body: string

  constructor(status: number, body: string, message?: string) {
    super(message ?? `API error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export class ResponseFormatError extends ApiError {
  constructor(body: string) {
    super(200, body, 'Сервер вернул ответ в неизвестном формате')
    this.name = 'ResponseFormatError'
  }
}

type RequestOptions = {
  method: 'GET' | 'POST' | 'DELETE'
  path: string
  suffix?: string
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(
  credentials: Credentials,
  options: RequestOptions,
): Promise<T | null> {
  const { apiUrl, idInstance, apiTokenInstance } = credentials
  const { method, path, suffix = '', body, signal } = options

  const baseUrl = apiUrl.replace(/\/+$/, '') // убираем слеш в конце
  const url = `${baseUrl}/waInstance${idInstance}/${path}/${apiTokenInstance}${suffix}`

  const response = await fetch(url, {
    method,
    signal,
    headers:
      body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new ApiError(response.status, text)
  }

  if (text.trim() === '') {
    return null
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new ResponseFormatError(text)
  }
}

export async function getStateInstance(
  credentials: Credentials,
  signal?: AbortSignal,
) {
  const data = await request<GetStateInstanceResponse>(credentials, {
    method: 'GET',
    path: 'getStateInstance',
    signal,
  })
  if (!data) throw new Error('Пустой ответ сервера')
  return data
}

export async function checkAccount(
  credentials: Credentials,
  phoneNumber: number,
  force?: boolean,
) {
  const data = await request<CheckAccountResponse>(credentials, {
    method: 'POST',
    path: 'checkAccount',
    body: { phoneNumber, force },
  })
  if (!data) throw new Error('Пустой ответ сервера')
  return data
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
) {
  const data = await request<SendMessageResponse>(credentials, {
    method: 'POST',
    path: 'sendMessage',
    body: { chatId, message },
  })

  if (!data) throw new Error('Пустой ответ сервера')
  return data
}

export async function receiveNotification(
  credentials: Credentials,
  receiveTimeout?: number,
  signal?: AbortSignal,
): Promise<ReceiveNotificationResponse | null> {
  const suffix =
    receiveTimeout !== undefined ? `?receiveTimeout=${receiveTimeout}` : ''

  return request<ReceiveNotificationResponse>(credentials, {
    method: 'GET',
    path: 'receiveNotification',
    suffix,
    signal,
  })
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
  signal?: AbortSignal,
) {
  const data = await request<DeleteNotificationResponse>(credentials, {
    method: 'DELETE',
    path: 'deleteNotification',
    suffix: `/${receiptId}`,
    signal,
  })

  if (!data) throw new Error('Пустой ответ сервера')
  return data.result
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ResponseFormatError) {
    return 'Сервер вернул ответ в неизвестном формате. Попробуйте позже'
  }

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return 'Некорректные данные запроса. Проверьте параметры'
      case 401:
        return 'Неверный токен или ID инстанса'
      case 403:
        return 'Проверьте ID инстанса и адрес API'
      case 404:
        return 'Метод или ресурс не найден'
      case 429:
        return 'Слишком много запросов, попробуйте позже'
      case 466:
        return 'Исчерпан лимит тарифа Developer. Смените тариф в личном кабинете GREEN-API'
      case 469:
        return 'Исчерпан лимит проверок на тарифе Developer. Попробуйте через 2 часа'
      case 500:
        return 'Внутренняя ошибка сервера'
      case 502:
        return 'Сервер временно недоступен'
      case 503:
        return 'Сервис недоступен'
      case 504:
        return 'Сервер не ответил вовремя'
      default:
        return `Ошибка сервера (${error.status})`
    }
  }

  if (error instanceof TypeError) {
    return 'Не удалось выполнить запрос. Проверьте соединение и попробуйте ещё раз'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Произошла неизвестная ошибка'
}
