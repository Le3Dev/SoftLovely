import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

const HeartDotsAnimation = dynamic(() => import('../components/HeartDotsAnimation'), { ssr: false })

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

/* ── helpers ─────────────────────────────────────── */
function resolveUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${API_BASE}${url}`
}
function parseLocalDate(str) {
  if (!str) return new Date()
  return str.includes('T') ? new Date(str) : new Date(str + 'T12:00:00')
}

function calcTime(dateStr) {
  const start = parseLocalDate(dateStr).getTime()
  let diff = Math.max(0, Date.now() - start)
  const Y = 31557600000, D = 86400000, H = 3600000, M = 60000, S = 1000
  const years   = Math.floor(diff / Y); diff -= years * Y
  const days    = Math.floor(diff / D); diff -= days  * D
  const hours   = Math.floor(diff / H); diff -= hours * H
  const minutes = Math.floor(diff / M); diff -= minutes * M
  const seconds = Math.floor(diff / S)
  const totalDays = Math.floor(Math.max(0, Date.now() - start) / D)
  return { years, days, hours, minutes, seconds, totalDays }
}

function extractSpotifyId(url) {
  if (!url) return null
  const m = url.match(/(?:open\.spotify\.com\/track\/|spotify:track:)([A-Za-z0-9]+)/)
  return m ? m[1] : null
}

function useInView(threshold = 0.35) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function Particles({ count = 8, colors = ['❤️','🌹','💋'] }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    left:  `${10 + Math.random() * 80}%`,
    size:  `${Math.random() * 10 + 8}px`,
    dur:   `${Math.random() * 3 + 2}s`,
    delay: `${Math.random() * 3}s`,
    char:  colors[i % colors.length],
  }))
  return (
    <>
      {items.map(p => (
        <span key={p.id} className="local-particle"
          style={{ left: p.left, bottom: 0, fontSize: p.size, animationDuration: p.dur, animationDelay: p.delay }}>
          {p.char}
        </span>
      ))}
    </>
  )
}

function ScrollHint() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 scroll-indicator text-white/30">
      <span className="text-xs font-semibold uppercase tracking-widest">deslize</span>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 14l-6-6h12l-6 6z"/>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   SECOES
═══════════════════════════════════════════════════ */

function SectionOpening({ couple, partners, time }) {
  const [ref, visible] = useInView()
  const names = partners.map(p => p.name).filter(Boolean)
  const title = names.length >= 2 ? `${names[0]} & ${names[1]}` : couple.slug

  return (
    <div ref={ref} className="snap-section text-center px-6"
      style={{ background: 'linear-gradient(160deg, #0D0208 0%, #1a0010 50%, #2d0019 100%)' }}>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {partners.length >= 2 && (
          <div className={`flex items-center gap-4 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {partners.map((p, i) => (
              <div key={p.id}
                className={`transition-all duration-700 ${visible ? 'translate-x-0 opacity-100' : i === 0 ? '-translate-x-16 opacity-0' : 'translate-x-16 opacity-0'}`}
                style={{ transitionDelay: `${i * 0.15}s` }}>
                {p.profileImageUrl ? (
                  <img src={p.profileImageUrl} alt={p.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-love-500 shadow-2xl"
                    style={{ boxShadow: '0 0 0 4px #4A0020, 0 0 30px rgba(201,24,74,0.6)' }} />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl border-4 border-love-500"
                    style={{ background: 'linear-gradient(135deg,#7B0033,#C9184A)', boxShadow: '0 0 0 4px #4A0020, 0 0 30px rgba(201,24,74,0.6)' }}>
                    {p.name?.[0] || '❤'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={`text-5xl transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          style={{ transitionDelay: '0.3s', animation: visible ? 'heartGlow 2s ease-in-out infinite' : 'none', display: 'inline-block' }}>
          ❤️
        </div>

        <h1 className={`font-black text-white text-4xl md:text-6xl tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '0.4s', textShadow: '0 0 40px rgba(201,24,74,0.5)' }}>
          {title}
        </h1>

        {couple.anniversaryDate && (
          <p className={`text-white/50 text-sm font-semibold transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '0.55s' }}>
            juntos desde{' '}
            <span className="text-love-300">
              {parseLocalDate(couple.anniversaryDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </p>
        )}

        <div className={`h-px bg-gradient-to-r from-transparent via-love-500 to-transparent transition-all duration-700 ${visible ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}
          style={{ transitionDelay: '0.7s' }} />

        {time && (
          <p className={`text-white/30 text-xs tracking-widest uppercase transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '0.85s' }}>
            {time.totalDays.toLocaleString('pt-BR')} dias de amor
          </p>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}

function SectionHeart({ coupleName }) {
  return (
    <div className="snap-section"
      style={{ background: 'linear-gradient(160deg, #0D0208 0%, #1a0010 100%)' }}>
      <div className="absolute inset-0">
        <HeartDotsAnimation coupleName={coupleName} />
      </div>
    </div>
  )
}

function SectionCounter({ time }) {
  const [ref, visible] = useInView()
  const units = [
    { key: 'years',   label: 'Anos',     delay: '0s' },
    { key: 'days',    label: 'Dias',     delay: '0.12s' },
    { key: 'hours',   label: 'Horas',    delay: '0.24s' },
    { key: 'minutes', label: 'Minutos',  delay: '0.36s' },
    { key: 'seconds', label: 'Segundos', delay: '0.48s' },
  ]
  return (
    <div ref={ref} className="snap-section px-6"
      style={{ background: 'linear-gradient(160deg, #2d0019 0%, #4A0020 50%, #7B0033 100%)' }}>
      <div className="relative z-10 w-full max-w-sm mx-auto">
        <p className={`text-love-400 text-xs font-bold uppercase tracking-widest text-center mb-2 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          Tempo juntos
        </p>
        <p className={`text-white/20 text-xs text-center mb-8 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '0.1s' }}>
          atualizado a cada segundo
        </p>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {units.map(({ key, label, delay }) => (
            <div key={key}
              className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-75'}`}
              style={{ transitionDelay: delay, transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div className="rounded-2xl py-4 text-center text-white font-black text-2xl tabular-nums shadow-xl"
                style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))', border: '1px solid rgba(201,24,74,0.3)', boxShadow: '0 0 20px rgba(201,24,74,0.2)' }}>
                {String(time?.[key] ?? 0).padStart(2, '0')}
              </div>
              <p className="text-white/30 text-center text-xs mt-1.5 font-bold uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
        <div className={`rounded-3xl p-6 text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '0.65s', background: 'rgba(201,24,74,0.12)', border: '1px solid rgba(201,24,74,0.25)' }}>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">total de dias</p>
          <p className="font-black text-white text-5xl" style={{ textShadow: '0 0 30px rgba(201,24,74,0.6)' }}>
            {time?.totalDays?.toLocaleString('pt-BR') ?? '0'}
          </p>
          <p className="text-love-400 text-xs mt-1">dias de puro amor ❤️</p>
        </div>
      </div>
      <ScrollHint />
    </div>
  )
}

function SectionStory({ story }) {
  const [ref, visible] = useInView(0.2)
  if (!story) return null
  const words = story.split(' ')
  return (
    <div ref={ref} className="snap-section px-8"
      style={{ background: 'linear-gradient(160deg, #0D0208 0%, #1a0010 100%)' }}>
      <div className="relative z-10 max-w-sm mx-auto">
        <div className={`flex items-center gap-2 mb-6 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #C9184A)' }} />
          <p className="text-love-400 text-xs font-bold uppercase tracking-widest">Nossa Historia</p>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #C9184A)' }} />
        </div>
        <div className="text-love-700 text-5xl font-serif mb-2 opacity-40">"</div>
        <p className="text-white/70 text-sm leading-relaxed italic">
          {words.map((word, i) => (
            <span key={i} className="inline-block transition-all duration-300"
              style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transitionDelay: `${0.3 + i * 0.04}s` }}>
              {word}&nbsp;
            </span>
          ))}
        </p>
        <div className="text-love-700 text-5xl font-serif text-right mt-2 opacity-40">"</div>
      </div>
      <ScrollHint />
    </div>
  )
}

function SectionPhotoMusic({ partners, events, musicUrl }) {
  const [ref, visible] = useInView(0.2)
  const [current, setCurrent] = useState(0)
  const spotifyId = extractSpotifyId(musicUrl)

  const getImg = o => resolveUrl(
    o?.profileImageUrl || o?.imageUrl || o?.image_url
    || o?.photoUrl || o?.photo_url
    || o?.fileUrl  || o?.file_url
    || o?.image    || o?.photo    || o?.url || o?.src || null
  )
  const photos = [
    ...partners.map(p => ({ url: getImg(p), label: p.name })).filter(p => p.url),
    ...events.map(e => ({ url: getImg(e), label: e.title || e.name || 'Foto' })).filter(e => e.url),
  ]
  if (typeof window !== 'undefined') {
    console.log('[SoftLovely] partners:', partners)
    console.log('[SoftLovely] events:', events)
    console.log('[SoftLovely] photos resolvidas:', photos)
  }

  useEffect(() => {
    if (photos.length <= 1) return
    const id = setInterval(() => setCurrent(c => (c + 1) % photos.length), 5000)
    return () => clearInterval(id)
  }, [photos.length])

  if (photos.length === 0 && !musicUrl) return null

  const photo = photos[current] || null

  return (
    <div ref={ref} className="snap-section" style={{ background: '#0D0208' }}>
      {photo && (
        <>
          <img key={photo.url} src={photo.url} alt={photo.label}
            className="absolute inset-0 w-full h-full object-cover animate-kenBurns"
            style={{ opacity: 0.5 }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(13,2,8,0.98) 0%, rgba(13,2,8,0.55) 55%, rgba(13,2,8,0.15) 100%)' }} />
        </>
      )}

      <div className="relative z-10 w-full max-w-sm mx-auto px-6 flex flex-col justify-end gap-5 pb-14" style={{ height: '100%' }}>
        {photos.length > 0 && (
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-love-400 text-xs font-bold uppercase tracking-widest mb-2">
              {photo?.label || 'Momentos especiais'}
            </p>
            {photos.length > 1 && (
              <div className="flex gap-1.5">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className="rounded-full transition-all duration-300"
                    style={{ width: i === current ? '20px' : '6px', height: '6px', background: i === current ? '#C9184A' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
            )}
          </div>
        )}

        {spotifyId && (
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="audio-wave">
                {[60, 100, 45, 80, 55].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-love-400 text-xs font-bold uppercase tracking-widest">Nossa Musica</p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <iframe
                src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
                width="100%" height="152" frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {musicUrl && !spotifyId && (
          <div className={`transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '0.15s' }}>
            <div className="rounded-2xl overflow-hidden border border-white/10 p-4"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <audio controls className="w-full">
                <source src={musicUrl} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}

/* ─── Seção Retrospectiva (estilo Spotify Wrapped) ─── */
function SectionRetrospectiva({ time }) {
  const [ref, visible] = useInView(0.3)
  const [slide, setSlide] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [barKey, setBarKey] = useState(0)

  const totalHours   = time ? time.totalDays * 24 + time.hours   : 0
  const totalMinutes = time ? totalHours * 60 + time.minutes      : 0
  const totalSeconds = time ? totalMinutes * 60 + time.seconds    : 0

  const slides = [
    {
      number: time?.totalDays?.toLocaleString('pt-BR') ?? '0',
      unit: time?.totalDays === 1 ? 'dia' : 'dias',
      sub: 'juntos e apaixonados',
      emoji: '🌹',
      bg: 'linear-gradient(160deg, #2d0019 0%, #4A0020 100%)',
    },
    {
      number: totalHours.toLocaleString('pt-BR'),
      unit: 'horas',
      sub: 'ao seu lado',
      emoji: '🌙',
      bg: 'linear-gradient(160deg, #1a0010 0%, #4A0020 100%)',
    },
    {
      number: totalMinutes.toLocaleString('pt-BR'),
      unit: 'minutos',
      sub: 'de amor sem parar',
      emoji: '💕',
      bg: 'linear-gradient(160deg, #0D0208 0%, #2d0019 100%)',
    },
    {
      number: totalSeconds.toLocaleString('pt-BR'),
      unit: 'segundos',
      sub: 'a cada batida do meu coração',
      emoji: '❤️',
      bg: 'linear-gradient(160deg, #4A0020 0%, #C9184A 100%)',
    },
  ]

  const SLIDE_MS = 3800

  /* Reset ao entrar na seção */
  useEffect(() => {
    if (!visible) return
    setSlide(0)
    setAnimKey(k => k + 1)
    setBarKey(k => k + 1)
  }, [visible])

  /* Avançar slide */
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => {
      setSlide(s => (s + 1) % slides.length)
      setAnimKey(k => k + 1)
      setBarKey(k => k + 1)
    }, SLIDE_MS)
    return () => clearTimeout(t)
  }, [slide, visible]) // eslint-disable-line react-hooks/exhaustive-deps

  const cur = slides[slide]

  return (
    <div
      ref={ref}
      className="snap-section px-6"
      style={{ background: cur.bg, transition: 'background 0.9s ease' }}
    >
      {/* Partículas de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['💖','✨','🌹','💋','⭐'].map((e, i) => (
          <span
            key={i}
            className="local-particle"
            style={{
              left: `${10 + i * 18}%`,
              bottom: 0,
              fontSize: `${10 + (i % 3) * 4}px`,
              animationDuration: `${4 + i * 0.8}s`,
              animationDelay: `${i * 0.6}s`,
            }}
          >
            {e}
          </span>
        ))}
      </div>

      {/* Barras de progresso estilo stories */}
      <div className="absolute top-12 left-6 right-6 flex gap-1.5 z-20">
        {slides.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            {i < slide && (
              <div className="h-full w-full" style={{ background: 'rgba(255,255,255,0.75)' }} />
            )}
            {i === slide && (
              <div
                key={`bar-${barKey}`}
                className="h-full rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  animation: `progressBar ${SLIDE_MS}ms linear both`,
                  width: 0,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Conteúdo central */}
      <div className="relative z-10 flex flex-col items-center text-center gap-3 w-full max-w-xs mx-auto">

        {/* Label topo */}
        <p
          className="text-white/40 text-xs font-bold uppercase tracking-widest"
          style={{ animation: 'fadeIn 0.5s ease both' }}
        >
          Uma retrospectiva do nosso amor
        </p>

        {/* Emoji */}
        <div
          key={`emoji-${animKey}`}
          style={{ fontSize: '4rem', animation: 'riseUp 0.7s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {cur.emoji}
        </div>

        {/* Número grande */}
        <p
          key={`num-${animKey}`}
          className="font-black text-white tabular-nums leading-none"
          style={{
            fontSize: 'clamp(2.8rem, 14vw, 5.5rem)',
            animation: 'numberDrop 0.75s cubic-bezier(0.34,1.56,0.64,1) both',
            textShadow: '0 0 60px rgba(255,77,122,0.55)',
          }}
        >
          {cur.number}
        </p>

        {/* Unidade */}
        <div
          key={`label-${animKey}`}
          style={{ animation: 'fadeInUp 0.6s ease both 0.18s' }}
        >
          <p className="text-white/80 text-xl font-bold">{cur.unit}</p>
          <p className="text-white/35 text-sm mt-0.5">{cur.sub}</p>
        </div>

        {/* Separador */}
        <div
          className="h-px my-1"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(201,24,74,0.6), transparent)',
            width: '80%',
            animation: 'lineExpand 0.8s ease both 0.35s',
          }}
        />

        {/* Dots de navegação manual */}
        <div className="flex gap-2 mt-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setSlide(i); setAnimKey(k => k + 1); setBarKey(k => k + 1) }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? '18px' : '6px',
                height: '6px',
                background: i === slide ? 'white' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      <ScrollHint />
    </div>
  )
}

function SectionShare({ couple, partners, time, qr, pageUrl, firstPhoto }) {
  const [ref, visible] = useInView()
  const [copied, setCopied] = useState(false)
  const names = partners.map(p => p.name).filter(Boolean)
  const displayTitle = names.length >= 2 ? `${names[0]} & ${names[1]}` : couple.slug

  function copy() {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: `${displayTitle} — SoftLovely`, text: 'Veja nossa pagina especial! ❤️', url: pageUrl })
    } else copy()
  }

  return (
    <div ref={ref} className="snap-section px-4"
      style={{ background: 'linear-gradient(160deg, #4A0020 0%, #7B0033 50%, #C9184A 100%)' }}>
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center gap-5">
        <p className={`text-white/60 text-xs font-bold uppercase tracking-widest transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          Compartilhe nos Stories
        </p>
        <div className={`stories-card animate-glow transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          style={{ transitionDelay: '0.15s', background: 'linear-gradient(160deg, #0D0208 0%, #4A0020 50%, #7B0033 100%)' }}>
          <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden rounded-2xl">
            {firstPhoto && (
              <>
                <img src={firstPhoto} alt="casal"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.35 }} />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(160deg, rgba(13,2,8,0.75) 0%, rgba(74,0,32,0.65) 50%, rgba(123,0,51,0.6) 100%)' }} />
              </>
            )}
            <div className="text-5xl animate-heartbeat mb-4 relative z-10">❤️</div>
            <p className="font-black text-white text-2xl mb-1 relative z-10">{displayTitle}</p>
            {couple.anniversaryDate && (
              <p className="text-white/40 text-xs mb-6 relative z-10">
                desde {parseLocalDate(couple.anniversaryDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
            {time && (
              <div className="w-full rounded-2xl px-5 py-4 mb-4 relative z-10"
                style={{ background: 'rgba(201,24,74,0.2)', border: '1px solid rgba(201,24,74,0.3)' }}>
                <p className="font-black text-white text-4xl">{time.years}</p>
                <p className="text-white/40 text-xs">anos juntos</p>
                <p className="text-love-300 font-bold text-lg mt-1">{time.totalDays.toLocaleString('pt-BR')}</p>
                <p className="text-white/30 text-xs">dias de amor</p>
              </div>
            )}
            <div className="absolute bottom-6 left-0 right-0 text-center z-10">
              <p className="text-white/20 text-xs font-bold tracking-wider">SoftLovely.com</p>
            </div>
          </div>
        </div>
        <p className={`text-white/40 text-xs text-center transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '0.3s' }}>
          Tire um print do card acima e poste nos Stories ❤️
        </p>
        <div className={`grid grid-cols-2 gap-3 w-full transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '0.4s' }}>
          <button onClick={share}
            className="py-3.5 rounded-xl font-bold text-white text-sm bg-white/15 border border-white/20 hover:bg-white/25 transition">
            📤 Compartilhar
          </button>
          <button onClick={copy}
            className={`py-3.5 rounded-xl font-bold text-sm transition ${copied ? 'bg-green-500 text-white' : 'bg-white text-love-700 hover:bg-love-50'}`}>
            {copied ? '✅ Copiado!' : '🔗 Copiar link'}
          </button>
        </div>
        {qr && (
          <div className={`flex flex-col items-center transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '0.55s' }}>
            <div className="p-2.5 bg-white rounded-2xl shadow-lg shimmer">
              <img src={qr} alt="QR Code" className="w-28 h-28" />
            </div>
            <p className="text-white/20 text-xs mt-2">Escaneie para abrir</p>
          </div>
        )}
        <p className="text-white/15 text-xs font-bold tracking-wider">SoftLovely ❤️</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   PAGINA PRINCIPAL — busca por slug (URL amigavel)
═══════════════════════════════════════════════════ */
export default function SlugPage() {
  const router = useRouter()
  const { slug } = router.query

  const [couple,   setCouple]   = useState(null)
  const [partners, setPartners] = useState([])
  const [events,   setEvents]   = useState([])
  const [time,     setTime]     = useState(null)
  const [qr,       setQr]       = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      try {
        let c
        try {
          const { data } = await axios.get(`${API_BASE}/api/couples/slug/${slug}`)
          c = data
        } catch {
          const { data } = await axios.get(`${API_BASE}/api/couples/${slug}`)
          c = data
        }
        setCouple(c)
        if (c.id) {
          try { const { data } = await axios.get(`${API_BASE}/api/partners/c/${c.id}`); setPartners(data || []) } catch {}
          try { const { data } = await axios.get(`${API_BASE}/api/events/c/${c.id}`);  setEvents(data || []) } catch {}
          try { const { data } = await axios.get(`${API_BASE}/api/couples/${c.id}/qrcode`); setQr(data.qrCode || data) } catch {}
        }
      } catch { setError('Pagina nao encontrada') }
      finally  { setLoading(false) }
    })()
  }, [slug])

  useEffect(() => {
    if (!couple?.anniversaryDate) return
    setTime(calcTime(couple.anniversaryDate))
    const id = setInterval(() => setTime(calcTime(couple.anniversaryDate)), 1000)
    return () => clearInterval(id)
  }, [couple])

  /* URL amigavel: /{slug} em vez de /c/{hash} */
  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : ''

  const names = partners.map(p => p.name).filter(Boolean)
  const coupleName = names.length >= 2 ? `${names[0]} & ${names[1]}` : couple?.slug || ''

  const getImg = o => resolveUrl(
    o?.profileImageUrl || o?.imageUrl || o?.image_url
    || o?.photoUrl || o?.photo_url
    || o?.fileUrl  || o?.file_url
    || o?.image    || o?.photo    || o?.url || o?.src || null
  )
  const firstPhoto = [...partners, ...events].map(getImg).find(Boolean) || null

  const storyEvent = events.find(e => e.category === 'story' || e.title === 'Nossa Historia')

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(150deg, #0D0208, #4A0020)' }}>
      <div className="text-center">
        <div className="text-6xl animate-heartbeat mb-4">❤️</div>
        <p className="text-white/40 text-sm font-semibold tracking-widest uppercase">carregando...</p>
      </div>
    </div>
  )

  if (error || !couple) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(150deg, #0D0208, #4A0020)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">💔</div>
        <h1 className="text-xl font-black text-white mb-2">Pagina nao encontrada</h1>
        <p className="text-white/40 text-sm mb-6">{error}</p>
        <button onClick={() => router.push('/')}
          className="px-6 py-3 bg-white text-love-700 rounded-xl font-bold">
          Voltar ao inicio
        </button>
      </div>
    </div>
  )

  return (
    <div className="snap-container font-sans">
      <SectionOpening couple={couple} partners={partners} time={time} />
      <SectionHeart coupleName={coupleName} />
      {time && <SectionCounter time={time} />}
      {time && <SectionRetrospectiva time={time} />}
      {storyEvent?.description && <SectionStory story={storyEvent.description} />}
      <SectionPhotoMusic partners={partners} events={events} musicUrl={couple.musicUrl} />
      <SectionShare couple={couple} partners={partners} time={time} qr={qr} pageUrl={pageUrl} firstPhoto={firstPhoto} />
    </div>
  )
}
