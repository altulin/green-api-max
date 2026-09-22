import { useState, type SubmitEvent } from 'react'
import type { Credentials } from '../../api/types'
import { useAppDispatch, useAppSelector } from '../../store'
import { login } from '../../store/authSlice'
import { buildApiUrl } from '../../utils/apiUrl'
import styles from './LoginForm.module.scss'

type FieldErrors = Partial<Record<keyof Credentials, string>>

function validate({
  idInstance,
  apiTokenInstance,
  apiUrl,
}: Credentials): FieldErrors {
  const errors: FieldErrors = {}

  if (idInstance.length === 0) {
    errors.idInstance = 'Введите idInstance из личного кабинета'
  } else if (!/^\d+$/.test(idInstance)) {
    errors.idInstance = 'idInstance состоит только из цифр'
  } else if (idInstance.length < 4) {
    errors.idInstance = 'Слишком короткий idInstance'
  }

  if (apiTokenInstance.length === 0) {
    errors.apiTokenInstance = 'Введите apiTokenInstance из личного кабинета'
  }

  if (apiUrl.length > 0 && !/^https?:\/\/\S+$/.test(apiUrl)) {
    errors.apiUrl = 'Адрес должен начинаться с https://'
  }

  return errors
}

export function LoginForm() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)
  const serverError = useAppSelector((state) => state.auth.error)

  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  const isLoading = status === 'loading'

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const values: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim(),
    }

    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    void dispatch(
      login({
        ...values,
        apiUrl: values.apiUrl || buildApiUrl(values.idInstance),
      }),
    )
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>MAX через GREEN-API</h1>
        <p className={styles.subtitle}>
          Введите данные инстанса из личного кабинета GREEN-API
        </p>

        <label className={styles.field}>
          <span className={styles.label}>idInstance</span>
          <input
            className={styles.input}
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            inputMode="numeric"
            autoComplete="off"
            placeholder="310022739727"
            disabled={isLoading}
            aria-invalid={errors.idInstance !== undefined}
          />
          {errors.idInstance && (
            <span className={styles.fieldError}>{errors.idInstance}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>apiTokenInstance</span>
          <input
            className={styles.input}
            type="password"
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            autoComplete="off"
            placeholder="73afd6e9..."
            disabled={isLoading}
            aria-invalid={errors.apiTokenInstance !== undefined}
          />
          {errors.apiTokenInstance && (
            <span className={styles.fieldError}>{errors.apiTokenInstance}</span>
          )}
        </label>

        <details className={styles.advanced}>
          <summary className={styles.summary}>Дополнительно</summary>
          <label className={styles.field}>
            <span className={styles.label}>API URL</span>
            <input
              className={styles.input}
              value={apiUrl}
              onChange={(event) => setApiUrl(event.target.value)}
              autoComplete="off"
              placeholder={
                idInstance.trim().length >= 4
                  ? buildApiUrl(idInstance.trim())
                  : 'https://3100.api.green-api.com'
              }
              disabled={isLoading}
              aria-invalid={errors.apiUrl !== undefined}
            />
            <span className={styles.hint}>
              Оставьте пустым — адрес возьмём из idInstance
            </span>
            {errors.apiUrl && (
              <span className={styles.fieldError}>{errors.apiUrl}</span>
            )}
          </label>
        </details>

        {serverError && (
          <p className={styles.formError} role="alert">
            {serverError}
          </p>
        )}

        <button className={styles.submit} type="submit" disabled={isLoading}>
          {isLoading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
