import { useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DRAWERS, tenureText } from './model'
import './cabinet.css'

const ease = [0.22, 1, 0.36, 1] as const

// A card cabinet seen from the front and a little above. Opening a drawer slides it
// towards the viewer, so its inside comes into view above the front with the role in it.
export function Cabinet() {
  const [open, setOpen] = useState(0)
  const still = useReducedMotion()
  const slide = { duration: still ? 0 : 0.6, ease }

  return (
    <div className="cab">
      <div className="cab__top" aria-hidden="true" />
      <div className="cab__case">
        {DRAWERS.map(({ role, months }, index) => {
          const isOpen = index === open
          const id = `drawer-${index}`
          return (
            <div key={role.company} className={`drawer${isOpen ? ' drawer--open' : ''}`}>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={id}
                    className="drawer__inside"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={slide}
                  >
                    <div className="drawer__well">
                      <motion.div
                        className="drawer__card"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ ...slide, delay: still ? 0 : 0.12 }}
                      >
                        <ul className="drawer__tabs" aria-label="Stack">
                          {role.stack.map((tool) => (
                            <li key={tool}>{tool}</li>
                          ))}
                        </ul>
                        <div className="drawer__sheet">
                          <p className="drawer__meta mono">
                            {role.period} · {tenureText(months)} · {role.location}
                          </p>
                          <ul className="role__highlights">
                            {role.highlights.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h3 className="drawer__heading">
                <button
                  type="button"
                  className="drawer__front"
                  style={{ '--tenure': months } as CSSProperties}
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  <span className="drawer__label">
                    <span className="drawer__index mono">{String(index + 1).padStart(2, '0')}</span>
                    <span className="drawer__company">{role.company}</span>
                    <span className="drawer__title">{role.title}</span>
                  </span>
                  <span className="drawer__pull" aria-hidden="true" />
                  <span className="drawer__period mono">
                    {role.period}
                    <span className="muted">{tenureText(months)}</span>
                  </span>
                </button>
              </h3>
            </div>
          )
        })}
      </div>
      <div className="cab__plinth" aria-hidden="true" />
    </div>
  )
}
