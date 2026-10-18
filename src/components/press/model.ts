// The truth behind the figure: one shared component, released with semver and
// stamped into every app that consumes the design system.

export const STAMP = { w: 16, d: 7, z: 3.8 } // the button die, and the sheet top it lands on

const COLUMNS = [-48, 4, 56]
const ROWS = [-23, 21]

// Each app sheet's centre, and the point where the shared button is stamped.
export const APPS = ROWS.flatMap((cy) => COLUMNS.map((cx) => ({ cx, cy, x: cx + 6, y: cy + 7 })))

export interface Version {
  major: number
  minor: number
}

export const FIRST_VERSION: Version = { major: 2, minor: 4 }

export const nextVersion = ({ major, minor }: Version): Version => ({ major, minor: minor + 1 })

export const versionText = ({ major, minor }: Version) => `v${major}.${minor}.0`

export type Phase = { app: number; stroke: boolean } | null

export function readoutOf(version: Version, stamped: boolean[], phase: Phase) {
  const done = stamped.filter(Boolean).length
  if (phase) return `${versionText(version)} · ${phase.stroke ? 'stamping' : 'moving to'} app ${phase.app + 1}`
  if (done === stamped.length) return `${versionText(version)} · ${done}/${stamped.length} apps · diff 0 px`
  return `${versionText(version)} · ${done}/${stamped.length} apps on latest`
}
