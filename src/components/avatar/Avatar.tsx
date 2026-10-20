import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion, useTransform } from 'motion/react'
import { usePointerLook } from './usePointerLook'
import { glasses, head, shirt } from './portrait'
import './avatar.css'

const ease = [0.22, 1, 0.36, 1] as const

// Eye positions under the sunglasses, in the portrait's coordinates. The head is tilted,
// so the right eye sits a little lower than the left.
const eyes = [
  { cx: 288, cy: 248, brow: 'M258 228 C272 218 298 216 316 224 C300 222 276 224 262 232 Z' },
  { cx: 403, cy: 260, brow: 'M374 236 C392 228 418 228 434 238 C420 234 396 234 378 242 Z' },
]

/**
 * Portrait traced from a photo. Layers move by different amounts as the pointer moves,
 * which reads as the head turning; hovering or pressing it pushes the sunglasses up
 * onto the hair so the eyes can follow the pointer too.
 */
export function Avatar({ name }: { name: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const { x, y } = usePointerLook(ref)
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [hint, setHint] = useState(false)
  const peek = hovered || pinned || hint

  // A short peek once the intro has played, so people find the interaction.
  useEffect(() => {
    if (reduce) return
    const on = setTimeout(() => setHint(true), 2600)
    const off = setTimeout(() => setHint(false), 4000)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
    }
  }, [reduce])

  const tiltY = useTransform(x, (v) => v * 10)
  const tiltX = useTransform(y, (v) => v * -6)
  const headX = useTransform(x, (v) => v * 10)
  const headY = useTransform(y, (v) => v * 6)
  const headRotate = useTransform(x, (v) => v * 3)
  const glassesX = useTransform(x, (v) => v * 5)
  const glassesY = useTransform(y, (v) => v * 3)
  const glintX = useTransform(x, (v) => v * -40)
  const pupilX = useTransform(x, (v) => v * 9)
  const pupilY = useTransform(y, (v) => v * 5)
  const shirtX = useTransform(x, (v) => v * 3)

  const frame = `frame-${uid}`
  const lensClip = `lens-${uid}`
  const glint = `glint-${uid}`
  const backdrop = `backdrop-${uid}`
  const lift = { duration: reduce ? 0 : 0.5, ease }

  return (
    <motion.button
      ref={ref}
      type="button"
      className="avatar"
      aria-label={`Illustrated portrait of ${name}. Press to ${pinned ? 'put the sunglasses back on' : 'push the sunglasses up'}.`}
      aria-pressed={pinned}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => setPinned((p) => !p)}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease }}
    >
      <motion.svg
        viewBox="0 0 700 740"
        role="img"
        aria-hidden
        className="avatar__svg"
        style={{ rotateX: tiltX, rotateY: tiltY }}
      >
        <defs>
          <radialGradient id={backdrop} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={glint} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={frame}>
            <circle cx="350" cy="380" r="345" />
          </clipPath>
          <clipPath id={lensClip}>
            <path d={glasses.lens} />
          </clipPath>
        </defs>

        <circle cx="350" cy="380" r="345" fill={`url(#${backdrop})`} />
        <circle className="avatar__ring" cx="350" cy="380" r="345" />

        {/* The head is drawn first so the collar overlaps the neck; only the shirt is
            clipped to the badge, so the hair can break out of the top of the circle. */}
        <motion.g style={{ x: headX, y: headY, rotate: headRotate, originX: '350px', originY: '520px' }}>
          <path fill="#ecbea4" d={head.skin} />
          <path fill="#cf9677" d={head.skinMid} />
          <path fill="#a26650" d={head.skinShadow} />
          <path fill="#4a302a" d={head.beard} />
          <path fill="#2a1c1a" d={head.beardDeep} />
          <path fill="#c47e6e" d="M286 341 C310 361 358 361 382 341 C360 354 310 354 286 341 Z" />
          <path fill="#3a1f1e" d="M282 336 C305 332 355 332 384 338 C360 351 305 351 282 336 Z" />
          <path fill="#f6efe6" d="M293 337 C316 334 352 334 376 339 C356 345 312 345 293 337 Z" />
          <path fill="#2c2630" d={head.hairShine} />
          <path fill="#16141a" d={head.hair} />

          {/* Eyes and brows, seen when the sunglasses go up */}
          {eyes.map((eye) => (
            <g key={eye.cx}>
              <path className="avatar__brow" d={eye.brow} />
              <ellipse className="avatar__eye" cx={eye.cx} cy={eye.cy} rx="22" ry="9" />
              <motion.g style={{ x: pupilX, y: pupilY }}>
                <circle className="avatar__iris" cx={eye.cx} cy={eye.cy} r="8" />
                <circle className="avatar__pupil" cx={eye.cx} cy={eye.cy} r="3.6" />
                <circle className="avatar__catchlight" cx={eye.cx + 3} cy={eye.cy - 3} r="1.8" />
              </motion.g>
              <path
                className="avatar__lid"
                d={`M${eye.cx - 24} ${eye.cy + 1} Q${eye.cx} ${eye.cy - 16} ${eye.cx + 24} ${eye.cy + 1}`}
              />
            </g>
          ))}

          <motion.g style={{ x: glassesX, y: glassesY }}>
            <motion.g
              animate={peek ? { y: -86, rotate: -4, scale: 0.94 } : { y: 0, rotate: 0, scale: 1 }}
              transition={lift}
              style={{ originX: '350px', originY: '250px' }}
            >
              <path fill="#25336e" d={glasses.frame} />
              <path fill="#0d1222" d={glasses.lens} />
              <g clipPath={`url(#${lensClip})`}>
                <motion.g style={{ x: glintX }}>
                  <path fill={`url(#${glint})`} d="M250 300 L300 200 L322 200 L272 300 Z" />
                  <path fill={`url(#${glint})`} d="M366 310 L416 210 L438 210 L388 310 Z" />
                </motion.g>
              </g>
              <circle className="avatar__rivet" cx="246" cy="222" r="3" />
              <circle className="avatar__rivet" cx="452" cy="232" r="3" />
            </motion.g>
          </motion.g>
        </motion.g>

        <motion.g clipPath={`url(#${frame})`} style={{ x: shirtX }}>
          <path fill="#f2f0eb" d={shirt.shirt} />
          <path fill="#d4d4dc" d={shirt.shirtShade} />
          <path fill="#b0b2c2" d={shirt.shirtDeep} />
        </motion.g>
      </motion.svg>
      <span className="avatar__hint" aria-hidden>
        {pinned ? 'tap to put them back' : 'hover or tap to say hi'}
      </span>
    </motion.button>
  )
}
