import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion, useTransform } from 'motion/react'
import { usePointerLook } from './usePointerLook'
import './avatar.css'

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Flat line-art portrait drawn from a photo. Layers move by different amounts as the
 * pointer moves, which reads as the head turning; hovering or pressing it lowers the
 * sunglasses so the eyes can follow the pointer too.
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
    const off = setTimeout(() => setHint(false), 4200)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
    }
  }, [reduce])

  const headX = useTransform(x, (v) => v * 8)
  const headY = useTransform(y, (v) => v * 5)
  const headRotate = useTransform(x, (v) => v * 4)
  const faceX = useTransform(x, (v) => v * 7)
  const faceY = useTransform(y, (v) => v * 5)
  const hairX = useTransform(x, (v) => v * 3)
  const earX = useTransform(x, (v) => v * -3)
  const glintX = useTransform(x, (v) => v * -16)
  const pupilX = useTransform(x, (v) => v * 4.5)
  const pupilY = useTransform(y, (v) => v * 3)
  const shirtX = useTransform(x, (v) => v * 2)

  const lensClip = `lens-${uid}`
  const glint = `glint-${uid}`
  const backdrop = `backdrop-${uid}`
  const frame = `frame-${uid}`

  return (
    <motion.button
      ref={ref}
      type="button"
      className="avatar"
      aria-label={`Illustrated portrait of ${name}. Press to ${pinned ? 'put the sunglasses back on' : 'lower the sunglasses'}.`}
      aria-pressed={pinned}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => setPinned((p) => !p)}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease }}
    >
      <svg viewBox="0 20 400 384" role="img" aria-hidden className="avatar__svg">
        <defs>
          <radialGradient id={backdrop} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={glint} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={frame}>
            <circle cx="200" cy="215" r="186" />
          </clipPath>
          <clipPath id={lensClip}>
            <path d="M140 180 Q140 176 144 176 L188 178 Q192 178 192 183 L190 210 Q189 218 181 218 L152 218 Q143 218 142 210 Z" />
            <path d="M260 180 Q260 176 256 176 L212 178 Q208 178 208 183 L210 210 Q211 218 219 218 L248 218 Q257 218 258 210 Z" />
          </clipPath>
        </defs>

        <circle cx="200" cy="215" r="190" fill={`url(#${backdrop})`} />
        <circle className="avatar__ring" cx="200" cy="215" r="186" />

        <g clipPath={`url(#${frame})`}>
        {/* Shirt: white, open collar */}
        <motion.g style={{ x: shirtX }} className="avatar__line">
          <path className="avatar__shirt" d="M30 440 C40 384 98 352 158 338 L200 384 L242 338 C302 352 360 384 370 440 Z" />
          <path className="avatar__skin-shade" d="M166 326 L200 386 L234 326 Z" />
          <path className="avatar__shirt" d="M162 322 L146 364 L198 392 L176 342 Z" />
          <path className="avatar__shirt" d="M238 322 L254 364 L202 392 L224 342 Z" />
          <path fill="none" d="M200 392 L200 440" />
          <circle className="avatar__button" cx="206" cy="414" r="3" />
          <path fill="none" className="avatar__fold" d="M92 404 C102 392 118 386 130 384 M308 404 C298 392 282 386 270 384" />
        </motion.g>

        {/* Neck */}
        <path className="avatar__skin-shade avatar__line" d="M172 280 L172 334 C182 344 218 344 228 334 L228 280 Z" />

        <motion.g
          style={{ x: headX, y: headY, rotate: headRotate, transformBox: 'fill-box', transformOrigin: '50% 90%' }}
        >
          {/* Ears */}
          <motion.g style={{ x: earX }} className="avatar__line">
            <ellipse className="avatar__skin" cx="129" cy="214" rx="13" ry="22" />
            <ellipse className="avatar__skin" cx="271" cy="214" rx="13" ry="22" />
            <path fill="none" className="avatar__fine" d="M126 206 Q122 214 128 224 M274 206 Q278 214 272 224" />
          </motion.g>

          {/* Face */}
          <path
            className="avatar__skin avatar__line"
            d="M134 196 C132 150 162 126 200 126 C238 126 268 150 266 196 C266 252 252 296 200 316 C148 296 134 252 134 196 Z"
          />

          {/* Hair: short at the sides, swept up into a quiff */}
          <motion.g style={{ x: hairX }}>
            <path
              className="avatar__hair avatar__line"
              d="M134 206 C128 176 126 146 136 120 C146 94 166 80 192 74 C212 68 234 64 256 68 L246 74 C266 72 282 80 292 94 L281 96 C292 112 292 140 284 160 C278 180 274 194 268 206 C266 184 262 168 254 158 C236 150 220 152 208 148 C190 152 168 150 150 158 C142 168 136 186 134 206 Z"
            />
          </motion.g>

          <motion.g style={{ x: faceX, y: faceY }}>
            {/* Brows rise a little when the glasses come down */}
            <motion.g
              className="avatar__brow"
              animate={{ y: peek ? -6 : 0 }}
              transition={{ duration: 0.4, ease }}
            >
              <path d="M146 170 Q166 160 188 166" />
              <path d="M254 170 Q234 160 212 166" />
            </motion.g>

            {/* Eyes, hidden behind the sunglasses until they dip */}
            <g className="avatar__line">
              <path className="avatar__eye" d="M152 192 Q166 182 182 192 Q166 200 152 192 Z" />
              <path className="avatar__eye" d="M218 192 Q234 182 248 192 Q234 200 218 192 Z" />
            </g>
            <motion.g style={{ x: pupilX, y: pupilY }} className="avatar__pupil">
              <circle cx="167" cy="191.5" r="4.6" />
              <circle cx="233" cy="191.5" r="4.6" />
            </motion.g>

            {/* Nose */}
            <path className="avatar__fine" fill="none" d="M201 204 C199 220 192 232 193 238 C196 243 205 243 209 239" />

            {/* Beard, mustache and smile */}
            <g className="avatar__line">
              <path
                className="avatar__beard"
                d="M136 222 C140 284 166 322 200 330 C234 322 260 284 264 222 C258 246 248 256 236 258 C222 252 210 250 200 252 C190 250 178 252 164 258 C152 256 142 246 136 222 Z"
              />
              <path className="avatar__lip" d="M176 266 C186 288 214 288 224 266 C214 270 186 270 176 266 Z" />
              <path className="avatar__teeth" d="M180 268 C190 278 210 278 220 268 C210 271 190 271 180 268 Z" />
              <path
                className="avatar__beard"
                d="M168 266 C176 252 192 250 200 256 C208 250 224 252 232 266 C222 262 210 260 200 262 C190 260 178 262 168 266 Z"
              />
            </g>
            <path className="avatar__fine" fill="none" d="M196 300 L198 310 M206 302 L204 312 M186 296 L189 305 M214 296 L211 305" />

            {/* Sunglasses: navy square frames */}
            <motion.g animate={{ y: peek ? 30 : 0 }} transition={{ duration: 0.45, ease }}>
              <path className="avatar__temple" d="M140 186 L130 196 M260 186 L270 196" />
              <g className="avatar__frame">
                <path d="M136 182 Q134 172 144 172 L190 174 Q197 174 196 182 L194 212 Q193 224 181 224 L151 224 Q139 224 138 212 Z" />
                <path d="M264 182 Q266 172 256 172 L210 174 Q203 174 204 182 L206 212 Q207 224 219 224 L249 224 Q261 224 262 212 Z" />
                <path d="M194 184 Q200 180 206 184 L206 190 Q200 186 194 190 Z" />
              </g>
              <g className="avatar__lens">
                <path d="M140 180 Q140 176 144 176 L188 178 Q192 178 192 183 L190 210 Q189 218 181 218 L152 218 Q143 218 142 210 Z" />
                <path d="M260 180 Q260 176 256 176 L212 178 Q208 178 208 183 L210 210 Q211 218 219 218 L248 218 Q257 218 258 210 Z" />
              </g>
              <g clipPath={`url(#${lensClip})`}>
                <motion.g style={{ x: glintX }}>
                  <path fill={`url(#${glint})`} d="M146 222 L176 170 L188 170 L158 222 Z" />
                  <path fill={`url(#${glint})`} d="M214 222 L244 170 L256 170 L226 222 Z" />
                </motion.g>
              </g>
              <circle className="avatar__rivet" cx="141" cy="181" r="2" />
              <circle className="avatar__rivet" cx="259" cy="181" r="2" />
            </motion.g>
          </motion.g>
        </motion.g>
        </g>
      </svg>
      <span className="avatar__hint" aria-hidden>
        {pinned ? 'tap to put them back' : 'hover or tap to say hi'}
      </span>
    </motion.button>
  )
}
