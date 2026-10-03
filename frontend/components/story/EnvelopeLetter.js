import { useEffect, useRef } from 'react'
import { motion, useTransform } from 'framer-motion'
import { StickyChapter, Eyebrow, HeartGlyph } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO — "Carta de amor"
   Um envelope: o selo se rompe, a aba abre, a carta sai
   e as palavras vão acendendo no ritmo da leitura.
══════════════════════════════════════════════════ */

function LetterWord({ word, range, read }) {
  const opacity = useTransform(read, range, [0.16, 1])
  return <><motion.span style={{ opacity }}>{word}</motion.span>{' '}</>
}

function EnvelopeScene({ p, words, signature }) {
  const introOp  = useTransform(p, [0, 0.1, 0.18], [1, 1, 0])
  const envScale = useTransform(p, [0, 0.1], [0.85, 1])
  const sealScale = useTransform(p, [0.1, 0.17], [1, 1.8])
  const sealOp   = useTransform(p, [0.12, 0.17], [1, 0])
  const flap     = useTransform(p, [0.15, 0.28], [0, 180])
  const flapZ    = useTransform(flap, v => (v > 90 ? 2 : 5))
  const miniY    = useTransform(p, [0.28, 0.42], [0, -118])
  const envY     = useTransform(p, [0.42, 0.52], [0, 160])
  const envOp    = useTransform(p, [0.44, 0.53], [1, 0])
  const cardOp   = useTransform(p, [0.44, 0.52], [0, 1])
  const cardScale = useTransform(p, [0.44, 0.56], [0.55, 1])
  const cardY    = useTransform(p, [0.44, 0.56], [-70, 0])
  const read     = useTransform(p, [0.56, 0.93], [0, 1])
  const signOp   = useTransform(p, [0.92, 0.98], [0, 1])

  /* cartas longas: o texto sobe dentro do papel conforme a leitura */
  const boxRef = useRef(null)
  const textRef = useRef(null)
  const overflow = useRef(0)
  useEffect(() => {
    const measure = () => {
      if (boxRef.current && textRef.current) overflow.current = Math.max(0, textRef.current.scrollHeight - boxRef.current.clientHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (textRef.current) ro.observe(textRef.current)
    return () => ro.disconnect()
  }, [])
  const textY = useTransform(read, v => -overflow.current * Math.min(1, Math.max(0, (v - 0.15) / 0.8)))

  const step = 0.9 / Math.max(1, words.length)
  const longLetter = words.length > 70

  return (
    <div className="relative h-full flex flex-col items-center justify-center px-6">
      <motion.div className="absolute inset-x-0 top-[16%] text-center px-6" style={{ opacity: introOp }}>
        <Eyebrow>carta de amor</Eyebrow>
        <p className="mt-3 font-script text-3xl text-[#4A0020]">tem uma carta pra você...</p>
      </motion.div>

      {/* envelope */}
      <motion.div className="relative w-[290px] h-[190px]" style={{ scale: envScale, y: envY, opacity: envOp }}>
        <div className="absolute inset-0 rounded-md shadow-2xl" style={{ background: '#D9728F', zIndex: 1 }} />
        <motion.div className="absolute left-3 right-3 top-3 h-[88%] rounded-sm p-4 flex flex-col gap-2"
          style={{ background: '#FFF8F0', zIndex: 3, y: miniY }}>
          <HeartGlyph className="w-4 h-4 self-end" fill="#C9184A" />
          {[92, 78, 86, 60].map((w, i) => <span key={i} className="h-1.5 rounded-full bg-[#e8d0d0]" style={{ width: `${w}%` }} />)}
        </motion.div>
        <div className="absolute inset-0 rounded-md" style={{ background: 'linear-gradient(160deg, #EE95AC, #E07A97)', clipPath: 'polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)', zIndex: 4 }} />
        <motion.div className="absolute left-0 right-0 top-0 h-[64%] rounded-t-md"
          style={{ background: 'linear-gradient(180deg, #F2A5B9, #E3849F)', clipPath: 'polygon(0 0, 100% 0, 50% 100%)', rotateX: flap, transformPerspective: 900, transformOrigin: '50% 0%', zIndex: flapZ }} />
        <motion.div className="absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: 'radial-gradient(circle at 35% 35%, #e0334f, #9b0f2c)', boxShadow: '0 3px 8px rgba(0,0,0,0.35)', zIndex: 6, scale: sealScale, opacity: sealOp }}>
          <HeartGlyph className="w-5 h-5" fill="#ffd6de" />
        </motion.div>
      </motion.div>

      {/* carta aberta para leitura */}
      <motion.div className="absolute w-[min(88vw,440px)] rounded-lg shadow-2xl px-6 pt-7 pb-6"
        style={{ opacity: cardOp, scale: cardScale, y: cardY, background: 'repeating-linear-gradient(#FFF8F0 0 27px, #f3dede 27px 28px)', color: '#3a1a1a' }}>
        <HeartGlyph className="absolute top-3 right-4 w-5 h-5" fill="var(--tc, #C9184A)" />
        <div ref={boxRef} className="max-h-[58svh] overflow-hidden">
          <motion.p ref={textRef} className={`font-script leading-[28px] ${longLetter ? 'text-lg' : 'text-xl md:text-2xl'}`} style={{ y: textY }}>
            {words.map((w, i) => (
              <LetterWord key={i} word={w} read={read} range={[i * step, Math.min(1, i * step + step * 2)]} />
            ))}
          </motion.p>
        </div>
        <motion.p className="mt-3 text-right font-script text-xl" style={{ opacity: signOp, color: 'var(--tc, #C9184A)' }}>
          {signature}
        </motion.p>
      </motion.div>
    </div>
  )
}

export function EnvelopeLetter({ letter, signature = 'com todo o meu amor ♡' }) {
  const words = (letter?.description || '').split(/\s+/).filter(Boolean)
  if (!words.length) return null
  const height = `${280 + Math.min(words.length, 160) * 1.3}vh`
  return (
    <StickyChapter height={height} chapter="carta de amor">
      {p => <EnvelopeScene p={p} words={words} signature={signature} />}
    </StickyChapter>
  )
}
