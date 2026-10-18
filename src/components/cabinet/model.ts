import { experience, type Role } from '../../data/resume'

// The truth behind the cabinet: one drawer per role, each as tall as the time spent
// there, holding one index card per tool in that role's stack.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const monthIndex = (text: string, now: Date) => {
  if (/present/i.test(text)) return now.getFullYear() * 12 + now.getMonth()
  const [month, year] = text.trim().split(/\s+/)
  return Number(year) * 12 + MONTHS.indexOf(month.slice(0, 3))
}

export function monthsIn(role: Role, now = new Date()) {
  const [from, to] = role.period.split(/\s*[–-]\s*/)
  return Math.max(1, monthIndex(to, now) - monthIndex(from, now))
}

export const tenureText = (months: number) => {
  const years = Math.floor(months / 12)
  const rest = months % 12
  return [years ? `${years} yr` : '', rest ? `${rest} mo` : ''].filter(Boolean).join(' ')
}

// Oldest at the bottom, so the stack reads upward like the career did.
export const ROLES = [...experience].reverse().map((role) => ({ role, months: monthsIn(role) }))

export const readoutOf = (index: number) => {
  const { role, months } = ROLES[index]
  return `${role.company} · ${tenureText(months)} · ${role.stack.length} tools`
}
