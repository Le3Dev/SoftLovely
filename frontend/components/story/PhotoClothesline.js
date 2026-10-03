import { useEffect, useRef, useState } from 'react'
import { motion, useTransform, useVelocity, useSpring } from 'framer-motion'
import { useScrollProgress, useViewportWidth } from '../../lib/scrollMotion'
import { Eyebrow, HeartGlyph } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO — "Varal de memórias"
   Fotos penduradas num varal; o scroll vertical anda com o varal
   para o lado e as fotos balançam conforme a velocidade.
══════════════════════════════════════════════════ */

const CAPTIONS = ['eu te amo meu amor', 'nós dois ♡', 'meu lugar favorito', 'pra sempre', 'minha pessoa', 'dia bom é com você']
const FUTURE = ['nossa próxima memória', 'a próxima viagem', 'o próximo abraço', 'o que ainda vamos viver']
const TILT = [-3, 2.5, -2, 3.5, -1.5, 2]
const SWAY = [1, -0.8, 1.2, -1, 0.9, -1.1]

function Card({ item, index, width, sway }) {
  const rotate = useTransform(sway, v => TILT[index % TILT.length] + v * SWAY[index % SWAY.length])
  return (
    <motion.div className="relative shrink-0 pt-5" style={{ width, rotate, transformOrigin: '50% 0%' }}
      initial={{ y: -60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.3 }}
      transition={{ type: 'spring', stiffness: 160, damping: 11, delay: (index % 3) * 0.08 }}>
      {/* pregador */}
      <span aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-3 h-8 rounded-[3px]"
        style={{ background: 'linear-gradient(90deg, #d9b48f, #f0d3b0 50%, #d9b48f)', boxShadow: '0 2px 4px rgba(0,0,0,0.35)' }} />

      <div className="clothes-swing" style={{ animationDelay: `${index * -0.7}s` }}>
        {item.type === 'photo' && (
          <div className="relative bg-white p-2.5 pb-10 shadow-2xl rounded-[3px]">
            <div className="aspect-square overflow-hidden bg-[#e8d5d5]">
              <img src={item.url} alt={item.caption} className="w-full h-full object-cover" draggable={false}
                onError={e => { e.currentTarget.style.display = 'none' }} />
            </div>
            <p className="absolute bottom-3 inset-x-0 text-center font-script text-lg text-[#5a3a3a]">{item.caption}</p>
          </div>
        )}

        {item.type === 'start' && (
          <div className="aspect-[4/5] p-5 rounded-[3px] shadow-2xl flex flex-col items-center justify-center text-center gap-3"
            style={{ background: 'linear-gradient(160deg, #FFE3EA, #FFC2D1)' }}>
            <HeartGlyph className="w-10 h-10 animate-heartbeat" fill="#C9184A" />
            <p className="font-script text-2xl text-[#7B0033] leading-tight">onde tudo<br />começou</p>
            {item.sub && <p className="text-[11px] font-bold uppercase tracking-wider text-[#7B0033]/60">{item.sub}</p>}
          </div>
        )}

        {item.type === 'future' && (
          <div className="relative bg-white/95 p-2.5 pb-10 shadow-2xl rounded-[3px]">
            <div className="aspect-square rounded-sm border-2 border-dashed border-love-200 flex flex-col items-center justify-center gap-2 bg-love-50">
              <HeartGlyph className="w-8 h-8 opacity-40" fill="#C9184A" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-love-400">em breve</span>
            </div>
            <p className="absolute bottom-3 inset-x-0 text-center font-script text-lg text-[#5a3a3a]/70">{item.caption}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function PhotoClothesline({ photos, dateStr }) {
  const vw = useViewportWidth()
  const cardW = vw < 640 ? 190 : 240
  const gap = vw < 640 ? 34 : 56
  const pad = Math.round(vw * 0.14)

  const items = [
    { type: 'start', sub: dateStr },
    ...photos.map((url, i) => ({ type: 'photo', url, caption: CAPTIONS[i % CAPTIONS.length] })),
  ]
  for (let i = 0; items.length < 5; i++) items.push({ type: 'future', caption: FUTURE[i % FUTURE.length] })

  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [distance, setDistance] = useState(0)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  const p = useScrollProgress({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(p, v => -v * distance)
  const velocity = useSpring(useVelocity(x), { stiffness: 140, damping: 14 })
  const sway = useTransform(velocity, [-1600, 1600], [11, -11], { clamp: true })
  const hintOp = useTransform(p, [0, 0.12], [1, 0])

  /* fio do varal: ponto alto em cada pregador, curvinha entre eles */
  const pins = items.map((_, i) => i * (cardW + gap) + cardW / 2)
  const lineW = items.length * cardW + (items.length - 1) * gap
  let d = `M${-pad} 4 Q${pins[0] / 2 - pad / 2} 26 ${pins[0]} 10`
  for (let i = 1; i < pins.length; i++) d += ` Q${(pins[i - 1] + pins[i]) / 2} 34 ${pins[i]} 10`
  d += ` Q${(pins[pins.length - 1] + lineW + pad) / 2} 26 ${lineW + pad} 4`

  return (
    <section ref={sectionRef} data-chapter="varal de memórias" className="story-chapter"
      style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-center gap-10">
        <div className="text-center px-6">
          <Eyebrow>varal de memórias</Eyebrow>
          <p className="mt-3 font-script text-3xl md:text-4xl text-[#4A0020] text-balance">cada foto, um pedacinho de nós</p>
          <motion.p className="mt-2 text-[#7B0033]/55 text-xs" style={{ opacity: hintOp }}>continue rolando para passear pelo varal →</motion.p>
        </div>

        <motion.div ref={trackRef} className="relative w-max" style={{ x, paddingLeft: pad, paddingRight: pad }}>
          <svg aria-hidden="true" className="absolute top-2 h-10 overflow-visible pointer-events-none" style={{ left: pad, width: lineW }}
            viewBox={`0 0 ${lineW} 40`} fill="none">
            <path d={d} stroke="rgba(123,0,51,0.4)" strokeWidth="1.5" />
          </svg>
          <div className="relative flex items-start" style={{ gap }}>
            {items.map((item, i) => (
              <Card key={i} item={item} index={i} width={cardW} sway={sway} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
