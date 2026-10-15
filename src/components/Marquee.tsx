import { motion } from 'motion/react'

const words = ['React', 'TypeScript', 'Design Systems', 'Agentic Workflows', 'RAG', 'Next.js', 'Accessibility', 'TDD', 'Visual Regression', 'MCP']

export function Marquee() {
  const row = [...words, ...words]
  return (
    <div className="marquee" aria-hidden>
      <motion.div
        className="marquee__track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {row.map((w, i) => (
          <span key={i} className="marquee__item">
            {w} <span className="marquee__star">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
