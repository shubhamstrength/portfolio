import { motion } from 'motion/react'
import { education, profile, stats } from '../data/resume'
import { Counter } from './Counter'
import { Reveal, SectionLabel } from './Reveal'

export function About() {
  return (
    <section id="about" className="section container">
      <SectionLabel index="01">About</SectionLabel>
      <div className="about">
        <Reveal>
          <h2 className="display">
            I build interfaces that <em>scale</em>, and the systems and AI tooling that help teams ship them.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="about__body">
          <p>{profile.summary}</p>
          <p className="muted">
            {education.degree}, {education.school} · {education.period}
          </p>
        </Reveal>
      </div>

      <ul className="stats">
        {stats.map((s, i) => (
          <motion.li
            key={s.label}
            className="stat"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
          >
            <span className="stat__value">
              <Counter to={s.value} suffix={s.suffix} />
            </span>
            <span className="stat__label">{s.label}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
