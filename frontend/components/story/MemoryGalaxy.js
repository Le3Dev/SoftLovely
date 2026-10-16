import { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, useInView, useTransform } from 'framer-motion'
import { StickyChapter, Eyebrow } from './StoryKit'

const MemoryGalaxyScene = dynamic(() => import('./MemoryGalaxyScene'), { ssr: false, loading: () => null })

/* ══════════════════════════════════════════════════
   CAPÍTULO — "nossa galáxia"
   As fotos giram em espiral em volta de um coração 3D
   e passam pela frente conforme a pessoa rola.
══════════════════════════════════════════════════ */

const MIN_CARDS = 6

function GalaxyStage({ photos, progress, themeColor }) {
  const ref = useRef(null)
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const titleOp = useTransform(progress, [0, 0.12], [1, 0.25])
  const endOp = useTransform(progress, [0.85, 1], [0, 1])

  return (
    <div ref={ref} className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 45%, #2E0A1F 0%, #14030C 70%)' }}>
      {mounted && <MemoryGalaxyScene photos={photos} progress={progress} themeColor={themeColor} running={near} />}
      <motion.div className="absolute top-0 inset-x-0 pt-16 px-6 text-center pointer-events-none" style={{ opacity: titleOp }}>
        <Eyebrow>nossa galáxia</Eyebrow>
        <p className="mt-3 font-script text-3xl md:text-4xl text-white text-balance" style={{ textShadow: '0 0 24px rgba(0,0,0,0.6)' }}>
          cada lembrança, girando ao nosso redor
        </p>
      </motion.div>
      <motion.p className="absolute bottom-12 inset-x-0 text-center text-white/60 text-sm font-semibold pointer-events-none px-6"
        style={{ opacity: endOp }}>
        e o centro de tudo continua sendo a gente ♡
      </motion.p>
    </div>
  )
}

export function MemoryGalaxy({ photos, themeColor }) {
  if (!photos?.length) return null
  /* poucas fotos (plano Básico): repete para a espiral ficar cheia */
  const cards = photos.length >= MIN_CARDS ? photos : Array.from({ length: MIN_CARDS }, (_, i) => photos[i % photos.length])
  return (
    <StickyChapter height={`${110 + cards.length * 40}vh`} chapter="nossa galáxia">
      {progress => <GalaxyStage photos={cards} progress={progress} themeColor={themeColor} />}
    </StickyChapter>
  )
}
