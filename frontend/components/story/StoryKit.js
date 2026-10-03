import { useEffect, useRef, useState } from 'react'
import {
  motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValueEvent,
} from 'framer-motion'
import { HEART_PATH, clamp01, useScrollProgress, RESPECT_REDUCED_MOTION } from '../../lib/scrollMotion'

/* ══════════════════════════════════════════════════
   KIT DA HISTÓRIA — peças compartilhadas pelos capítulos
══════════════════════════════════════════════════ */

export const STORY_EASE = [0.22, 1, 0.36, 1]

/* ── Rolagem suave (Lenis) ───────────────────────────
   interpola a roda do mouse para as animações ligadas ao scroll
   andarem sem "degraus"; no toque o scroll nativo já é suave.   */
let lenis = null
let scrollLocked = false

export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled || (RESPECT_REDUCED_MOTION && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return
    let cancelled = false
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.9 })
      if (scrollLocked) lenis.stop()
    })
    return () => {
      cancelled = true
      lenis?.destroy()
      lenis = null
    }
  }, [enabled])
}

export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.6 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

/* trava a rolagem (ex.: enquanto a tela de entrada está aberta) */
export function setScrollLocked(locked) {
  scrollLocked = locked
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  if (lenis) (locked ? lenis.stop() : lenis.start())
}

/* coração recortado justo (viewBox sem sobras), usado como máscara CSS */
export const HEART_VIEWBOX = '2 2.6 20 18.8'
export const HEART_MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${HEART_VIEWBOX}'><path d='${HEART_PATH}' fill='black'/></svg>`
)}")`

export function HeartGlyph({ className = 'w-4 h-4', fill = 'currentColor', ...rest }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...rest}>
      <path d={HEART_PATH} fill={fill} />
    </svg>
  )
}

/* Capítulo "preso" na tela: a seção é alta e o conteúdo fica sticky,
   recebendo o progresso (0 → 1) de quanto já foi rolado dentro dela */
export function StickyChapter({ height = '250vh', chapter, className = '', style, children }) {
  const ref = useRef(null)
  const progress = useScrollProgress({ target: ref, offset: ['start start', 'end end'] })
  return (
    <section ref={ref} data-chapter={chapter} className={`story-chapter ${className}`} style={{ height, ...style }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {children(progress)}
      </div>
    </section>
  )
}

/* Rótulo pequeno de capítulo, no estilo das seções da página */
export function Eyebrow({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, var(--tc, #C9184A))' }} />
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--tc, #FF4D7A)' }}>{children}</p>
      <span className="h-px w-8" style={{ background: 'linear-gradient(to left, transparent, var(--tc, #C9184A))' }} />
    </div>
  )
}

/* Estouro de coraçõezinhos (renderize com key nova para disparar de novo) */
const BURST = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2
  return { x: Math.cos(a) * (70 + (i % 3) * 18), y: Math.sin(a) * (70 + (i % 3) * 18), r: (i % 2 ? 1 : -1) * 30 }
})
export function HeartBurst({ color = '#FF4D7A', size = 'w-4 h-4' }) {
  return (
    <span aria-hidden="true" className="absolute left-1/2 top-1/2 pointer-events-none">
      {BURST.map((b, i) => (
        <motion.span key={i} className="absolute -translate-x-1/2 -translate-y-1/2"
          initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: b.y, scale: 1, opacity: 0, rotate: b.r }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.015 }}>
          <HeartGlyph className={size} fill={color} />
        </motion.span>
      ))}
    </span>
  )
}

/* Céu estrelado leve (posições determinísticas → sem divergência no SSR) */
const STARS = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: 1 + (i % 3),
  delay: (i % 7) * 0.6,
  dur: 2.4 + (i % 5) * 0.7,
}))
export function Starfield({ className = '' }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${className}`}>
      {STARS.map((s, i) => (
        <span key={i} className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
      ))}
    </div>
  )
}

/* ── publica --enter / --leave em cada seção enquanto a janela rola ──
   --enter: 1 com a seção uma tela abaixo → 0 quando o topo chega ao topo
   --leave: 0 enquanto o fim da seção está na tela → 1 quando ela saiu por cima
   Os efeitos em si ficam no globals.css (classes story-*).               */
export function useStoryScrollFx(ready) {
  useEffect(() => {
    if (!ready) return
    const cache = new WeakMap()
    let frame = 0

    const update = () => {
      frame = 0
      const vh = window.innerHeight || 1
      const els = document.querySelectorAll('.story-section, .story-chapter')
      /* lê tudo antes de escrever, para não forçar layout a cada seção */
      const values = Array.from(els, el => {
        const r = el.getBoundingClientRect()
        return [clamp01(r.top / vh).toFixed(3), clamp01((vh - r.bottom) / vh).toFixed(3)]
      })
      els.forEach((el, i) => {
        const [enter, leave] = values[i]
        const key = `${enter}|${leave}`
        if (cache.get(el) === key) return
        cache.set(el, key)
        el.style.setProperty('--enter', enter)
        el.style.setProperty('--leave', leave)
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const mo = new MutationObserver(schedule)
    mo.observe(document.body, { childList: true, subtree: true })
    update()

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mo.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [ready])
}

/* ── O fio vermelho: costura a página conforme a leitura ─────
   fio ondulado fixo na lateral, um coração na ponta da agulha e
   uma "conta" por capítulo (toque para ir até ele)               */
const TH = 400
const threadX = y => 12 + 4 * Math.sin((y / TH) * Math.PI * 8)
const THREAD_D = 'M' + Array.from({ length: 121 }, (_, i) => {
  const y = (i / 120) * TH
  return `${threadX(y).toFixed(2)} ${y.toFixed(1)}`
}).join(' L')

/* posição (em px da página) de cada elemento com data-chapter */
export function useChapterPositions(rootRef) {
  const [chapters, setChapters] = useState([])
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setChapters(Array.from(root.querySelectorAll('[data-chapter]'), el => {
        const r = el.getBoundingClientRect()
        const top = r.top + window.scrollY
        return { label: el.dataset.chapter, top, bottom: top + r.height, f: max > 0 ? clamp01(top / max) : 0 }
      }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [rootRef])
  return chapters
}

export function StoryThread({ rootRef }) {
  const chapters = useChapterPositions(rootRef)
  const [active, setActive] = useState(-1)
  const [toast, setToast] = useState(null)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })
  const heartTop = useTransform(progress, v => `${clamp01(v) * 100}%`)
  const heartLeft = useTransform(progress, v => threadX(clamp01(v) * TH))
  const first = useRef(true)

  /* capítulo atual → aviso "capítulo N · nome" por alguns segundos */
  useMotionValueEvent(scrollYProgress, 'change', () => {
    const line = window.scrollY + window.innerHeight * 0.45
    let idx = -1
    chapters.forEach((c, i) => { if (c.top <= line) idx = i })
    if (idx !== active) setActive(idx)
  })
  useEffect(() => {
    if (active < 0) return
    if (first.current) { first.current = false; return }
    setToast({ n: active + 1, label: chapters[active]?.label })
    const t = setTimeout(() => setToast(null), 1900)
    return () => clearTimeout(t)
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  if (chapters.length < 2) return null

  return (
    <>
      <nav aria-label="Capítulos da história"
        className="fixed right-1 md:right-3 top-1/2 -translate-y-1/2 z-50 w-6 h-[min(58svh,440px)]">
        <svg viewBox={`0 0 24 ${TH}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible" fill="none" aria-hidden="true">
          <path d={THREAD_D} stroke="rgba(150,150,150,0.35)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="1 5" strokeLinecap="round" />
          {/* brilho = traço largo e translúcido por baixo (mais barato que filtro de sombra) */}
          <motion.path d={THREAD_D} stroke="rgba(var(--tc-rgb,201,24,74),0.3)" strokeWidth="6" vectorEffect="non-scaling-stroke" strokeLinecap="round"
            style={{ pathLength: progress }} />
          <motion.path d={THREAD_D} stroke="var(--tc, #FF4D7A)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round"
            style={{ pathLength: progress }} />
        </svg>

        {chapters.map((c, i) => (
          <button key={i} type="button" onClick={() => scrollToY(c.top)}
            aria-label={`Capítulo ${i + 1}: ${c.label}`} aria-current={i === active ? 'step' : undefined}
            className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ top: `${c.f * 100}%`, left: threadX(c.f * TH) }}>
            <span className="block rounded-full transition-all duration-300"
              style={{
                width: i === active ? 7 : 5, height: i === active ? 7 : 5,
                background: i <= active ? 'var(--tc, #FF4D7A)' : 'rgba(150,150,150,0.55)',
                boxShadow: i <= active ? '0 0 0 2px rgba(255,255,255,0.35)' : 'none',
              }} />
          </button>
        ))}

        {/* agulha: coração na ponta do fio */}
        <motion.span aria-hidden="true" className="absolute pointer-events-none"
          style={{ top: heartTop, left: heartLeft, x: '-50%', y: '-50%' }}>
          <HeartGlyph className="w-3.5 h-3.5 animate-heartbeat" fill="var(--tc, #FF4D7A)" />
        </motion.span>
      </nav>

      <AnimatePresence>
        {toast && (
          <motion.div key={toast.n} role="status"
            className="fixed right-9 md:right-12 top-1/2 z-50 pointer-events-none rounded-full px-3 py-1.5 text-[11px] font-bold text-white whitespace-nowrap"
            style={{ background: 'rgba(13,2,8,0.72)', border: '1px solid rgba(var(--tc-rgb,201,24,74),0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0, x: 12, y: '-50%' }} animate={{ opacity: 1, x: 0, y: '-50%' }} exit={{ opacity: 0, x: 12, y: '-50%' }}
            transition={{ duration: 0.3, ease: STORY_EASE }}>
            <span className="text-white/50 font-semibold">capítulo {toast.n} · </span>{toast.label}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
