import { useRef, type PointerEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { profile } from '../data/resume'
import { Reveal, SectionLabel } from './Reveal'

function MagneticLink({ href, children }: { href: string; children: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      className="magnetic"
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  )
}

const YEAR = new Date().getFullYear()

export function Contact() {
  return (
    <section id="contact" className="section container contact">
      <SectionLabel index="04">Contact</SectionLabel>
      <Reveal>
        <h2 className="contact__title">
          Let’s build something <em>great</em> together.
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="contact__actions">
        <MagneticLink href={`mailto:${profile.email}`}>Say hello</MagneticLink>
        <div className="contact__links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
        </div>
      </Reveal>
      <footer className="footer">
        <span>© {YEAR} {profile.name}</span>
        <span className="muted">Built with React, TypeScript, Vite and Motion</span>
      </footer>
    </section>
  )
}
