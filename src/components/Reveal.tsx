import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <Reveal className="section-label">
      <span className="section-label__index">{index}</span>
      <span className="section-label__line" />
      <span>{children}</span>
    </Reveal>
  )
}
