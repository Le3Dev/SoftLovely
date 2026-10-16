import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useInView } from 'framer-motion'
import { RevealHeading } from '../LandingScrollFx'
import { HEART_PATH } from '../../lib/scrollMotion'

const StarNamesScene = dynamic(() => import('./StarNamesScene'), { ssr: false, loading: () => null })

/* ══════════════════════════════════════════════════
   SEÇÃO INTERATIVA — o visitante digita os nomes,
   as estrelas escrevem e desenham um coração, e dá
   para salvar uma imagem 9:16 pronta para os Stories.
══════════════════════════════════════════════════ */

const DEFAULT_NAMES = ['Ana', 'Pedro']
const clean = s => s.replace(/\s+/g, ' ').trim().slice(0, 14)

export default function NamesInStars({ onUseNames }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  useEffect(() => { if (inView) setActive(true) }, [inView])

  const [n1, setN1] = useState('')
  const [n2, setN2] = useState('')
  const [names, setNames] = useState(DEFAULT_NAMES)
  useEffect(() => {
    const id = setTimeout(() => setNames([clean(n1) || DEFAULT_NAMES[0], clean(n2) || DEFAULT_NAMES[1]]), 650)
    return () => clearTimeout(id)
  }, [n1, n2])

  const [burstKey, setBurstKey] = useState(0)
  const typed = !!(clean(n1) && clean(n2))

  return (
    <section ref={ref} id="estrelas" className="relative overflow-hidden py-20 md:py-24 px-4"
      style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 45%, #3D0A22 0%, #1A040E 55%, #0B0207 100%)' }}>
      <div className="relative z-10 max-w-3xl mx-auto">
        <RevealHeading dark eyebrow="Experimente agora" title="Escreva vocês nas estrelas"
          subtitle="Digite os dois nomes e veja o universo se reorganizar só para vocês." className="mb-2" />
      </div>

      <div className="relative h-[52svh] min-h-[340px] md:h-[60vh] max-w-6xl mx-auto cursor-pointer select-none"
        onPointerDown={() => setBurstKey(k => k + 1)}>
        {mounted && (
          <StarNamesScene names={names} active={active} running={near} burstKey={burstKey} />
        )}
        <p className="absolute bottom-1 inset-x-0 text-center text-white/35 text-xs pointer-events-none">
          toque nas estrelas ✨
        </p>
      </div>

      <div className="relative z-10 max-w-xl mx-auto mt-4">
        <div className="flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur rounded-2xl p-2 shadow-2xl shadow-black/30">
          <input value={n1} onChange={e => setN1(e.target.value)} maxLength={14} placeholder={DEFAULT_NAMES[0]}
            aria-label="Primeiro nome"
            className="flex-1 min-w-0 bg-transparent text-white placeholder-white/30 text-center font-script font-bold text-2xl px-3 py-2 rounded-xl focus:outline-none focus:bg-white/5" />
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 animate-heartbeat" aria-hidden="true">
            <path d={HEART_PATH} fill="#FF4D7A" />
          </svg>
          <input value={n2} onChange={e => setN2(e.target.value)} maxLength={14} placeholder={DEFAULT_NAMES[1]}
            aria-label="Segundo nome"
            className="flex-1 min-w-0 bg-transparent text-white placeholder-white/30 text-center font-script font-bold text-2xl px-3 py-2 rounded-xl focus:outline-none focus:bg-white/5" />
        </div>

        <button type="button" onClick={() => onUseNames?.(`${names[0]} e ${names[1]}`)}
          className="mt-4 w-full py-3.5 px-3 rounded-xl bg-white text-love-700 font-black text-sm shadow-lg hover:-translate-y-0.5 transition truncate">
          {typed ? `Quero a página de ${names[0]} & ${names[1]} →` : 'Quero a página de vocês →'}
        </button>
      </div>
    </section>
  )
}
