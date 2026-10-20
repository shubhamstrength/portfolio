import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion, useTransform } from 'motion/react'
import { usePointerLook } from './usePointerLook'
import figureSrc from '../../assets/avatar/figure.webp'
import sceneSrc from '../../assets/avatar/scene.webp'
import './avatar.css'

const ease = [0.22, 1, 0.36, 1] as const

// Sparkles over the scene, in the 620 x 620 coordinates of the painting crop.
const sparkles = [
  { x: 70, y: 210, r: 16, delay: 0 },
  { x: 498, y: 52, r: 22, delay: 0.9 },
  { x: 560, y: 300, r: 12, delay: 1.7 },
  { x: 120, y: 470, r: 10, delay: 2.4 },
  { x: 440, y: 150, r: 9, delay: 0.4 },
  { x: 40, y: 360, r: 8, delay: 1.2 },
]

// Sunglass lenses on the figure, so a glint can slide across them.
const lenses = [
  'M192 248 C200 238 236 236 248 244 C254 262 248 290 230 296 C210 300 194 290 190 272 Z',
  'M268 246 C282 236 326 236 338 246 C342 266 330 290 308 292 C286 294 272 282 268 264 Z',
]

const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`

/**
 * Painted portrait split into a background scene and a cut-out figure. The layers move by
 * different amounts as the pointer moves, so the badge reads as a little diorama; hovering
 * or pressing it brings the figure forward, sweeps a glint over the sunglasses and makes
 * the stars flare.
 */
export function Avatar({ name }: { name: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const { x, y } = usePointerLook(ref)
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [hint, setHint] = useState(false)
  const active = hovered || pinned || hint

  // A short flourish once the intro has played, so people find the interaction.
  useEffect(() => {
    if (reduce) return
    const on = setTimeout(() => setHint(true), 2600)
    const off = setTimeout(() => setHint(false), 3800)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
    }
  }, [reduce])

  const tiltY = useTransform(x, (v) => v * 10)
  const tiltX = useTransform(y, (v) => v * -6)
  const sceneX = useTransform(x, (v) => v * -14)
  const sceneY = useTransform(y, (v) => v * -8)
  const figureX = useTransform(x, (v) => v * 10)
  const figureY = useTransform(y, (v) => v * 6)
  const figureRotate = useTransform(x, (v) => v * 2)
  const sparkleX = useTransform(x, (v) => v * -26)
  const sparkleY = useTransform(y, (v) => v * -14)
  const glintX = useTransform(x, (v) => v * -60)

  const lensClip = `lens-${uid}`
  const glint = `glint-${uid}`

  return (
    <motion.button
      ref={ref}
      type="button"
      className="avatar"
      aria-label={`Painted portrait of ${name}`}
      aria-pressed={pinned}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => setPinned((p) => !p)}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease }}
    >
      <motion.span className="avatar__badge" style={{ rotateX: tiltX, rotateY: tiltY }}>
        <motion.img
          className="avatar__scene"
          src={sceneSrc}
          alt=""
          draggable={false}
          style={{ x: sceneX, y: sceneY }}
        />

        <motion.svg className="avatar__layer" viewBox="0 0 620 620" aria-hidden style={{ x: sparkleX, y: sparkleY }}>
          {sparkles.map((s) => (
            <motion.path
              key={`${s.x}-${s.y}`}
              className="avatar__sparkle"
              d={star(s.x, s.y, s.r)}
              style={{ originX: `${s.x}px`, originY: `${s.y}px` }}
              animate={
                reduce
                  ? { opacity: 0.8 }
                  : active
                    ? { scale: [1, 1.8, 1.3], opacity: 1, rotate: 45 }
                    : { scale: [0.7, 1.1, 0.7], opacity: [0.5, 1, 0.5], rotate: 0 }
              }
              transition={
                active
                  ? { duration: 0.6, ease }
                  : { duration: 2.4, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }
              }
            />
          ))}
        </motion.svg>

        <motion.span
          className="avatar__figure"
          style={{ x: figureX, y: figureY, rotate: figureRotate }}
          animate={{ scale: active ? 1.05 : 1 }}
          transition={{ duration: reduce ? 0 : 0.5, ease }}
        >
          <img src={figureSrc} alt="" draggable={false} />
          <svg className="avatar__layer" viewBox="0 0 620 620" aria-hidden>
            <defs>
              <clipPath id={lensClip}>
                {lenses.map((d) => (
                  <path key={d} d={d} />
                ))}
              </clipPath>
              <linearGradient id={glint} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.6" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g clipPath={`url(#${lensClip})`}>
              <motion.g style={{ x: glintX }}>
                <motion.g
                  animate={{ x: active && !reduce ? [-160, 160] : 0 }}
                  transition={{ duration: 0.8, ease }}
                >
                  <path fill={`url(#${glint})`} d="M206 310 L246 226 L262 226 L222 310 Z" />
                  <path fill={`url(#${glint})`} d="M286 310 L326 226 L342 226 L302 310 Z" />
                </motion.g>
              </motion.g>
            </g>
          </svg>
        </motion.span>
      </motion.span>
      <span className="avatar__hint" aria-hidden>
        hover or tap ✦
      </span>
    </motion.button>
  )
}
