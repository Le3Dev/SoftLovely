import { useEffect, useRef } from 'react'
import { clamp01 } from '../../lib/scrollMotion'
import { useChapterPositions } from './StoryKit'

/* ══════════════════════════════════════════════════
   CÉU QUE MUDA DE COR — o fundo da página atravessa um "dia"
   inteiro enquanto a história é lida: noite, céu estrelado,
   amanhecer, crepúsculo, dia, cosmos, pôr do sol... e noite.
   Camadas fixas com opacidade (barato para a GPU) em crossfade.
══════════════════════════════════════════════════ */

export const PALETTES = {
  'era uma vez':         ['#14030C', '#2E0A20'],
  'o céu daquela noite': ['#040819', '#17204D'],
  'cada dia conta':      ['#FF8C7A', '#E4457A'],
  'dois corações':       ['#0A0612', '#1E0B2E'],
  'nossa música':        ['#221043', '#5B2B8C'],
  'nós dois':            ['#160610', '#2B0E20'],
  'varal de memórias':   ['#FFF3EA', '#FFCFBF'],
  'momentos':            ['#1C0A14', '#3D1028'],
  'nosso universo':      ['#060A24', '#241452'],
  'próximo capítulo':    ['#FFB45E', '#EE5670'],
  'poema':               ['#1D0B12', '#4A1430'],
  'carta de amor':       ['#FFE7EF', '#FFBCCD'],
  'surpresa':            ['#2A0616', '#5E1233'],
  'continua...':         ['#0D0208', '#2D0019'],
  'compartilhar':        ['#1A0010', '#7B0033'],
}
const FALLBACK = ['#0D0208', '#2D0019']

export function SkyBackdrop({ rootRef }) {
  const chapters = useChapterPositions(rootRef)
  const layers = useRef([])

  useEffect(() => {
    if (!chapters.length) return
    let frame = 0
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      const blend = vh * 0.8
      const center = window.scrollY + vh * 0.5
      /* quanto cada capítulo já "entrou" (0 → 1 numa faixa em volta do seu topo) */
      const entered = chapters.map((c, i) => (i === 0 ? 1 : clamp01((center - (c.top - blend / 2)) / blend)))
      let covered = false
      for (let i = entered.length - 1; i >= 0; i--) {
        const el = layers.current[i]
        if (!el) continue
        /* camadas totalmente cobertas por uma de cima ficam em 0 (menos pintura) */
        const op = covered ? 0 : entered[i]
        el.style.opacity = op.toFixed(3)
        if (entered[i] >= 1) covered = true
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [chapters])

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" style={{ background: FALLBACK[0] }}>
      {chapters.map((c, i) => {
        const [a, b] = PALETTES[c.label] || FALLBACK
        return (
          <div key={c.label + i} ref={el => { layers.current[i] = el }} className="absolute inset-0"
            style={{ background: `linear-gradient(170deg, ${a} 0%, ${b} 100%)`, opacity: i === 0 ? 1 : 0, willChange: 'opacity' }} />
        )
      })}
    </div>
  )
}
