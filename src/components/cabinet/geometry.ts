import * as k from '../iso/iso-kit'
import type { Plan, Point3 } from '../iso/iso-kit'
import { ROLES } from './model'

// A card cabinet: one drawer per role, stacked oldest at the bottom. Each drawer is as
// tall as the months spent in the role and holds one index card per tool in its stack.

export const WIDTH = 560
export const HEIGHT = 470

const PER_MONTH = 0.6
const GAP = 1.2
const BASE_Z = 5 // plinth top
const FRONT = { y: -29, d: 58, t: 1.6 }
export const OPEN = 30 // full drawer travel
const CARD_STEP = 3.4
const CARD_FROM = 3.2

const PLATE: Plan = { x: -60, y: -48, w: 114, d: 96, r: 6 }
const PLATE_H = 8
const FOOT_H = 5
const CASE: Plan = { x: -44, y: -31, w: 44, d: 62, r: 2 }

export const DRAWERS = (() => {
  let z = BASE_Z + GAP
  return ROLES.map(({ role, months }) => {
    const h = months * PER_MONTH
    const drawer = { z0: z, z1: z + h, mid: z + h / 2, cards: role.stack.length }
    z += h + GAP
    return drawer
  })
})()

const STACK_TOP = DRAWERS[DRAWERS.length - 1].z1 + GAP
const CASE_TOP = STACK_TOP + 3

export const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(CASE, 0, CASE_TOP + 2), [OPEN + 6, FRONT.y + FRONT.d, DRAWERS[DRAWERS.length - 1].z1]],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: 36 },
)

const at = (point: Point3) => k.iso(point, P)
const S = k.solidSvg
const L = k.lineSvg
const D = k.dotsSvg
const byDepth = <T extends [number, number]>(points: T[]) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`]
  for (const [x, y] of byDepth(k.corners(PLATE, 18))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 28), { tone: 'lo' }))
    out.push(S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 28), { tone: 'mid' }))
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: 'mid', inner: L(k.sideSeam(PLATE, -3.5, P, 8), { tone: 'faint' }) }))
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4.5), 0, P), { tone: 'lo' }))
  const screws = k.corners(PLATE, 9)
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(''), { tone: 'lo' }))
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }))

  // Travel ruler in front of the drawers, read by the open drawer's front.
  const strip: Plan = { x: 2, y: 34, w: OPEN + 8, d: 6, r: 1 }
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: 'lo', crease: 'none' }))
  const ticks = k.topTicks(strip.x + 2, strip.x + OPEN + 2, 2, 5, strip.y + 0.6, 0.6, [1.6, 3], P)
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }))
  out.push(D([at([strip.x + strip.w - 2, strip.y + 3, 0.6])], { size: 0.45 }))

  // Label plate on the far corner.
  const label: Plan = { x: 14, y: -40, w: 26, d: 14, r: 1.5 }
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: 'lo' }))
  out.push(L(k.planOutline(k.insetPlan(label, 1.5), 0.8, P, 4), { tone: 'faint' }))
  for (const [i, length] of [18, 11, 14].entries()) {
    const y = label.y + 4 + i * 3
    out.push(L(k.lineOnTop([label.x + 4, y], [label.x + 4 + length, y], 0.8, P), { tone: 'lo', free: true }))
  }
  return out.join('')
}

function cabinet() {
  const out: string[] = []
  const plinth = k.insetPlan(CASE, 2)
  out.push(S(k.slabOf(plinth, 0, BASE_Z, P, 4, 0.4), { tone: 'lo' }))
  const seams = [STACK_TOP].map((z) => L(k.sideSeam(CASE, z, P, 4), { tone: 'faint' })).join('')
  out.push(S(k.slabOf(CASE, BASE_Z, CASE_TOP - BASE_Z, P, 4, 0.8), { tone: 'mid', inner: seams }))
  out.push(L(k.planOutline(k.insetPlan(CASE, 3), CASE_TOP, P, 4), { tone: 'faint' }))
  out.push(D(k.corners(CASE, 5).map(([x, y]) => at([x, y, CASE_TOP])), { size: 0.45 }))

  // Time scale on the side: a tick every six months up the stack, a long one each year.
  const face = CASE.y + CASE.d
  const strip: Plan = { x: -11, y: face, w: 5, d: 0.6, r: 0.2 }
  const z0 = DRAWERS[0].z0
  out.push(S(k.slabOf(strip, z0, STACK_TOP - GAP - z0, P, 2), { tone: 'lo', crease: 'none' }))
  const minor: string[] = []
  const major: string[] = []
  for (let month = 0, z = z0; z <= STACK_TOP - GAP + 0.01; month += 6, z = z0 + month * PER_MONTH) {
    const long = month % 12 === 0
    const edge = strip.x + strip.w
    ;(long ? major : minor).push(k.segment([edge, face + 0.6, z], [edge - (long ? 3.2 : 1.8), face + 0.6, z], P))
  }
  out.push(L(minor.join(''), { tone: 'lo' }), L(major.join(''), { tone: 'mid' }))
  return out.join('')
}

// Parts of one drawer that move with its front, built closed (open = 0).
function front(index: number) {
  const { z0, z1, mid, cards } = DRAWERS[index]
  const out: string[] = []
  // Index cards behind the front, one per tool, with staggered tabs.
  const rim = z1 - 1.2
  const cardParts: string[] = []
  for (let j = 0; j < cards; j++) {
    const x = -CARD_FROM - j * CARD_STEP
    const card: Plan = { x: x - 0.35, y: -21, w: 0.7, d: 36, r: 0.3 }
    const tab: Plan = { x: x - 0.35, y: -19 + (j % 4) * 8.4, w: 0.7, d: 6, r: 0.3 }
    cardParts.push(
      `<g data-card="${j}" opacity="0">${S(k.slabOf(card, rim, 1.8, P, 2), { tone: 'hi', crease: 'lo' })}${S(k.slabOf(tab, rim + 1.8, 0.5, P, 2), { tone: 'hi', crease: 'lo' })}</g>`,
    )
  }
  out.push(cardParts.reverse().join(''))
  const plan: Plan = { x: 0, y: FRONT.y, w: FRONT.t, d: FRONT.d, r: 0.8 }
  out.push(`<g data-front>${S(k.slabOf(plan, z0, z1 - z0, P, 3, 0.4), { tone: 'mid' })}</g>`)
  // Bar pull on two posts.
  const face = FRONT.t
  for (const y of [-10, 10]) out.push(S(k.slabOf({ x: face, y: y - 1, w: 2.4, d: 2, r: 0.6 }, mid - 0.9, 1.8, P, 2), { tone: 'mid', crease: 'none' }))
  out.push(S(k.slabOf({ x: face + 2.4, y: -11.5, w: 1.4, d: 23, r: 0.7 }, mid - 0.7, 1.4, P, 3, 0.2), { tone: 'hi', crease: 'lo' }))
  // Label holder with its card and two rivets.
  const holder: Plan = { x: face, y: 14, w: 0.4, d: 11, r: 0.3 }
  out.push(S(k.slabOf(holder, mid - 1.6, 3.2, P, 2), { tone: 'mid' }))
  out.push(L(k.segment([face + 0.4, 16, mid], [face + 0.4, 22, mid], P), { tone: 'lo', free: true }))
  out.push(D([at([face + 0.4, 15, mid + 1]), at([face + 0.4, 24, mid + 1])], { size: 0.4 }))
  return out.join('')
}

// The drawer box between the case front and the back of the drawer front, rebuilt as it slides.
export function bodyAt(index: number, open: number) {
  if (open < 0.3) return ''
  const { z0, z1 } = DRAWERS[index]
  const plan: Plan = { x: 0, y: FRONT.y + 1.5, w: open, d: FRONT.d - 3, r: 0.6 }
  const top = z1 - 1.2
  const body = S(k.slabOf(plan, z0 + 0.6, top - z0 - 0.6, P, 2), { tone: 'mid' })
  if (open < 2.4) return body
  const inside = k.onTop(k.ringOf({ x: 0, y: plan.y + 1, w: open - 1, d: plan.d - 2, r: 0.3 }, 2), top, P, true)
  return `${body}<path class="iso-shade" data-shade="0" d="${inside}"/>${L(inside, { tone: 'faint' })}`
}

export const cardOpacity = (card: number, open: number) => {
  const x = open - CARD_FROM - card * CARD_STEP
  return Math.min(1, Math.max(0, (x - 0.8) / 1.6))
}

export const ART = {
  base: plate() + cabinet(),
  fronts: DRAWERS.map((_, index) => front(index)),
}

export const move = (by: Point3) => k.translateAlong(P, by)
