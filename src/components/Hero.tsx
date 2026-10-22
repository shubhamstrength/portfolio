import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { profile } from '../data/resume'
import { Avatar } from './avatar/Avatar'
import { HeroCode } from './HeroCode'

const ease = [0.22, 1, 0.36, 1] as const

function SplitWord({ word, delay }: { word: string; delay: number }) {
  return (
    <span className="split" aria-hidden>
      {word.split('').map((ch, i) => (
        <motion.span
          key={i}
          className="split__char"
          initial={{ y: '110%', rotate: 8, opacity: 0 }}
          animate={{ y: '0%', rotate: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: delay + i * 0.045, ease }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

function RotatingRole() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % profile.roles.length), 2400)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="rotator">
      <AnimatePresence mode="wait">
        <motion.span
          key={profile.roles[index]}
          className="rotator__word"
          initial={{ y: 24, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -24, opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease }}
        >
          {profile.roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%'])

  return (
    <section id="top" className="hero" ref={ref}>
      <motion.div className="hero__bg" style={{ y: orbY }} aria-hidden>
        <div className="orb orb--a" />
        <div className="orb orb--b" />
        <div className="orb orb--c" />
      </motion.div>
      <HeroCode />

      <motion.div className="hero__inner container" style={{ y, opacity }}>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          <span className="pulse" /> Based in {profile.location} · 10+ years on the web
        </motion.p>

        <div className="hero__head">
          <h1 className="hero__title" aria-label={profile.name}>
            <SplitWord word={profile.firstName} delay={0.2} />
            <br />
            <span className="hero__title-italic">
              <SplitWord word={profile.lastName} delay={0.5} />
            </span>
          </h1>
          <div className="hero__avatar">
            <Avatar name={profile.name} />
          </div>
        </div>

        <motion.div
          className="hero__sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease }}
        >
          <p>
            {profile.title} crafting fast, accessible interfaces with <RotatingRole />
          </p>
        </motion.div>

        <motion.div
          className="hero__cta"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease }}
        >
          <a href="#work" className="btn btn--primary">
            See my work
          </a>
          <a href={`mailto:${profile.email}`} className="btn btn--ghost">
            Get in touch
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        className="scroll-cue"
        aria-label="Scroll to about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <motion.span
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.a>
    </section>
  )
}
