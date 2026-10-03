import { useRef } from 'react'
import { motion, useTransform, useSpring } from 'framer-motion'
import { useScrollProgress } from '../../lib/scrollMotion'
import { DAY_MS } from '../../lib/loveTime'
import { HeartGlyph, HeartBurst } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO — "Próximo capítulo"
   O anel do ano atual de vocês se desenha até a parte já vivida,
   com um sol na ponta; no centro, quanto falta pro aniversário.
══════════════════════════════════════════════════ */

const R = 100

function anniversaryInfo(start) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let next = new Date(today.getFullYear(), start.getMonth(), start.getDate())
  if (next < today) next = new Date(today.getFullYear() + 1, start.getMonth(), start.getDate())
  const prev = new Date(next.getFullYear() - 1, start.getMonth(), start.getDate())
  const cycle = Math.round((next - prev) / DAY_MS)
  const daysUntil = Math.round((next - today) / DAY_MS)
  const isToday = daysUntil === 0
  const yearsCompleting = next.getFullYear() - start.getFullYear()
  const fraction = isToday ? 1 : Math.min(1, Math.max(0.01, (cycle - daysUntil) / cycle))
  return { next, daysUntil, isToday, yearsCompleting, fraction }
}

export function NextChapter({ start }) {
  const ref = useRef(null)
  const raw = useScrollProgress({ target: ref, offset: ['start end', 'center center'] })
  const p = useSpring(raw, { stiffness: 70, damping: 20, restDelta: 0.001 })
  const info = start ? anniversaryInfo(start) : null
  const f = info?.fraction ?? 0

  const drawn  = useTransform(p, [0.25, 1], [0, f])
  const angle  = useTransform(drawn, v => v * 2 * Math.PI - Math.PI / 2)
  const sunX   = useTransform(angle, a => Math.cos(a) * R)
  const sunY   = useTransform(angle, a => Math.sin(a) * R)
  const pctTxt = useTransform(drawn, v => `${Math.round(v * 100)}%`)
  const textOp = useTransform(p, [0.5, 0.9], [0, 1])

  if (!info) return null
  const { next, daysUntil, isToday, yearsCompleting } = info
  const years = `${yearsCompleting} ${yearsCompleting === 1 ? 'ano' : 'anos'}`

  return (
    <section ref={ref} data-chapter="próximo capítulo" className="story-section px-6 text-center">
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-xs font-bold uppercase tracking-widest text-white/85">próximo capítulo</p>
        <p className="mt-2 mb-6 font-script text-3xl md:text-4xl text-white text-balance" style={{ textShadow: '0 2px 12px rgba(120,20,40,0.35)' }}>
          {isToday ? 'hoje começa um novo capítulo!' : 'cada dia, um pouquinho mais perto'}
        </p>

        <div className="relative w-64 h-64 md:w-72 md:h-72">
          <svg viewBox="-130 -130 260 260" className="w-full h-full overflow-visible" aria-hidden="true">
            <circle r={R} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="10" />
            <motion.circle r={R} fill="none" stroke="white" strokeWidth="10" strokeLinecap="round"
              transform="rotate(-90)" style={{ pathLength: drawn }} />
            <motion.g style={{ x: sunX, y: sunY }}>
              <circle r="15" fill="#FFE27A" />
              <circle r="24" fill="rgba(255,226,122,0.35)" />
            </motion.g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isToday ? (
              <>
                <HeartGlyph className="w-12 h-12 animate-heartbeat" fill="white" />
                <p className="mt-2 font-black text-white text-2xl">{years}!</p>
              </>
            ) : (
              <>
                <p className="font-black text-white text-6xl leading-none tabular-nums" style={{ textShadow: '0 4px 20px rgba(120,20,40,0.35)' }}>{daysUntil}</p>
                <p className="mt-2 text-white/90 text-sm font-bold">{daysUntil === 1 ? 'dia' : 'dias'} para {years}</p>
              </>
            )}
          </div>
          {isToday && <HeartBurst color="#FFFFFF" />}
        </div>

        <motion.div className="mt-6" style={{ opacity: textOp }}>
          <p className="text-white/90 text-sm">
            vocês já viveram <motion.span className="font-black">{pctTxt}</motion.span> deste capítulo
          </p>
          <p className="mt-1 text-white/70 text-xs font-bold uppercase tracking-widest">
            {next.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
