import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartGlyph, HeartBurst, Starfield, setScrollLocked } from './StoryKit'

/* ══════════════════════════════════════════════════
   ENTRADA — "você me ama?"
   Um selo pulsando pede o primeiro toque (que também libera a
   música); depois vem a pergunta, com o "não" fugindo do dedo
   e o "sim" crescendo. É o momento que a pessoa grava a reação.
══════════════════════════════════════════════════ */

const NO_LINES = [
  'escolha com o coração ♡',
  'tem certeza? 🥺',
  'pensa bem...',
  'olha que eu choro 😭',
  'resposta errada 😅',
  'o "não" tá com defeito',
  'tá bom, agora só tem o sim 😌',
]
const MAX_DODGES = NO_LINES.length - 1

export function LoveGate({ onOpen, onAccept, onDone }) {
  const [stage, setStage] = useState('closed') // closed → ask → yes
  const [dodges, setDodges] = useState(0)
  const [noPos, setNoPos] = useState(null)

  useEffect(() => {
    setScrollLocked(true)
    return () => setScrollLocked(false)
  }, [])

  /* posição inicial do "não": ao lado do "sim" */
  useEffect(() => {
    if (stage !== 'ask') return
    setNoPos({ x: window.innerWidth / 2 + 14, y: window.innerHeight * 0.62 })
  }, [stage])

  const open = () => { onOpen?.(); setStage('ask') }

  const lastDodge = useRef(0)
  const dodge = e => {
    e?.preventDefault?.()
    /* no toque chegam pointerdown + click: conta uma fuga só */
    if (dodges >= MAX_DODGES || performance.now() - lastDodge.current < 450) return
    lastDodge.current = performance.now()
    const w = window.innerWidth, h = window.innerHeight
    setNoPos({ x: 20 + Math.random() * (w - 140), y: h * 0.3 + Math.random() * h * 0.55 })
    setDodges(d => d + 1)
  }

  const accept = () => {
    onAccept?.()
    setStage('yes')
    setTimeout(() => setStage('leaving'), 1900)
    setTimeout(() => onDone?.(), 2500)
  }

  const skip = () => { onOpen?.(); onDone?.() }

  return (
    <motion.div role="dialog" aria-modal="true" aria-label="Surpresa"
      className="fixed inset-0 z-[80] overflow-hidden text-center select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #3a0b25 0%, #14030C 70%)' }}
      animate={{ opacity: stage === 'leaving' ? 0 : 1 }} transition={{ duration: 0.6 }}>
      <Starfield />

      {stage !== 'yes' && stage !== 'leaving' && (
        <button type="button" onClick={skip} className="absolute top-4 right-4 z-10 text-white/35 text-xs font-semibold px-3 py-2">
          pular ›
        </button>
      )}

      <AnimatePresence mode="wait">
        {stage === 'closed' && (
          <motion.div key="closed" className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-8"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }}>
            <p className="font-script text-4xl md:text-5xl text-white text-balance" style={{ textShadow: '0 0 30px rgba(255,77,122,0.5)' }}>
              tem uma surpresa aqui pra você 💌
            </p>
            <button type="button" onClick={open} aria-label="Abrir a surpresa"
              className="relative w-28 h-28 rounded-full flex items-center justify-center animate-heartbeat"
              style={{ background: 'radial-gradient(circle at 35% 30%, #ff5d86, #b3123f 70%)', boxShadow: '0 12px 40px rgba(201,24,74,0.55), inset 0 -6px 14px rgba(0,0,0,0.25)' }}>
              <span className="absolute inset-0 rounded-full animate-ping bg-love-400/30" />
              <HeartGlyph className="relative w-12 h-12" fill="#FFE3EA" />
            </button>
            <p className="text-white/45 text-xs font-bold uppercase tracking-widest">toque no coração para abrir</p>
          </motion.div>
        )}

        {stage === 'ask' && (
          <motion.div key="ask" className="absolute inset-0 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <p className="font-script text-6xl md:text-7xl text-white -mt-24" style={{ textShadow: '0 0 34px rgba(255,77,122,0.6)' }}>
              você me ama?
            </p>
            <AnimatePresence mode="wait">
              <motion.p key={dodges} className="mt-4 text-love-200 text-sm font-semibold"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                {NO_LINES[dodges]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {(stage === 'yes' || stage === 'leaving') && (
          <motion.div key="yes" className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
            <div className="relative">
              <HeartGlyph className="w-24 h-24 animate-heartbeat" fill="#FF4D7A" />
              <HeartBurst />
              <HeartBurst color="#FFD6E0" size="w-6 h-6" />
            </div>
            <p className="font-script text-5xl text-white mt-2">eu sabia! 🥹</p>
            <p className="text-white/60 text-sm">então vem ver o que eu preparei...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* botões da pergunta (fora do AnimatePresence para o "não" poder fugir pela tela toda) */}
      {stage === 'ask' && noPos && (
        <>
          <motion.button type="button" onClick={accept}
            className="absolute left-1/2 z-10 rounded-full px-8 py-3.5 font-black text-lg text-white shadow-2xl"
            style={{ top: '62%', x: '-100%', marginLeft: -14, background: 'linear-gradient(135deg, #FF4D7A, #C9184A)', boxShadow: '0 10px 30px rgba(255,77,122,0.5)' }}
            initial={{ scale: 0 }} animate={{ scale: Math.min(2.1, 1 + dodges * 0.2) }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
            sim ❤️
          </motion.button>
          {dodges < MAX_DODGES && (
            <motion.button type="button"
              className="fixed z-10 rounded-full px-7 py-3 font-bold text-white/85 border border-white/25"
              style={{ left: 0, top: 0, background: 'rgba(255,255,255,0.08)' }}
              initial={{ x: noPos.x, y: noPos.y, scale: 0 }}
              animate={{ x: noPos.x, y: noPos.y, scale: Math.max(0.45, 1 - dodges * 0.11) }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              onPointerEnter={e => { if (e.pointerType === 'mouse') dodge(e) }}
              onPointerDown={dodge}
              onClick={dodge}>
              não
            </motion.button>
          )}
        </>
      )}
    </motion.div>
  )
}
