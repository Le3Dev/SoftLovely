import { useEffect, useRef, useState } from 'react'
import {
  motion, useScroll, useTransform, useSpring, useVelocity, useMotionValue,
  useAnimationFrame, useMotionValueEvent, useInView,
} from 'framer-motion'
import { HEART_PATH, useScrollProgress, useSafeReducedMotion } from '../lib/scrollMotion'

export { useScrollProgress, useSafeReducedMotion }

/* ══════════════════════════════════════════════════
   ANIMAÇÕES DE SCROLL — LANDING PAGE
══════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1]

function wrap(min, max, v) {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

/* ── Coração do logo: enche de "líquido" conforme o scroll ── */
function LiquidHeart({ progress, size = 28 }) {
  const level = useTransform(progress, [0, 1], [15, -3])
  const [full, setFull] = useState(false)
  useMotionValueEvent(progress, 'change', v => setFull(v > 0.985))

  return (
    <motion.span className="relative inline-flex" style={{ width: size, height: size }}
      animate={full ? { scale: [1, 1.25, 1, 1.12, 1] } : { scale: 1 }}
      transition={full ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}>
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <defs>
          <clipPath id="sl-liquid-clip"><path d={HEART_PATH} /></clipPath>
          <linearGradient id="sl-liquid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4D7A" />
            <stop offset="100%" stopColor="#A4003D" />
          </linearGradient>
        </defs>
        <g clipPath="url(#sl-liquid-clip)">
          <path d={HEART_PATH} fill="#FFF0F3" />
          <motion.g style={{ y: level }}>
            <path className="liquid-wave" fill="url(#sl-liquid-grad)"
              d="M-24 4 q3 -2 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 V40 H-24 Z" />
          </motion.g>
        </g>
        <path d={HEART_PATH} fill="none" stroke="#C9184A" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </motion.span>
  )
}

/* ── Navbar: encolhe ao rolar + barra de progresso ─────── */
export function ScrollNav({ onCta }) {
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 })
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', v => setScrolled(v > 24))

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-love-100 px-6 transition-[padding,box-shadow] duration-300 ${scrolled ? 'py-2.5 shadow-lg shadow-love-900/5' : 'py-4'}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LiquidHeart progress={progress} />
          <span className="font-black text-love-700 text-xl tracking-tight">SoftLovely</span>
        </div>
        <button onClick={onCta} className="btn-love text-sm py-2.5 px-5 whitespace-nowrap">
          Criar minha pagina
        </button>
      </div>
      <motion.div aria-hidden="true" className="absolute left-0 right-0 -bottom-px h-[3px] origin-left"
        style={{ scaleX: progress, background: 'linear-gradient(90deg, #FF8FA3, #C9184A 60%, #FF4D7A)' }} />
    </nav>
  )
}

/* ── Fitas cruzadas com palavras — aceleram com a velocidade do scroll ── */
const MARQUEE_WORDS = [
  'Contador em tempo real', 'Fotos de vocês', 'Música do Spotify', 'Carta de amor',
  'Linha do tempo', 'Caixa surpresa', 'QR Code exclusivo', 'Para sempre',
]

function MarqueeRow({ baseVelocity, className, style, textClass, heartColor }) {
  const reduce = useSafeReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, [0, 1000], [0, 4], { clamp: false })
  const x = useTransform(baseX, v => `${wrap(-50, 0, v)}%`)
  const direction = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const b = boost.get()
    if (b < 0) direction.current = -1
    else if (b > 0) direction.current = 1
    const moveBy = direction.current * baseVelocity * (Math.min(delta, 100) / 1000)
    baseX.set(baseX.get() + moveBy * (1 + Math.abs(b)))
  })

  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS]
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} style={style}>
      <motion.div className="flex w-max" style={{ x }}>
        {[0, 1].map(half => (
          <div key={half} className="flex shrink-0">
            {words.map((w, i) => (
              <span key={i} className={`flex items-center gap-5 pr-5 ${textClass}`}>
                {w}
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0"><path d={HEART_PATH} fill={heartColor} /></svg>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function LoveMarquee() {
  return (
    <div aria-hidden="true" className="relative z-20 h-32 -my-16 pointer-events-none select-none">
      <MarqueeRow baseVelocity={-1.1} heartColor="#FF4D7A"
        className="absolute -left-[5%] -right-[5%] top-1/2 -translate-y-1/2 -rotate-3 py-3.5 bg-white border-y border-love-100 shadow-xl shadow-love-900/10"
        textClass="text-love-600 font-black text-base md:text-lg uppercase tracking-wide" />
      <MarqueeRow baseVelocity={1.1} heartColor="#FFCCD5"
        className="absolute -left-[5%] -right-[5%] top-1/2 -translate-y-1/2 rotate-2 py-3.5 shadow-2xl shadow-love-900/30"
        style={{ background: 'linear-gradient(90deg, #7B0033, #C9184A 50%, #FF4D7A)' }}
        textClass="text-white font-black text-base md:text-lg uppercase tracking-wide" />
    </div>
  )
}

/* ── Traço à mão com um coração no meio — desenha ao aparecer ── */
function HeartUnderline({ dark }) {
  return (
    <svg viewBox="0 0 200 30" className="mx-auto mt-3 w-40 h-6 overflow-visible" fill="none" aria-hidden="true">
      <motion.path
        d="M6 20 C40 18, 70 30, 100 24 C90 18, 82 8, 91 4 C96 2, 100 5, 100 9 C100 5, 104 2, 109 4 C118 8, 110 18, 100 24 C130 30, 160 18, 194 20"
        stroke={dark ? '#FFCCD5' : '#FF4D7A'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ pathLength: { duration: 1.4, ease: 'easeInOut', delay: 0.45 }, opacity: { duration: 0.2, delay: 0.45 } }} />
    </svg>
  )
}

/* ── Título de seção: palavras sobem de dentro de uma máscara ── */
export function RevealHeading({ eyebrow, title, subtitle, dark = false, className = 'mb-16' }) {
  const words = title.split(' ')
  return (
    <div className={`text-center ${className}`}>
      {eyebrow && (
        <motion.p className={`font-bold text-sm uppercase mb-3 ${dark ? 'text-love-200' : 'text-love-500'}`}
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          whileInView={{ opacity: 1, letterSpacing: '0.1em' }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1, ease: EASE }}>
          {eyebrow}
        </motion.p>
      )}
      <motion.h2 className={`text-4xl font-black ${dark ? 'text-white mb-2' : 'text-love-900'}`}
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}>
        {words.map((w, i) => (
          <span key={i}>
            <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
              <motion.span className="inline-block"
                variants={{ hidden: { y: '110%', rotate: 6 }, show: { y: '0%', rotate: 0, transition: { duration: 0.8, ease: EASE } } }}>
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </motion.h2>
      {subtitle && (
        <motion.p className={dark ? 'text-white/60' : 'text-gray-500'}
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}>
          {subtitle}
        </motion.p>
      )}
      <HeartUnderline dark={dark} />
    </div>
  )
}

/* ── Cards "distribuídos" como cartas de baralho ───────── */
export function DealIn({ index = 0, children, className = '' }) {
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 70, rotate: index % 2 ? 7 : -7, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: 'spring', stiffness: 110, damping: 15, delay: (index % 3) * 0.1 }}>
      {children}
    </motion.div>
  )
}

/* ── Palavra gigante que desliza no fundo da seção ─────── */
export function ParallaxWord({ children, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], ['12%', '-30%'])
  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
      <motion.span className={`font-vibes whitespace-nowrap leading-none ${className}`} style={{ x }}>
        {children}
      </motion.span>
    </div>
  )
}

/* ── Frase fixa na tela que "acende" palavra por palavra ── */
const QUOTE = 'Cada segundo ao lado de quem a gente ama merece ser contado, lembrado e celebrado.'
const QUOTE_ACCENTS = ['contado', 'lembrado', 'celebrado']
const ECG_PATH = 'M0 30 H180 l8 -16 l10 36 l10 -44 l10 34 l6 -10 H330 l8 -16 l10 36 l10 -44 l10 34 l6 -10 H600'

function QuoteWord({ children, progress, range, accent }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  const y = useTransform(progress, range, [10, 0])
  return (
    <>
      <motion.span style={{ opacity, y }}
        className={`inline-block ${accent ? 'font-script font-bold text-love-300 text-[1.15em]' : 'text-white'}`}>
        {children}
      </motion.span>{' '}
    </>
  )
}

function LoveTimer({ start }) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!start) return
    const tick = () => setSecs(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [start])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  return <span className="tabular-nums font-black text-white">{mm}:{ss}</span>
}

export function ScrollQuote() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.05 })
  const [startedAt, setStartedAt] = useState(null)
  useEffect(() => { if (inView && !startedAt) setStartedAt(Date.now()) }, [inView, startedAt])

  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start start', 'end end'] })
  const pulse = useTransform(scrollYProgress, [0.05, 0.85], [0, 1])
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.6, 1.4])
  const footOpacity = useTransform(scrollYProgress, [0.78, 0.92], [0, 1])
  const footY = useTransform(scrollYProgress, [0.78, 0.92], [16, 0])

  const words = QUOTE.split(' ')
  const span = 0.72 / words.length

  return (
    <section ref={ref} className="relative h-[260vh] bg-love-900">
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col items-center justify-center px-6">
        <motion.div aria-hidden="true" className="absolute w-[80vmin] h-[80vmin] rounded-full pointer-events-none"
          style={{ scale: glowScale, background: 'radial-gradient(circle, rgba(255,77,122,0.28), transparent 65%)' }} />

        <p className="relative max-w-4xl text-center font-black text-3xl sm:text-4xl md:text-6xl leading-[1.15] tracking-tight">
          {words.map((w, i) => {
            const start = 0.05 + i * span
            return (
              <QuoteWord key={i} progress={scrollYProgress} range={[start, start + span]}
                accent={QUOTE_ACCENTS.includes(w.replace(/[^\p{L}]/gu, ''))}>
                {w}
              </QuoteWord>
            )
          })}
        </p>

        {/* Batimento que desenha junto com a leitura */}
        <svg viewBox="0 0 600 60" className="relative w-full max-w-2xl h-12 mt-10" fill="none" aria-hidden="true">
          <path d={ECG_PATH} stroke="rgba(255,204,213,0.12)" strokeWidth="2" strokeLinejoin="round" />
          <motion.path d={ECG_PATH} stroke="#FF4D7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ pathLength: pulse, filter: 'drop-shadow(0 0 6px rgba(255,77,122,0.8))' }} />
        </svg>

        <motion.div style={{ opacity: footOpacity, y: footY }} className="relative mt-6 text-center">
          <p className="text-love-200/80 text-sm md:text-base">
            ⏱️ Enquanto você lia, mais <LoveTimer start={startedAt} /> de amor se passaram.
          </p>
          <p className="text-white/40 text-xs md:text-sm mt-1">Imagine isso contando numa página só de vocês.</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── "Fio vermelho do destino" ligando os passos ─────────
   desktop: fio ondulado horizontal · mobile: fio vertical   */
const THREAD_PATH = 'M166 40 C260 -6, 400 86, 500 40 S740 86, 834 40'

function TravelHeart() {
  return (
    <span className="block w-6 h-6 animate-heartbeat" style={{ filter: 'drop-shadow(0 2px 6px rgba(201,24,74,0.55))' }}>
      <svg viewBox="0 0 24 24" className="w-full h-full"><path d={HEART_PATH} fill="#C9184A" stroke="white" strokeWidth="1.5" /></svg>
    </span>
  )
}

const BURST = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2
  return { x: Math.cos(a) * 58, y: Math.sin(a) * 58, r: (i % 2 ? 1 : -1) * 25 }
})

function ThreadStep({ step, index, total, progress, reduce, stepRef }) {
  const t = total > 1 ? index / (total - 1) : 0
  const isLast = index === total - 1
  const fill = useTransform(progress, [t - 0.12, t], [0, 1])
  const scale = useTransform(progress, [t - 0.12, t, t + 0.06], reduce ? [1, 1, 1] : [0.82, 1.14, 1])
  const color = useTransform(progress, [t - 0.12, t], ['#FF8FA3', '#FFFFFF'])
  const textOpacity = useTransform(progress, [t - 0.22, t], [0.3, 1])
  const textY = useTransform(progress, [t - 0.22, t], reduce ? [0, 0] : [14, 0])
  const [reached, setReached] = useState(t <= 0)
  useMotionValueEvent(progress, 'change', v => setReached(v >= t - 0.005))

  return (
    <div ref={stepRef} className="relative flex gap-5 text-left md:block md:text-center">
      <motion.div style={{ scale }}
        className="relative z-10 w-16 h-16 shrink-0 rounded-2xl md:mx-auto md:mb-5 flex items-center justify-center font-black text-2xl bg-love-100">
        <motion.div className="absolute inset-0 rounded-2xl" style={{ opacity: fill, background: 'linear-gradient(135deg, #C9184A, #FF4D7A)' }} />
        {reached && !reduce && (
          <motion.span className="absolute inset-0 rounded-2xl border-2 border-love-400"
            initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }} />
        )}
        {isLast && reached && !reduce && BURST.map((b, i) => (
          <motion.svg key={i} viewBox="0 0 24 24" className="absolute w-4 h-4 pointer-events-none"
            initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
            animate={{ x: b.x, y: b.y, scale: 1, opacity: 0, rotate: b.r }}
            transition={{ duration: 1, ease: 'easeOut', delay: i * 0.02 }}>
            <path d={HEART_PATH} fill="#FF4D7A" />
          </motion.svg>
        ))}
        <motion.span className="relative" style={{ color }}>{step.num}</motion.span>
      </motion.div>

      <motion.div style={{ opacity: textOpacity, y: textY }} className="pt-1 md:pt-0">
        <h3 className="font-bold text-love-900 text-lg mb-2">{step.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
      </motion.div>
    </div>
  )
}

export function RedThreadSteps({ steps }) {
  const ref = useRef(null)
  const pathRef = useRef(null)
  const lastRef = useRef(null)
  const reduce = useSafeReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, restDelta: 0.001 })

  /* coração que viaja pelo fio (posição calculada sobre o path real) */
  const heartLeft = useMotionValue('16.6%')
  const heartTop = useMotionValue('50%')
  useMotionValueEvent(progress, 'change', v => {
    const path = pathRef.current
    if (!path) return
    const pt = path.getPointAtLength(path.getTotalLength() * Math.min(1, Math.max(0, v)))
    heartLeft.set(`${pt.x / 10}%`)
    heartTop.set(`${(pt.y / 80) * 100}%`)
  })
  const heartOpacity = useTransform(progress, [0, 0.03, 0.97, 1], [0, 1, 1, 0])
  const mobileHeartTop = useTransform(progress, v => `${Math.min(1, Math.max(0, v)) * 100}%`)

  /* fio vertical (mobile) vai do centro do 1º ao centro do último número */
  const [lineBottom, setLineBottom] = useState(0)
  useEffect(() => {
    const el = lastRef.current
    if (!el) return
    const measure = () => setLineBottom(Math.max(0, el.offsetHeight - 32))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* fio — desktop */}
      <div aria-hidden="true" className="hidden md:block absolute left-0 right-0 top-8 -translate-y-1/2 aspect-[1000/80] pointer-events-none">
        <svg viewBox="0 0 1000 80" className="absolute inset-0 w-full h-full overflow-visible" fill="none">
          <defs>
            <linearGradient id="sl-thread-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF8FA3" />
              <stop offset="55%" stopColor="#C9184A" />
              <stop offset="100%" stopColor="#FF4D7A" />
            </linearGradient>
          </defs>
          <path d={THREAD_PATH} stroke="#FFCCD5" strokeWidth="2.5" strokeDasharray="1 10" strokeLinecap="round" />
          <motion.path ref={pathRef} d={THREAD_PATH} stroke="url(#sl-thread-grad)" strokeWidth="3.5" strokeLinecap="round"
            style={{ pathLength: progress }} />
        </svg>
        <motion.div className="absolute" style={{ left: heartLeft, top: heartTop, x: '-50%', y: '-50%', opacity: heartOpacity }}>
          <TravelHeart />
        </motion.div>
      </div>

      {/* fio — mobile */}
      <div aria-hidden="true" className="md:hidden absolute left-8 top-8 w-0.5 -translate-x-1/2 pointer-events-none" style={{ bottom: lineBottom }}>
        <div className="absolute inset-0 rounded-full bg-love-100" />
        <motion.div className="absolute inset-0 rounded-full origin-top"
          style={{ scaleY: progress, background: 'linear-gradient(#FF8FA3, #C9184A)' }} />
        <motion.div className="absolute left-1/2" style={{ top: mobileHeartTop, x: '-50%', y: '-50%', opacity: heartOpacity }}>
          <TravelHeart />
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {steps.map((step, i) => (
          <ThreadStep key={step.num} step={step} index={i} total={steps.length} progress={progress}
            reduce={reduce} stepRef={i === steps.length - 1 ? lastRef : undefined} />
        ))}
      </div>
    </div>
  )
}

/* ── Planos: os dois cards vêm de lados opostos e se encontram ── */
export function PlansMeet({ left, right }) {
  const ref = useRef(null)
  const reduce = useSafeReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'center 55%'] })
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 20, restDelta: 0.001 })
  const dist = reduce ? 0 : 160
  const tilt = reduce ? 0 : 10
  const leftX = useTransform(p, [0, 1], [-dist, 0])
  const rightX = useTransform(p, [0, 1], [dist, 0])
  const leftRotate = useTransform(p, [0, 1], [-tilt, 0])
  const rightRotate = useTransform(p, [0, 1], [tilt, 0])
  const opacity = useTransform(p, [0, 0.5], [0, 1])
  const heartScale = useSpring(useTransform(scrollYProgress, [0.85, 1], [0, 1]), { stiffness: 300, damping: 12 })
  const heartRotate = useTransform(scrollYProgress, [0.85, 1], [-45, 0])

  return (
    <div ref={ref} className="relative grid md:grid-cols-2 gap-6">
      <motion.div style={{ x: leftX, rotate: leftRotate, opacity }}>{left}</motion.div>
      <motion.div style={{ x: rightX, rotate: rightRotate, opacity }}>{right}</motion.div>

      {/* Coração que "sela" o encontro */}
      <motion.div aria-hidden="true" className="absolute left-1/2 top-1/2 z-20 pointer-events-none"
        style={{ x: '-50%', y: '-50%', scale: heartScale, rotate: heartRotate }}>
        <div className="relative w-14 h-14 rounded-full bg-white shadow-xl shadow-love-900/25 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-love-300/40 animate-ping" />
          <svg viewBox="0 0 24 24" className="relative w-7 h-7 animate-heartbeat"><path d={HEART_PATH} fill="#C9184A" /></svg>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Assinatura do rodapé: letras saltam uma a uma ─────── */
export function FooterSignature() {
  const letters = 'SoftLovely'.split('')
  return (
    <motion.p aria-label="SoftLovely" className="font-black text-white text-xl mt-2 tracking-tight"
      initial="hidden" whileInView="show" viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
      {letters.map((l, i) => (
        <motion.span key={i} aria-hidden="true" className="inline-block"
          variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 18 } } }}>
          {l}
        </motion.span>
      ))}
    </motion.p>
  )
}
