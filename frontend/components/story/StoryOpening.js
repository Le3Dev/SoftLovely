import { useRef, useState } from 'react'
import { motion, useTransform, useSpring, useMotionValueEvent } from 'framer-motion'
import { HEART_PATH, useSafeReducedMotion, useViewportWidth } from '../../lib/scrollMotion'
import { StickyChapter, HeartGlyph, HeartBurst, Starfield, HEART_MASK, HEART_VIEWBOX } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO 1 — "Era uma vez..."
   A foto do casal chega partida em duas metades de coração,
   uma de cada lado, ligadas por um fio. O scroll puxa o fio:
   a foto só fica inteira quando os dois se encontram.
══════════════════════════════════════════════════ */

/* costura em zigue-zague — as duas metades se encaixam perfeitamente */
const SEAM = [[50, 0], [45, 18], [55, 36], [45, 54], [55, 72], [47, 88], [50, 100]]
const LEFT_CLIP  = `polygon(0 0, ${SEAM.map(([x, y]) => `${x}% ${y}%`).join(', ')}, 0 100%)`
const RIGHT_CLIP = `polygon(100% 0, ${SEAM.map(([x, y]) => `${x}% ${y}%`).join(', ')}, 100% 100%)`
const FALLBACK_BG = ['linear-gradient(135deg, #7B0033, #C9184A)', 'linear-gradient(135deg, #C9184A, #FF8FA3)']

function HeartHalf({ side, photo, partner, size }) {
  const left = side === 'left'
  return (
    <div className="absolute inset-0"
      style={{ clipPath: left ? LEFT_CLIP : RIGHT_CLIP, WebkitMaskImage: HEART_MASK, maskImage: HEART_MASK, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}>
      {photo ? (
        <img src={photo} alt="" className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full relative" style={{ background: FALLBACK_BG[left ? 0 : 1] }}>
          <span className="absolute top-[38%] -translate-y-1/2 font-black text-white" style={{ [left ? 'left' : 'right']: '22%', fontSize: size * 0.22 }}>
            {partner?.name?.[0]?.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}

function OpeningScene({ p, partners, coupleName, dateStr, totalDays, photo }) {
  const reduce = useSafeReducedMotion()
  const vw = useViewportWidth()
  const size = vw < 768 ? 180 : 230
  /* cada metade começa inteira na borda da tela (o lado visível dela é o de fora) */
  const far = reduce ? 30 : Math.max(40, Math.min(vw / 2 - size / 2 - 14, 380))

  const leftX       = useTransform(p, [0.12, 0.58], [-far, 0])
  const rightX      = useTransform(p, [0.12, 0.58], [far, 0])
  const leftRotate  = useTransform(p, [0.12, 0.45, 0.58], [reduce ? 0 : -14, reduce ? 0 : -6, 0])
  const rightRotate = useTransform(leftRotate, v => -v)
  const pairY       = useTransform(p, [0.58, 0.74], [0, reduce ? 0 : -70])
  const pairScale   = useTransform(p, [0.58, 0.66, 0.74], [1, 1.08, 0.9])
  const namesOp     = useTransform(p, [0.14, 0.22, 0.5, 0.57], [0, 1, 1, 0])
  const halvesOp    = useTransform(p, [0, 0.08], [0.55, 1])

  const threadScale = useTransform(p, [0.03, 0.13, 0.58], [0, 1, 0.02])
  const threadOp    = useTransform(p, [0.03, 0.08, 0.55, 0.6], [0, 1, 1, 0])

  const introOp     = useTransform(p, [0, 0.1, 0.17], [1, 1, 0])
  const introY      = useTransform(p, [0, 0.17], [0, -40])
  const captionOp   = useTransform(p, [0.2, 0.27, 0.46, 0.53], [0, 1, 1, 0])

  const outline     = useSpring(useTransform(p, [0.57, 0.62], [0, 1]), { stiffness: 200, damping: 16 })
  const titleOp     = useTransform(p, [0.64, 0.74], [0, 1])
  const titleY      = useTransform(p, [0.64, 0.74], [28, 0])
  const dateOp      = useTransform(p, [0.72, 0.82], [0, 1])
  const daysOp      = useTransform(p, [0.8, 0.9], [0, 1])
  const glowScale   = useTransform(p, [0.5, 0.75], [0.4, 1.3])
  const glowOp      = useTransform(p, [0.5, 0.65], [0, 1])

  /* estoura corações quando as metades se encaixam (só indo para frente) */
  const [burst, setBurst] = useState(0)
  const armed = useRef(true)
  useMotionValueEvent(p, 'change', v => {
    if (v > 0.59 && armed.current) { armed.current = false; setBurst(b => b + 1) }
    else if (v < 0.5) armed.current = true
  })

  const [a, b] = partners
  const h = size * (18.8 / 20)

  return (
    <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
      <Starfield />

      <motion.div aria-hidden="true" className="absolute w-[90vmin] h-[90vmin] rounded-full pointer-events-none"
        style={{ scale: glowScale, opacity: glowOp, background: 'radial-gradient(circle, rgba(var(--tc-rgb,201,24,74),0.4), transparent 62%)' }} />

      {/* "Era uma vez..." */}
      <motion.div className="absolute inset-x-0 top-[17%] px-6" style={{ opacity: introOp, y: introY }}>
        <p className="font-script text-white text-5xl md:text-7xl animate-glowIn" style={{ textShadow: '0 0 30px rgba(255,77,122,0.6)' }}>
          Era uma vez...
        </p>
      </motion.div>

      {/* as duas metades + o fio */}
      <motion.div className="relative w-full flex items-center justify-center" style={{ height: h + 60, y: pairY, scale: pairScale, opacity: halvesOp }}>
        <motion.div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[2px] -translate-y-1/2"
          style={{ width: far * 2, x: '-50%', scaleX: threadScale, opacity: threadOp, background: 'linear-gradient(90deg, transparent, var(--tc,#FF4D7A) 15%, #FF8FA3 50%, var(--tc,#FF4D7A) 85%, transparent)' }} />

        {[['left', a, leftX, leftRotate], ['right', b, rightX, rightRotate]].map(([side, partner, x, rotate]) => (
          <motion.div key={side} className="absolute left-1/2 top-1/2" style={{ width: size, height: h, marginLeft: -size / 2, marginTop: -h / 2, x, rotate }}>
            <HeartHalf side={side} photo={photo} partner={partner} size={size} />
            <motion.p className="absolute top-full mt-3 text-white/85 text-sm font-bold whitespace-nowrap"
              style={{ opacity: namesOp, [side === 'left' ? 'left' : 'right']: '14%' }}>
              {partner?.name}
            </motion.p>
          </motion.div>
        ))}

        {/* contorno que acende quando o coração se completa */}
        <motion.svg viewBox={HEART_VIEWBOX} aria-hidden="true" className="absolute left-1/2 top-1/2 pointer-events-none overflow-visible"
          style={{ width: size, height: h, x: '-50%', y: '-50%', scale: outline, opacity: outline }}>
          <path d={HEART_PATH} fill="none" stroke="rgba(255,143,163,0.35)" strokeWidth="1.6" />
          <path d={HEART_PATH} fill="none" stroke="#FF8FA3" strokeWidth="0.45" />
        </motion.svg>
        {burst > 0 && <HeartBurst key={burst} size="w-5 h-5" />}
      </motion.div>

      <motion.p className="absolute inset-x-0 bottom-[16%] px-8 font-script text-2xl md:text-3xl text-love-200 text-balance" style={{ opacity: captionOp }}>
        duas metades de uma mesma história,<br />esperando pra se encontrar...
      </motion.p>

      {/* nomes + data */}
      <div className="absolute inset-x-0 top-[62%] px-6">
        <motion.h1 className="font-black text-white text-4xl md:text-6xl tracking-tight"
          style={{ opacity: titleOp, y: titleY, textShadow: '0 0 40px rgba(var(--tc-rgb,201,24,74),0.6)' }}>
          {coupleName}
        </motion.h1>
        {dateStr && (
          <motion.p className="mt-3 text-white/60 text-sm font-semibold" style={{ opacity: dateOp }}>
            juntos desde <span className="text-love-300">{dateStr}</span>
          </motion.p>
        )}
        {totalDays != null && (
          <motion.p className="mt-4 text-white/40 text-xs font-bold tracking-widest uppercase" style={{ opacity: daysOp }}>
            {totalDays.toLocaleString('pt-BR')} {totalDays === 1 ? 'dia' : 'dias'} de amor · e contando
          </motion.p>
        )}
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/45 scroll-indicator"
        style={{ opacity: introOp }}>
        <span className="text-[11px] font-semibold uppercase tracking-widest">role devagar</span>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 14l-6-6h12l-6 6z" /></svg>
      </motion.div>
    </div>
  )
}

export function StoryOpening(props) {
  return (
    <StickyChapter height="260vh" chapter="era uma vez">
      {p => <OpeningScene p={p} {...props} />}
    </StickyChapter>
  )
}
