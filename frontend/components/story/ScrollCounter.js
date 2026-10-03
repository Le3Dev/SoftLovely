import { useState } from 'react'
import { motion, AnimatePresence, useTransform, useMotionValueEvent } from 'framer-motion'
import { useLiveTime, DAY_MS } from '../../lib/loveTime'
import { StickyChapter, HeartGlyph } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO — "Cada dia conta"
   Rolar a página passa os dias desde o começo: a folhinha vira,
   o número corre, marcos aparecem e no fim entra o contador ao vivo.
══════════════════════════════════════════════════ */

const MILESTONES = [
  { d: 7, label: '1 semana' }, { d: 30, label: '1 mês' }, { d: 100, label: '100 dias' },
  { d: 180, label: '6 meses' }, { d: 365, label: '1 ano' }, { d: 500, label: '500 dias' },
  { d: 730, label: '2 anos' }, { d: 1000, label: '1.000 dias' }, { d: 1825, label: '5 anos' },
  { d: 3650, label: '10 anos' },
]
const ECG = 'M0 30 H150 l8 -16 l10 36 l10 -44 l10 34 l6 -10 H300 l8 -16 l10 36 l10 -44 l10 34 l6 -10 H600'

function Folhinha({ date }) {
  const key = date.toDateString()
  return (
    <div className="relative w-32 h-36 [perspective:600px]">
      {/* páginas de baixo, para dar volume */}
      <div className="absolute inset-0 translate-y-1.5 rounded-2xl bg-white/10" />
      <div className="absolute inset-0 translate-y-0.5 rounded-2xl bg-white/20" />
      {/* página nova a cada dia (a anterior some na hora — sem acumular em scroll rápido) */}
        <motion.div key={key} className="absolute inset-0 rounded-2xl overflow-hidden bg-white shadow-2xl"
          style={{ transformOrigin: 'top center' }}
          initial={{ rotateX: -95, opacity: 0.6 }} animate={{ rotateX: 0, opacity: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}>
          <div className="h-9 flex items-center justify-center gap-1 text-white text-xs font-black uppercase tracking-wider"
            style={{ background: 'linear-gradient(135deg, var(--tc,#C9184A), #FF4D7A)' }}>
            {date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')} {date.getFullYear()}
          </div>
          <p className="text-center font-black text-5xl leading-none mt-3 text-[#1a0010] tabular-nums">{date.getDate()}</p>
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-[#1a0010]/40 mt-1.5">
            {date.toLocaleDateString('pt-BR', { weekday: 'long' })}
          </p>
        </motion.div>
      {/* argolas */}
      <span className="absolute -top-1.5 left-8 w-2 h-4 rounded-full bg-white/80 shadow" />
      <span className="absolute -top-1.5 right-8 w-2 h-4 rounded-full bg-white/80 shadow" />
    </div>
  )
}

function CounterScene({ p, totalDays, start, anniversaryDate }) {
  const total = Math.max(0, totalDays)
  const dayMV   = useTransform(p, [0.08, 0.66], [0, total])
  const dayText = useTransform(dayMV, v => Math.round(v).toLocaleString('pt-BR'))
  const pulse   = useTransform(p, [0.08, 0.66], [0, 1])
  const liveOp  = useTransform(p, [0.7, 0.82], [0, 1])
  const liveY   = useTransform(p, [0.7, 0.82], [24, 0])
  const introOp = useTransform(p, [0, 0.06], [0.6, 1])

  const [day, setDay] = useState(0)
  useMotionValueEvent(dayMV, 'change', v => setDay(Math.round(v)))

  const date = new Date(start.getTime() + day * DAY_MS)
  const milestone = [...MILESTONES].reverse().find(m => day >= m.d && total >= m.d)
  const done = day >= total

  return (
    <div className="relative h-full flex flex-col items-center justify-center gap-5 px-6 text-center">
      <motion.div style={{ opacity: introOp }} className="flex flex-col items-center gap-2">
        <p className="text-xs font-black uppercase tracking-widest text-white/90">cada dia conta</p>
        <p className="text-white/80 text-xs">{day === 0 ? 'o dia em que tudo começou' : done ? 'até hoje' : 'rolando pelos dias de vocês...'}</p>
      </motion.div>

      <Folhinha date={date} />

      <div className="relative">
        <motion.p className="font-black text-white tabular-nums leading-none text-7xl md:text-8xl"
          style={{ textShadow: '0 6px 30px rgba(120,10,50,0.35)' }}>
          {dayText}
        </motion.p>
        <p className="mt-2 text-white/90 text-sm font-bold tracking-wide">
          {total === 1 ? 'dia juntos' : 'dias juntos'}
        </p>

        {/* marco atingido — pipoca a cada novo marco */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-11 h-8">
          <AnimatePresence mode="wait">
            {milestone && (
              <motion.span key={milestone.d}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black text-[#1a0010]"
                style={{ background: 'linear-gradient(135deg, #FFD700, #FFB347)', boxShadow: '0 0 18px rgba(255,215,0,0.45)' }}
                initial={{ scale: 0.3, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16 }}>
                <HeartGlyph className="w-3 h-3" fill="#C9184A" /> {milestone.label}!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <svg viewBox="0 0 600 60" className="w-full max-w-md h-10 mt-8" fill="none" aria-hidden="true">
        <path d={ECG} stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinejoin="round" />
        <motion.path d={ECG} stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ pathLength: pulse }} />
      </svg>

      {/* contador ao vivo */}
      <motion.div className="w-full max-w-sm" style={{ opacity: liveOp, y: liveY }}>
        <LiveGrid anniversaryDate={anniversaryDate} />
        <p className="mt-3 text-white/85 text-xs flex items-center justify-center gap-1.5">
          e contando, a cada segundo <HeartGlyph className="w-3 h-3 animate-heartbeat" fill="white" />
        </p>
      </motion.div>
    </div>
  )
}

/* só este pedacinho re-renderiza a cada segundo */
const UNITS = [['years', 'anos'], ['days', 'dias'], ['hours', 'horas'], ['minutes', 'min'], ['seconds', 'seg']]
function LiveGrid({ anniversaryDate }) {
  const time = useLiveTime(anniversaryDate)
  if (!time) return null
  return (
    <div className="grid grid-cols-5 gap-2">
      {UNITS.map(([k, label]) => (
        <div key={k} className="rounded-xl py-2.5 text-center"
          style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.35)' }}>
          <p className="font-black text-white text-lg tabular-nums">{String(time[k] ?? 0).padStart(2, '0')}</p>
          <p className="text-white/75 text-[10px] font-bold uppercase tracking-wider">{label}</p>
        </div>
      ))}
    </div>
  )
}

export function ScrollCounter({ totalDays, start, anniversaryDate }) {
  if (totalDays == null || !start) return null
  return (
    <StickyChapter height="250vh" chapter="cada dia conta">
      {p => <CounterScene p={p} totalDays={totalDays} start={start} anniversaryDate={anniversaryDate} />}
    </StickyChapter>
  )
}
