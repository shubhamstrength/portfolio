import { motion } from 'motion/react'
import { SectionLabel } from './Reveal'
import { Cabinet } from './cabinet/Cabinet'

const ease = [0.22, 1, 0.36, 1] as const

export function Experience() {
  return (
    <section id="work" className="section container">
      <SectionLabel index="02">Experience</SectionLabel>
      <h2 className="display display--sm">
        A decade across <em>insurance</em>, <em>cloud</em> and <em>consulting</em>.
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease }}
      >
        <Cabinet />
      </motion.div>
    </section>
  )
}
