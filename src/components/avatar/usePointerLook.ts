import { useEffect, type RefObject } from 'react'
import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from 'motion/react'

const spring = { stiffness: 120, damping: 18, mass: 0.6 }

/**
 * Where the pointer sits relative to an element's centre, as two springs in [-1, 1].
 * Reaches ±1 about 600px away, so the look stays subtle across a wide screen.
 */
export function usePointerLook(ref: RefObject<Element | null>): { x: MotionValue<number>; y: MotionValue<number> } {
  const reduce = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, spring)
  const y = useSpring(rawY, spring)

  useEffect(() => {
    if (reduce) return
    const clamp = (v: number) => Math.max(-1, Math.min(1, v))

    const onMove = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      rawX.set(clamp((e.clientX - (r.left + r.width / 2)) / 600))
      rawY.set(clamp((e.clientY - (r.top + r.height * 0.4)) / 600))
    }
    const onLeave = () => {
      rawX.set(0)
      rawY.set(0)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce, ref, rawX, rawY])

  return { x, y }
}
