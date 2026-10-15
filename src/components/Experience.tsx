import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import { experience, type Role } from '../data/resume'
import { SectionLabel } from './Reveal'

function RoleCard({ role, index }: { role: Role; index: number }) {
  return (
    <motion.li
      className="role"
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className="role__dot"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}
        aria-hidden
      />
      <div className="role__meta">
        <span className="mono">{role.period}</span>
        <span className="muted">{role.location}</span>
      </div>
      <div className="role__card">
        <span className="role__index mono">{String(index + 1).padStart(2, '0')}</span>
        <h3>
          {role.title} <span className="role__at">at</span> <span className="accent">{role.company}</span>
        </h3>
        <ul className="role__highlights">
          {role.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <ul className="tags" aria-label="Stack">
          {role.stack.map((t) => (
            <li key={t} className="tag">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  )
}

export function Experience() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

  return (
    <section id="work" className="section container">
      <SectionLabel index="02">Experience</SectionLabel>
      <h2 className="display display--sm">
        A decade across <em>insurance</em>, <em>cloud</em> and <em>consulting</em>.
      </h2>
      <div className="timeline" ref={ref}>
        <div className="timeline__rail" aria-hidden>
          <motion.div className="timeline__fill" style={{ scaleY }} />
        </div>
        <ol className="timeline__list">
          {experience.map((role, i) => (
            <RoleCard key={role.company} role={role} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
