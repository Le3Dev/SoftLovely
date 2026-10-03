import { useEffect, useState } from 'react'
import { motion, useTransform, useMotionValueEvent } from 'framer-motion'
import { HEART_PATH, useSafeReducedMotion, useViewportWidth } from '../../lib/scrollMotion'
import { StickyChapter, HeartGlyph, HEART_VIEWBOX, HEART_MASK } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO — "Nós dois"
   A foto aparece por uma janela em forma de coração que
   se abre com o scroll até tomar a tela inteira.
══════════════════════════════════════════════════ */

function RevealScene({ p, photos, coupleName, dateStr }) {
  const reduce = useSafeReducedMotion()
  const vw = useViewportWidth()
  const startSize = vw < 640 ? 62 : 34

  /* cresce de forma exponencial: cada trecho de scroll aumenta o coração na
     mesma proporção, então a abertura parece constante do começo ao fim */
  const from = reduce ? 80 : startSize
  const size        = useTransform(p, v => from * Math.pow(950 / from, Math.min(1, Math.max(0, (v - 0.1) / 0.62))))
  const maskSize    = useTransform(size, v => `${v}%`)
  const outlineScale = useTransform(size, v => v / 100)
  const outlineOp   = useTransform(p, [0.3, 0.55], [1, 0])
  const photoScale  = useTransform(p, [0, 0.85], [reduce ? 1 : 1.35, 1])
  const introOp     = useTransform(p, [0, 0.1, 0.24], [1, 1, 0])
  const captionOp   = useTransform(p, [0.7, 0.84], [0, 1])
  const captionY    = useTransform(p, [0.7, 0.84], [24, 0])

  /* depois de aberto, as fotos se revezam */
  const [open, setOpen] = useState(false)
  useMotionValueEvent(p, 'change', v => setOpen(v > 0.75))
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!open || photos.length < 2) return
    const id = setInterval(() => setCurrent(c => (c + 1) % photos.length), 4200)
    return () => clearInterval(id)
  }, [open, photos.length])

  return (
    <div className="relative h-full">
      <motion.p className="absolute inset-x-0 top-[13%] text-center font-script text-3xl md:text-4xl text-love-200 px-6 z-10"
        style={{ opacity: introOp }}>
        abra o coração ♡
      </motion.p>

      {/* foto dentro da máscara de coração */}
      <motion.div className="absolute inset-0"
        style={{
          WebkitMaskImage: HEART_MASK, maskImage: HEART_MASK,
          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center', maskPosition: 'center',
          WebkitMaskSize: maskSize, maskSize,
        }}>
        {photos.map((url, i) => (
          <motion.img key={url + i} src={url} alt={coupleName}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ scale: photoScale, opacity: i === current ? 1 : 0, transition: 'opacity 1.2s ease' }}
            onError={e => { e.currentTarget.style.display = 'none' }} />
        ))}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent 45%, rgba(0,0,0,0.25))' }} />
      </motion.div>

      {/* contorno luminoso acompanhando a janela */}
      <motion.svg viewBox={HEART_VIEWBOX} aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-full pointer-events-none overflow-visible"
        style={{ aspectRatio: '20 / 18.8', x: '-50%', y: '-50%', scale: outlineScale, opacity: outlineOp }}>
        <path d={HEART_PATH} fill="none" stroke="rgba(var(--tc-rgb,201,24,74),0.35)" strokeWidth="8" vectorEffect="non-scaling-stroke" />
        <path d={HEART_PATH} fill="none" stroke="var(--tc, #FF4D7A)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </motion.svg>

      <motion.div className="absolute inset-x-0 bottom-[9%] flex flex-col items-center gap-2 px-6 text-center" style={{ opacity: captionOp, y: captionY }}>
        <span className="h-0.5 w-10 rounded-full" style={{ background: 'var(--tc, #C9184A)' }} />
        <p className="text-white font-black text-2xl" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{coupleName}</p>
        {dateStr && <p className="text-white/70 text-xs uppercase tracking-widest">{dateStr}</p>}
        {photos.length > 1 && (
          <div className="flex gap-1.5 mt-2">
            {photos.map((_, i) => (
              <button key={i} type="button" aria-label={`Foto ${i + 1}`} onClick={() => setCurrent(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === current ? 18 : 6, background: i === current ? 'var(--tc, #C9184A)' : 'rgba(255,255,255,0.45)' }} />
            ))}
          </div>
        )}
        <HeartGlyph className="w-5 h-5 mt-1 animate-heartbeat" fill="#FF4D7A" />
      </motion.div>
    </div>
  )
}

export function HeartReveal({ photos, coupleName, dateStr }) {
  if (!photos?.length) return null
  return (
    <StickyChapter height="230vh" chapter="nós dois">
      {p => <RevealScene p={p} photos={photos} coupleName={coupleName} dateStr={dateStr} />}
    </StickyChapter>
  )
}
