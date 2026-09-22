import { useState, type SubmitEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { login } from '../../store/authSlice'
import { buildApiUrl } from '../../utils/apiUrl'
import styles from './LoginForm.module.scss'

type FormValues = {
  idInstance: string
  apiTokenInstance: string
}

type FieldErrors = Partial<Record<keyof FormValues, string>>

function validate({ idInstance, apiTokenInstance }: FormValues): FieldErrors {
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

  return errors
}

export function LoginForm() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)
  const serverError = useAppSelector((state) => state.auth.error)

  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  const isLoading = status === 'loading'

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const values: FormValues = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }

    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    void dispatch(
      login({
        ...values,
        apiUrl: buildApiUrl(values.idInstance),
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
            placeholder="1101000001"
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
            placeholder="d75b3a66521e4…"
            disabled={isLoading}
            aria-invalid={errors.apiTokenInstance !== undefined}
          />
          {errors.apiTokenInstance && (
            <span className={styles.fieldError}>{errors.apiTokenInstance}</span>
          )}
        </label>

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
