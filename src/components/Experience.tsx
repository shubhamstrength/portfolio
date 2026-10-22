import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SectionLabel } from './Reveal'
import { WorkCabinet } from './cabinet/WorkCabinet'
import { ROLES, tenureText } from './cabinet/model'

const ease = [0.22, 1, 0.36, 1] as const
const LATEST = ROLES.length - 1

export function Experience() {
  const [selected, setSelected] = useState(LATEST)
  const select = useCallback((index: number) => setSelected(index), [])
  const { role, months } = ROLES[selected]

  return (
    <section id="work" className="section container">
      <SectionLabel index="02">Experience</SectionLabel>
      <h2 className="display display--sm">
        A decade across <em>insurance</em>, <em>cloud</em> and <em>consulting</em>.
      </h2>

      <div className="work">
        <motion.div
          className="work__figure"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease }}
        >
          <WorkCabinet selected={selected} onSelect={select} />
        </motion.div>

        <div className="work__detail">
          <div className="work__picker" role="group" aria-label="Choose a role">
            {ROLES.map((_, index) => index)
              .reverse()
              .map((index) => (
                <button
                  key={ROLES[index].role.company}
                  type="button"
                  className={`work__pick${index === selected ? ' work__pick--active' : ''}`}
                  aria-pressed={index === selected}
                  onClick={() => select(index)}
                >
                  {ROLES[index].role.company}
                </button>
              ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={role.company}
              className="role__card"
              aria-live="polite"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease }}
            >
              <span className="role__index mono">{String(LATEST - selected + 1).padStart(2, '0')}</span>
              <div className="work__meta mono">
                <span>{role.period}</span>
                <span className="muted">
                  {tenureText(months)} · {role.location}
                </span>
              </div>
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
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
