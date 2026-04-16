import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

const HeartDotsAnimation = dynamic(() => import('../../components/HeartDotsAnimation'), { ssr: false })

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

/* ── helpers ─────────────────────────────────────── */
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

/* ── hook: dispara uma vez ao entrar (animações de entrada) */
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

/* ── hook: rastreia ENTRAR e SAIR (para pausar música, etc.) */
function useVisibility(threshold = 0.4) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, isVisible]
}

/* ── particulas locais ───────────────────────────── */
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

/* ── indicador de scroll ─────────────────────────── */
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
   SECOES DA PAGINA
═══════════════════════════════════════════════════ */

/* SECAO 1 — Abertura com nomes */
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

        <h1
          className={`font-black text-white text-4xl md:text-6xl tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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

/* SECAO 2 — Coração animado com nome do casal */
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

/* SECAO 3 — Contador dramatico */
function SectionCounter({ time }) {
  const [ref, visible] = useInView()

  const units = [
    { key: 'years',   label: 'Anos',    delay: '0s' },
    { key: 'days',    label: 'Dias',    delay: '0.12s' },
    { key: 'hours',   label: 'Horas',   delay: '0.24s' },
    { key: 'minutes', label: 'Minutos', delay: '0.36s' },
    { key: 'seconds', label: 'Segundos',delay: '0.48s' },
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

/* SECAO 4 — Historia */
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
            <span key={i}
              className="inline-block transition-all duration-300"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transitionDelay: `${0.3 + i * 0.04}s`,
              }}>
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

/* ── Foto em formato de coração ─────────────────────── */
function HeartPhoto({ src, alt = '', size = 220 }) {
  const clipId = useRef(`hclip-${Math.random().toString(36).slice(2)}`).current
  const inner = src ? (
    <img
      src={src}
      alt={alt}
      onError={e => { e.currentTarget.style.display = 'none' }}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg,#7B0033,#C9184A)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32,
    }}>❤️</div>
  )

  return (
    <div style={{ position: 'relative', width: size, height: size * 0.92, flexShrink: 0 }}>
      {/* SVG define o clip-path do coração */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.88 C0.08,0.64,0,0.49,0,0.34 C0,0.14,0.13,0.04,0.28,0.04 C0.37,0.04,0.45,0.09,0.5,0.17 C0.55,0.09,0.63,0.04,0.72,0.04 C0.87,0.04,1,0.14,1,0.34 C1,0.49,0.92,0.64,0.5,0.88Z" />
          </clipPath>
        </defs>
      </svg>
      {/* Glow por baixo */}
      <div style={{
        position: 'absolute', inset: 0,
        filter: 'blur(18px)',
        background: 'radial-gradient(ellipse at 50% 60%, rgba(201,24,74,0.7), transparent 70%)',
      }} />
      {/* Imagem com clip */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `url(#${clipId})` }}>
        {inner}
      </div>
      {/* Borda luminosa na forma do coração */}
      <div style={{
        position: 'absolute', inset: -2,
        clipPath: `url(#${clipId})`,
        background: 'linear-gradient(135deg, rgba(255,77,122,0.6), rgba(201,24,74,0.3))',
        zIndex: -1,
      }} />
    </div>
  )
}

/* ── Player de música com preview de 10s ─────────────── */
function SpotifyMiniPlayer({ trackId, fallbackEmbed }) {
  const [info, setInfo]         = useState(null)   // { previewUrl, name, artist, albumArt }
  const [status, setStatus]     = useState('idle') // idle | loading | playing | paused | done | no-preview
  const [progress, setProgress] = useState(0)
  const audioRef  = useRef(null)
  const timerRef  = useRef(null)
  const rafRef    = useRef(null)
  const startRef  = useRef(null)
  const PREVIEW_S = 10

  useEffect(() => {
    if (!trackId) return
    fetch(`/api/spotify-preview?trackId=${trackId}`)
      .then(r => r.json())
      .then(d => {
        if (d.previewUrl) { setInfo(d); setStatus('idle') }
        else               { setInfo(d); setStatus('no-preview') }
      })
      .catch(() => setStatus('no-preview'))
  }, [trackId])

  function play() {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
    setStatus('playing')
    setProgress(0)
    startRef.current = Date.now()

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      audio.pause()
      setStatus('done')
      setProgress(100)
    }, PREVIEW_S * 1000)

    const tick = () => {
      const p = Math.min(((Date.now() - startRef.current) / (PREVIEW_S * 1000)) * 100, 100)
      setProgress(p)
      if (p < 100) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function pause() {
    audioRef.current?.pause()
    clearTimeout(timerRef.current)
    cancelAnimationFrame(rafRef.current)
    setStatus('paused')
  }

  function restart() {
    setProgress(0)
    setStatus('idle')
  }

  useEffect(() => () => {
    audioRef.current?.pause()
    clearTimeout(timerRef.current)
    cancelAnimationFrame(rafRef.current)
  }, [])

  /* ─ sem preview → iframe Spotify ─ */
  if (status === 'no-preview' || (!info && !trackId)) {
    if (!fallbackEmbed) return null
    return (
      <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <iframe
          src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
          width="100%" height="152" frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="w-full rounded-2xl p-4 flex items-center gap-3 border border-white/10"
        style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-2 bg-white/10 rounded animate-pulse w-1/2" />
        </div>
      </div>
    )
  }

  const isPlaying = status === 'playing'
  const isDone    = status === 'done'

  return (
    <div className="w-full rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.06)' }}>
      {info.previewUrl && (
        <audio ref={audioRef} src={info.previewUrl} preload="none" />
      )}

      <div className="p-3 flex items-center gap-3">
        {info.albumArt ? (
          <img src={info.albumArt} alt={info.name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-lg" />
        ) : (
          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg,#7B0033,#C9184A)' }}>🎵</div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate leading-tight">{info.name}</p>
          <p className="text-white/45 text-xs truncate">{info.artist}</p>
        </div>

        {isDone ? (
          <button onClick={restart}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20 text-white/60 hover:text-white transition">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/>
            </svg>
          </button>
        ) : (
          <button onClick={isPlaying ? pause : play}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{ background: isPlaying ? 'rgba(201,24,74,0.9)' : '#C9184A', boxShadow: '0 0 20px rgba(201,24,74,0.5)' }}>
            {isPlaying ? (
              <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                <rect x="5" y="4" width="4" height="16" rx="1"/>
                <rect x="15" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="13" height="13" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Barra de progresso 10s */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full transition-none"
          style={{ width: `${progress}%`, background: 'linear-gradient(to right,#C9184A,#FF4D7A)', transition: isPlaying ? 'none' : 'width 0.3s ease' }} />
      </div>
      <p className="text-white/20 text-center text-xs py-1.5">
        {isDone ? 'prévia encerrada' : isPlaying ? `${PREVIEW_S}s de prévia` : 'toque para ouvir 10s ▶'}
      </p>
    </div>
  )
}

/* SECAO 5 — Foto em coração + Música */
function SectionPhotoMusic({ partners, events, musicUrl, coupleName }) {
  const [ref, visible] = useInView(0.2)
  const [current, setCurrent] = useState(0)
  const spotifyId = extractSpotifyId(musicUrl)

  const resolveUrl = url => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }
  const getImg = o => resolveUrl(
    o?.profileImageUrl || o?.imageUrl || o?.image_url
    || o?.photoUrl || o?.photo_url
    || o?.fileUrl  || o?.file_url
    || o?.image    || o?.photo    || o?.url || o?.src || null
  )
  const photos = [
    ...partners.map(p => ({ url: getImg(p), label: p.name })).filter(p => p.url),
    ...events.map(e  => ({ url: getImg(e), label: e.title || e.name || 'Foto' })).filter(e => e.url),
  ]

  useEffect(() => {
    if (photos.length <= 1) return
    const id = setInterval(() => setCurrent(c => (c + 1) % photos.length), 6000)
    return () => clearInterval(id)
  }, [photos.length])

  if (photos.length === 0 && !musicUrl) return null

  const photo = photos[current] || null

  return (
    <div ref={ref} className="snap-section px-6"
      style={{ background: 'linear-gradient(160deg, #0D0208 0%, #1a0010 50%, #2d0019 100%)' }}>

      {/* Partículas sutis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['✨','💕','🌹'].map((e, i) => (
          <span key={i} className="local-particle"
            style={{ left: `${15 + i * 30}%`, bottom: 0, fontSize: '10px', animationDuration: `${5 + i}s`, animationDelay: `${i * 1.2}s` }}>
            {e}
          </span>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-xs mx-auto flex flex-col items-center gap-5">

        {/* Foto em coração */}
        <div className={`transition-all duration-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}>
          <HeartPhoto src={photo?.url} alt={photo?.label || coupleName} size={210} />
        </div>

        {/* Nome do casal */}
        <div className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '0.25s' }}>
          <p className="font-black text-white text-xl" style={{ textShadow: '0 0 20px rgba(201,24,74,0.5)' }}>
            {coupleName}
          </p>
          {photos.length > 1 && (
            <div className="flex gap-1.5 justify-center mt-2">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === current ? '16px' : '5px', height: '5px', background: i === current ? '#C9184A' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Música */}
        {musicUrl && (
          <div className={`w-full transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="audio-wave">
                {[60, 100, 45, 80, 55].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-love-400 text-xs font-bold uppercase tracking-widest">Nossa Música</p>
            </div>
            {spotifyId ? (
              <SpotifyMiniPlayer trackId={spotifyId} fallbackEmbed />
            ) : (
              <div className="rounded-2xl overflow-hidden border border-white/10 p-4"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <audio controls className="w-full">
                  <source src={musicUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </div>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}

/* ─── Seção Retrospectiva (estilo Spotify Wrapped) ─── */
function SectionRetrospectiva({ time, musicUrl, events }) {
  /* visibilidade bidirecional — para iniciar/pausar música */
  const [visRef, isVisible] = useVisibility(0.4)
  /* inView unidirecional — para animações de entrada (não resetam) */
  const [, enteredOnce] = useInView(0.3)

  const [slide,   setSlide]   = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [barKey,  setBarKey]  = useState(0)

  /* ── música ──────────────────────────────────────── */
  const spotifyId  = extractSpotifyId(musicUrl)
  const [trackInfo,   setTrackInfo]   = useState(null)   // { previewUrl, name, artist, albumArt }
  const [audioState,  setAudioState]  = useState('idle') // idle | playing | blocked | done
  const audioRef = useRef(null)

  /* busca preview URL uma vez */
  useEffect(() => {
    if (!spotifyId) return
    fetch(`/api/spotify-preview?trackId=${spotifyId}`)
      .then(r => r.json())
      .then(d => setTrackInfo(d))
      .catch(() => {})
  }, [spotifyId])

  /* tenta autoplay quando seção entra na tela */
  useEffect(() => {
    const url = trackInfo?.previewUrl
    if (!isVisible || !url) return

    const audio = new Audio(url)
    audio.volume = 0.55
    audioRef.current = audio

    audio.play()
      .then(() => {
        setAudioState('playing')
        const timer = setTimeout(() => {
          audio.pause()
          setAudioState('done')
        }, 10000)
        audio._timer = timer
      })
      .catch(() => {
        /* autoplay bloqueado pelo browser — mostra botão */
        setAudioState('blocked')
      })

    return () => {
      clearTimeout(audio._timer)
      audio.pause()
      audioRef.current = null
      setAudioState('idle')
    }
  }, [isVisible, trackInfo])

  function unlockPlay() {
    const url = trackInfo?.previewUrl
    if (!url) return
    const audio = new Audio(url)
    audio.volume = 0.55
    audioRef.current = audio
    audio.play().then(() => {
      setAudioState('playing')
      const timer = setTimeout(() => { audio.pause(); setAudioState('done') }, 10000)
      audio._timer = timer
    }).catch(() => {})
  }

  /* ── foto do casal (primeiro evento com imagem) ─────── */
  const resolveEvtUrl = url => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }
  const couplePhoto = (events || []).map(e => resolveEvtUrl(e.imageUrl)).find(Boolean) || null

  /* ── slides ──────────────────────────────────────── */
  const totalHours   = time ? time.totalDays * 24 + time.hours   : 0
  const totalMinutes = time ? totalHours * 60 + time.minutes      : 0
  const totalSeconds = time ? totalMinutes * 60 + time.seconds    : 0

  const slides = [
    { type: 'number', number: time?.totalDays?.toLocaleString('pt-BR') ?? '0', unit: time?.totalDays === 1 ? 'dia' : 'dias', sub: 'juntos e apaixonados', emoji: '🌹', bg: 'linear-gradient(160deg,#2d0019,#4A0020)', dur: 3800 },
    { type: 'number', number: totalHours.toLocaleString('pt-BR'),   unit: 'horas',    sub: 'ao seu lado',             emoji: '🌙', bg: 'linear-gradient(160deg,#1a0010,#4A0020)', dur: 3800 },
    { type: 'number', number: totalMinutes.toLocaleString('pt-BR'), unit: 'minutos',  sub: 'de amor sem parar',       emoji: '💕', bg: 'linear-gradient(160deg,#0D0208,#2d0019)', dur: 3800 },
    { type: 'number', number: totalSeconds.toLocaleString('pt-BR'), unit: 'segundos', sub: 'a cada batida do meu coração', emoji: '❤️', bg: 'linear-gradient(160deg,#4A0020,#C9184A)', dur: 3800 },
    { type: 'photo-music', bg: 'linear-gradient(160deg,#0D0208,#1a0010)', dur: 5000 },
  ]

  useEffect(() => {
    if (!enteredOnce) return
    setSlide(0); setAnimKey(k => k + 1); setBarKey(k => k + 1)
  }, [enteredOnce])

  useEffect(() => {
    if (!isVisible) return
    const dur = slides[slide]?.dur ?? 3800
    const t = setTimeout(() => {
      setSlide(s => (s + 1) % slides.length)
      setAnimKey(k => k + 1); setBarKey(k => k + 1)
    }, dur)
    return () => clearTimeout(t)
  }, [slide, isVisible]) // eslint-disable-line react-hooks/exhaustive-deps

  const cur = slides[slide]
  const isPhotoMusicSlide = cur.type === 'photo-music'

  return (
    <div ref={visRef} className="snap-section"
      style={{ background: cur.bg, transition: 'background 0.9s ease', overflow: 'hidden' }}>

      {/* Foto de fundo desfocada no slide especial */}
      {isPhotoMusicSlide && couplePhoto && (
        <div key={`bgphoto-${animKey}`} className="absolute inset-0 pointer-events-none"
          style={{ animation: 'fadeIn 1.2s ease both' }}>
          <img src={couplePhoto} alt="" className="w-full h-full object-cover"
            style={{ opacity: 0.18, filter: 'blur(12px)', transform: 'scale(1.08)' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom,rgba(13,2,8,0.7) 0%,rgba(74,0,32,0.85) 50%,rgba(13,2,8,0.9) 100%)' }} />
        </div>
      )}

      {/* Partículas — notas musicais no slide especial, corações nos outros */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {isPhotoMusicSlide
          ? ['♪','♫','♬','❤️','✨','♪','♫'].map((e, i) => (
              <span key={i} className="local-particle"
                style={{ left: `${8 + i * 13}%`, bottom: 0, fontSize: `${11 + (i % 3) * 4}px`, animationDuration: `${3.5 + i * 0.6}s`, animationDelay: `${i * 0.45}s`, color: 'rgba(255,143,163,0.85)' }}>
                {e}
              </span>
            ))
          : ['💖','✨','🌹','💋','⭐'].map((e, i) => (
              <span key={i} className="local-particle"
                style={{ left: `${10 + i * 18}%`, bottom: 0, fontSize: `${10 + (i % 3) * 4}px`, animationDuration: `${4 + i * 0.8}s`, animationDelay: `${i * 0.6}s` }}>
                {e}
              </span>
            ))
        }
      </div>

      {/* Indicador / botão de música */}
      {spotifyId && trackInfo && !isPhotoMusicSlide && (
        <div className="absolute top-6 right-6 z-20">
          {audioState === 'playing' ? (
            <div className="flex items-center gap-1.5">
              <div className="audio-wave" style={{ height: '16px' }}>
                {[60,100,45,80,55].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
              </div>
              <p className="text-white/40 text-xs max-w-[90px] truncate">{trackInfo.name}</p>
            </div>
          ) : audioState === 'blocked' ? (
            <button onClick={unlockPlay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 transition active:scale-95"
              style={{ background: 'rgba(201,24,74,0.5)', backdropFilter: 'blur(8px)' }}>
              <svg width="10" height="10" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <p className="text-white text-xs font-bold">Tocar música</p>
            </button>
          ) : audioState === 'done' ? (
            <p className="text-white/25 text-xs">🎵 {trackInfo.name}</p>
          ) : null}
        </div>
      )}

      {/* Barras de progresso estilo stories */}
      <div className="absolute top-12 left-6 right-6 flex gap-1.5 z-20">
        {slides.map((s, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            {i < slide && <div className="h-full w-full" style={{ background: 'rgba(255,255,255,0.75)' }} />}
            {i === slide && (
              <div key={`bar-${barKey}`} className="h-full rounded-full"
                style={{ background: 'rgba(255,255,255,0.9)', animation: `progressBar ${s.dur}ms linear both`, width: 0 }} />
            )}
          </div>
        ))}
      </div>

      {/* ── SLIDE ESPECIAL: foto + capa do álbum ── */}
      {isPhotoMusicSlide ? (
        <div key={`photomusic-${animKey}`} className="relative z-10 flex flex-col items-center justify-center gap-5 w-full max-w-xs mx-auto px-6 h-full">

          <p className="text-white/35 text-xs font-bold uppercase tracking-widest"
            style={{ animation: 'fadeInUp 0.6s ease both' }}>
            a trilha sonora do nosso amor
          </p>

          {/* Foto do casal em coração + capa do álbum sobrepostos */}
          <div className="relative flex items-center justify-center"
            style={{ width: 200, height: 200 }}>

            {/* Foto em coração ao fundo */}
            {couplePhoto && (
              <div style={{ position: 'absolute', inset: 0, animation: 'glowIn 1s ease both 0.2s' }}>
                <HeartPhoto src={couplePhoto} size={200} />
              </div>
            )}

            {/* Capa do álbum centralizada com glow */}
            {trackInfo?.albumArt ? (
              <div style={{
                position: 'relative', zIndex: 10,
                animation: 'numberDrop 0.8s cubic-bezier(0.34,1.56,0.64,1) both 0.4s',
              }}>
                {/* Anéis pulsantes em torno da capa */}
                {[1,2,3].map(n => (
                  <div key={n} style={{
                    position: 'absolute',
                    inset: -(n * 10),
                    borderRadius: '50%',
                    border: `1px solid rgba(201,24,74,${0.4 - n * 0.1})`,
                    animation: `softPulse ${1.8 + n * 0.4}s ease-in-out infinite`,
                    animationDelay: `${n * 0.2}s`,
                  }} />
                ))}
                <img src={trackInfo.albumArt} alt={trackInfo.name}
                  style={{
                    width: 90, height: 90,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid rgba(201,24,74,0.8)',
                    boxShadow: '0 0 30px rgba(201,24,74,0.7), 0 0 60px rgba(201,24,74,0.35)',
                    animation: 'spin 12s linear infinite',
                    display: 'block',
                  }} />
                {/* Buraco do vinil */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#0D0208',
                  border: '2px solid rgba(201,24,74,0.5)',
                  zIndex: 2,
                }} />
              </div>
            ) : (
              /* sem capa: só emoji de nota */
              <div style={{ position: 'relative', zIndex: 10, fontSize: '3rem', animation: 'heartGlow 2s ease-in-out infinite' }}>🎵</div>
            )}
          </div>

          {/* Info da música */}
          {trackInfo && (
            <div className="text-center" style={{ animation: 'fadeInUp 0.7s ease both 0.6s' }}>
              <p className="text-white font-black text-base leading-tight"
                style={{ textShadow: '0 0 20px rgba(201,24,74,0.6)' }}>
                {trackInfo.name}
              </p>
              <p className="text-white/45 text-xs mt-1">{trackInfo.artist}</p>
              {/* Onda de áudio decorativa */}
              <div className="flex justify-center mt-3">
                <div className="audio-wave" style={{ height: '20px' }}>
                  {[55,100,40,80,60,90,50].map((h, i) => (
                    <span key={i} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dots navegação */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button key={i}
                onClick={() => { setSlide(i); setAnimKey(k => k + 1); setBarKey(k => k + 1) }}
                className="rounded-full transition-all duration-300"
                style={{ width: i === slide ? '18px' : '6px', height: '6px', background: i === slide ? 'white' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
        </div>

      ) : (
        /* ── SLIDES DE NÚMERO ── */
        <div className="relative z-10 flex flex-col items-center text-center gap-3 w-full max-w-xs mx-auto px-6">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest"
            style={{ animation: 'fadeIn 0.5s ease both' }}>
            Uma retrospectiva do nosso amor
          </p>

          <div key={`emoji-${animKey}`}
            style={{ fontSize: '4rem', animation: 'riseUp 0.7s cubic-bezier(0.22,1,0.36,1) both' }}>
            {cur.emoji}
          </div>

          <p key={`num-${animKey}`} className="font-black text-white tabular-nums leading-none"
            style={{ fontSize: 'clamp(2.8rem,14vw,5.5rem)', animation: 'numberDrop 0.75s cubic-bezier(0.34,1.56,0.64,1) both', textShadow: '0 0 60px rgba(255,77,122,0.55)' }}>
            {cur.number}
          </p>

          <div key={`label-${animKey}`} style={{ animation: 'fadeInUp 0.6s ease both 0.18s' }}>
            <p className="text-white/80 text-xl font-bold">{cur.unit}</p>
            <p className="text-white/35 text-sm mt-0.5">{cur.sub}</p>
          </div>

          <div className="h-px my-1"
            style={{ background: 'linear-gradient(to right,transparent,rgba(201,24,74,0.6),transparent)', width: '80%', animation: 'lineExpand 0.8s ease both 0.35s' }} />

          <div className="flex gap-2 mt-1">
            {slides.map((_, i) => (
              <button key={i}
                onClick={() => { setSlide(i); setAnimKey(k => k + 1); setBarKey(k => k + 1) }}
                className="rounded-full transition-all duration-300"
                style={{ width: i === slide ? '18px' : '6px', height: '6px', background: i === slide ? 'white' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
        </div>
      )}

      <ScrollHint />
    </div>
  )
}

/* ── Seção foto do casal ──────────────────────────── */
function SectionCouplePhoto({ events, coupleName, couple }) {
  const [ref, visible] = useInView(0.25)
  const [pulse, setPulse] = useState(false)

  const resolveUrl = url => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  const allPhotos = events.map(e => resolveUrl(e.imageUrl)).filter(Boolean)
  const [current, setCurrent] = useState(0)

  /* troca automática entre fotos */
  useEffect(() => {
    if (allPhotos.length <= 1) return
    const id = setInterval(() => setCurrent(c => (c + 1) % allPhotos.length), 5000)
    return () => clearInterval(id)
  }, [allPhotos.length])

  /* ativa pulsação suave 1.2s após a foto aparecer */
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setPulse(true), 1200)
    return () => clearTimeout(t)
  }, [visible])

  const activePhoto = allPhotos[current] || null

  /* corações que sobem da foto */
  const floatingHearts = [
    { emoji: '❤️',  left: '20%', delay: '0s',    dur: '3.2s', size: '12px' },
    { emoji: '💕',  left: '50%', delay: '0.7s',  dur: '2.8s', size: '10px' },
    { emoji: '🌸',  left: '75%', delay: '1.4s',  dur: '3.5s', size: '11px' },
    { emoji: '✨',  left: '35%', delay: '2.1s',  dur: '3s',   size: '9px'  },
    { emoji: '💖',  left: '62%', delay: '0.4s',  dur: '4s',   size: '13px' },
    { emoji: '🌹',  left: '85%', delay: '1.8s',  dur: '3.3s', size: '10px' },
    { emoji: '💗',  left: '10%', delay: '2.6s',  dur: '2.9s', size: '11px' },
  ]

  return (
    <div ref={ref} className="snap-section px-6"
      style={{ background: 'linear-gradient(160deg,#0D0208 0%,#1a0010 50%,#2d0019 100%)' }}>

      {/* Partículas de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingHearts.map((h, i) => (
          <span key={i} className="local-particle"
            style={{ left: h.left, bottom: 0, fontSize: h.size, animationDuration: h.dur, animationDelay: h.delay }}>
            {h.emoji}
          </span>
        ))}
      </div>

      {/* Brilho de fundo difuso */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 55%, rgba(201,24,74,0.12), transparent)' }} />

      <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-xs mx-auto">

        {/* Label animado */}
        <div className={`flex items-center gap-2 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="h-px w-8" style={{ background: 'linear-gradient(to right,transparent,rgba(201,24,74,0.6))' }} />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">nossa foto</p>
          <div className="h-px w-8" style={{ background: 'linear-gradient(to left,transparent,rgba(201,24,74,0.6))' }} />
        </div>

        {/* Container da foto */}
        <div style={{ position: 'relative', width: 'min(74vw, 280px)', aspectRatio: '4/5' }}>

          {/* Anel giratório (decorativo) */}
          {visible && (
            <div className="absolute pointer-events-none"
              style={{
                inset: '-8px',
                borderRadius: '32px',
                background: 'conic-gradient(from 0deg, rgba(201,24,74,0.6), rgba(255,77,122,0.3), transparent, rgba(201,24,74,0.6))',
                animation: 'spin 8s linear infinite',
                opacity: 0.5,
              }} />
          )}

          {/* Card polaroid */}
          <div
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '24px',
              background: 'linear-gradient(160deg,#1a0010,#0D0208)',
              border: '2px solid rgba(201,24,74,0.4)',
              boxShadow: pulse
                ? '0 0 60px rgba(201,24,74,0.5), 0 20px 60px rgba(0,0,0,0.7), inset 0 0 20px rgba(201,24,74,0.08)'
                : '0 0 30px rgba(201,24,74,0.25), 0 20px 40px rgba(0,0,0,0.6)',
              opacity: visible ? 1 : 0,
              animation: visible ? 'photoReveal 1.1s cubic-bezier(0.34,1.56,0.64,1) both 0.1s' : 'none',
              transition: 'box-shadow 1s ease',
              overflow: 'hidden',
            }}
          >
            {activePhoto ? (
              <>
                <img
                  key={activePhoto}
                  src={activePhoto}
                  alt={coupleName}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '85%',
                    objectFit: 'cover',
                    animation: pulse ? 'kenBurns 12s ease-in-out infinite alternate' : 'none',
                  }}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
                {/* Overlay gradiente base */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                  background: 'linear-gradient(to top,rgba(13,2,8,0.95) 0%,rgba(13,2,8,0.6) 50%,transparent 100%)',
                }} />
                {/* Label polaroid na base */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '12px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                }}>
                  <p style={{
                    color: 'white', fontWeight: 900, fontSize: '1rem', lineHeight: 1.2,
                    textShadow: '0 0 20px rgba(201,24,74,0.7)',
                    animation: pulse ? 'fadeInUp 0.8s ease both' : 'none',
                    textAlign: 'center',
                  }}>{coupleName}</p>
                  {couple.anniversaryDate && (
                    <p style={{
                      color: 'rgba(255,143,163,0.7)', fontSize: '0.65rem', fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      animation: pulse ? 'fadeInUp 0.8s ease both 0.15s' : 'none',
                    }}>
                      {parseLocalDate(couple.anniversaryDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                {/* Shimmer ao aparecer */}
                {visible && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmerOnce 1.2s ease 0.5s both',
                    pointerEvents: 'none',
                  }} />
                )}
              </>
            ) : (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
              }}>
                <span style={{ fontSize: '3rem', animation: 'heartbeat 2s ease-in-out infinite' }}>📷</span>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textAlign: 'center', padding: '0 16px' }}>
                  Adicione uma foto especial de vocês
                </p>
              </div>
            )}
          </div>

          {/* Sparkles nos cantos quando visível */}
          {visible && activePhoto && (
            <>
              {[
                { top: '-6px', left: '-6px', delay: '0.8s' },
                { top: '-6px', right: '-6px', delay: '1.1s' },
                { bottom: '-6px', left: '-6px', delay: '1.4s' },
                { bottom: '-6px', right: '-6px', delay: '1.7s' },
              ].map((pos, i) => (
                <span key={i} style={{
                  position: 'absolute', ...pos,
                  fontSize: '14px', pointerEvents: 'none',
                  animation: `softPulse 2s ease-in-out infinite`,
                  animationDelay: pos.delay,
                }}>✨</span>
              ))}
            </>
          )}
        </div>

        {/* Dots navegação */}
        {allPhotos.length > 1 && (
          <div className="flex gap-1.5">
            {allPhotos.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: i === current ? '16px' : '5px', height: '5px', background: i === current ? '#C9184A' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
        )}

        {/* Frase romântica */}
        <div className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '0.7s' }}>
          <p className="text-white/25 text-xs italic">
            "cada foto conta a nossa história"
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {['❤️','❤️','❤️'].map((h, i) => (
              <span key={i} style={{ fontSize: '10px', animation: `heartbeat 1.8s ease-in-out infinite`, animationDelay: `${i * 0.25}s` }}>{h}</span>
            ))}
          </div>
        </div>
      </div>

      <ScrollHint />
    </div>
  )
}

/* SECAO 6 — Compartilhar com card Stories completo */
function SectionShare({ couple, partners, time, qr, pageUrl, firstPhoto }) {
  const [ref, visible] = useInView()
  const [copied, setCopied] = useState(false)

  const names = partners.map(p => p.name).filter(Boolean)
  const displayTitle = names.length >= 2 ? `${names[0]} & ${names[1]}` : couple.slug

  const totalHours   = time ? time.totalDays * 24 + time.hours   : 0
  const totalMinutes = time ? totalHours * 60 + time.minutes      : 0
  const totalSeconds = time ? totalMinutes * 60 + time.seconds    : 0

  function copy() {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: `${displayTitle} — SoftLovely`, text: 'Veja nossa página especial! ❤️', url: pageUrl })
    } else copy()
  }

  return (
    <div ref={ref} className="snap-section px-4 overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #1a0010 0%, #4A0020 60%, #7B0033 100%)' }}>

      {/* Partículas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['❤️','✨','🌹','💖','💋'].map((e, i) => (
          <span key={i} className="local-particle"
            style={{ left: `${8 + i * 20}%`, bottom: 0, fontSize: `${9 + (i % 3) * 3}px`, animationDuration: `${5 + i * 0.7}s`, animationDelay: `${i * 0.5}s` }}>
            {e}
          </span>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-8">

        <p className={`text-white/50 text-xs font-bold uppercase tracking-widest transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          Compartilhe nos Stories
        </p>

        {/* ── Card Stories 9:16 com TUDO ── */}
        <div
          className={`stories-card animate-glow transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          style={{ transitionDelay: '0.15s' }}
        >
          {/* Fundo com foto */}
          <div className="absolute inset-0 rounded-[24px] overflow-hidden"
            style={{ background: 'linear-gradient(160deg,#0D0208,#4A0020)' }}>
            {firstPhoto && (
              <>
                <img src={firstPhoto} alt="casal"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.22 }} />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(13,2,8,0.55) 0%, rgba(74,0,32,0.80) 55%, rgba(13,2,8,0.95) 100%)' }} />
              </>
            )}
          </div>

          {/* Conteúdo interno */}
          <div className="relative z-10 h-full flex flex-col px-5 py-6">

            {/* Topo — branding */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-base">❤️</span>
                <span className="text-white/50 text-xs font-black tracking-widest uppercase">SoftLovely</span>
              </div>
              {couple.anniversaryDate && (
                <span className="text-white/30 text-xs">
                  {parseLocalDate(couple.anniversaryDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Linha separadora */}
            <div className="h-px mb-4" style={{ background: 'linear-gradient(to right,transparent,rgba(201,24,74,0.5),transparent)' }} />

            {/* Foto em coração + nome */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <HeartPhoto src={firstPhoto} alt={displayTitle} size={110} />
              <p className="font-black text-white text-lg text-center leading-tight"
                style={{ textShadow: '0 0 20px rgba(201,24,74,0.5)' }}>
                {displayTitle}
              </p>
            </div>

            {/* Bloco principal de stats */}
            {time && (
              <div className="rounded-2xl p-3 mb-3"
                style={{ background: 'rgba(201,24,74,0.14)', border: '1px solid rgba(201,24,74,0.28)' }}>
                {/* Dias em destaque */}
                <div className="text-center mb-2">
                  <p className="font-black text-white leading-none"
                    style={{ fontSize: '2.2rem', textShadow: '0 0 30px rgba(255,77,122,0.6)' }}>
                    {time.totalDays.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-love-300 text-xs font-bold uppercase tracking-wider">
                    {time.totalDays === 1 ? 'dia juntos' : 'dias juntos'}
                  </p>
                </div>

                {/* Grid horas / minutos / segundos */}
                <div className="grid grid-cols-3 gap-1.5 pt-2"
                  style={{ borderTop: '1px solid rgba(201,24,74,0.2)' }}>
                  {[
                    { val: totalHours.toLocaleString('pt-BR'),   label: 'horas'    },
                    { val: totalMinutes.toLocaleString('pt-BR'), label: 'minutos'  },
                    { val: totalSeconds.toLocaleString('pt-BR'), label: 'segundos' },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <p className="font-black text-white text-sm tabular-nums leading-tight">{val}</p>
                      <p className="text-white/30 text-xs">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linha de separação */}
            <div className="h-px mb-3" style={{ background: 'linear-gradient(to right,transparent,rgba(255,255,255,0.1),transparent)' }} />

            {/* Rodapé — QR + URL */}
            <div className="flex items-center justify-between mt-auto">
              {qr ? (
                <div className="bg-white rounded-xl p-1 shadow-lg">
                  <img src={qr} alt="QR" className="w-12 h-12" />
                </div>
              ) : <div />}
              <div className="text-right">
                <p className="text-white/20 text-xs font-black tracking-wider">SoftLovely.com</p>
                <p className="text-white/15 text-xs mt-0.5">escaneie para abrir ❤️</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instrução */}
        <p className={`text-white/35 text-xs text-center transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '0.35s' }}>
          Tire um print do card acima e poste nos Stories ❤️
        </p>

        {/* Botões */}
        <div className={`grid grid-cols-2 gap-3 w-full transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '0.45s' }}>
          <button onClick={share}
            className="py-3.5 rounded-xl font-bold text-white text-sm border border-white/20 transition active:scale-95"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            📤 Compartilhar
          </button>
          <button onClick={copy}
            className={`py-3.5 rounded-xl font-bold text-sm transition active:scale-95 ${copied ? 'bg-green-500 text-white' : 'bg-white text-love-700'}`}>
            {copied ? '✅ Copiado!' : '🔗 Copiar link'}
          </button>
        </div>

        <p className="text-white/15 text-xs font-bold tracking-wider pb-2">SoftLovely ❤️</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   PAGINA PRINCIPAL
═══════════════════════════════════════════════════ */
export default function CouplePage() {
  const router = useRouter()
  const { hash } = router.query

  const [couple,   setCouple]   = useState(null)
  const [partners, setPartners] = useState([])
  const [events,   setEvents]   = useState([])
  const [time,     setTime]     = useState(null)
  const [qr,       setQr]       = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!hash) return
    ;(async () => {
      try {
        const { data: c } = await axios.get(`${API_BASE}/api/couples/hash/${hash}`)
        setCouple(c)
        if (c.id) {
          try { const { data } = await axios.get(`${API_BASE}/api/partners/c/${c.id}`); setPartners(data || []) } catch {}
          try { const { data } = await axios.get(`${API_BASE}/api/events/c/${c.id}`);  setEvents(data || []) } catch {}
          try { const { data } = await axios.get(`${API_BASE}/api/couples/${c.id}/qrcode`); setQr(data.qrCode || data) } catch {}
        }
      } catch { setError('Pagina nao encontrada') }
      finally  { setLoading(false) }
    })()
  }, [hash])

  useEffect(() => {
    if (!couple?.anniversaryDate) return
    setTime(calcTime(couple.anniversaryDate))
    const id = setInterval(() => setTime(calcTime(couple.anniversaryDate)), 1000)
    return () => clearInterval(id)
  }, [couple])

  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${hash}` : ''

  const names = partners.map(p => p.name).filter(Boolean)
  const coupleName = names.length >= 2 ? `${names[0]} & ${names[1]}` : couple?.slug || ''

  const resolveUrl = url => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }
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

      {/* SECAO 1: Abertura */}
      <SectionOpening couple={couple} partners={partners} time={time} />

      {/* SECAO 2: Coração animado */}
      <SectionHeart coupleName={coupleName} />

      {/* SECAO 3: Contador */}
      {time && <SectionCounter time={time} />}

      {/* SECAO 3b: Retrospectiva + música tocando */}
      {time && <SectionRetrospectiva time={time} musicUrl={couple.musicUrl} events={events} />}

      {/* SECAO 4: Foto do casal com animação */}
      <SectionCouplePhoto events={events} coupleName={coupleName} couple={couple} />

      {/* SECAO 4b: Historia */}
      {storyEvent?.description && <SectionStory story={storyEvent.description} />}

      {/* SECAO 5: Foto em coração + Música */}
      <SectionPhotoMusic partners={partners} events={events} musicUrl={couple.musicUrl} coupleName={coupleName} />

      {/* SECAO 6: Compartilhar */}
      <SectionShare
        couple={couple}
        partners={partners}
        time={time}
        qr={qr}
        pageUrl={pageUrl}
        firstPhoto={firstPhoto}
      />

    </div>
  )
}
