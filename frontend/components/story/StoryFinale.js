import { useRef } from 'react'
import { motion, useTransform, useSpring } from 'framer-motion'
import { useScrollProgress } from '../../lib/scrollMotion'
import { HeartGlyph, Starfield } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO FINAL — "continua..."
   O fio vermelho que costurou a página dá um laço em forma de
   coração: a história não termina, está só começando.
══════════════════════════════════════════════════ */

const KNOT = 'M-10 168 C80 176, 150 182, 200 170 C170 140, 110 100, 130 55 C145 18, 195 24, 200 62 C205 24, 255 18, 270 55 C290 100, 230 140, 200 170 C250 182, 320 176, 410 168'

export function StoryFinale({ totalDays }) {
  const ref = useRef(null)
  const raw = useScrollProgress({ target: ref, offset: ['start end', 'center center'] })
  const p = useSpring(raw, { stiffness: 80, damping: 20, restDelta: 0.001 })
  const draw   = useTransform(p, [0.1, 0.85], [0, 1])
  const line1  = useTransform(p, [0.35, 0.6], [0, 1])
  const line2  = useTransform(p, [0.55, 0.85], [0, 1])
  const line2Y = useTransform(p, [0.55, 0.85], [20, 0])
  const footOp = useTransform(p, [0.8, 1], [0, 1])
  const heartScale = useTransform(p, [0.82, 0.95, 1], [0, 1.3, 1])

  return (
    <section ref={ref} data-chapter="continua..." className="story-section px-6 text-center">
      <Starfield className="opacity-60" />
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        <div className="relative w-full">
          <svg viewBox="0 0 400 200" className="w-full overflow-visible" fill="none" aria-hidden="true">
            <path d={KNOT} stroke="rgba(255,204,213,0.1)" strokeWidth="3" strokeLinecap="round" />
            <motion.path d={KNOT} stroke="var(--tc, #FF4D7A)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ pathLength: draw, filter: 'drop-shadow(0 0 8px rgba(var(--tc-rgb,201,24,74),0.9))' }} />
          </svg>
          <motion.span className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2" style={{ scale: heartScale }}>
            <HeartGlyph className="w-9 h-9 animate-heartbeat" fill="#FF4D7A" style={{ filter: 'drop-shadow(0 0 12px rgba(255,77,122,0.9))' }} />
          </motion.span>
        </div>

        <motion.p className="mt-6 text-white/60 text-lg font-semibold" style={{ opacity: line1 }}>e essa história...</motion.p>
        <motion.p className="font-script text-white text-4xl md:text-5xl mt-1 text-balance" style={{ opacity: line2, y: line2Y, textShadow: '0 0 30px rgba(255,77,122,0.55)' }}>
          está só começando
        </motion.p>
        <motion.p className="mt-6 text-white/30 text-xs font-bold uppercase tracking-widest" style={{ opacity: footOp }}>
          {totalDays != null ? `${totalDays.toLocaleString('pt-BR')} ${totalDays === 1 ? 'dia escrito' : 'dias escritos'} · infinitos por vir` : 'infinitos dias por vir'}
        </motion.p>
      </div>
    </section>
  )
}
