import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useTransform, useInView, useMotionValueEvent } from 'framer-motion'
import { moonPhase } from '../../lib/loveTime'
import { StickyChapter, Eyebrow, HeartGlyph, Starfield } from './StoryKit'

const HeartSpaceScene = dynamic(() => import('../HeartSpaceScene'), { ssr: false, loading: () => null })

/* ══════════════════════════════════════════════════
   CAPÍTULO — "O céu daquela noite"
   A lua na fase exata do dia em que tudo começou (vista do
   hemisfério sul), os dois sentadinhos no morro olhando pra ela...
   e as estrelas se juntando num coração: uma constelação de vocês.
══════════════════════════════════════════════════ */

/* lua desenhada pela fase real (0 nova · 0.5 cheia) */
function Moon({ phase }) {
  const R = 50
  const k = Math.cos(2 * Math.PI * phase)
  const rx = Math.max(0.01, Math.abs(k) * R)
  /* parte iluminada do lado direito; o terminador curva para dentro (crescente) ou para fora (gibosa) */
  const lit = `M0 ${-R} A${R} ${R} 0 0 1 0 ${R} A${rx} ${R} 0 0 ${k > 0 ? 0 : 1} 0 ${-R} Z`
  /* no hemisfério norte a crescente brilha à direita; no sul (Brasil) é o contrário */
  const mirror = phase < 0.5 ? 'scale(-1,1)' : undefined

  return (
    <svg viewBox="-60 -60 120 120" className="w-full h-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="moon-lit" cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FFFBEA" />
          <stop offset="70%" stopColor="#F4E7B8" />
          <stop offset="100%" stopColor="#D9C68C" />
        </radialGradient>
        <clipPath id="moon-lit-clip"><path d={lit} transform={mirror} /></clipPath>
      </defs>
      <circle r={R} fill="#1A2046" />
      <circle r={R} fill="none" stroke="rgba(255,255,255,0.06)" />
      <path d={lit} transform={mirror} fill="url(#moon-lit)" />
      <g clipPath="url(#moon-lit-clip)" fill="rgba(120,100,60,0.14)">
        <circle cx="-16" cy="-14" r="9" /><circle cx="14" cy="8" r="12" /><circle cx="-8" cy="22" r="6" />
        <circle cx="22" cy="-20" r="5" /><circle cx="-26" cy="10" r="4" />
      </g>
    </svg>
  )
}

/* os dois sentadinhos no morro */
function HillCouple() {
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" className="w-full h-full" aria-hidden="true">
      <path d="M0 120 L0 78 C70 52, 150 40, 210 44 C280 48, 340 64, 400 80 L400 120 Z" fill="#070A1C" />
      <g transform="translate(196 30)" fill="#070A1C">
        {/* pessoa 1 */}
        <circle cx="-9" cy="-2" r="5.2" />
        <path d="M-15 16 C-16 6, -13 3, -9 3 C-5 3, -3 7, -3 16 Z" />
        {/* pessoa 2, com a cabeça encostada */}
        <circle cx="5" cy="-0.5" r="5" />
        <path d="M-2 16 C-2 7, 1 4, 5 4 C9 4, 11 7, 11 16 Z" />
      </g>
      <g transform="translate(193 12)">
        <HeartPath />
      </g>
    </svg>
  )
}
function HeartPath() {
  return <path d="M0 6 C-5 2, -7 -1, -4 -4 C-2 -6, 0 -4, 0 -2 C0 -4, 2 -6, 4 -4 C7 -1, 5 2, 0 6 Z" fill="#FF4D7A" className="animate-heartbeat" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />
}

function SkyScene({ p, start, coupleName, themeColor }) {
  const sceneRef = useRef(null)
  const near = useInView(sceneRef, { margin: '100% 0px' })   // monta o 3D um pouco antes
  const onScreen = useInView(sceneRef)
  const moon = moonPhase(start)
  const pct = Math.round(moon.illumination * 100)
  const dateStr = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  const moonY     = useTransform(p, [0, 0.32, 0.5, 0.62], ['38vh', '0vh', '0vh', '-26vh'])
  const moonScale = useTransform(p, [0, 0.32, 0.5, 0.62], [0.8, 1, 1, 0.45])
  const moonOp    = useTransform(p, [0.58, 0.68], [1, 0])
  const hillY     = useTransform(p, [0.44, 0.6], ['0%', '100%'])
  const introOp   = useTransform(p, [0, 0.06, 0.2, 0.26], [0, 1, 1, 0])
  const phaseOp   = useTransform(p, [0.26, 0.33, 0.44, 0.5], [0, 1, 1, 0])
  const gatherOp  = useTransform(p, [0.52, 0.58, 0.74, 0.8], [0, 1, 1, 0])
  const canvasOp  = useTransform(p, [0.46, 0.6], [0, 1])
  const formation = useTransform(p, [0.56, 0.88], [0, 1])
  const finalOp   = useTransform(p, [0.86, 0.94], [0, 1])
  const finalY    = useTransform(p, [0.86, 0.94], [24, 0])

  /* 3D só renderiza quando está visível */
  const [canvasOn, setCanvasOn] = useState(false)
  useMotionValueEvent(p, 'change', v => setCanvasOn(v > 0.44))
  /* estrela cadente quando a lua termina de subir */
  const [shoot, setShoot] = useState(0)
  const armed = useRef(true)
  useMotionValueEvent(p, 'change', v => {
    if (v > 0.3 && armed.current) { armed.current = false; setShoot(s => s + 1) }
    else if (v < 0.2) armed.current = true
  })

  return (
    <div ref={sceneRef} className="relative h-full overflow-hidden text-center">
      <Starfield />

      {shoot > 0 && <span key={shoot} aria-hidden="true" className="shooting-star" />}

      {near && (
        <motion.div className="absolute inset-0" style={{ opacity: canvasOp }}>
          <HeartSpaceScene themeColor={themeColor} progress={formation} running={onScreen && canvasOn} />
        </motion.div>
      )}

      {/* lua */}
      <motion.div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-44 md:h-44"
        style={{ y: moonY, scale: moonScale, opacity: moonOp }}>
        <div className="absolute -inset-16 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(255,246,210,${0.12 + moon.illumination * 0.22}), transparent 62%)` }} />
        <Moon phase={moon.phase} />
      </motion.div>

      {/* morro com os dois */}
      <motion.div className="absolute inset-x-0 bottom-0 h-[26svh]" style={{ y: hillY }}>
        <HillCouple />
      </motion.div>

      <motion.div className="absolute inset-x-0 top-[58%] px-6" style={{ opacity: introOp }}>
        <Eyebrow><span className="text-[#C9D2FF]">o céu daquela noite</span></Eyebrow>
        <p className="mt-3 font-script text-3xl md:text-4xl text-white text-balance">{dateStr}</p>
      </motion.div>

      <motion.div className="absolute inset-x-0 top-[55%] px-6" style={{ opacity: phaseOp }}>
        <p className="text-[#C9D2FF]/80 text-sm">na noite em que tudo começou, a lua estava assim:</p>
        <p className="mt-2 font-black text-white text-3xl tracking-tight">{moon.name}</p>
        <p className="mt-1 text-[#F4E7B8] text-sm font-bold">{pct}% iluminada</p>
      </motion.div>

      <motion.p className="absolute inset-x-0 top-[70%] px-8 font-script text-2xl md:text-3xl text-white/90 text-balance" style={{ opacity: gatherOp }}>
        e as estrelas, sem ninguém perceber,<br />começaram a se juntar...
      </motion.p>

      <motion.div className="absolute inset-x-0 bottom-[12%] px-6" style={{ opacity: finalOp, y: finalY }}>
        <p className="font-black text-white text-3xl md:text-5xl tracking-tight" style={{ textShadow: '0 0 30px rgba(var(--tc-rgb,201,24,74),0.6)' }}>{coupleName}</p>
        <p className="mt-2 text-[#C9D2FF]/80 text-sm flex items-center justify-center gap-1.5">
          uma constelação só de vocês <HeartGlyph className="w-3.5 h-3.5" fill="#FF8FA3" />
        </p>
      </motion.div>
    </div>
  )
}

export function MoonSky({ start, coupleName, themeColor }) {
  if (!start) return null
  return (
    <StickyChapter height="340vh" chapter="o céu daquela noite">
      {p => <SkyScene p={p} start={start} coupleName={coupleName} themeColor={themeColor} />}
    </StickyChapter>
  )
}
