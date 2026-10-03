import { useRef } from 'react'
import { motion, useTransform, useSpring } from 'framer-motion'
import { useScrollProgress, useSafeReducedMotion } from '../../lib/scrollMotion'
import { Eyebrow, HeartGlyph } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO — "Momentos especiais"
   O fio vermelho desce costurando os momentos do casal;
   cada momento floresce quando o fio chega nele.
══════════════════════════════════════════════════ */

function formatDate(str) {
  if (!str) return null
  const d = new Date(str.includes('T') ? str : `${str}T12:00:00`)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Moment({ ev, index, total, progress, reduce }) {
  const t = (index + 0.5) / total
  const isLeft = index % 2 === 0
  const dotScale = useTransform(progress, [t - 0.06, t, t + 0.04], [0.4, 1.35, 1])
  const dotFill  = useTransform(progress, [t - 0.05, t], [0, 1])
  const cardOp   = useTransform(progress, [t - 0.14, t], [0, 1])
  const cardX    = useTransform(progress, [t - 0.14, t], [reduce ? 0 : isLeft ? -40 : 40, 0])
  const cardRot  = useTransform(progress, [t - 0.14, t], [reduce ? 0 : isLeft ? -5 : 5, 0])

  const card = (
    <motion.div className={`w-[42%] ${isLeft ? 'text-right pr-4' : 'text-left pl-4'}`} style={{ opacity: cardOp, x: cardX, rotate: cardRot }}>
      <p className="font-black text-white text-sm leading-snug">{ev.title}</p>
      {ev.eventDate && <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--tc, #FF4D7A)' }}>{formatDate(ev.eventDate)}</p>}
      {ev.description && <p className="text-white/45 text-xs mt-1 leading-relaxed">{ev.description}</p>}
    </motion.div>
  )

  return (
    <div className="relative flex items-center min-h-[92px]">
      {isLeft ? card : <div className="w-[42%]" />}
      <div className="w-[16%] flex justify-center">
        <motion.div className="relative w-7 h-7 flex items-center justify-center" style={{ scale: dotScale }}>
          <span className="absolute inset-0 rounded-full" style={{ background: '#0D0208', border: '2px solid var(--tc, #C9184A)' }} />
          <motion.span className="relative" style={{ opacity: dotFill }}>
            <HeartGlyph className="w-4 h-4" fill="var(--tc, #FF4D7A)" />
          </motion.span>
        </motion.div>
      </div>
      {isLeft ? <div className="w-[42%]" /> : card}
    </div>
  )
}

export function ThreadTimeline({ events }) {
  const ref = useRef(null)
  const reduce = useSafeReducedMotion()
  const raw = useScrollProgress({ target: ref, offset: ['start 72%', 'end 55%'] })
  const progress = useSpring(raw, { stiffness: 90, damping: 22, restDelta: 0.001 })
  const heartTop = useTransform(progress, v => `${Math.min(1, Math.max(0, v)) * 100}%`)
  const heartOp = useTransform(progress, [0, 0.03, 0.97, 1], [0, 1, 1, 0])

  if (!events?.length) return null

  return (
    <section data-chapter="momentos" className="story-section !h-auto min-h-[100svh] py-24 px-4">
      <div className="section-content relative z-10 w-full max-w-md mx-auto">
        <Eyebrow>momentos especiais</Eyebrow>
        <p className="mt-3 mb-10 text-center font-script text-3xl text-white text-balance">costurados no mesmo fio</p>

        <div ref={ref} className="relative">
          {/* fio */}
          <div aria-hidden="true" className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2">
            <div className="absolute inset-0 rounded-full bg-white/10" />
            <motion.div className="absolute inset-0 rounded-full origin-top"
              style={{ scaleY: progress, background: 'linear-gradient(to bottom, #FF8FA3, var(--tc, #C9184A))', boxShadow: '0 0 10px rgba(var(--tc-rgb,201,24,74),0.8)' }} />
            <motion.span className="absolute left-1/2" style={{ top: heartTop, x: '-50%', y: '-50%', opacity: heartOp }}>
              <HeartGlyph className="w-5 h-5 animate-heartbeat" fill="#FF4D7A" style={{ filter: 'drop-shadow(0 0 6px rgba(255,77,122,0.9))' }} />
            </motion.span>
          </div>

          {events.map((ev, i) => (
            <Moment key={ev.id || i} ev={ev} index={i} total={events.length} progress={progress} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  )
}
