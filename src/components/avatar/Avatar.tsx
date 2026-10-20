import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion, useTransform } from 'motion/react'
import { usePointerLook } from './usePointerLook'
import './avatar.css'

const ease = [0.22, 1, 0.36, 1] as const

// Eye centres in the drawing's coordinates. The head is tilted, so the right eye sits lower.
const eyes = [
  { cx: 288, cy: 250, brow: 'M254 226 C272 214 300 212 320 222', lid: 'M264 248 C276 236 300 234 312 244' },
  { cx: 404, cy: 262, brow: 'M380 236 C400 228 428 228 446 240', lid: 'M380 260 C392 248 416 246 428 256' },
]

const lenses = [
  'M244 214 L334 224 C338 225 340 229 339 233 L334 262 C331 278 321 285 302 285 L270 284 C256 283 249 275 247 262 Z',
  'M358 228 L458 222 C462 222 464 226 463 230 L457 268 C453 288 443 297 424 297 L390 296 C374 295 366 287 363 272 Z',
]

/**
 * Hand-drawn portrait in a soft, Ghibli-inspired style, laid out over the proportions of a
 * photo. Sky, town, shirt, head, hair and sunglasses move by different amounts as the
 * pointer moves, which reads as depth; hovering or pressing it pushes the sunglasses up
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

  const tiltY = useTransform(x, (v) => v * 8)
  const tiltX = useTransform(y, (v) => v * -5)
  const cloudsX = useTransform(x, (v) => v * -16)
  const townX = useTransform(x, (v) => v * -6)
  const bodyX = useTransform(x, (v) => v * 3)
  const headX = useTransform(x, (v) => v * 10)
  const headY = useTransform(y, (v) => v * 6)
  const headRotate = useTransform(x, (v) => v * 3)
  const hairX = useTransform(x, (v) => v * 2)
  const glassesX = useTransform(x, (v) => v * 5)
  const glassesY = useTransform(y, (v) => v * 3)
  const glintX = useTransform(x, (v) => v * -40)
  const pupilX = useTransform(x, (v) => v * 7)
  const pupilY = useTransform(y, (v) => v * 4)

  const badge = `badge-${uid}`
  const sky = `sky-${uid}`
  const lens = `lens-${uid}`
  const lensClip = `lens-clip-${uid}`
  const glint = `glint-${uid}`
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
        viewBox="0 -12 780 798"
        role="img"
        aria-hidden
        className="avatar__svg"
        style={{ rotateX: tiltX, rotateY: tiltY }}
      >
        <defs>
          <clipPath id={badge}>
            <circle cx="390" cy="400" r="375" />
          </clipPath>
          <clipPath id={lensClip}>
            {lenses.map((d) => (
              <path key={d} d={d} />
            ))}
          </clipPath>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6fa8e0" />
            <stop offset="0.65" stopColor="#b9dcf3" />
            <stop offset="1" stopColor="#e8f2f7" />
          </linearGradient>
          <linearGradient id={lens} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4f86" />
            <stop offset="0.45" stopColor="#141a33" />
            <stop offset="1" stopColor="#0c1022" />
          </linearGradient>
          <linearGradient id={glint} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Everything below the head is clipped to the badge; the hair breaks out of the top. */}
        <g clipPath={`url(#${badge})`}>
          <circle cx="390" cy="400" r="375" fill={`url(#${sky})`} />
          <motion.g style={{ x: cloudsX }}>
            <g className="av-drift">
              <g>
                <circle className="av-cloud-shade" cx="120" cy="250" r="44" />
                <circle className="av-cloud" cx="150" cy="226" r="52" />
                <circle className="av-cloud" cx="206" cy="214" r="40" />
                <circle className="av-cloud" cx="96" cy="246" r="36" />
                <rect className="av-cloud" x="70" y="240" width="170" height="34" rx="17" />
              </g>
              <g>
                <circle className="av-cloud-shade" cx="610" cy="200" r="34" />
                <circle className="av-cloud" cx="640" cy="176" r="44" />
                <circle className="av-cloud" cx="690" cy="190" r="34" />
                <circle className="av-cloud" cx="596" cy="196" r="28" />
                <rect className="av-cloud" x="575" y="190" width="150" height="30" rx="15" />
              </g>
              <g>
                <circle className="av-cloud" cx="560" cy="380" r="24" />
                <circle className="av-cloud" cx="590" cy="370" r="30" />
                <rect className="av-cloud" x="540" y="378" width="90" height="22" rx="11" />
              </g>
            </g>
          </motion.g>
          <motion.g style={{ x: townX }}>
            <path className="av-tower" d="M60 470 L60 400 L74 380 L88 400 L88 470 Z" />
            <path className="av-tower" d="M30 560 L30 480 L130 470 L130 560 Z" />
            <path className="av-tower-shade" d="M74 380 L88 400 L88 470 L76 470 Z" />
          </motion.g>
          <motion.g style={{ x: bodyX }}>
            <path className="av-shirt" d="M18 786 L26 650 C36 566 74 522 132 502 C170 488 198 474 214 456 L262 486 L330 548 L420 470 L470 440 C506 462 566 492 640 522 C702 548 736 604 746 694 L760 786 Z" />
            <path className="av-shirt-shade" d="M640 522 C702 548 736 604 746 694 L760 786 L700 786 C706 700 690 620 640 560 Z" />
            <path className="av-shirt-shade" d="M214 456 C190 500 178 560 186 640 C206 590 230 548 270 530 Z" />
            <path className="av-shirt-shade" d="M330 548 C380 560 450 548 488 556 C470 590 420 600 360 594 Z" />
            <path className="av-shirt-fold" d="M70 600 C90 640 96 690 92 740 M300 640 C340 660 380 700 420 720 M560 580 C590 610 600 650 600 700 M120 520 C150 540 170 560 180 600" />
            <path className="av-shirt-fold" d="M330 548 C312 620 292 690 278 786" />
            <circle className="av-button" cx="303" cy="640" r="6" />
            <circle className="av-button" cx="287" cy="728" r="6" />
            <path className="av-skin av-ln" d="M262 398 C262 450 274 504 330 548 C384 520 420 472 432 420 L432 376 Z" />
            <path className="av-skin-shade" d="M264 420 C300 468 384 466 432 408 L432 444 C410 494 372 524 330 548 C292 520 272 484 264 440 Z" />
            <path className="av-shirt" d="M246 404 L204 456 C222 490 254 514 300 534 L330 548 C296 504 268 456 246 404 Z" />
            <path className="av-shirt" d="M436 388 L502 438 L494 558 C470 540 440 530 404 524 L330 548 C380 500 418 448 436 388 Z" />
            <path className="av-shirt-shade" d="M436 388 L502 438 L498 470 C478 452 456 440 440 430 Z" />
          </motion.g>
        </g>

        <motion.g style={{ x: headX, y: headY, rotate: headRotate, originX: '345px', originY: '450px' }}>
          <path className="av-skin av-ln" d="M234 246 C214 232 198 248 202 278 C205 304 214 326 236 332 Z" />
          <path className="av-ln-soft" d="M224 262 C214 270 216 288 226 300" />
          <path className="av-skin av-ln" d="M462 262 C480 248 496 262 492 292 C488 320 478 344 458 350 Z" />
          <path className="av-ln-soft" d="M474 276 C484 284 482 304 472 316" />
          <path className="av-skin av-ln" d="M232 196 C226 240 226 292 234 334 C244 384 282 422 334 440 C388 440 440 402 458 352 C468 302 468 252 462 200 C450 150 410 118 346 116 C282 118 242 148 232 196 Z" />
          <path className="av-skin-shade" d="M462 200 C468 252 468 302 458 352 C446 386 426 408 400 422 C432 382 446 334 446 284 C446 244 442 214 432 192 Z" />
          <path className="av-hairline-shade" d="M236 206 C262 176 300 160 346 158 C396 158 436 176 460 210 C456 184 440 162 418 150 C392 140 368 136 346 136 C300 138 262 156 240 186 Z" />
          <path className="av-skin-light" d="M262 200 C282 174 318 162 352 162 C328 172 300 186 282 210 Z" />
          <ellipse className="av-skin-light" cx="268" cy="282" rx="14" ry="7" />
          <ellipse className="av-blush" cx="262" cy="302" rx="22" ry="11" />
          <ellipse className="av-blush" cx="438" cy="314" rx="20" ry="10" />
          <path className="av-stubble" d="M228 290 C226 360 258 430 304 452 C326 462 366 464 392 450 C434 428 462 380 466 318 C452 344 432 360 412 364 C396 344 372 334 340 334 C308 334 286 344 272 362 C252 352 236 330 228 290 Z" />
          <path className="av-beard" d="M234 312 C236 368 264 422 304 444 C326 456 362 458 388 444 C428 424 452 380 458 336 C446 352 428 362 410 358 C404 352 400 346 398 340 C390 358 370 370 340 370 C310 370 290 358 282 340 C280 348 276 354 270 358 C254 354 242 338 234 312 Z" />
          <path className="av-beard" d="M276 342 C282 318 310 306 340 312 C370 306 400 318 404 342 C392 336 378 332 366 332 C356 330 348 331 340 333 C332 331 322 330 312 332 C300 332 288 336 276 342 Z" />
          <path className="av-beard-line" d="M300 322 L306 330 M320 318 L324 328 M360 318 L356 328 M380 322 L374 330 M262 392 L268 404 M290 420 L294 432 M322 432 L324 444 M356 434 L354 446 M388 422 L384 434 M414 400 L408 412 M432 372 L426 384" />
          <path className="av-mouth" d="M288 336 C308 332 364 332 388 338 C374 356 350 362 338 362 C318 360 298 352 288 336 Z" />
          <path className="av-teeth" d="M294 337 C318 335 362 335 382 339 C372 346 348 349 338 349 C318 348 300 344 294 337 Z" />
          <path className="av-lip" d="M312 364 C328 372 352 372 368 362" />
          <path className="av-skin-shade" d="M352 248 C358 268 370 284 370 298 C362 306 350 306 344 302 C352 286 352 266 352 248 Z" />
          <path className="av-ln-soft" d="M312 296 C316 308 330 312 338 306 C344 312 360 312 368 300" />

          {/* Eyes and brows, seen when the sunglasses go up */}
          {eyes.map((eye) => (
            <g key={eye.cx}>
              <path className="av-brow" d={eye.brow} />
              <motion.g
                className="av-blink"
                style={{ originX: `${eye.cx}px`, originY: `${eye.cy}px` }}
                animate={peek && !reduce ? { scaleY: [1, 1, 0.1, 1] } : { scaleY: 1 }}
                transition={{ duration: 3.2, times: [0, 0.9, 0.95, 1], repeat: Infinity, delay: 0.8 }}
              >
                <ellipse className="av-eye-white" cx={eye.cx} cy={eye.cy} rx="20" ry="11" />
                <motion.g style={{ x: pupilX, y: pupilY }}>
                  <ellipse className="av-iris" cx={eye.cx} cy={eye.cy} rx="8.5" ry="10" />
                  <circle className="av-catch" cx={eye.cx + 3} cy={eye.cy - 4} r="3" />
                </motion.g>
              </motion.g>
              <path className="av-lid" d={eye.lid} />
            </g>
          ))}

          <motion.g style={{ x: hairX }}>
            <path className="av-hair" d="M232 232 C220 190 218 140 232 108 C236 96 244 86 254 78 L246 70 C262 58 282 50 302 48 L294 36 C320 22 350 18 378 22 L372 10 C406 10 438 20 460 40 L470 34 C488 50 498 70 502 94 L512 98 C508 116 502 132 496 146 C500 170 494 196 486 214 C480 230 474 242 468 250 C466 222 462 198 452 178 C440 160 418 152 396 150 C372 142 350 132 330 130 C300 132 272 146 254 166 C242 180 236 200 232 232 Z" />
            <path className="av-hair-sheen" d="M272 108 C298 82 336 66 376 60 C348 72 320 88 296 114 Z" />
            <path className="av-hair-sheen" d="M384 90 C412 80 446 82 474 94 C448 94 422 98 400 106 Z" />
            <path className="av-hair-strand" d="M258 150 C268 110 300 80 344 64 M300 128 C324 96 366 74 414 70 M352 134 C384 108 424 96 468 102 M412 150 C440 132 470 128 494 138 M246 196 C240 170 240 140 250 116" />
          </motion.g>

          <motion.g style={{ x: glassesX, y: glassesY }}>
            <motion.g
              animate={peek ? { y: -96, rotate: -4, scale: 0.94 } : { y: 0, rotate: 0, scale: 1 }}
              transition={lift}
              style={{ originX: '350px', originY: '255px' }}
            >
              <path className="av-temple" d="M244 222 L212 238 M462 228 L490 246" />
              {lenses.map((d) => (
                <path key={d} className="av-lens" fill={`url(#${lens})`} d={d} />
              ))}
              <g clipPath={`url(#${lensClip})`}>
                <motion.g style={{ x: glintX }}>
                  <path fill={`url(#${glint})`} d="M250 300 L300 200 L322 200 L272 300 Z" />
                  <path fill={`url(#${glint})`} d="M370 310 L420 210 L442 210 L392 310 Z" />
                </motion.g>
              </g>
              <path className="av-temple" d="M339 238 C346 232 352 232 358 238" />
              <circle className="av-rivet" cx="246" cy="222" r="3" />
              <circle className="av-rivet" cx="456" cy="230" r="3" />
            </motion.g>
          </motion.g>
        </motion.g>
      </motion.svg>
      <span className="avatar__hint" aria-hidden>
        {pinned ? 'tap to put them back' : 'hover or tap to say hi'}
      </span>
    </motion.button>
  )
}
