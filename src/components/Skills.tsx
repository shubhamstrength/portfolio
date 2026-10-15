import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { awards, skillGroups } from '../data/resume'
import { Reveal, SectionLabel } from './Reveal'

export function Skills() {
  const [active, setActive] = useState(0)
  const group = skillGroups[active]

  return (
    <section id="skills" className="section container">
      <SectionLabel index="03">Skills</SectionLabel>
      <h2 className="display display--sm">
        The <em>toolkit</em>.
      </h2>

      <Reveal>
        <div className="tabs" role="tablist" aria-label="Skill groups">
          {skillGroups.map((g, i) => (
            <button
              key={g.name}
              role="tab"
              type="button"
              aria-selected={active === i}
              className={`tab ${active === i ? 'tab--active' : ''}`}
              onClick={() => setActive(i)}
            >
              {active === i && (
                <motion.span
                  layoutId="tab-pill"
                  className="tab__pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="tab__label">{g.name}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <div className="chips" role="tabpanel" aria-label={group.name}>
        <AnimatePresence mode="popLayout">
          {group.items.map((item, i) => (
            <motion.span
              key={`${group.name}-${item}`}
              className="chip"
              layout
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.06, rotate: -1.5 }}
            >
              {item}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <Reveal className="awards">
        <span className="mono muted">Recognition</span>
        <ul>
          {awards.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
