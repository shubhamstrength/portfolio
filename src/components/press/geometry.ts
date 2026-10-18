import * as k from '../iso/iso-kit'
import type { Plan, Point3 } from '../iso/iso-kit'
import { APPS, STAMP } from './model'

// A component press: one shared die (the design system's button) stamped onto six
// app sheets by a gantry. Every static path is built once, here, at module load.

export const WIDTH = 600
export const HEIGHT = 430

const PLATE: Plan = { x: -136, y: -92, w: 272, d: 184, r: 8 }
const PLATE_H = 12
const FOOT_H = 5

const RAIL_FROM = -104
const RAIL_TO = 104
const RAILS = [-76, 62] // y of each rail bed (12 deep)
const RAIL_TOP = 7

const LEG_TOP = 86
const BEAM_TOP = 98
const HEAD = { x: 7.5, w: 13, d: 20, z0: 66, z1: 110 }
const DIAL = { r: 9, z: 114, h: 6 }
export const DIAL_TOP = DIAL.z + DIAL.h
// The plunger centre sits this far in +x from the bridge centre.
export const REACH = 14

const ROD = 64
export const PZ_REST = 24
export const PZ_PRESS = STAMP.z
export const PER_TURN = 20 // world units of plunger travel per needle turn

export const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [APPS[0].x - 9, APPS[0].y - 9, DIAL_TOP + 2],
    [APPS[5].x + 9, APPS[5].y + 9, DIAL_TOP + 2],
  ],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: 45 },
)

const at = (point: Point3) => k.iso(point, P)
const S = k.solidSvg
const L = k.lineSvg
const D = k.dotsSvg
const byDepth = <T extends [number, number]>(points: T[]) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`]
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: 'lo' }))
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: 'mid' }))
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: 'mid', inner: L(k.sideSeam(PLATE, -5, P, 8), { tone: 'faint' }) }))
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: 'lo' }))
  const screws = k.corners(PLATE, 10)
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(''), { tone: 'lo' }))
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }))
  return out.join('')
}

function railBed(y: number) {
  const out: string[] = []
  const bed: Plan = { x: RAIL_FROM, y, w: RAIL_TO - RAIL_FROM, d: 12, r: 1.5 }
  out.push(S(k.slabOf(bed, 0, 3, P, 3, 0.4), { tone: 'lo' }))
  out.push(S(k.slabOf({ x: RAIL_FROM + 2, y: y + 3, w: RAIL_TO - RAIL_FROM - 4, d: 6, r: 1 }, 3, RAIL_TOP - 3, P, 3, 0.4), { tone: 'mid' }))
  // Bolts down the rail every 24 units.
  const bolts: [number, number][] = []
  for (let x = RAIL_FROM + 8; x < RAIL_TO - 4; x += 24) bolts.push(at([x, y + 6, RAIL_TOP]))
  out.push(D(bolts, { size: 0.42, tone: 'lo' }))
  const stop = RAIL_FROM - 6
  out.push(S(k.slabOf({ x: stop, y: y - 2, w: 6, d: 16, r: 1.2 }, 0, 11, P, 3, 0.5), { tone: 'mid' }))
  out.push(D([at([stop + 3, y + 1.5, 11]), at([stop + 3, y + 10.5, 11])], { size: 0.45 }))
  // Drive motor at the far end, with cooling ribs as seams round its body.
  const motor: Plan = { x: RAIL_TO, y: y - 2, w: 14, d: 16, r: 1.5 }
  const ribs = [3, 5.5, 8, 10.5].map((z) => L(k.sideSeam(motor, z, P, 3), { tone: 'faint' })).join('')
  out.push(S(k.slabOf(motor, 0, 14, P, 3, 0.6), { tone: 'mid', inner: ribs }))
  out.push(L(k.planOutline(k.insetPlan(motor, 2), 14, P, 3), { tone: 'faint' }))
  out.push(D(k.corners(motor, 2.8).map(([x, yy]) => at([x, yy, 14])), { size: 0.42 }))
  return out.join('')
}

function ruler() {
  const strip: Plan = { x: -96, y: 76, w: 192, d: 6, r: 1 }
  const out = [S(k.slabOf(strip, 0, 0.6, P, 3), { tone: 'lo', crease: 'none' })]
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P)
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }))
  out.push(D([at([strip.x + 2, strip.y + 3, 0.6]), at([strip.x + strip.w - 2, strip.y + 3, 0.6])], { size: 0.45 }))
  return out.join('')
}

// The die library: a rack of turned holders, each with a component die on top.
// The empty pocket is where the button die lives when it is not on the press.
function rack() {
  const RACK: Plan = { x: -128, y: -54, w: 20, d: 80, r: 2 }
  const top = 8
  const out = [S(k.slabOf(RACK, 0, top, P, 4, 0.6), { tone: 'mid', inner: L(k.sideSeam(RACK, 3, P, 4), { tone: 'faint' }) })]
  out.push(L(k.planOutline(k.insetPlan(RACK, 2.5), top, P, 4), { tone: 'faint' }))
  out.push(D([at([RACK.x + 4, RACK.y + 4, top]), at([RACK.x + 16, RACK.y + 4, top]), at([RACK.x + 4, RACK.y + RACK.d - 4, top]), at([RACK.x + 16, RACK.y + RACK.d - 4, top])], { size: 0.45 }))
  const cx = RACK.x + RACK.w / 2
  const dies: (Plan | null)[] = [
    { x: cx - 7, y: 0, w: 14, d: 5, r: 1.2 }, // input field
    { x: cx - 6, y: 0, w: 12, d: 10, r: 1.6 }, // card
    { x: cx - 5, y: 0, w: 10, d: 5, r: 2.5 }, // toggle
    null, // the button die is on the press
  ]
  dies.forEach((die, index) => {
    const cy = RACK.y + 12 + index * 18.5
    out.push(L(k.ring(cx, cy, 6.6, top, P, 40), { tone: 'lo' }))
    if (!die) {
      out.push(L(k.ring(cx, cy, 4, top, P, 32), { tone: 'faint' }))
      return
    }
    out.push(S(k.cylinder(cx, cy, 5, top, 3, P, 32), { tone: 'mid' }))
    const plan = { ...die, y: cy - die.d / 2 }
    out.push(S(k.slabOf(plan, top + 3, 2, P, 3, 0.3), { tone: 'hi', crease: 'lo' }))
    if (index === 2) out.push(S(k.cylinder(plan.x + plan.w - 2.5, cy, 1.6, top + 5, 0.8, P, 16), { tone: 'hi' }))
    if (index === 1) out.push(L(k.lineOnTop([plan.x, plan.y + 3.5], [plan.x + plan.w, plan.y + 3.5], top + 5, P), { tone: 'lo' }))
  })
  return out.join('')
}

function labelPlate() {
  const plan: Plan = { x: -129, y: 30, w: 18, d: 26, r: 1.5 }
  const out = [S(k.slabOf(plan, 0, 0.8, P, 4), { tone: 'lo' })]
  out.push(L(k.planOutline(k.insetPlan(plan, 1.6), 0.8, P, 4), { tone: 'faint' }))
  for (const [index, length] of [16, 10, 13].entries()) {
    const x = plan.x + 5 + index * 3.6
    out.push(L(k.lineOnTop([x, plan.y + 5], [x, plan.y + 5 + length], 0.8, P), { tone: 'lo', free: true }))
  }
  out.push(D([at([plan.x + 3, plan.y + 3, 0.8]), at([plan.x + plan.w - 3, plan.y + plan.d - 3, 0.8])], { size: 0.4 }))
  return out.join('')
}

// The bed the app sheets are clamped to: a T-slot plate with stop pins.
function bed() {
  const plan: Plan = { x: -80, y: -46, w: 164, d: 90, r: 3 }
  const out = [S(k.slabOf(plan, 0, BED_Z, P, 4, 0.5), { tone: 'lo' })]
  const slots: string[] = []
  for (let y = plan.y + 9; y < plan.y + plan.d - 4; y += 12) slots.push(k.lineOnTop([plan.x, y], [plan.x + plan.w, y], BED_Z, P))
  out.push(L(slots.join(''), { tone: 'faint' }))
  out.push(D(k.corners(plan, 4).map(([x, y]) => at([x, y, BED_Z])), { size: 0.45 }))
  return out.join('')
}

// One app: a sheet with a title bar, window dots, rule lines for content and the
// seat where the shared button lands.
export const seatOf = (index: number): Plan => {
  const app = APPS[index]
  return { x: app.x - STAMP.w / 2, y: app.y - STAMP.d / 2, w: STAMP.w, d: STAMP.d, r: STAMP.d / 2 }
}

const BED_Z = 2.2
const SHEET_Z = STAMP.z

function sheet(index: number) {
  const { cx, cy } = APPS[index]
  const plan: Plan = { x: cx - 23, y: cy - 17, w: 46, d: 34, r: 2 }
  const out = [S(k.slabOf(plan, BED_Z, SHEET_Z - BED_Z, P, 4, 0.3), { tone: 'hi', crease: 'lo' })]
  out.push(L(k.lineOnTop([plan.x, plan.y + 6], [plan.x + plan.w, plan.y + 6], SHEET_Z, P), { tone: 'lo' }))
  out.push(D([0, 1, 2].map((i) => at([plan.x + 3.5 + i * 2.6, plan.y + 3, SHEET_Z])), { size: 0.55, tone: 'mid' }))
  for (const [i, length] of [22, 14, 18].entries()) {
    const y = plan.y + 11 + i * 3.4
    out.push(L(k.lineOnTop([plan.x + 4, y], [plan.x + 4 + length, y], SHEET_Z, P), { tone: 'mid', free: true }))
  }
  out.push(L(k.planOutline(seatOf(index), SHEET_Z, P, 6), { tone: 'faint' }))
  return out.join('')
}

// The stamped button: drawn on every sheet, faded in when the press lands.
function mark(index: number) {
  const seat = seatOf(index)
  const out = [S(k.slabOf(seat, SHEET_Z, 0.9, P, 6, 0.3), { tone: 'hi', crease: 'lo' })]
  const y = seat.y + seat.d / 2
  out.push(L(k.lineOnTop([seat.x + 5, y], [seat.x + seat.w - 5, y], SHEET_Z + 0.9, P), { tone: 'mid', free: true }))
  return out.join('')
}

function truck(railY: number, near: boolean) {
  const out: string[] = []
  const plan: Plan = { x: -11, y: railY - 1, w: 22, d: 14, r: 2 }
  out.push(S(k.slabOf(plan, RAIL_TOP, 6, P, 3, 0.5), { tone: 'mid', inner: L(k.sideSeam(plan, RAIL_TOP + 2, P, 3), { tone: 'faint' }) }))
  out.push(D(k.corners(plan, 2.6).map(([x, y]) => at([x, y, RAIL_TOP + 6])), { size: 0.45 }))
  if (near) {
    // Pointer over the ruler strip.
    const shelf: Plan = { x: -3.5, y: railY + 13, w: 7, d: 5.5, r: 0.8 }
    out.push(S(k.slabOf(shelf, RAIL_TOP, 1.6, P, 2, 0.3), { tone: 'mid' }))
    out.push(L(k.lineOnTop([0, shelf.y], [0, shelf.y + shelf.d], RAIL_TOP + 1.6, P), { tone: 'hi' }))
  }
  const leg: Plan = { x: -5, y: railY + 1, w: 10, d: 10, r: 1.5 }
  const seams = [30, 58].map((z) => L(k.sideSeam(leg, z, P, 3), { tone: 'faint' })).join('')
  out.push(S(k.slabOf(leg, RAIL_TOP + 6, LEG_TOP - RAIL_TOP - 6, P, 3, 0.4), { tone: 'mid', inner: seams }))
  return out.join('')
}

function beam() {
  const plan: Plan = { x: -6, y: -78, w: 12, d: 152, r: 2 }
  const out = [S(k.slabOf(plan, LEG_TOP, BEAM_TOP - LEG_TOP, P, 4, 0.6), { tone: 'mid' })]
  out.push(D([-72, -40, -8, 24, 56].map((y) => at([0, y, BEAM_TOP])), { size: 0.45, tone: 'lo' }))
  // Linear guide on the face toward the viewer, which the head runs on.
  out.push(S(k.slabOf({ x: 6, y: -70, w: 1.6, d: 136, r: 0.6 }, 89, 5, P, 2), { tone: 'mid' }))
  return out.join('')
}

function plunger() {
  // Built with the stamp's bottom at z = 0; moved up and down as one piece.
  const x = REACH
  const out: string[] = []
  const die: Plan = { x: x - STAMP.w / 2, y: -STAMP.d / 2, w: STAMP.w, d: STAMP.d, r: STAMP.d / 2 }
  out.push(S(k.cylinder(x, 0, 2, 6, ROD, P, 20), { tone: 'hi', crease: 'none' }))
  out.push(L(k.sideArc(x, 0, 2, 14, P, 12), { tone: 'lo' }))
  out.push(S(k.cylinder(x, 0, 4.4, 3, 3, P, 28), { tone: 'mid' }))
  out.push(L(k.knurl(x, 0, 4.4, 3, 6, 22, P), { tone: 'lo' }))
  out.push(S(k.slabOf(die, 0, 3, P, 6, 0.4), { tone: 'hi', lit: true }))
  return out.join('')
}

function headBody() {
  const out: string[] = []
  const x = REACH
  out.push(S(k.cylinder(x, 0, 4.6, HEAD.z0 - 4, 4, P, 28), { tone: 'mid' }))
  out.push(L(k.sideArc(x, 0, 4.6, HEAD.z0 - 2, P, 20), { tone: 'faint' }))
  const plan: Plan = { x: HEAD.x, y: -HEAD.d / 2, w: HEAD.w, d: HEAD.d, r: 2 }
  const seams = [HEAD.z0 + 8, HEAD.z1 - 8].map((z) => L(k.sideSeam(plan, z, P, 4), { tone: 'faint' })).join('')
  out.push(S(k.slabOf(plan, HEAD.z0, HEAD.z1 - HEAD.z0, P, 4, 0.6), { tone: 'mid', inner: seams }))
  // Cover plate on the front face, with four screws.
  const face = HEAD.x + HEAD.w
  out.push(S(k.slabOf({ x: face, y: -6.5, w: 1.2, d: 13, r: 0.5 }, HEAD.z0 + 13, 18, P, 2), { tone: 'mid' }))
  out.push(D([[-4.5, HEAD.z0 + 15.5], [4.5, HEAD.z0 + 15.5], [-4.5, HEAD.z0 + 28.5], [4.5, HEAD.z0 + 28.5]].map(([y, z]) => at([face + 1.2, y, z])), { size: 0.42 }))
  out.push(L(k.planOutline(k.insetPlan(plan, 2.2), HEAD.z1, P, 4), { tone: 'faint' }))
  return out.join('')
}

function dial() {
  const out: string[] = []
  const x = REACH
  out.push(S(k.cylinder(x, 0, 2.4, HEAD.z1, DIAL.z - HEAD.z1, P, 20), { tone: 'mid' }))
  out.push(S(k.cylinder(x, 0, DIAL.r, DIAL.z, DIAL.h, P, 56, 0.6), { tone: 'hi', crease: 'lo' }))
  out.push(L(k.knurl(x, 0, DIAL.r, DIAL_TOP - 2.6, DIAL_TOP, 54, P, 0.3), { tone: 'lo' }))
  out.push(L(k.sideArc(x, 0, DIAL.r, DIAL_TOP - 2.6, P, 32), { tone: 'faint' }))
  out.push(L(k.ring(x, 0, DIAL.r - 1.4, DIAL_TOP, P, 56), { tone: 'lo' }))
  const ticks = k.radialTicks(x, 0, DIAL.r - 1.6, 40, 5, DIAL_TOP, [0.9, 1.9], P)
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }))
  out.push(L(k.ring(x, 0, 1, DIAL_TOP, P, 16), { tone: 'mid' }))
  return out.join('')
}

export const needleAt = (travel: number) => {
  const angle = (travel / PER_TURN) * Math.PI * 2
  const x = REACH
  return k.lineOnTop(
    [x - Math.sin(angle) * 2, Math.cos(angle) * 2],
    [x + Math.sin(angle) * (DIAL.r - 2.4), -Math.cos(angle) * (DIAL.r - 2.4)],
    DIAL_TOP + 0.2,
    P,
  )
}

// The release console: version dial, keys and a status lamp.
function consoleBox() {
  const plan: Plan = { x: 108, y: -38, w: 20, d: 58, r: 3 }
  const top = 16
  const out = [`<path class="iso-halo" d="${k.haloOf(plan, 0, 2, P)}" style="filter:blur(5px)"/>`]
  // Motor cables lie on the plate between each drive and the console.
  for (const [from, to] of [[RAILS[0] + 14, plan.y], [RAILS[1] - 2, plan.y + plan.d]]) {
    out.push(k.wireSvg(at([RAIL_TO + 9, from, 0]), at([RAIL_TO + 9, to, 0]), { via: [at([RAIL_TO + 9, (from + to) / 2, 0])], tone: 'mid', size: 1 }))
  }
  out.push(S(k.slabOf(plan, 0, top, P, 4, 0.8), { tone: 'mid', inner: L(k.sideSeam(plan, 4, P, 4), { tone: 'faint' }) }))
  out.push(L(k.planOutline(k.insetPlan(plan, 2.4), top, P, 4), { tone: 'faint' }))
  // Keys.
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 2; col++) {
      const key: Plan = { x: plan.x + 4 + col * 6.6, y: plan.y + 5 + row * 6.4, w: 5, d: 4.4, r: 0.8 }
      out.push(S(k.slabOf(key, top, 1, P, 2, 0.2), { tone: 'mid' }))
    }
  }
  // Version dial.
  const [kx, ky] = [plan.x + 10, plan.y + 42]
  out.push(L(k.ring(kx, ky, 7.4, top, P, 40), { tone: 'lo' }))
  const t = k.radialTicks(kx, ky, 7.2, 12, 3, top, [0.9, 1.7], P, -Math.PI * 0.75, Math.PI * 1.5)
  out.push(L(t.minor, { tone: 'lo' }), L(t.major, { tone: 'mid' }))
  out.push(S(k.cylinder(kx, ky, 4.8, top, 4, P, 32), { tone: 'mid' }))
  out.push(L(k.knurl(kx, ky, 4.8, top, top + 4, 30, P), { tone: 'lo' }))
  out.push(L(k.lineOnTop([kx, ky], [kx - 2.4, ky - 3.6], top + 4, P), { tone: 'hi', free: 'end' }))
  out.push(D([at([kx, ky, top + 4])], { size: 0.5, tone: 'hi' }))
  // Lamp.
  out.push(S(k.cylinder(plan.x + 10, plan.y + 30.5, 1.8, top, 1.4, P, 16), { tone: 'hi' }))
  return out.join('')
}

export const ART = {
  base: [plate(), railBed(RAILS[0]), rack(), labelPlate(), bed()].join(''),
  sheets: APPS.map((_, index) => sheet(index)),
  marks: APPS.map((_, index) => mark(index)),
  nearRail: railBed(RAILS[1]) + ruler(),
  legs: truck(RAILS[0], false) + truck(RAILS[1], true),
  beam: beam(),
  plunger: plunger(),
  head: headBody() + dial(),
  console: consoleBox(),
}

export const move = (by: Point3) => k.translateAlong(P, by)
export const screenOf = (point: Point3) => at(point)
