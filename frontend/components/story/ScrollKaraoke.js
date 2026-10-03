import { useEffect, useRef } from 'react'
import { motion, useTransform, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { StickyChapter, Eyebrow } from './StoryKit'

/* ══════════════════════════════════════════════════
   KARAOKÊ DE SCROLL — versos rolam e acendem conforme a leitura
   (letra da música, poema do casal...)
══════════════════════════════════════════════════ */

function KaraokeLine({ text, index, active, className, lineRef }) {
  /* d > 0: verso que ainda vem · d < 0: verso que já passou */
  const opacity = useTransform(active, v => {
    const d = index - v
    if (d >= 1) return 0.18
    if (d >= 0) return 1 - d * 0.82
    if (d >= -1) return 1 + d * 0.5
    return 0.5
  })
  const scale = useTransform(active, v => 1 + Math.max(0, 1 - Math.abs(index - v)) * 0.06)
  return (
    <motion.p ref={lineRef} className={`origin-center ${className}`} style={{ opacity, scale }}>
      {text || ' '}
    </motion.p>
  )
}

function KaraokeScene({ p, eyebrow, lines, header, footer, lineClassName }) {
  const n = lines.length
  const active = useTransform(p, [0.12, 0.86], [0, Math.max(0, n - 1)])
  const lineRefs = useRef([])
  const centers = useRef([])
  const y = useMotionValue(0)

  /* mantém o verso atual no centro da "janela" da letra */
  const sync = () => {
    const c = centers.current
    if (!c.length) return
    const v = active.get()
    const i = Math.max(0, Math.min(c.length - 1, Math.floor(v)))
    const j = Math.min(c.length - 1, i + 1)
    const f = Math.max(0, Math.min(1, v - i))
    y.set(-(c[i] + (c[j] - c[i]) * f))
  }
  useMotionValueEvent(active, 'change', sync)

  useEffect(() => {
    const measure = () => {
      centers.current = lineRefs.current.slice(0, n).map(el => (el ? el.offsetTop + el.offsetHeight / 2 : 0))
      sync()
    }
    measure()
    const ro = new ResizeObserver(measure)
    lineRefs.current.forEach(el => el && ro.observe(el))
    return () => ro.disconnect()
  }, [n]) // eslint-disable-line react-hooks/exhaustive-deps

  const footerOp = useTransform(p, [0.86, 0.95], [0, 1])
  const footerEvents = useTransform(footerOp, v => (v > 0.5 ? 'auto' : 'none'))

  return (
    <div className="relative h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {typeof header === 'function' ? header(p) : header}

      {/* janela da letra com fade nas bordas */}
      <div className="relative w-full max-w-md h-[34svh] overflow-hidden"
        style={{ maskImage: 'linear-gradient(transparent, black 28%, black 72%, transparent)', WebkitMaskImage: 'linear-gradient(transparent, black 28%, black 72%, transparent)' }}>
        <motion.div className="absolute inset-x-0 top-1/2 flex flex-col gap-3" style={{ y }}>
          {lines.map((line, i) => (
            <KaraokeLine key={i} text={line} index={i} active={active} className={lineClassName}
              lineRef={el => { lineRefs.current[i] = el }} />
          ))}
        </motion.div>
      </div>

      {footer && <motion.div className="w-full max-w-md flex justify-center" style={{ opacity: footerOp, pointerEvents: footerEvents }}>{footer}</motion.div>}
    </div>
  )
}

export function ScrollKaraoke({ chapter, eyebrow, lines, header, footer, style, lineClassName = 'text-white font-black text-xl md:text-3xl leading-snug' }) {
  if (!lines?.length) return null
  const height = `${150 + Math.min(lines.length, 18) * 26}vh`
  return (
    <StickyChapter height={height} chapter={chapter} style={style}>
      {p => <KaraokeScene p={p} eyebrow={eyebrow} lines={lines} header={header} footer={footer} lineClassName={lineClassName} />}
    </StickyChapter>
  )
}
