import { profile } from '../data/resume'

type Token = [kind: 'k' | 's' | 'f' | 'p' | 'c' | '', text: string]

// A short, readable snippet about Shubham, tinted like an editor theme.
const lines: Token[][] = [
  [['c', '// hello, world']],
  [['k', 'const'], ['', ' '], ['f', 'shubham'], ['p', ' = {']],
  [['', '  role: '], ['s', `'${profile.title}'`], ['p', ',']],
  [['', '  based: '], ['s', `'${profile.location.split(',')[0]}'`], ['p', ',']],
  [['', '  loves: ['], ['s', "'React'"], ['p', ', '], ['s', "'TypeScript'"], ['p', ', '], ['s', "'design systems'"], ['p', '],']],
  [['', '  ships: () '], ['k', '=>'], ['', ' fast '], ['k', '&&'], ['', ' accessible'], ['p', ',']],
  [['p', '}']],
  [],
  [['k', 'export default function'], ['', ' '], ['f', 'Portfolio'], ['p', '() {']],
  [['', '  '], ['k', 'return'], ['', ' '], ['p', '<'], ['f', 'Hero'], ['', ' who'], ['p', '={'], ['', 'shubham'], ['p', '} />']],
  [['p', '}']],
]

/** Faint editor-style code behind the hero, in place of a background grid. */
export function HeroCode() {
  return (
    <div className="hero__code" aria-hidden>
      <pre>
        {lines.map((line, i) => (
          <span key={i} className="hero__code-line" style={{ animationDelay: `${0.3 + i * 0.09}s` }}>
            <span className="hero__code-num">{String(i + 1).padStart(2, '0')}</span>
            {line.map(([kind, text], j) => (
              <span key={j} className={kind ? `tok-${kind}` : undefined}>
                {text}
              </span>
            ))}
            {i === lines.length - 1 && <span className="hero__code-caret" />}
          </span>
        ))}
      </pre>
    </div>
  )
}
