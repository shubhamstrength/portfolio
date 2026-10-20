import { experience, type Role } from '../../data/resume'

// One cabinet drawer per role, sized by tenure.

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

// Latest role in the top drawer; each drawer front is as tall as the time spent there.
export const DRAWERS = experience.map((role) => ({ role, months: monthsIn(role) }))
