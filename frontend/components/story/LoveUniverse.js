import { useEffect, useRef } from 'react'
import { motion, useTransform, useInView, animate, useMotionValue } from 'framer-motion'
import { Earth, Sun, Moon, Hourglass, MessageCircleHeart, CalendarHeart } from 'lucide-react'
import { useScrollProgress } from '../../lib/scrollMotion'
import { countFullMoons, EARTH_ORBIT_KMH } from '../../lib/loveTime'
import { Starfield } from './StoryKit'

/* ══════════════════════════════════════════════════
   CAPÍTULO — "Nosso universo em números"
   Números de verdade (e alguns chutes carinhosos) sobre o tempo
   de vocês, em cartões coloridos flutuando no espaço.
══════════════════════════════════════════════════ */

function fmt(n) {
  if (n >= 1e6) return `${(n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} milhões`
  return Math.round(n).toLocaleString('pt-BR')
}

function CountUp({ to, format = fmt }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const value = useMotionValue(0)
  const text = useTransform(value, v => format(v))
  useEffect(() => {
    if (!inView) return
    const controls = animate(value, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [inView, to, value])
  return <motion.span ref={ref}>{text}</motion.span>
}

function StatCard({ stat, index, progress }) {
  /* cada cartão flutua numa velocidade diferente (profundidade) */
  const depth = [60, -40, 90, -70, 40, -90][index % 6]
  const y = useTransform(progress, [0, 1], [depth, -depth])
  const Icon = stat.icon
  return (
    <motion.div style={{ y }}>
      <motion.div className="relative h-full rounded-3xl p-4 md:p-5 text-left shadow-2xl"
        style={{ background: stat.bg, color: '#1d0f24' }}
        initial={{ opacity: 0, scale: 0.8, rotate: index % 2 ? 6 : -6 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ type: 'spring', stiffness: 150, damping: 14, delay: (index % 3) * 0.08 }}>
        <span className="inline-flex w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.55)' }}>
          <Icon size={20} strokeWidth={2.2} />
        </span>
        <p className="font-black text-2xl md:text-3xl leading-none tabular-nums"><CountUp to={stat.value} format={stat.format} /></p>
        <p className="mt-1.5 text-[13px] font-semibold leading-snug opacity-75">{stat.label}</p>
        {stat.note && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-45">{stat.note}</p>}
      </motion.div>
    </motion.div>
  )
}

export function LoveUniverse({ start, time }) {
  const ref = useRef(null)
  const progress = useScrollProgress({ target: ref, offset: ['start end', 'end start'] })
  if (!start || !time) return null

  const days = time.totalDays
  const hours = time.totalHours
  const moons = countFullMoons(start)
  const moonLabel = moons === 0 ? 'luas cheias — a primeira ainda está por vir' : moons === 1 ? 'lua cheia vista lado a lado' : 'luas cheias vistas lado a lado'
  const stats = [
    { icon: Earth, value: days, label: days === 1 ? 'volta da Terra em torno de si mesma' : 'voltas da Terra em torno de si mesma', bg: 'linear-gradient(135deg,#A8F0D8,#7ED9C0)' },
    { icon: Sun, value: hours * EARTH_ORBIT_KMH, label: 'km viajados juntos pelo espaço, em volta do Sol', bg: 'linear-gradient(135deg,#FFE7A3,#FFC96B)' },
    { icon: Moon, value: moons, label: moonLabel, bg: 'linear-gradient(135deg,#D9D1FF,#B3A4FF)' },
    { icon: Hourglass, value: hours, label: 'horas desde o primeiro dia', bg: 'linear-gradient(135deg,#BDE7FF,#8CCBFF)' },
    { icon: CalendarHeart, value: Math.floor(days / 7), label: 'fins de semana pra chamar de nossos', bg: 'linear-gradient(135deg,#FFD0C2,#FFA992)' },
    { icon: MessageCircleHeart, value: days * 3, label: '"eu te amo" (no mínimo)', note: 'chute carinhoso', bg: 'linear-gradient(135deg,#FFC8E0,#FF97C1)' },
  ]

  return (
    <section ref={ref} data-chapter="nosso universo" className="story-section !h-auto min-h-[100svh] py-24 px-4">
      <Starfield className="opacity-70" />
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#BFB3FF]">nosso universo em números</p>
          <p className="mt-3 font-script text-3xl md:text-4xl text-white text-balance">enquanto vocês se apaixonavam, o universo seguia girando...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {stats.map((s, i) => <StatCard key={i} stat={s} index={i} progress={progress} />)}
        </div>
      </div>
    </section>
  )
}
