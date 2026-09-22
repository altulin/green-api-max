// MAX принимает только номера России (7) и Беларуси (375)
const PHONE_PATTERN = /^(7\d{10}|375\d{9})$/

// '+7 (902) 515-96-32' → '79025159632', '8 902…' → '7902…'
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }

  return PHONE_PATTERN.test(digits) ? digits : null
}

// '79025159632' → '+7 902 515-96-32'
export function formatPhone(phone: string): string {
  const match = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(phone)
  if (match === null) return `+${phone}`

  const [, code, first, second, third] = match
  return `+7 ${code} ${first}-${second}-${third}`
}
