import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useInView } from 'framer-motion'
import { Eyebrow } from './StoryKit'
import { buildStoryImage, shareStoryImage } from '../../lib/starStory'

const StarNamesScene = dynamic(() => import('../landing/StarNamesScene'), { ssr: false, loading: () => null })

/* ══════════════════════════════════════════════════
   CAPÍTULO — "escritos nas estrelas"
   As estrelas escrevem os nomes do casal e desenham um
   coração em volta; dá para salvar a imagem nos Stories.
══════════════════════════════════════════════════ */

export function StarNamesChapter({ names }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  useEffect(() => { if (inView) setActive(true) }, [inView])

  const [burstKey, setBurstKey] = useState(0)
  const glCanvas = useRef(null)
  const [saving, setSaving] = useState(false)

  if (names.length < 2) return null

  const save = async () => {
    if (!glCanvas.current || saving) return
    setSaving(true)
    try {
      const blob = await buildStoryImage(glCanvas.current, names[0], names[1])
      if (blob) await shareStoryImage(blob, names[0], names[1])
    } finally {
      setSaving(false)
    }
  }

  return (
    <section ref={ref} data-chapter="escritos nas estrelas" className="story-chapter py-16 px-4 text-center"
      style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 45%, #3D0A22 0%, #1A040E 55%, #0B0207 100%)' }}>
      <Eyebrow>escritos nas estrelas</Eyebrow>
      <p className="mt-3 font-script text-3xl md:text-4xl text-white text-balance">nem o universo resistiu a vocês</p>

      <div className="relative h-[58svh] min-h-[340px] max-w-5xl mx-auto mt-2 cursor-pointer select-none"
        onPointerDown={() => setBurstKey(k => k + 1)}>
        {mounted && (
          <StarNamesScene names={[names[0], names[1]]} active={active} running={near} burstKey={burstKey}
            onCanvas={el => (glCanvas.current = el)} />
        )}
        <p className="absolute bottom-1 inset-x-0 text-white/35 text-xs pointer-events-none">toque nas estrelas ✨</p>
      </div>

      <button type="button" onClick={save} disabled={saving}
        className="mt-4 w-full max-w-sm py-4 rounded-xl font-black text-white text-sm disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,var(--tc,#C9184A),rgba(var(--tc-rgb,201,24,74),0.7))', boxShadow: '0 8px 24px rgba(var(--tc-rgb,201,24,74),0.4)' }}>
        {saving ? 'gerando imagem...' : '📲 Salvar nossos nomes nas estrelas'}
      </button>
      <p className="mt-2 text-white/40 text-xs">pronta para postar nos Stories</p>
    </section>
  )
}
