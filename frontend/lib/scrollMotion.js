import { useEffect, useState } from 'react'
import { useScroll, useTransform, useReducedMotion } from 'framer-motion'

/* ══════════════════════════════════════════════════
   Utilitários de animação ligada ao scroll (landing + página do casal)
══════════════════════════════════════════════════ */

export const HEART_PATH = 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'

export const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v)

/* framer-motion 12 "acelera" useTransform(scrollYProgress, [..], [..]) ligado a
   opacity com uma ViewTimeline nativa, mas erra o intervalo e perde os keyframes
   fora do trecho pedido. Derivar o progresso por função mantém o cálculo em JS. */
export function useScrollProgress(options) {
  const { scrollYProgress } = useScroll(options)
  return useTransform(scrollYProgress, v => v)
}

/* Respeitar o "reduzir movimento" do sistema? Muita gente tem isso ligado sem
   saber (ex.: Windows com "Efeitos de animação" desligado), e aí o site perde
   quase todas as animações — que são o produto. Desligado por decisão do produto;
   mude para true para voltar a respeitar a preferência (landing + página do casal). */
export const RESPECT_REDUCED_MOTION = false

/* useReducedMotion devolve null no SSR e o valor real já no 1º render do
   cliente, o que quebra a hidratação — aqui a preferência só vale após montar */
export function useSafeReducedMotion() {
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return RESPECT_REDUCED_MOTION && mounted && !!reduce
}

/* largura da janela (para animações em px que dependem da tela) */
export function useViewportWidth(fallback = 375) {
  const [w, setW] = useState(fallback)
  useEffect(() => {
    const update = () => setW(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return w
}
