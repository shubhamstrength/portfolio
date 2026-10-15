# Shubham Tiwari · Portfolio

Animated personal portfolio built with React 19, TypeScript, Vite and [Motion](https://motion.dev).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # serve the production build
```

## Editing content

All copy (roles, stats, skills, awards, contact links) lives in `src/data/resume.ts`.
Components in `src/components/` only render that data.

## Animations

- Hero: per-letter name reveal, rotating specialty, parallax gradient orbs
- Scroll progress bar, hide-on-scroll nav, cursor glow (mouse only)
- Count-up stats, scroll-drawn experience timeline, animated skill tabs
- Infinite marquee and a magnetic "Say hello" button

All motion respects the OS "reduce motion" setting via `<MotionConfig reducedMotion="user">`.

## Deploy

`dist/` is a static site with relative paths, so it can go on Vercel, Netlify, GitHub Pages or any static host.
