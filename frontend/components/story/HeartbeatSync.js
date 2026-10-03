import { useRef, useState } from 'react'
import { motion, useTransform, useMotionValue, useAnimationFrame, useInView, useMotionValueEvent } from 'framer-motion'
import { StickyChapter, HeartGlyph, HeartBurst } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO — "Dois corações, um ritmo"
   Dois batimentos, cada um no seu compasso; o scroll aproxima
   as linhas até baterem juntas, virando uma só.
══════════════════════════════════════════════════ */

const BEAT = 150 // largura de um batimento (unidades do SVG)
const BEAT_PATH = 'l38 0 l8 -6 l8 6 l10 0 l6 10 l8 -52 l8 58 l6 -16 l12 0 l10 -10 l12 10 l24 0'
const TRACK = 'M0 60 ' + Array.from({ length: 12 }, () => BEAT_PATH).join(' ')

const COLOR_A = '#FF4D7A'
const COLOR_B = '#A48BFF'

function Line({ x, y, color, label, labelOp }) {
  return (
    <motion.g style={{ y }}>
      <motion.g style={{ x }}>
        <path d={TRACK} fill="none" stroke={color} strokeWidth="7" strokeOpacity="0.18" strokeLinejoin="round" strokeLinecap="round" />
        <path d={TRACK} fill="none" stroke={color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      </motion.g>
      <motion.text x="80" y="26" fill={color} fontSize="15" fontWeight="800" style={{ opacity: labelOp }}>{label}</motion.text>
    </motion.g>
  )
}

function BeatScene({ p, names, totalMinutes }) {
  const sceneRef = useRef(null)
  const onScreen = useInView(sceneRef)
  const sync = useTransform(p, [0.12, 0.62], [0, 1])
  const gap  = useTransform(sync, v => (1 - v) * 58)
  const yA   = useTransform(gap, g => -g)
  const labelOp = useTransform(sync, [0.7, 0.95], [1, 0])

  /* fase de cada linha: B começa fora do compasso e vai sendo puxado para A */
  const phaseA = useRef(0)
  const phaseB = useRef(BEAT * 0.45)
  const xA = useMotionValue(0)
  const xB = useMotionValue(0)
  useAnimationFrame((_, delta) => {
    if (!onScreen) return
    const dt = Math.min(delta, 60) / 1000
    const s = sync.get()
    const speedA = BEAT * 1.2                  // ~72 bpm
    const speedB = BEAT * (1.45 - 0.25 * s)    // ~87 bpm → 72 bpm
    phaseA.current += speedA * dt
    phaseB.current += speedB * dt
    /* puxa o compasso de B para o de A conforme sincroniza */
    const diff = ((phaseA.current - phaseB.current) % BEAT + BEAT * 1.5) % BEAT - BEAT / 2
    phaseB.current += diff * Math.min(1, s * s * 4 * dt * 3)
    xA.set(-(phaseA.current % BEAT))
    xB.set(-(phaseB.current % BEAT))
  })

  const bpmA = 72
  const bpmB = useTransform(sync, v => Math.round(87 - 15 * v))
  const introOp = useTransform(p, [0, 0.08, 0.5, 0.58], [0, 1, 1, 0])
  const syncedOp = useTransform(p, [0.62, 0.7], [0, 1])
  const beatsOp  = useTransform(p, [0.74, 0.84], [0, 1])
  const beatsY   = useTransform(p, [0.74, 0.84], [20, 0])
  const beats = Math.round(totalMinutes * 75)
  const beatsText = useTransform(p, [0.74, 0.95], [0, beats])
  const beatsRounded = useTransform(beatsText, v => Math.round(v).toLocaleString('pt-BR'))

  const [burst, setBurst] = useState(0)
  const armed = useRef(true)
  useMotionValueEvent(p, 'change', v => {
    if (v > 0.63 && armed.current) { armed.current = false; setBurst(b => b + 1) }
    else if (v < 0.55) armed.current = true
  })

  return (
    <div ref={sceneRef} className="relative h-full flex flex-col items-center justify-center gap-8 px-4 text-center">
      <motion.div style={{ opacity: introOp }}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#C7B8FF]">dois corações</p>
        <p className="mt-2 font-script text-3xl md:text-4xl text-white text-balance">cada um no seu compasso...</p>
        <div className="mt-3 flex justify-center gap-5 text-xs font-bold tabular-nums">
          <span style={{ color: COLOR_A }}>{names[0]} · {bpmA} bpm</span>
          <span style={{ color: COLOR_B }}>{names[1]} · <motion.span>{bpmB}</motion.span> bpm</span>
        </div>
      </motion.div>

      <div className="relative w-full max-w-3xl">
        <svg viewBox="0 0 600 180" className="w-full overflow-hidden" aria-hidden="true"
          style={{ maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)' }}>
          <g transform="translate(0 30)">
            <Line x={xA} y={yA} color={COLOR_A} label={names[0]} labelOp={labelOp} />
            <Line x={xB} y={gap} color={COLOR_B} label={names[1]} labelOp={labelOp} />
          </g>
        </svg>
        <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ opacity: syncedOp }}>
          <HeartGlyph className="w-10 h-10 animate-heartbeat" fill={COLOR_A} />
        </motion.div>
        {burst > 0 && <HeartBurst key={burst} color="#FF8FA3" />}
      </div>

      <motion.div style={{ opacity: syncedOp }}>
        <p className="font-script text-4xl md:text-5xl text-white">um só ritmo</p>
      </motion.div>

      <motion.div style={{ opacity: beatsOp, y: beatsY }} className="max-w-sm">
        <p className="text-white/60 text-sm">desde o começo, os corações de vocês já bateram</p>
        <motion.p className="mt-1 font-black text-4xl md:text-5xl tabular-nums"
          style={{ background: `linear-gradient(90deg, ${COLOR_A}, ${COLOR_B})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          {beatsRounded}
        </motion.p>
        <p className="text-white/60 text-sm">vezes — um pouquinho mais rápido quando estão juntos</p>
      </motion.div>
    </div>
  )
}

export function HeartbeatSync({ names, totalMinutes }) {
  if (!names?.length) return null
  const pair = [names[0] || 'você', names[1] || 'eu']
  return (
    <StickyChapter height="280vh" chapter="dois corações">
      {p => <BeatScene p={p} names={pair} totalMinutes={totalMinutes || 0} />}
    </StickyChapter>
  )
}
