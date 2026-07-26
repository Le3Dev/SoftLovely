import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

/* ── helpers ─────────────────────────────────────── */
function hexToRgb(hex) {
  if (!hex) return '201,24,74'
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r},${g},${b}`
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
function SectionOpening({ couple, partners, time, coverPhoto }) {
  const [ref, visible] = useInView()
  const [parallaxY, setParallaxY] = useState(0)
  const names = partners.map(p => p.name).filter(Boolean)
  const title = names.length >= 2 ? `${names[0]} & ${names[1]}` : couple.slug

  useEffect(() => {
    const container = document.querySelector('.snap-container')
    if (!container || !coverPhoto) return
    const onScroll = () => setParallaxY(container.scrollTop * 0.38)
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [coverPhoto])

  return (
    <div ref={ref} className="snap-section text-center px-6"
      style={{ background: 'linear-gradient(160deg, #0D0208 0%, #1a0010 50%, #2d0019 100%)' }}>

      {/* Foto de capa com parallax */}
      {coverPhoto && (
        <>
          <img src={coverPhoto} alt="capa"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ transform: `translateY(${parallaxY}px) scale(1.15)`, opacity: 0.35, transition: 'opacity 1s ease' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(13,2,8,0.5) 0%, rgba(13,2,8,0.3) 40%, rgba(13,2,8,0.7) 100%)' }} />
        </>
      )}

      <div className="section-content relative z-10 flex flex-col items-center gap-6 w-full max-w-xs mx-auto">
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

        <div className={`h-px transition-all duration-700 ${visible ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}
          style={{ transitionDelay: '0.7s', background: 'linear-gradient(to right, transparent, var(--tc, #C9184A), transparent)' }} />

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

/* SECAO 2 — Coração de partículas */
function SectionHeart({ coupleName }) {
  const [ref, visible] = useInView(0.3)
  const canvasRef      = useRef(null)
  const animRef        = useRef(null)
  const startedRef     = useRef(false)
  const [nameVisible,  setNameVisible]  = useState(false)
  const [pulseRings,   setPulseRings]   = useState(false)

  useEffect(() => {
    if (!visible || startedRef.current) return
    startedRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const W   = canvas.offsetWidth
    const H   = canvas.offsetHeight
    canvas.width  = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    /* Lê a cor do tema */
    const container = canvas.closest('.snap-container')
    const cs  = container ? getComputedStyle(container) : null
    const rgb = (cs?.getPropertyValue('--tc-rgb') || '201,24,74').trim()
    const [cr, cg, cb] = rgb.split(',').map(Number)

    const cx    = W / 2
    const cy    = H * 0.42
    const scale = Math.min(W, H) * 0.023

    /* Posições alvo no coração (fórmula paramétrica) */
    function heartPos(t, r = 1) {
      const x = r * 16 * Math.pow(Math.sin(t), 3)
      const y = r * -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
      return { x: cx + x * scale, y: cy + y * scale }
    }

    const OUTLINE = 220
    const outlineTargets = Array.from({ length: OUTLINE }, (_, i) => heartPos((i / OUTLINE) * Math.PI * 2))

    /* Cria partícula */
    const mkParticle = (target, idx) => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      tx: target.x,
      ty: target.y,
      size:  Math.random() * 1.4 + 0.8,
      speed: 0.038 + Math.random() * 0.044,
      delay: Math.floor(Math.random() * 40),
      alpha: 0,
      settled: false,
      idx,
    })

    const particles = outlineTargets.map((t, i) => mkParticle(t, i))

    let frame = 0

    function draw() {
      /* Rastro suave */
      ctx.fillStyle = 'rgba(13,2,8,0.2)'
      ctx.fillRect(0, 0, W, H)
      frame++

      let settled = 0

      particles.forEach((p, i) => {
        if (frame < p.delay) return

        const dx   = p.tx - p.x
        const dy   = p.ty - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 0.8) {
          p.x += dx * p.speed
          p.y += dy * p.speed
        } else {
          p.x = p.tx; p.y = p.ty; p.settled = true
        }
        if (p.settled) settled++

        p.alpha = Math.min(1, p.alpha + 0.045)

        /* Respiração após estabilizar */
        const breathe = p.settled
          ? 0.82 + Math.sin(frame * 0.016 + i * 0.22) * 0.18
          : 1 + Math.sin(frame * 0.08 + i) * 0.1 /* tremula enquanto voa */

        const sz = p.size  * breathe
        const a  = p.alpha * breathe

        /* Halo externo */
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 6)
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.55})`)
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
        ctx.beginPath(); ctx.arc(p.x, p.y, sz * 6, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()

        /* Núcleo brilhante */
        ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${Math.min(255, cr + 70)},${Math.min(255, cg + 55)},${Math.min(255, cb + 80)},${a})`
        ctx.fill()
      })

      /* Linhas de constelação entre partículas próximas do contorno */
      if (settled > OUTLINE * 0.65) {
        const ol = particles.filter(p => p.settled)
        for (let i = 0; i < ol.length - 1; i += 2) {
          const a2 = ol[i], b2 = ol[i + 1]
          const d  = Math.hypot(a2.x - b2.x, a2.y - b2.y)
          if (d < 28) {
            ctx.beginPath(); ctx.moveTo(a2.x, a2.y); ctx.lineTo(b2.x, b2.y)
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.15 * (1 - d / 28)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }

      /* Sparkles aleatórios sobre o contorno estabilizado */
      if (settled > OUTLINE * 0.8 && frame % 4 === 0) {
        const sp = particles[Math.floor(Math.random() * particles.length)]
        if (sp.settled) {
          ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.size * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,0.7)`; ctx.fill()
        }
      }

      if (settled >= particles.length * 0.88 && !nameVisible) {
        setNameVisible(true)
        setTimeout(() => setPulseRings(true), 400)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className="snap-section" style={{ background: '#0D0208' }}>

      <canvas ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Anéis de pulso após o coração se formar */}
      {pulseRings && [0, 1, 2].map(i => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: 220, height: 220,
            top: '42%', left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid rgba(var(--tc-rgb,201,24,74),0.4)',
            animation: `ringExpand 4s ease-out infinite ${i * 1.35}s`,
          }} />
      ))}

      {/* Nome do casal — centralizado horizontalmente, posicionado abaixo do coração */}
      <div style={{
        position: 'absolute',
        top: '68%',
        left: 0, right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <p className="font-black text-white text-2xl tracking-tight"
          style={{
            opacity: nameVisible ? 1 : 0,
            transform: nameVisible ? 'translateY(0)' : 'translateY(18px)',
            transition: 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.34,1.56,0.64,1)',
            textShadow: '0 0 30px rgba(var(--tc-rgb,201,24,74),0.7)',
            textAlign: 'center',
          }}>
          {coupleName}
        </p>
        <p style={{
          color: 'rgba(255,255,255,0.28)',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: nameVisible ? 1 : 0,
          transition: 'opacity 0.9s ease 0.4s',
          textAlign: 'center',
        }}>
          para sempre ❤
        </p>
      </div>

      <ScrollHint />
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

      <div className="section-content relative z-10 w-full max-w-sm mx-auto">
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

      <div className="section-content relative z-10 max-w-sm mx-auto w-full">
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

/* ── Player Spotify — embed direto ──────────────────── */
function SpotifyPlayer({ trackId }) {
  const [loaded, setLoaded] = useState(false)

  if (!trackId) return null

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      style={{ background: 'rgba(0,0,0,0.3)', animation: 'fadeInScale 0.4s ease both' }}>

      {/* Skeleton enquanto iframe carrega */}
      {!loaded && (
        <div className="w-full flex items-center gap-3 p-3"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-14 h-14 rounded-xl bg-white/10 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
            <div className="h-2 bg-white/10 rounded animate-pulse w-1/2" />
          </div>
          <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
        </div>
      )}

      {/* Embed Spotify — altura 152px mostra capa + barra de progresso + botão play */}
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? 'block' : 'none', borderRadius: '0.75rem' }}
      />
    </div>
  )
}

/* SECAO 5 — Now Playing */
function SectionPhotoMusic({ musicUrl }) {
  const [ref, visible] = useInView(0.2)
  const [track, setTrack] = useState(null)
  const spotifyId = extractSpotifyId(musicUrl)

  useEffect(() => {
    if (!spotifyId) return
    fetch(`/api/spotify-track?id=${spotifyId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setTrack(d) })
      .catch(() => {})
  }, [spotifyId])

  if (!musicUrl) return null

  return (
    <div ref={ref} className="snap-section overflow-hidden" style={{ background: '#080808' }}>

      {/* Capa desfocada como fundo atmosférico */}
      {track?.albumArt && (
        <img src={track.albumArt} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(50px) brightness(0.18) saturate(0.5)', transform: 'scale(1.25)' }} />
      )}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(5,5,5,0.5) 0%, rgba(0,0,0,0.85) 100%)' }} />

      <div className="section-content relative z-10 flex flex-col items-center gap-6 w-full max-w-xs mx-auto px-5">

        {/* Label */}
        <div className={`flex items-center gap-2 w-full transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right,transparent,var(--tc,#C9184A))' }} />
          <div className="audio-wave" style={{ height: 14 }}>
            {[60,100,45,80,55].map((h,i) => <span key={i} style={{ height: `${h}%` }} />)}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--tc,#FF4D7A)' }}>Nossa Música</p>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left,transparent,var(--tc,#C9184A))' }} />
        </div>

        {/* Disco de vinil + capa */}
        <div className={`relative transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
          style={{ transitionDelay: '0.1s' }}>

          {/* Glow pulsante */}
          <div style={{
            position: 'absolute', inset: -16, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(var(--tc-rgb,201,24,74),0.45) 0%, transparent 70%)`,
            filter: 'blur(16px)',
            animation: 'softPulse 2.5s ease-in-out infinite',
          }} />

          {/* Vinil por baixo, girando */}
          <div style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #1a1a1a, #2e2e2e, #1a1a1a, #111, #1a1a1a)',
            animation: 'spin 6s linear infinite',
            boxShadow: '0 0 0 2px rgba(255,255,255,0.05)',
          }}>
            {[15,25,35,45,55,65].map(r => (
              <div key={r} style={{ position:'absolute', inset:`${r}%`, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)' }} />
            ))}
          </div>

          {/* Capa do álbum (quadrada + borda circular no vinil) */}
          {track?.albumArt ? (
            <img src={track.albumArt} alt={track.name}
              style={{ width: 190, height: 190, borderRadius: '50%', objectFit: 'cover', display: 'block', position: 'relative',
                boxShadow: '0 0 0 6px rgba(255,255,255,0.07), 0 24px 70px rgba(0,0,0,0.9)' }} />
          ) : (
            <div style={{ width: 190, height: 190, borderRadius: '50%', background: `linear-gradient(135deg,#111,var(--tc,#C9184A))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative',
              boxShadow: '0 24px 70px rgba(0,0,0,0.9)' }}>🎵</div>
          )}

          {/* Furo central */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 18, height: 18, borderRadius: '50%',
            background: '#080808', border: '2px solid rgba(255,255,255,0.12)',
          }} />
        </div>

        {/* Info da música */}
        <div className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '0.3s' }}>
          {track ? (
            <>
              <p className="font-black text-white text-xl leading-tight">{track.name}</p>
              <p className="text-white/40 text-sm mt-1 font-medium">{track.artist}</p>
            </>
          ) : (
            <p className="text-white/25 text-sm">carregando...</p>
          )}
        </div>

        {/* Player Spotify — compacto */}
        {spotifyId && (
          <div className={`w-full transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '0.45s' }}>
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
              <iframe
                src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
                width="100%" height="80" frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy" style={{ display: 'block' }}
              />
            </div>
          </div>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}

/* ── Ornamento decorativo (substitui emoji nos slides de número) ── */
function SlideOrnament({ variant = 0 }) {
  /* Elemento central muda por slide */
  const centers = [
    /* 0 — Coração (dias) */
    <svg key="heart" width="34" height="31" viewBox="0 0 34 31" fill="none">
      <path d="M17 29 C6.5 23, 2 17, 2 11 C2 6.5, 5.5 3, 10 3 C12.8 3, 15.2 4.5, 17 7.2 C18.8 4.5, 21.2 3, 24 3 C28.5 3, 32 6.5, 32 11 C32 17, 27.5 23, 17 29Z"
        fill="rgba(201,24,74,0.18)" stroke="rgba(255,77,122,0.75)" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 9 C10 9, 13 7, 16 9" stroke="rgba(255,200,210,0.4)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>,

    /* 1 — Lua crescente (horas) */
    <svg key="moon" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M20 7 C14 7, 8 11, 8 17 C8 23, 14 28, 20 28 C17 25, 15 22, 15 17 C15 12, 17 9, 20 7Z"
        fill="rgba(255,143,163,0.2)" stroke="rgba(255,77,122,0.75)" strokeWidth="1.3" />
      <circle cx="22" cy="9"  r="1.4" fill="rgba(255,200,210,0.65)" />
      <circle cx="25" cy="15" r="0.9" fill="rgba(255,200,210,0.45)" />
      <circle cx="23" cy="21" r="1.1" fill="rgba(255,200,210,0.55)" />
    </svg>,

    /* 2 — Infinito (minutos) */
    <svg key="inf" width="44" height="22" viewBox="0 0 44 22" fill="none">
      <path d="M22 11 C22 6, 18 3, 13 3 C8 3, 4 6.5, 4 11 C4 15.5, 8 19, 13 19 C18 19, 22 16, 22 11 C22 6, 26 3, 31 3 C36 3, 40 6.5, 40 11 C40 15.5, 36 19, 31 19 C26 19, 22 16, 22 11Z"
        fill="rgba(201,24,74,0.15)" stroke="rgba(255,77,122,0.78)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>,

    /* 3 — Pulso cardíaco (segundos) */
    <svg key="pulse" width="48" height="22" viewBox="0 0 48 22" fill="none">
      <polyline points="2,11 10,11 13,3 17,19 21,11 25,11 28,6 31,16 35,11 46,11"
        stroke="rgba(255,77,122,0.88)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
  ]

  const outerStroke  = ['rgba(201,24,74,0.3)', 'rgba(160,50,110,0.3)', 'rgba(201,24,74,0.25)', 'rgba(255,50,80,0.38)']
  const outerDash    = ['4 3.5',               '3 4',                  '5 3',                  '2 2']
  const outerSpeed   = ['20s',                 '16s',                  '24s',                  '9s']
  const outerDir     = ['normal',              'reverse',              'normal',               'normal']
  const innerSpeed   = ['13s',                 '20s',                  '10s',                  '7s']
  const innerDir     = ['reverse',             'normal',               'reverse',              'reverse']
  const centerAnim   = ['heartGlow 2.5s ease-in-out infinite', 'heartGlow 3s ease-in-out infinite',
                        'softPulse 2s ease-in-out infinite',   'softPulse 0.75s ease-in-out infinite']

  return (
    <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
      {/* Anel externo */}
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ position: 'absolute', inset: 0, animation: `spin ${outerSpeed[variant]} linear infinite ${outerDir[variant]}` }}>
        <circle cx="44" cy="44" r="41" stroke={outerStroke[variant]} strokeWidth="0.8" strokeDasharray={outerDash[variant]} fill="none" />
        {[0, 90, 180, 270].map(deg => (
          <polygon key={deg} points="44,1.5 46,4.5 44,7.5 42,4.5"
            fill={outerStroke[variant].replace(/[\d.]+\)$/, '0.6)')}
            transform={`rotate(${deg}, 44, 44)`}
          />
        ))}
      </svg>

      {/* Anel intermediário */}
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ position: 'absolute', inset: 0, animation: `spin ${innerSpeed[variant]} linear infinite ${innerDir[variant]}` }}>
        <circle cx="44" cy="44" r="31" stroke="rgba(255,77,122,0.18)" strokeWidth="0.7" strokeDasharray="2 5" fill="none" />
        {[45, 135, 225, 315].map(deg => (
          <circle key={deg} cx="44" cy="13" r="2" fill="rgba(255,143,163,0.45)" transform={`rotate(${deg}, 44, 44)`} />
        ))}
      </svg>

      {/* Anel interno fixo */}
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="44" cy="44" r="20" stroke="rgba(201,24,74,0.15)" strokeWidth="0.6" fill="none" />
      </svg>

      {/* Elemento central */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: centerAnim[variant] }}>
        {centers[variant]}
      </div>
    </div>
  )
}

/* ── Ambiente visual animado por trás do conteúdo ───── */
function SlideBackground({ variant }) {
  const v = variant % 4
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>

      {v === 0 && (
        /* Anéis cósmicos expandindo do centro */
        <div className="absolute inset-0 flex items-center justify-center">
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%',
              width: `${18 + i * 19}vw`, height: `${18 + i * 19}vw`,
              border: '1px solid rgba(201,24,74,0.28)',
              animation: 'ringExpand 4s ease-out infinite',
              animationDelay: `${i * 1}s`,
            }} />
          ))}
          <div style={{
            position: 'absolute', borderRadius: '50%', width: '55vw', height: '55vw',
            background: 'radial-gradient(circle, rgba(201,24,74,0.1) 0%, transparent 70%)',
            animation: 'softPulse 3s ease-in-out infinite',
          }} />
        </div>
      )}

      {v === 1 && (
        /* Linhas de velocidade horizontais */
        <div className="absolute inset-0 overflow-hidden">
          {[
            {top:'7%',  w:'44%', o:0.18, d:'0.06s'},
            {top:'16%', w:'60%', o:0.26, d:'0.13s'},
            {top:'25%', w:'30%', o:0.12, d:'0.20s'},
            {top:'34%', w:'68%', o:0.32, d:'0.04s'},
            {top:'43%', w:'50%', o:0.22, d:'0.17s'},
            {top:'52%', w:'36%', o:0.14, d:'0.09s'},
            {top:'61%', w:'74%', o:0.28, d:'0.02s'},
            {top:'70%', w:'52%', o:0.20, d:'0.15s'},
            {top:'79%', w:'40%', o:0.15, d:'0.23s'},
            {top:'88%', w:'58%', o:0.20, d:'0.11s'},
          ].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', height: '1px',
              top: s.top, right: 0, width: s.w,
              background: `rgba(255,77,122,${s.o})`,
              animation: `speedLine 1.5s cubic-bezier(0.16,1,0.3,1) both ${s.d}`,
            }} />
          ))}
        </div>
      )}

      {v === 2 && (
        /* Molduras geométricas girando */
        <div className="absolute inset-0 flex items-center justify-center">
          {[[76,0.08,22,'normal'],[58,0.12,15,'reverse'],[40,0.17,10,'normal']].map(([sz,op,spd,dir], i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${sz}vw`, height: `${sz}vw`,
              border: `1px solid rgba(201,24,74,${op})`,
              animation: `spin ${spd}s linear infinite ${dir}`,
            }} />
          ))}
          <div style={{
            position: 'absolute', borderRadius: '50%', width: '48vw', height: '48vw',
            background: 'radial-gradient(circle, rgba(201,24,74,0.07) 0%, transparent 70%)',
          }} />
        </div>
      )}

      {v === 3 && (
        /* Pulso radial + linha de batimento cardíaco */
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{
            position: 'absolute', borderRadius: '50%', width: '90vw', height: '90vw',
            background: 'radial-gradient(circle, rgba(255,50,80,0.16) 0%, transparent 58%)',
            animation: 'softPulse 0.88s ease-in-out infinite',
          }} />
          <svg viewBox="0 0 320 44" style={{
            position: 'absolute', width: '88%', bottom: '26%',
            opacity: 0.32, animation: 'softPulse 0.88s ease-in-out infinite',
          }}>
            <polyline
              points="0,22 50,22 68,5 86,39 104,22 140,22 156,12 172,32 188,22 320,22"
              fill="none" stroke="rgba(255,77,122,0.9)" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

/* ── Listras que deslizam e revelam o conteúdo ──────── */
function RevealStrips({ variant }) {
  const N = 11
  const bgs = [
    'linear-gradient(160deg,#2d0019,#4A0020)',  // 0 — dias
    'linear-gradient(160deg,#1a0010,#4A0020)',  // 1 — horas
    'linear-gradient(160deg,#0D0208,#2d0019)',  // 2 — minutos
    'linear-gradient(160deg,#4A0020,#C9184A)',  // 3 — segundos
  ]
  const bg = bgs[variant % 4]
  const ease = 'cubic-bezier(0.77,0,0.18,1)'

  return (
    <div className="absolute pointer-events-none"
      style={{ top: 72, left: 0, right: 0, bottom: 0, zIndex: 15, overflow: 'hidden' }}>
      {Array.from({ length: N }, (_, i) => {
        const top   = `${i * (100 / N)}%`
        const height = `${100 / N}%`
        let animation

        if (variant % 4 === 0) {
          /* todas para a direita — stagger de cima para baixo */
          animation = `stripRight 0.52s ${ease} both ${(i * 0.038).toFixed(3)}s`

        } else if (variant % 4 === 1) {
          /* alterna cima / baixo — stagger de cima para baixo */
          const delay = `${(i * 0.038).toFixed(3)}s`
          animation = i % 2 === 0
            ? `stripUp   0.50s ${ease} both ${delay}`
            : `stripDown 0.50s ${ease} both ${delay}`

        } else if (variant % 4 === 2) {
          /* todas para a direita — stagger do centro para fora */
          const dist  = Math.abs(i - (N - 1) / 2)
          animation = `stripRight 0.50s ${ease} both ${(dist * 0.055).toFixed(3)}s`

        } else {
          /* alterna esquerda / direita — stagger de cima para baixo */
          const delay = `${(i * 0.038).toFixed(3)}s`
          animation = i % 2 === 0
            ? `stripLeft  0.52s ${ease} both ${delay}`
            : `stripRight 0.52s ${ease} both ${delay}`
        }

        return (
          <div key={i} style={{
            position: 'absolute',
            width: '110%', left: '-5%',
            height, top,
            background: bg,
            animation,
          }} />
        )
      })}
    </div>
  )
}

/* SECAO 3c — Contagem regressiva para o próximo aniversário */
function SectionAnniversaryCountdown({ anniversaryDate }) {
  const [ref, visible] = useInView(0.3)

  const start = parseLocalDate(anniversaryDate)
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const thisYearAnn = new Date(today.getFullYear(), start.getMonth(), start.getDate())

  let nextAnn, yearsCompleting
  if (thisYearAnn >= todayMidnight) {
    nextAnn = thisYearAnn
    yearsCompleting = thisYearAnn.getFullYear() - start.getFullYear()
  } else {
    nextAnn = new Date(today.getFullYear() + 1, start.getMonth(), start.getDate())
    yearsCompleting = nextAnn.getFullYear() - start.getFullYear()
  }

  const daysUntil = Math.round((nextAnn - todayMidnight) / 86400000)
  const isToday = daysUntil === 0

  return (
    <div ref={ref} className="snap-section px-6"
      style={{ background: 'linear-gradient(160deg, #0D0208 0%, #1a0010 50%, #2d0019 100%)' }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['❤️','🌹','✨','💕','🎉'].map((e, i) => (
          <span key={i} className="local-particle"
            style={{ left: `${10 + i * 18}%`, bottom: 0, fontSize: `${9 + (i % 3) * 3}px`, animationDuration: `${4 + i * 0.8}s`, animationDelay: `${i * 0.7}s` }}>
            {e}
          </span>
        ))}
      </div>

      <div className="section-content relative z-10 flex flex-col items-center text-center gap-5 w-full max-w-xs mx-auto">

        <p className={`text-love-400 text-xs font-bold uppercase tracking-widest transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          Próximo Aniversário
        </p>

        {isToday ? (
          <>
            <div className={`text-6xl transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
              style={{ animation: visible ? 'heartGlow 1.2s ease-in-out infinite' : 'none' }}>
              🎉
            </div>
            <p className={`font-black text-white text-4xl transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ textShadow: '0 0 40px rgba(201,24,74,0.7)', transitionDelay: '0.15s' }}>
              Hoje!
            </p>
            <p className={`text-white/70 text-xl font-bold transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '0.3s' }}>
              {yearsCompleting} {yearsCompleting === 1 ? 'ano' : 'anos'} juntos ❤️
            </p>
            <p className={`text-white/30 text-sm italic transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '0.45s', fontFamily: 'Georgia, serif' }}>
              "Parabéns pelo aniversário!"
            </p>
          </>
        ) : (
          <>
            <div className={`transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              style={{ transitionDelay: '0.1s' }}>
              <p className="font-black text-white tabular-nums leading-none"
                style={{
                  fontSize: 'clamp(4.5rem, 22vw, 8rem)',
                  textShadow: '0 0 60px rgba(255,77,122,0.6)',
                  animation: visible ? 'numberDrop 0.75s cubic-bezier(0.34,1.56,0.64,1) both 0.2s' : 'none',
                }}>
                {daysUntil}
              </p>
            </div>

            <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '0.35s' }}>
              <p className="text-white/40 text-base font-semibold">dias para completar</p>
              <p className="font-black text-white text-2xl mt-0.5"
                style={{ textShadow: '0 0 20px rgba(201,24,74,0.4)' }}>
                {yearsCompleting} {yearsCompleting === 1 ? 'ano' : 'anos'} juntos
              </p>
            </div>

            <div className={`h-px transition-all duration-700 ${visible ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}
              style={{ transitionDelay: '0.5s', background: 'linear-gradient(to right, transparent, #C9184A, transparent)' }} />

            <div className={`flex flex-col items-center gap-0.5 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '0.65s' }}>
              <p className="text-white/25 text-xs uppercase tracking-widest">em</p>
              <p className="text-love-300 text-sm font-bold">
                {nextAnn.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}

/* ─── Seção Retrospectiva (estilo Spotify Wrapped) ─── */
function SectionRetrospectiva_REMOVED() {
  const [barKey,  setBarKey]  = useState(0)

  /* ── spotify: trackId + metadados para exibição no slide ── */
  const spotifyId = extractSpotifyId(musicUrl)
  const [trackInfo, setTrackInfo] = useState(null) // { name, artist, albumArt }

  useEffect(() => {
    if (!spotifyId) return
    fetch(`/api/spotify-preview?trackId=${spotifyId}`)
      .then(r => r.json())
      .then(d => setTrackInfo(d))
      .catch(() => {})
  }, [spotifyId])

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

      {/* Barras de progresso estilo stories */}
      <div className="absolute top-12 left-6 right-6 flex gap-1.5 z-20">
        {slides.map((s, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            {i < slide && <div className="h-full w-full" style={{ background: 'rgba(255,255,255,0.75)' }} />}
            {i === slide && (
              <div key={`bar-${barKey}`} className="h-full rounded-full"
                style={{ background: 'rgba(255,255,255,0.9)', animation: isVisible ? `progressBar ${s.dur}ms linear both` : 'none', width: 0 }} />
            )}
          </div>
        ))}
      </div>

      {/* Mini card de música — canto superior esquerdo, abaixo das barrinhas */}
      {spotifyId && trackInfo && (
        <div className="absolute left-6 z-20 flex items-center gap-2"
          style={{ top: '62px', animation: 'fadeInUp 0.5s ease both 0.3s' }}>
          {trackInfo.albumArt
            ? <img src={trackInfo.albumArt} alt={trackInfo.name}
                style={{ width: 28, height: 28, borderRadius: '6px', objectFit: 'cover', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }} />
            : <div style={{ width: 28, height: 28, borderRadius: '6px', flexShrink: 0,
                background: 'linear-gradient(135deg,#7B0033,#C9184A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🎵</div>
          }
          <div style={{ maxWidth: 110 }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: 700, lineHeight: 1.2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trackInfo.name}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, marginTop: 1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trackInfo.artist}
            </p>
          </div>
        </div>
      )}

      {/* Background animado por slide (apenas slides de número) */}
      {!isPhotoMusicSlide && <SlideBackground key={`bg-${animKey}`} variant={slide % 4} />}

      {/* Listras de reveal — remontam a cada troca de slide */}
      <RevealStrips key={`str-${animKey}`} variant={slide % 4} />

      {/* ── SLIDE ESPECIAL: foto + capa do álbum ── */}
      {isPhotoMusicSlide ? (
        <div key={`photomusic-${animKey}`} className="section-content relative z-10 flex flex-col items-center justify-center gap-3 w-full max-w-xs mx-auto px-4 h-full">

          <p className="text-white/35 text-xs font-bold uppercase tracking-widest"
            style={{ animation: 'fadeInUp 0.6s ease both' }}>
            a trilha sonora do nosso amor
          </p>

          {/* Foto — Modelo 3: Emerge da névoa */}
          {couplePhoto && (
            <div className="relative" style={{ animation: 'emergeFromFog 1.1s cubic-bezier(0.16,1,0.3,1) both 0.55s' }}>

              {/* Borda/glow animado em torno da foto */}
              <div style={{
                position: 'absolute', inset: -3, borderRadius: '1.5rem',
                background: 'linear-gradient(135deg, #FF4D7A, #C9184A, #7B0033, #FF4D7A)',
                backgroundSize: '300% 300%',
                animation: 'gradientShift 3s ease infinite',
                zIndex: 0,
              }} />

              {/* Foto formato story (9:16) */}
              <div style={{ position: 'relative', zIndex: 1, borderRadius: '1.3rem', overflow: 'hidden', width: 250, height: 405 }}>
                <img src={couplePhoto} alt="foto do casal"
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    animation: 'diagonalPan 9s ease-in-out infinite',
                  }} />
                {/* overlay leve */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(13,2,8,0.45) 0%, transparent 55%)',
                }} />
              </div>

              {/* Capa do álbum no canto inferior direito */}
              {trackInfo?.albumArt && (
                <div style={{
                  position: 'absolute', bottom: -12, right: -12, zIndex: 20,
                  animation: 'fadeInUp 0.7s ease both 0.7s',
                }}>
                  {/* sombra/card */}
                  <div style={{
                    background: 'rgba(13,2,8,0.85)',
                    borderRadius: '0.75rem',
                    padding: '5px',
                    border: '1px solid rgba(201,24,74,0.5)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', gap: 6,
                    backdropFilter: 'blur(8px)',
                  }}>
                    <img src={trackInfo.albumArt} alt={trackInfo.name}
                      style={{ width: 44, height: 44, borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ paddingRight: 6, maxWidth: 90 }}>
                      <p style={{ color: '#fff', fontSize: 10, fontWeight: 800, lineHeight: 1.2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trackInfo.name}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, marginTop: 2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trackInfo.artist}
                      </p>
                      {/* mini onda animada */}
                      <div className="flex items-end gap-px mt-1.5" style={{ height: 10 }}>
                        {[40,70,55,90,60,80,45].map((h, i) => (
                          <span key={i} style={{
                            display: 'block', width: 2, borderRadius: 1,
                            background: '#1DB954',
                            height: `${h}%`,
                            animation: `audioBar 0.9s ease-in-out infinite alternate`,
                            animationDelay: `${i * 0.1}s`,
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* sem capa: emoji de nota no canto */}
              {!trackInfo?.albumArt && (
                <div style={{
                  position: 'absolute', bottom: -8, right: -8, zIndex: 20,
                  fontSize: '2rem', animation: 'heartGlow 2s ease-in-out infinite',
                }}>🎵</div>
              )}
            </div>
          )}

          {/* Info da música (se tiver) */}
          {trackInfo && (
            <div className="text-center" style={{ animation: 'fadeInUp 0.7s ease both 0.9s' }}>
              <p className="text-white font-black text-sm leading-tight"
                style={{ textShadow: '0 0 20px rgba(201,24,74,0.6)' }}>
                {trackInfo.name}
              </p>
              <p className="text-white/40 text-xs mt-0.5">{trackInfo.artist}</p>
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
        <div key={animKey} className="section-content relative z-10 flex flex-col items-center text-center gap-3 w-full max-w-xs mx-auto px-6">

          <p className="text-white/40 text-xs font-bold uppercase tracking-widest"
            style={{ animation: 'fadeIn 0.5s ease both 0.2s' }}>
            Uma retrospectiva do nosso amor
          </p>

          <SlideOrnament variant={slide} />

          {/* Número — entrada dramática + loop contínuo por slide */}
          <p className="font-black text-white tabular-nums leading-none"
            style={{
              fontSize: 'clamp(2.8rem,14vw,5.5rem)',
              textShadow: '0 0 60px rgba(255,77,122,0.55)',
              animation: [
                'numCosmicZoom 0.85s cubic-bezier(0.34,1.56,0.64,1) both 0.42s, numBreathe 3s ease-in-out infinite 1.3s',
                'numSlam 0.72s cubic-bezier(0.22,1,0.36,1) both 0.44s',
                'numRiseSplit 0.65s cubic-bezier(0.34,1.56,0.64,1) both 0.35s, numBreathe 2.8s ease-in-out infinite 1.0s',
                'numGlitch 0.75s ease both 0.40s, numPulse 0.85s ease-in-out infinite 1.15s',
              ][slide % 4],
            }}>
            {cur.number}
          </p>

          {/* Unidade + subtítulo — stagger por slide */}
          <div style={{
            animation: [
              'riseUp 0.55s ease both 1.0s',
              'fadeInUp 0.5s ease both 0.9s',
              'fadeIn 0.5s ease both 0.8s',
              'slideInRight 0.5s ease both 0.9s',
            ][slide % 4],
          }}>
            <p className="text-white/80 text-xl font-bold">{cur.unit}</p>
            <p className="text-white/35 text-sm mt-0.5">{cur.sub}</p>
          </div>

          <div className="h-px"
            style={{
              background: 'linear-gradient(to right,transparent,rgba(201,24,74,0.6),transparent)',
              width: '80%',
              animation: 'lineExpand 0.7s ease both 0.75s',
            }} />

          <div className="flex gap-2">
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

/* ── Galeria Cinema ──────────────────────────────── */
function SectionCouplePhoto({ events, coupleName, couple }) {
  const [ref, visible] = useInView(0.1)
  const [current, setCurrent] = useState(0)
  const [fading,  setFading]  = useState(false)

  const resolveUrl = url => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  const allPhotos = events.map(e => resolveUrl(e.imageUrl)).filter(Boolean)
  useEffect(() => {
    if (allPhotos.length <= 1) return
    const id = setInterval(() => {
      setFading(true)
      setTimeout(() => { setCurrent(c => (c + 1) % allPhotos.length); setFading(false) }, 600)
    }, 5500)
    return () => clearInterval(id)
  }, [allPhotos.length])

  const activePhoto = allPhotos[current] || null
  const dateStr = couple.anniversaryDate
    ? parseLocalDate(couple.anniversaryDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div ref={ref} className="snap-section" style={{ position: 'relative', background: '#0D0208', overflow: 'hidden' }}>

      {/* Foto principal — full bleed com Ken Burns */}
      {activePhoto ? (
        <img
          key={activePhoto}
          src={activePhoto}
          alt={coupleName}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.6s ease',
            animation: 'kenBurns 14s ease-in-out infinite alternate',
          }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span style={{ fontSize: '3rem' }}>📷</span>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Adicione uma foto especial</p>
        </div>
      )}

      {/* Overlay escuro suave */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)', pointerEvents: 'none' }} />

      {/* Gradiente cinemático — base */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 45%, rgba(0,0,0,0.3) 100%)',
      }} />

      {/* Barras letterbox */}
      {[{ top: 0 }, { bottom: 0 }].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0, height: 28, ...pos,
          background: 'rgba(0,0,0,0.6)', pointerEvents: 'none',
        }} />
      ))}

      {/* Nome + data */}
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: '0 24px',
        opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease',
      }}>
        <div style={{ width: 40, height: 2, background: 'var(--tc, #C9184A)', borderRadius: 1 }} />
        <p style={{
          color: 'white', fontWeight: 900, fontSize: '1.25rem',
          textShadow: '0 2px 16px rgba(0,0,0,0.8)',
          textAlign: 'center', lineHeight: 1.2,
        }}>{coupleName}</p>
        {dateStr && (
          <p style={{
            color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>{dateStr}</p>
        )}
      </div>

      {/* Dots navegação */}
      {allPhotos.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '5%', left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 6,
        }}>
          {allPhotos.map((_, i) => (
            <button key={i}
              onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false) }, 300) }}
              style={{
                width: i === current ? 20 : 6, height: 6,
                borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer',
                background: i === current ? 'var(--tc, #C9184A)' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
              }} />
          ))}
        </div>
      )}

      <ScrollHint />
    </div>
  )
}

/* SECAO 6c — Polaroid */
const POLAROID_ROTATIONS = [-7, 4, -3, 8, -5, 6, -9, 3, -4, 7]

/* Posições dos polaroids de fundo — espalhados nas bordas/cantos */
const BG_POLAROIDS = [
  { top: '1%',   left: '-14%',  rot: -24, scale: 0.82 },
  { top: '3%',   right: '-12%', rot:  19, scale: 0.78 },
  { top: '26%',  left: '-18%',  rot: -30, scale: 0.75 },
  { top: '24%',  right: '-16%', rot:  26, scale: 0.80 },
  { top: '52%',  left: '-14%',  rot: -18, scale: 0.77 },
  { top: '50%',  right: '-13%', rot:  22, scale: 0.76 },
  { bottom: '3%',left: '-10%',  rot: -12, scale: 0.80 },
  { bottom: '2%',right: '-8%',  rot:  16, scale: 0.82 },
]

function PolaroidCard({ url, label, style: extraStyle }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '3px',
      padding: '8px 8px 30px',
      ...extraStyle,
    }}>
      <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: '#e8d5d5' }}>
        {url && (
          <img src={url} alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none' }} />
        )}
      </div>
      <p style={{
        textAlign: 'center', color: '#5a3a3a', fontSize: '9px',
        fontFamily: 'Georgia, serif', fontStyle: 'italic',
        marginTop: '5px', lineHeight: 1.3, paddingTop: '3px',
        borderTop: '1px solid rgba(90,58,58,0.08)',
      }}>
        {label}
      </p>
    </div>
  )
}

function SectionPolaroid({ events }) {
  const [ref, visible] = useInView(0.2)
  const [active, setActive] = useState(0)

  const resolveUrl = url => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  const photos = events
    .filter(e => e.imageUrl)
    .map((e, i) => ({
      url: resolveUrl(e.imageUrl),
      label: 'eu te amo meu amor',
      rotation: POLAROID_ROTATIONS[i % POLAROID_ROTATIONS.length],
    }))

  if (photos.length === 0) return null

  const next = () => setActive(a => (a + 1) % photos.length)

  return (
    <div ref={ref} className="snap-section overflow-hidden"
      style={{ position: 'relative', background: 'linear-gradient(160deg, #0D0208 0%, #1a0010 60%, #2d0019 100%)' }}>

      {/* ── Polaroids de fundo espalhados ── */}
      {photos.length > 0 && BG_POLAROIDS.map((pos, i) => {
        const photo = photos[i % photos.length]
        const { rot, scale: sc, ...placement } = pos
        return (
          <div key={i} style={{
            position: 'absolute',
            ...placement,
            width: 160,
            transform: `rotate(${rot}deg) scale(${sc})`,
            transformOrigin: 'center center',
            opacity: visible ? 0.22 : 0,
            filter: 'blur(1.5px)',
            transition: `opacity 0.8s ease ${0.05 + i * 0.07}s`,
            zIndex: 1,
            pointerEvents: 'none',
          }}>
            <PolaroidCard url={photo.url} label={photo.label} style={{}} />
          </div>
        )
      })}

      {/* ── Pilha interativa centralizada ── */}
      <div className="relative z-10 flex flex-col items-center gap-5">

        <div className={`flex items-center gap-2 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-px w-8" style={{ background: 'linear-gradient(to right,transparent,rgba(var(--tc-rgb,201,24,74),0.6))' }} />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">nossas fotos</p>
          <div className="h-px w-8" style={{ background: 'linear-gradient(to left,transparent,rgba(var(--tc-rgb,201,24,74),0.6))' }} />
        </div>

        <div
          className="relative flex items-center justify-center cursor-pointer"
          style={{ width: 240, height: 300 }}
          onClick={next}>
          {photos.map((photo, i) => {
            const offset    = i - active
            const isActive  = offset === 0
            const absOffset = Math.abs(offset)
            return (
              <div key={i} style={{
                position: 'absolute',
                width: 215,
                background: 'white',
                borderRadius: '3px',
                padding: '10px 10px 38px',
                boxShadow: isActive
                  ? '0 28px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.2)'
                  : '0 8px 28px rgba(0,0,0,0.5)',
                transform: isActive
                  ? 'rotate(0deg) translateY(0) scale(1)'
                  : `rotate(${photo.rotation}deg) translateY(${absOffset * 6}px) scale(${1 - absOffset * 0.05})`,
                zIndex: 20 - absOffset,
                opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.2,
                transition: 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: '#e8d5d5' }}>
                  <img src={photo.url} alt={photo.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                </div>
                <p style={{
                  textAlign: 'center', color: '#5a3a3a', fontSize: '11px',
                  fontFamily: 'Georgia, serif', fontStyle: 'italic',
                  marginTop: '8px', lineHeight: 1.3, paddingTop: '5px',
                  borderTop: '1px solid rgba(90,58,58,0.1)',
                }}>
                  {photo.label}
                </p>
              </div>
            )
          })}
        </div>

        {photos.length > 1 && (
          <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '0.3s' }}>
            <p className="text-white/25 text-xs">toque para ver a próxima foto</p>
            <div className="flex gap-2">
              {photos.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i) }}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === active ? '16px' : '5px', height: '5px', background: i === active ? 'var(--tc,#C9184A)' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}

/* SECAO 6b — Música especial */
function SectionMusicMemory({ musicUrl }) {
  const [ref, visible] = useInView(0.3)
  const [track, setTrack] = useState(null)
  const [lyrics, setLyrics] = useState(null)
  const spotifyId = extractSpotifyId(musicUrl)

  useEffect(() => {
    if (!spotifyId) return
    fetch(`/api/spotify-track?id=${spotifyId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.name) return
        setTrack(data)
        fetch(`/api/lyrics?artist=${encodeURIComponent(data.artist)}&title=${encodeURIComponent(data.name)}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.lyrics) setLyrics(d.lyrics) })
          .catch(() => {})
      })
      .catch(() => {})
  }, [spotifyId])

  if (!spotifyId) return null

  const lyricsLines = lyrics
    ? lyrics.split('\n').filter(l => l.trim()).slice(0, 18)
    : null

  return (
    <div ref={ref} className="snap-section overflow-hidden"
      style={{ background: '#0D0208' }}>

      {track?.albumArt && (
        <img src={track.albumArt} alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(28px) brightness(0.35)', transform: 'scale(1.15)' }} />
      )}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(13,2,8,0.55) 0%, rgba(13,2,8,0.75) 60%, rgba(13,2,8,0.97) 100%)' }} />

      <div className="section-content relative z-10 flex flex-col items-center text-center gap-4 px-8 w-full max-w-xs mx-auto overflow-y-auto py-10"
        style={{ maxHeight: '100dvh' }}>

        <p className={`flex-shrink-0 text-love-400 text-xs font-bold uppercase tracking-widest transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          Nossa Música
        </p>

        {/* Capa do álbum */}
        <div className={`flex-shrink-0 transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
          style={{ transitionDelay: '0.1s' }}>
          {track?.albumArt ? (
            <div className="relative">
              <img src={track.albumArt} alt={track?.name}
                className="w-44 h-44 rounded-2xl object-cover shadow-2xl"
                style={{ boxShadow: '0 0 60px rgba(201,24,74,0.45), 0 20px 60px rgba(0,0,0,0.7)' }} />
              <div className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }} />
            </div>
          ) : (
            <div className="w-44 h-44 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#4A0020,#C9184A)', boxShadow: '0 0 60px rgba(201,24,74,0.45)' }}>
              <span style={{ fontSize: '4rem' }}>🎵</span>
            </div>
          )}
        </div>

        {/* Nome e artista */}
        <div className={`flex-shrink-0 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '0.25s' }}>
          {track ? (
            <>
              <p className="font-black text-white text-lg leading-tight">{track.name}</p>
              <p className="text-white/40 text-sm mt-1 font-semibold">{track.artist}</p>
            </>
          ) : (
            <p className="text-white/30 text-sm">carregando...</p>
          )}
        </div>

        <div className={`flex-shrink-0 h-px transition-all duration-700 ${visible ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}
          style={{ transitionDelay: '0.35s', background: 'linear-gradient(to right, transparent, #C9184A, transparent)' }} />

        <p className={`flex-shrink-0 text-white/70 text-sm italic leading-relaxed font-light transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '0.45s', fontFamily: 'Georgia, serif' }}>
          "quando escuto essa música,<br />eu lembro de você"
        </p>

        {/* Letra da música */}
        {lyricsLines && (
          <div className={`flex-shrink-0 w-full transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '0.55s' }}>
            <div className="flex items-center gap-2 justify-center mb-3">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right,transparent,rgba(201,24,74,0.4))' }} />
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Letra</p>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left,transparent,rgba(201,24,74,0.4))' }} />
            </div>
            <div className="relative">
              <div className="overflow-y-auto text-left pr-1" style={{ maxHeight: '150px' }}>
                {lyricsLines.map((line, i) => (
                  <p key={i} className="text-white/45 text-xs leading-relaxed"
                    style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '1px' }}>
                    {line}
                  </p>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(13,2,8,0.95))' }} />
            </div>
          </div>
        )}

        <div className={`flex-shrink-0 text-2xl transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: lyricsLines ? '0.7s' : '0.6s', animation: visible ? 'heartGlow 2s ease-in-out infinite' : 'none' }}>
          ❤️
        </div>
      </div>
    </div>
  )
}

/* SECAO Premium — Timeline de momentos */
function SectionTimeline({ events }) {
  const [ref, visible] = useInView(0.15)
  if (!events?.length) return null

  return (
    <div ref={ref} className="snap-section overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0D0208 0%, #1a0010 60%, #2d0019 100%)' }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['✨','💕','🌹','❤️','⭐'].map((e, i) => (
          <span key={i} className="local-particle"
            style={{ left: `${8 + i * 20}%`, bottom: 0, fontSize: '10px', animationDuration: `${4 + i}s`, animationDelay: `${i * 0.8}s` }}>
            {e}
          </span>
        ))}
      </div>

      <div className="section-content relative z-10 w-full max-w-xs mx-auto px-4 overflow-y-auto py-10" style={{ maxHeight: '100dvh' }}>

        {/* Título */}
        <div className={`flex items-center gap-2 mb-8 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, var(--tc, #C9184A))' }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--tc, #FF4D7A)' }}>Momentos especiais</p>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, var(--tc, #C9184A))' }} />
        </div>

        {/* Timeline centralizada */}
        <div className="relative">

          {/* Linha vertical central */}
          <div
            className="absolute top-0 bottom-0 w-px left-1/2 -translate-x-1/2"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--tc, #C9184A) 8%, var(--tc, #C9184A) 92%, transparent)`,
              animation: visible ? 'timelineLineGrow 0.8s ease both 0.1s' : 'none',
            }}
          />

          <div className="space-y-7">
            {events.map((ev, i) => {
              const isLeft = i % 2 === 0
              return (
                <div key={ev.id || i} className="relative flex items-center gap-0">

                  {/* Conteúdo ESQUERDO */}
                  <div
                    className="w-5/12 text-right pr-4"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateX(0)' : 'translateX(-28px)',
                      transition: `opacity 0.55s ease ${0.15 + i * 0.13}s, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${0.15 + i * 0.13}s`,
                    }}>
                    {isLeft ? (
                      <>
                        <p className="font-black text-white text-xs leading-snug">{ev.title}</p>
                        {ev.eventDate && (
                          <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--tc, #FF4D7A)', opacity: 0.8 }}>
                            {new Date(ev.eventDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                        {ev.description && (
                          <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{ev.description}</p>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* Dot central */}
                  <div className="w-2/12 flex justify-center flex-shrink-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
                      style={{
                        background: '#0D0208',
                        borderColor: 'var(--tc, #C9184A)',
                        boxShadow: `0 0 10px rgba(var(--tc-rgb, 201,24,74), 0.7)`,
                        animation: visible ? `timelineDotPulse 2s ease-in-out infinite ${0.5 + i * 0.2}s` : 'none',
                      }}
                    />
                  </div>

                  {/* Conteúdo DIREITO */}
                  <div
                    className="w-5/12 text-left pl-4"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateX(0)' : 'translateX(28px)',
                      transition: `opacity 0.55s ease ${0.15 + i * 0.13}s, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${0.15 + i * 0.13}s`,
                    }}>
                    {!isLeft ? (
                      <>
                        <p className="font-black text-white text-xs leading-snug">{ev.title}</p>
                        {ev.eventDate && (
                          <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--tc, #FF4D7A)', opacity: 0.8 }}>
                            {new Date(ev.eventDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                        {ev.description && (
                          <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{ev.description}</p>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* SECAO Premium — Conquistas do casal */
const ACHIEVEMENTS = [
  { days: 7,    label: '1 semana',  emoji: '🌸', desc: 'juntos' },
  { days: 30,   label: '1 mês',     emoji: '❤️', desc: 'de amor' },
  { days: 100,  label: '100 dias',  emoji: '✨', desc: 'especiais' },
  { days: 180,  label: '6 meses',   emoji: '🌹', desc: 'juntos' },
  { days: 365,  label: '1 ano',     emoji: '💫', desc: 'de história' },
  { days: 730,  label: '2 anos',    emoji: '💕', desc: 'de amor' },
  { days: 1825, label: '5 anos',    emoji: '👑', desc: 'juntos' },
  { days: 3650, label: '10 anos',   emoji: '💎', desc: 'de vida' },
]

function SectionAchievements({ time }) {
  const [ref, visible] = useInView(0.2)
  if (!time) return null

  const unlocked = ACHIEVEMENTS.filter(a => time.totalDays >= a.days)
  const next     = ACHIEVEMENTS.find(a => time.totalDays < a.days)
  if (unlocked.length === 0) return null

  return (
    <div ref={ref} className="snap-section overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0D0208 0%, #1a0010 50%, #2d0019 100%)' }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🏆','✨','💫','⭐','🌟'].map((e, i) => (
          <span key={i} className="local-particle"
            style={{ left: `${10 + i * 18}%`, bottom: 0, fontSize: `${10 + i * 2}px`, animationDuration: `${4 + i * 0.8}s`, animationDelay: `${i * 0.7}s` }}>
            {e}
          </span>
        ))}
      </div>

      <div className="section-content relative z-10 w-full max-w-xs mx-auto px-5 overflow-y-auto py-10" style={{ maxHeight: '100dvh' }}>

        <div className={`flex items-center gap-2 mb-6 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, var(--tc, #C9184A))' }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--tc, #FF4D7A)' }}>Conquistas</p>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, var(--tc, #C9184A))' }} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {ACHIEVEMENTS.map((a, i) => {
            const isUnlocked = time.totalDays >= a.days
            return (
              <div key={i}
                className="flex flex-col items-center gap-1 rounded-2xl py-3 px-2 text-center transition-all duration-700"
                style={{
                  background: isUnlocked ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                  border: isUnlocked ? '1px solid rgba(var(--tc-rgb, 201,24,74), 0.4)' : '1px solid rgba(255,255,255,0.05)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(16px)',
                  transitionDelay: `${i * 0.07}s`,
                  boxShadow: isUnlocked ? '0 0 16px rgba(var(--tc-rgb, 201,24,74), 0.15)' : 'none',
                }}>
                <span style={{ fontSize: '1.6rem', filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.3)' }}>
                  {a.emoji}
                </span>
                <p className="font-black text-xs leading-tight" style={{ color: isUnlocked ? 'white' : 'rgba(255,255,255,0.2)' }}>
                  {a.label}
                </p>
                <p style={{ fontSize: '9px', color: isUnlocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)' }}>
                  {a.desc}
                </p>
              </div>
            )
          })}
        </div>

        {next && (
          <div className={`rounded-2xl p-3 text-center transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '0.6s', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p className="text-white/30 text-xs">próxima conquista</p>
            <p className="font-black text-white/60 text-sm mt-0.5">{next.emoji} {next.label} — faltam {next.days - time.totalDays} dias</p>
          </div>
        )}
      </div>

      <ScrollHint />
    </div>
  )
}

/* SECAO Premium — Caça-níquel de memórias */
function SlotReel({ photo, spinCount, locked, jackpot, reelIndex }) {
  return (
    <div style={{
      width: 86, height: 86,
      borderRadius: 12,
      overflow: 'hidden',
      border: jackpot ? '2px solid gold' : locked ? '2px solid rgba(255,215,0,0.5)' : '2px solid rgba(var(--tc-rgb,201,24,74),0.4)',
      background: '#0D0208',
      position: 'relative',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      boxShadow: jackpot ? '0 0 0 0 rgba(255,215,0,0.8)' : locked ? '0 0 10px rgba(255,215,0,0.35)' : 'none',
      animation: jackpot ? `reelBounce 0.65s cubic-bezier(0.34,1.56,0.64,1) both ${reelIndex * 0.1}s, jackpotGlow 1.5s ease-in-out infinite ${reelIndex * 0.1 + 0.65}s` : 'none',
    }}>
      {photo ? (
        <img
          key={`${photo}-${spinCount}`}
          src={photo}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'reelSlide 0.09s ease both' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.2 }}>
          🎰
        </div>
      )}
    </div>
  )
}

function SectionRandomMemory({ events }) {
  const [ref, visible] = useInView(0.3)
  const [reels, setReels] = useState([
    { photo: null, spinCount: 0 },
    { photo: null, spinCount: 0 },
    { photo: null, spinCount: 0 },
  ])
  const [lockedReels, setLockedReels] = useState([false, false, false])
  const [isSpinning,  setIsSpinning]  = useState(false)
  const [jackpot,     setJackpot]     = useState(false)
  const [winner,      setWinner]      = useState(null)
  const [showWinner,  setShowWinner]  = useState(false)
  const [hasSpun,     setHasSpun]     = useState(false)

  const resolveUrl = url => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  const photos = events
    .filter(e => e.imageUrl && e.category === 'photo')
    .map(e => resolveUrl(e.imageUrl))

  if (photos.length < 2) return null

  const rand = () => photos[Math.floor(Math.random() * photos.length)]

  function spinReel(reelIndex, steps, finalPhoto, startDelay, onDone) {
    setTimeout(() => {
      let count = 0
      function tick() {
        if (count < steps) {
          setReels(prev => {
            const next = [...prev]
            next[reelIndex] = { photo: rand(), spinCount: prev[reelIndex].spinCount + 1 }
            return next
          })
          const delay = count < steps * 0.55 ? 55 : count < steps * 0.8 ? 100 : 170
          setTimeout(tick, delay)
          count++
        } else {
          setReels(prev => {
            const next = [...prev]
            next[reelIndex] = { photo: finalPhoto, spinCount: prev[reelIndex].spinCount + 1 }
            return next
          })
          setLockedReels(prev => { const n = [...prev]; n[reelIndex] = true; return n })
          if (onDone) onDone()
        }
      }
      tick()
    }, startDelay)
  }

  function spin() {
    if (isSpinning) return
    setIsSpinning(true)
    setJackpot(false)
    setWinner(null)
    setShowWinner(false)
    setHasSpun(true)
    setLockedReels([false, false, false])

    const winnerPhoto = rand()

    spinReel(0, 24, winnerPhoto, 0, () => {
      spinReel(1, 18, winnerPhoto, 350, () => {
        spinReel(2, 12, winnerPhoto, 350, () => {
          setTimeout(() => {
            setIsSpinning(false)
            setJackpot(true)
            setWinner(winnerPhoto)
            /* após 2.8s de comemoração → abre a foto */
            setTimeout(() => setShowWinner(true), 2800)
          }, 250)
        })
      })
    })
  }

  /* ── TELA DE COMEMORAÇÃO + FOTO VENCEDORA ── */
  if (showWinner && winner) {
    return (
      <div ref={ref} className="snap-section overflow-hidden" style={{ background: '#0D0208' }}>

        {/* Foto de fundo desfocada */}
        <img src={winner} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(24px) brightness(0.3)', transform: 'scale(1.12)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,2,8,0.4) 0%, rgba(13,2,8,0.6) 60%, rgba(13,2,8,0.95) 100%)' }} />

        {/* Partículas comemorativas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['❤️','💕','✨','🌹','💫','⭐','💖','🌸'].map((e, i) => (
            <span key={i} className="local-particle" style={{
              left: `${6 + i * 12}%`, bottom: 0,
              fontSize: `${13 + (i % 3) * 4}px`,
              animationDuration: `${2.5 + i * 0.4}s`,
              animationDelay: `${i * 0.2}s`,
            }}>{e}</span>
          ))}
        </div>

        <div className="section-content relative z-10 flex flex-col items-center gap-5 w-full max-w-xs mx-auto px-5">

          {/* Label */}
          <p className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'gold', textShadow: '0 0 16px rgba(255,215,0,0.7)', animation: 'fadeInUp 0.6s ease both' }}>
            ✨ nossa memória especial ✨
          </p>

          {/* Foto em destaque */}
          <div style={{
            width: '100%', borderRadius: 20, overflow: 'hidden',
            animation: 'fadeInScale 0.7s cubic-bezier(0.34,1.56,0.64,1) both 0.15s',
            opacity: 0, animationFillMode: 'both',
            boxShadow: '0 32px 80px rgba(0,0,0,0.85), 0 0 0 3px rgba(255,215,0,0.5)',
            border: '3px solid rgba(255,215,0,0.4)',
          }}>
            <img src={winner} alt="nossa memória"
              className="w-full object-cover" style={{ aspectRatio: '1/1', display: 'block' }} />
          </div>

          {/* Separador */}
          <div className="h-px w-32"
            style={{ background: 'linear-gradient(to right,transparent,gold,transparent)', animation: 'lineExpand 0.8s ease both 0.4s' }} />

          {/* Botão girar de novo */}
          <button onClick={spin}
            className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              animation: 'fadeInUp 0.6s ease both 0.5s', opacity: 0, animationFillMode: 'both',
            }}>
            🔀 Girar novamente
          </button>
        </div>

        <ScrollHint />
      </div>
    )
  }

  /* ── TELA DA MÁQUINA ── */
  return (
    <div ref={ref} className="snap-section overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0D0208 0%, #2d0019 100%)' }}>

      {/* Flash triplo dourado */}
      {jackpot && (
        <div className="absolute inset-0 pointer-events-none z-30"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.4) 0%, transparent 65%)', animation: 'jackpotFlash 1.8s ease both' }} />
      )}

      {/* Confetes de cima e de baixo */}
      {jackpot && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {['🎊','❤️','💕','✨','🌹','💫','⭐','💖','🎉','💛','🌸','💗','🎊','❤️','✨','💫'].map((e, i) => (
            <span key={i} style={{
              position: 'absolute',
              top: i % 3 === 0 ? '-5%' : '-2%',
              left: `${3 + i * 6.1}%`,
              fontSize: `${13 + (i % 5) * 3}px`,
              animation: `confettiFall ${1.0 + i * 0.12}s ease both ${i * 0.06}s`,
            }}>{e}</span>
          ))}
        </div>
      )}

      <div className="section-content relative z-10 flex flex-col items-center gap-4 w-full max-w-xs mx-auto px-5">

        <div className={`flex items-center gap-2 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, var(--tc,#C9184A))' }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--tc,#FF4D7A)' }}>memórias especiais</p>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, var(--tc,#C9184A))' }} />
        </div>

        {/* Máquina */}
        <div className="w-full rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: jackpot ? '2px solid gold' : '2px solid rgba(var(--tc-rgb,201,24,74),0.25)',
            boxShadow: jackpot ? '0 0 50px rgba(255,215,0,0.35)' : 'none',
            transition: 'all 0.4s ease',
          }}>

          <div className="flex items-center justify-center gap-3 mb-3">
            {reels.map((reel, i) => (
              <SlotReel key={i} photo={reel.photo} spinCount={reel.spinCount}
                locked={lockedReels[i]} jackpot={jackpot} reelIndex={i} />
            ))}
          </div>

          <div className="flex items-center gap-2 my-2">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs" style={{ color: jackpot ? 'gold' : 'rgba(255,255,255,0.15)' }}>
              {jackpot ? '⭐ ⭐ ⭐' : '— — —'}
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {jackpot && (
            <div className="text-center space-y-1"
              style={{ animation: 'jackpotText 0.55s cubic-bezier(0.34,1.56,0.64,1) both 0.1s', opacity: 0, animationFillMode: 'both' }}>
              <p className="font-black text-lg"
                style={{
                  color: 'gold',
                  textShadow: '0 0 20px rgba(255,215,0,1), 0 0 50px rgba(255,215,0,0.6)',
                  letterSpacing: '0.08em',
                  animation: 'jackpotText 0.55s cubic-bezier(0.34,1.56,0.64,1) both 0.1s, jackpotStrobe 0.6s linear 0.7s 3',
                }}>
                🎊 JACKPOT! 🎊
              </p>
              <p className="text-xs font-semibold" style={{ color: 'rgba(255,215,0,0.65)' }}>
                preparando sua memória especial...
              </p>
            </div>
          )}
        </div>

        <button onClick={spin} disabled={isSpinning}
          className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, var(--tc,#C9184A), rgba(var(--tc-rgb,201,24,74),0.7))`,
            boxShadow: '0 8px 30px rgba(var(--tc-rgb,201,24,74),0.4)',
          }}>
          {isSpinning
            ? <><span style={{ animation: 'spin 0.5s linear infinite', display: 'inline-block' }}>🎰</span> girando...</>
            : hasSpun ? '🔀 girar novamente' : '🎰 Girar'}
        </button>
      </div>

      <ScrollHint />
    </div>
  )
}

/* SECAO Premium — Caixa surpresa */
function SectionSurpriseBox({ event }) {
  const [ref, visible] = useInView(0.3)
  const [opened, setOpened] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [confetti, setConfetti] = useState([])

  if (!event?.description) return null

  const resolveUrl = url => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  const photoUrl = event.imageUrl ? resolveUrl(event.imageUrl) : null

  function open() {
    const pieces = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      color: ['#C9184A','#FF6B8A','#FFD700','#FF69B4','#ffffff','#FF4466','#FFAA00','#FF8C00'][i % 8],
      shape: i % 3,
      x: (Math.random() - 0.5) * 320,
      y: -(60 + Math.random() * 220),
      rot: Math.random() * 720 - 360,
      size: 7 + Math.random() * 9,
      delay: (Math.random() * 0.3).toFixed(2),
    }))
    setConfetti(pieces)
    setOpened(true)
    setTimeout(() => setShowContent(true), 750)
  }

  const words = event.description.split(' ')

  return (
    <div ref={ref} className="snap-section overflow-hidden"
      style={{ position: 'relative', background: 'linear-gradient(160deg, #0D0208 0%, #4A0020 60%, #0D0208 100%)' }}>

      {!opened && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['💝','✨','💌','🎁','❤️'].map((e, i) => (
            <span key={i} className="local-particle"
              style={{ left: `${8 + i * 20}%`, bottom: 0, fontSize: `${11 + i * 2}px`, animationDuration: `${3.5 + i * 0.7}s`, animationDelay: `${i * 0.5}s` }}>
              {e}
            </span>
          ))}
        </div>
      )}

      {!opened && (
        <div className="section-content relative z-10 flex flex-col items-center gap-5 w-full max-w-xs mx-auto px-5">
            <p className={`text-white/40 text-xs font-bold uppercase tracking-widest transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              Tem uma surpresa para você
            </p>

            <button onClick={open}
              className={`flex flex-col items-center gap-4 transition-all duration-700 active:scale-95 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: '0.2s', background: 'none', border: 'none', cursor: 'pointer' }}>

              <div style={{ position: 'relative', animation: visible ? 'giftShake 3s ease-in-out infinite 2s' : 'none' }}>
                {/* Aura pulsante */}
                <div style={{
                  position: 'absolute', inset: -28, borderRadius: '50%', pointerEvents: 'none',
                  background: 'radial-gradient(circle, rgba(var(--tc-rgb,201,24,74),0.28) 0%, transparent 70%)',
                  animation: 'softPulse 1.8s ease-in-out infinite',
                }} />

                <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                  {/* Tampa */}
                  <rect x="15" y="10" width="110" height="30" rx="6"
                    style={{ fill: 'rgba(var(--tc-rgb,201,24,74),0.15)', stroke: 'rgba(var(--tc-rgb,201,24,74),0.8)', strokeWidth: 2 }} />
                  {/* Fita da tampa */}
                  <rect x="62" y="10" width="16" height="30"
                    style={{ fill: 'rgba(var(--tc-rgb,201,24,74),0.3)' }} />
                  {/* Laço */}
                  <path d="M70 10 C60 2, 50 2, 55 10 S70 10 70 10 Z"
                    style={{ fill: 'rgba(var(--tc-rgb,201,24,74),0.7)' }} />
                  <path d="M70 10 C80 2, 90 2, 85 10 S70 10 70 10 Z"
                    style={{ fill: 'rgba(var(--tc-rgb,201,24,74),0.7)' }} />
                  {/* Corpo */}
                  <rect x="15" y="42" width="110" height="88" rx="6"
                    style={{ fill: 'rgba(var(--tc-rgb,201,24,74),0.1)', stroke: 'rgba(var(--tc-rgb,201,24,74),0.8)', strokeWidth: 2 }} />
                  {/* Fita vertical */}
                  <rect x="62" y="42" width="16" height="88"
                    style={{ fill: 'rgba(var(--tc-rgb,201,24,74),0.25)' }} />
                  {/* Fita horizontal */}
                  <rect x="15" y="82" width="110" height="16"
                    style={{ fill: 'rgba(var(--tc-rgb,201,24,74),0.25)' }} />
                  {/* Coração */}
                  <text x="70" y="98" textAnchor="middle" fontSize="24">❤️</text>
                </svg>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.45rem', color: 'white', fontWeight: 700, textShadow: '0 0 24px rgba(var(--tc-rgb,201,24,74),0.8)', lineHeight: 1.2 }}>
                  Toque para abrir ✨
                </p>
                <p className="text-white/30 text-xs mt-1">preparado especialmente para você</p>
              </div>
            </button>
        </div>
      )}

      {opened && (
        <div style={{ position: 'absolute', inset: 0 }}>

            {/* Confetti explodindo do centro da caixa */}
          {/* Confetti */}
          <div style={{ position: 'absolute', top: '35%', left: '50%', width: 0, height: 0, pointerEvents: 'none', zIndex: 30 }}>
            {confetti.map(p => (
              <div key={p.id} style={{
                position: 'absolute',
                width: p.size, height: p.size,
                background: p.color,
                borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '2px' : '0 50% 50% 50%',
                animation: `confettiExplode 1.3s cubic-bezier(0.25,0.46,0.45,0.94) ${p.delay}s both`,
                '--cx': `${p.x}px`,
                '--cy': `${p.y}px`,
                '--cr': `${p.rot}deg`,
              }} />
            ))}
          </div>

          {/* Sparkles */}
          <div style={{ position: 'absolute', top: '22%', left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0 16px', pointerEvents: 'none', zIndex: 30 }}>
              {['✨','⭐','💫','🌟','✨','💥','⭐'].map((s, i) => (
                <span key={i} style={{
                  position: 'absolute', fontSize: 16,
                  left: `${5 + i * 14}%`, top: `${10 + (i % 3) * 20}%`,
                  animation: `sparkleOut 0.9s ease both ${(i * 0.08).toFixed(2)}s`,
                  opacity: 0,
                }}>{s}</span>
              ))}
            </div>

          {/* Foto do casal como fundo */}
          {photoUrl ? (
            <img src={photoUrl} alt="surpresa"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                animation: 'fadeIn 0.9s ease both 0.2s', opacity: 0, animationFillMode: 'both',
              }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, #4A0020 0%, #0D0208 70%)' }} />
          )}

          {/* Overlay gradiente */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: photoUrl
              ? 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.25) 100%)'
              : 'rgba(0,0,0,0.2)',
          }} />

          {/* Mensagem sobre a foto */}
          {showContent && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '0 28px',
              animation: 'burstUp 0.8s cubic-bezier(0.34,1.56,0.64,1) both',
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                borderRadius: 28, padding: '28px 24px 24px',
                border: '1px solid rgba(255,255,255,0.14)',
                maxWidth: 320, width: '100%',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}>
                <div style={{ fontSize: 34, fontFamily: 'Georgia', color: 'var(--tc,#C9184A)', opacity: 0.6, lineHeight: 0.8, marginBottom: 8 }}>"</div>
                <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.25rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.95)', textAlign: 'center', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                  {words.map((w, i) => (
                    <span key={i} style={{ display: 'inline-block', animation: `fadeInUp 0.35s ease both ${(i * 0.035).toFixed(2)}s` }}>
                      {w}&nbsp;
                    </span>
                  ))}
                </p>
                <div style={{ fontSize: 34, fontFamily: 'Georgia', color: 'var(--tc,#C9184A)', opacity: 0.6, lineHeight: 0.8, textAlign: 'right', marginTop: 8 }}>"</div>
              </div>
              <div style={{ marginTop: 24, animation: 'heartbeat 2s ease-in-out infinite 1.2s' }}>
                <span style={{ fontSize: 32 }}>{'❤️'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <ScrollHint />
    </div>
  )
}

/* SECAO Premium — Carta de amor */
function SectionLoveLetter({ letter }) {
  const [ref, visible] = useInView(0.3)
  if (!letter?.description) return null

  const words = letter.description.split(' ')

  return (
    <div ref={ref} className="snap-section overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #2d0019 0%, #4A0020 50%, #0D0208 100%)' }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['💌','❤️','💕','✨','🌹'].map((e, i) => (
          <span key={i} className="local-particle"
            style={{ left: `${8 + i * 20}%`, bottom: 0, fontSize: `${10 + i * 2}px`, animationDuration: `${3.5 + i * 0.7}s`, animationDelay: `${i * 0.6}s` }}>
            {e}
          </span>
        ))}
      </div>

      <div className="section-content relative z-10 w-full max-w-xs mx-auto px-5 overflow-y-auto py-10" style={{ maxHeight: '100dvh' }}>

        <div className={`flex items-center gap-2 mb-6 flex-shrink-0 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right,transparent,#C9184A)' }} />
          <span className="text-lg">💌</span>
          <p className="text-love-400 text-xs font-bold uppercase tracking-widest">Carta de amor</p>
          <span className="text-lg">💌</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left,transparent,#C9184A)' }} />
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,24,74,0.2)' }}>
          <div className="text-love-700 text-4xl font-serif mb-1 opacity-50">"</div>
          <p className="text-white/75 text-sm leading-relaxed" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            {words.map((word, i) => (
              <span key={i} className="inline-block transition-all duration-300"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(8px)',
                  transitionDelay: `${0.2 + i * 0.03}s`,
                }}>
                {word}&nbsp;
              </span>
            ))}
          </p>
          <div className="text-love-700 text-4xl font-serif text-right mt-1 opacity-50">"</div>
        </div>

        <div className={`flex items-center justify-center gap-2 mt-5 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: `${0.2 + words.length * 0.03 + 0.3}s` }}>
          <div className="h-px w-12" style={{ background: 'linear-gradient(to right,transparent,rgba(201,24,74,0.5))' }} />
          <span className="text-xl" style={{ animation: 'heartGlow 2s ease-in-out infinite' }}>❤️</span>
          <div className="h-px w-12" style={{ background: 'linear-gradient(to left,transparent,rgba(201,24,74,0.5))' }} />
        </div>
      </div>
    </div>
  )
}

/* SECAO 6 — Compartilhar com card Stories completo */
function MusicSticker({ trackInfo, dark = true }) {
  if (!trackInfo) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.07)',
      borderRadius: 20, padding: '4px 10px 4px 4px',
      border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
      maxWidth: '100%',
    }}>
      {trackInfo.albumArt
        ? <img src={trackInfo.albumArt} alt="" style={{ width: 24, height: 24, borderRadius: 5, flexShrink: 0, objectFit: 'cover', display: 'block' }} />
        : <span style={{ fontSize: 14, flexShrink: 0 }}>🎵</span>
      }
      <div style={{ overflow: 'hidden', minWidth: 0 }}>
        <p style={{ fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: dark ? 'rgba(255,255,255,0.9)' : '#1a0010' }}>
          {trackInfo.name}
        </p>
        <p style={{ fontSize: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)', marginTop: 1 }}>
          {trackInfo.artist}
        </p>
      </div>
    </div>
  )
}

function SectionShare({ couple, partners, time, qr, pageUrl, firstPhoto, musicUrl }) {
  const [ref, visible]       = useInView()
  const cardRef              = useRef(null)
  const [copied,      setCopied]      = useState(false)
  const [template,    setTemplate]    = useState('romantic')
  const [downloading, setDownloading] = useState(false)
  const [trackInfo,   setTrackInfo]   = useState(null)

  const names        = partners.map(p => p.name).filter(Boolean)
  const displayTitle = names.length >= 2 ? `${names[0]} & ${names[1]}` : couple.slug
  const totalHours   = time ? time.totalDays * 24 + time.hours   : 0
  const totalMinutes = time ? totalHours * 60 + time.minutes      : 0
  const spotifyId    = extractSpotifyId(musicUrl)

  useEffect(() => {
    if (!spotifyId) return
    fetch(`/api/spotify-track?id=${spotifyId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setTrackInfo(d) })
      .catch(() => {})
  }, [spotifyId])

  function copy() { navigator.clipboard.writeText(pageUrl); setCopied(true); setTimeout(() => setCopied(false), 2500) }
  function share() { if (navigator.share) { navigator.share({ title: `${displayTitle} — SoftLovely`, text: 'Veja nossa página especial! ❤️', url: pageUrl }) } else copy() }
  function downloadQr() {
    if (!qr) return
    const a = document.createElement('a'); a.href = qr
    a.download = `qrcode-${couple.slug || displayTitle.replace(/\s/g, '-')}.png`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  async function shareCard() {
    if (downloading) return
    setDownloading(true)
    try {
      await document.fonts.ready
      const W = 1080, H = 1920
      const canvas = document.createElement('canvas')
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext('2d')

      /* Lê tema */
      const cs  = document.querySelector('.snap-container')
      const tcr = getComputedStyle(cs || document.body).getPropertyValue('--tc-rgb').trim() || '201,24,74'
      const [cr, cg, cb] = tcr.split(',').map(Number)
      const tc  = `rgb(${cr},${cg},${cb})`
      const tcA = (a) => `rgba(${cr},${cg},${cb},${a})`

      /* Carrega capa do álbum */
      let albumImg = null
      if (trackInfo?.albumArt) {
        albumImg = new Image(); albumImg.crossOrigin = 'anonymous'
        await new Promise(res => { albumImg.onload = res; albumImg.onerror = res; albumImg.src = trackInfo.albumArt }).catch(() => {})
        if (!albumImg?.naturalWidth) albumImg = null
      }

      /* Helper: desenha bloco de música (capa + nome + artista) centralizado */
      function drawMusic(centerY, textColor, subColor) {
        if (!trackInfo) return
        const artSize = 96, gap = 22
        const nameStr = trackInfo.name.slice(0, 24)
        const artistStr = trackInfo.artist.slice(0, 26)
        ctx.textAlign = 'center'
        if (albumImg) {
          const blockW = artSize + gap + 480
          const startX = (W - blockW) / 2
          ctx.save()
          if (ctx.roundRect) {
            ctx.beginPath(); ctx.roundRect(startX, centerY - artSize / 2, artSize, artSize, 10); ctx.clip()
          } else {
            ctx.beginPath(); ctx.rect(startX, centerY - artSize / 2, artSize, artSize); ctx.clip()
          }
          ctx.drawImage(albumImg, startX, centerY - artSize / 2, artSize, artSize)
          ctx.restore()
          const tx = startX + artSize + gap
          ctx.textAlign = 'left'
          ctx.fillStyle = textColor; ctx.font = 'bold 48px Montserrat,sans-serif'
          ctx.fillText(nameStr, tx, centerY - 4)
          ctx.fillStyle = subColor; ctx.font = '400 36px Montserrat,sans-serif'
          ctx.fillText(artistStr, tx, centerY + 44)
          ctx.textAlign = 'center'
        } else {
          ctx.fillStyle = textColor; ctx.font = 'bold 46px Montserrat,sans-serif'
          ctx.fillText(`♪  ${nameStr}`, W / 2, centerY)
          ctx.fillStyle = subColor; ctx.font = '400 36px Montserrat,sans-serif'
          ctx.fillText(artistStr, W / 2, centerY + 52)
        }
      }

      if (template === 'minimalist') {
        /* ── MINIMALISTA ── */
        ctx.fillStyle = '#FAFAFA'; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = tc; ctx.fillRect(0, 0, W, 18)
        ctx.fillStyle = '#1a0010'; ctx.font = `900 ${displayTitle.length > 16 ? 80 : 100}px Montserrat,sans-serif`
        ctx.textAlign = 'center'; ctx.fillText(displayTitle, W/2, 820)
        ctx.strokeStyle = tcA(0.4); ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(W*0.25,880); ctx.lineTo(W*0.75,880); ctx.stroke()
        ctx.fillStyle = '#1a0010'; ctx.font = '900 220px Montserrat,sans-serif'
        ctx.fillText(time?.totalDays?.toLocaleString('pt-BR') ?? '0', W/2, 1120)
        ctx.fillStyle = tc; ctx.font = 'bold 58px Montserrat,sans-serif'
        ctx.fillText('DIAS JUNTOS', W/2, 1210)
        if (dateStr) { ctx.fillStyle = '#aaa'; ctx.font = '400 40px Montserrat,sans-serif'; ctx.fillText(`desde ${dateStr}`, W/2, 1320) }
        if (trackInfo) drawMusic(1490, '#333', '#888')
        ctx.fillStyle = '#ddd'; ctx.font = 'bold 34px Montserrat,sans-serif'; ctx.fillText('softlovely.com', W/2, H - 100)

      } else if (template === 'polaroid') {
        /* ── POLAROID ── */
        /* carrega foto */
        let pImg = null
        if (firstPhoto) {
          pImg = new Image(); pImg.crossOrigin = 'anonymous'
          await new Promise(res => { pImg.onload = res; pImg.onerror = res; pImg.src = firstPhoto }).catch(() => {})
          if (!pImg.naturalWidth) pImg = null
        }

        /* fundo rosado */
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
        bgGrad.addColorStop(0, '#f0e6ea'); bgGrad.addColorStop(1, '#fce4ec')
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H)

        /* moldura polaroid centrada */
        const frameW = W * 0.78
        const framePad = 44
        const frameBot = 200
        const photoSide = frameW - framePad * 2
        const frameH = framePad + photoSide + frameBot
        const frameX = (W - frameW) / 2
        const frameY = H * 0.06

        /* sombra da moldura */
        ctx.save()
        ctx.shadowColor = 'rgba(0,0,0,0.28)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 24
        ctx.fillStyle = 'white'; ctx.fillRect(frameX, frameY, frameW, frameH)
        ctx.restore()

        /* foto dentro da moldura */
        const photoX = frameX + framePad
        const photoY = frameY + framePad
        ctx.save(); ctx.beginPath(); ctx.rect(photoX, photoY, photoSide, photoSide); ctx.clip()
        if (pImg) {
          const scale = Math.max(photoSide / pImg.naturalWidth, photoSide / pImg.naturalHeight)
          const dw = pImg.naturalWidth * scale, dh = pImg.naturalHeight * scale
          ctx.drawImage(pImg, photoX + (photoSide - dw) / 2, photoY + (photoSide - dh) / 2, dw, dh)
        } else {
          const pGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoSide)
          pGrad.addColorStop(0, '#f5e0e0'); pGrad.addColorStop(1, '#ffe4ec')
          ctx.fillStyle = pGrad; ctx.fillRect(photoX, photoY, photoSide, photoSide)
          ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '220px sans-serif'; ctx.textAlign = 'center'
          ctx.fillText('❤️', W/2, photoY + photoSide * 0.6)
        }
        ctx.restore()

        /* legenda dentro da moldura */
        ctx.fillStyle = '#3a1a1a'
        ctx.font = `700 italic ${displayTitle.length > 16 ? 62 : 78}px Georgia,serif`
        ctx.textAlign = 'center'
        ctx.fillText(displayTitle, W/2, frameY + framePad + photoSide + frameBot * 0.52)

        /* info abaixo da moldura */
        const belowY = frameY + frameH + 80
        if (dateStr) { ctx.fillStyle = '#8b5e6e'; ctx.font = '400 40px Georgia,serif'; ctx.fillText(dateStr, W/2, belowY) }
        ctx.fillStyle = '#7a4040'; ctx.font = 'italic 400 48px Georgia,serif'
        ctx.fillText(`❤  ${time?.totalDays?.toLocaleString('pt-BR') ?? '0'} dias juntos`, W/2, belowY + 74)
        if (trackInfo) drawMusic(belowY + 168, '#7a4040', '#b08080')
        ctx.fillStyle = '#d0b0b0'; ctx.font = '400 32px Georgia,serif'; ctx.fillText('SoftLovely.com', W/2, H - 80)

      } else {
        /* ── ROMÂNTICO (padrão) ── */
        const grad = ctx.createLinearGradient(0, 0, 0, H)
        grad.addColorStop(0, '#0D0208'); grad.addColorStop(0.4, tcA(0.85)); grad.addColorStop(1, '#0D0208')
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
        /* Branding */
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = 'bold 40px Montserrat,sans-serif'; ctx.textAlign = 'left'
        ctx.fillText('❤  SoftLovely', 80, 130)
        if (dateStr) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '400 36px Montserrat,sans-serif'; ctx.textAlign = 'right'; ctx.fillText(dateStr, W - 80, 130) }
        /* Coração */
        ctx.font = '280px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('❤️', W/2, 640)
        /* Nomes */
        ctx.fillStyle = 'white'; ctx.font = `900 ${displayTitle.length > 16 ? 78 : 96}px Montserrat,sans-serif`
        ctx.fillText(displayTitle, W/2, 810)
        /* Linha */
        ctx.strokeStyle = tcA(0.55); ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(W*0.2, 870); ctx.lineTo(W*0.8, 870); ctx.stroke()
        /* Dias */
        ctx.fillStyle = 'white'; ctx.font = '900 210px Montserrat,sans-serif'
        ctx.fillText(time?.totalDays?.toLocaleString('pt-BR') ?? '0', W/2, 1095)
        ctx.fillStyle = tc; ctx.font = 'bold 58px Montserrat,sans-serif'; ctx.fillText('DIAS JUNTOS', W/2, 1180)
        /* Horas / minutos */
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '400 40px Montserrat,sans-serif'
        ctx.fillText(`${totalHours.toLocaleString('pt-BR')} horas  ·  ${totalMinutes.toLocaleString('pt-BR')} minutos`, W/2, 1270)
        /* Música */
        if (trackInfo) drawMusic(1450, 'rgba(255,255,255,0.82)', 'rgba(255,255,255,0.38)')
        /* Footer */
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.font = 'bold 36px Montserrat,sans-serif'; ctx.fillText('softlovely.com', W/2, H - 100)
      }

      /* Converte para blob e compartilha */
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
      const file = new File([blob], `${displayTitle.replace(/\s+/g,'-')}-stories.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: displayTitle })
      } else if (navigator.share) {
        await navigator.share({ title: displayTitle, text: 'Veja nossa página especial! ❤️', url: pageUrl })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = file.name
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        try { await navigator.share({ title: displayTitle, url: pageUrl }) } catch {}
      }
    } finally { setDownloading(false) }
  }

  const TEMPLATES = [
    { id: 'romantic',   label: '🌹 Romântico'   },
    { id: 'minimalist', label: '⬜ Minimalista'  },
    { id: 'polaroid',   label: '📷 Polaroid'     },
  ]

  const dateStr = couple.anniversaryDate
    ? parseLocalDate(couple.anniversaryDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  /* ── Conteúdo dos 3 templates ── */
  const cardContent = {

    romantic: (
      <>
        <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(160deg,#0D0208,#4A0020)' }}>
          {firstPhoto && <><img src={firstPhoto} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.22 }} /><div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(13,2,8,0.55) 0%,rgba(74,0,32,0.80) 55%,rgba(13,2,8,0.95) 100%)' }} /></>}
        </div>
        <div className="relative z-10 h-full flex flex-col px-4 py-4" style={{ gap: 0 }}>

          {/* Topo */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1"><span style={{ fontSize: 12 }}>❤️</span><span className="text-white/50 font-black tracking-widest uppercase" style={{ fontSize: 9 }}>SoftLovely</span></div>
            {couple.anniversaryDate && <span className="text-white/30" style={{ fontSize: 9 }}>{parseLocalDate(couple.anniversaryDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
          </div>

          <div className="h-px mb-3" style={{ background: 'linear-gradient(to right,transparent,rgba(var(--tc-rgb,201,24,74),0.5),transparent)' }} />

          {/* Foto + nome */}
          <div className="flex flex-col items-center mb-3" style={{ gap: 6 }}>
            <HeartPhoto src={firstPhoto} alt={displayTitle} size={80} />
            <p className="font-black text-white text-center leading-tight" style={{ fontSize: 13, textShadow: '0 0 16px rgba(var(--tc-rgb,201,24,74),0.5)' }}>{displayTitle}</p>
          </div>

          {/* Stats */}
          {time && (
            <div className="rounded-xl mb-2" style={{ background: 'rgba(var(--tc-rgb,201,24,74),0.14)', border: '1px solid rgba(var(--tc-rgb,201,24,74),0.28)', padding: '8px 10px' }}>
              <div className="text-center mb-1.5">
                <p className="font-black text-white leading-none" style={{ fontSize: 28, textShadow: '0 0 20px rgba(255,77,122,0.6)' }}>{time.totalDays.toLocaleString('pt-BR')}</p>
                <p className="font-bold uppercase tracking-wider" style={{ fontSize: 8, color: 'var(--tc,#FF8FA3)' }}>{time.totalDays === 1 ? 'dia juntos' : 'dias juntos'}</p>
              </div>
              <div className="grid grid-cols-2 pt-1.5" style={{ gap: 6, borderTop: '1px solid rgba(var(--tc-rgb,201,24,74),0.2)' }}>
                {[{ val: totalHours.toLocaleString('pt-BR'), label: 'horas' }, { val: totalMinutes.toLocaleString('pt-BR'), label: 'minutos' }].map(({ val, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-black text-white tabular-nums" style={{ fontSize: 11 }}>{val}</p>
                    <p className="text-white/30" style={{ fontSize: 8 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Música */}
          {trackInfo && <div className="mb-2"><MusicSticker trackInfo={trackInfo} dark /></div>}

          <div className="h-px mb-2" style={{ background: 'linear-gradient(to right,transparent,rgba(255,255,255,0.1),transparent)' }} />

          {/* Rodapé */}
          <div className="flex items-center justify-between mt-auto">
            {qr ? <div className="bg-white rounded-lg" style={{ padding: 3 }}><img src={qr} crossOrigin="anonymous" alt="QR" style={{ width: 38, height: 38 }} /></div> : <div />}
            <div className="text-right">
              <p className="text-white/20 font-black tracking-wider" style={{ fontSize: 8 }}>SoftLovely.com</p>
              <p className="text-white/15" style={{ fontSize: 7, marginTop: 2 }}>escaneie para abrir ❤️</p>
            </div>
          </div>
        </div>
      </>
    ),

    minimalist: (
      <div className="h-full flex flex-col px-6 py-7" style={{ background: '#FAFAFA' }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#aaa', marginBottom: 4 }}>SoftLovely</p>
        <div style={{ height: 1, background: 'linear-gradient(to right, var(--tc,#C9184A), transparent)', marginBottom: 20 }} />
        <p style={{ fontWeight: 900, fontSize: 22, color: '#1a0010', lineHeight: 1.2, textAlign: 'center', marginBottom: 6 }}>{displayTitle}</p>
        {dateStr && <p style={{ fontSize: 10, color: '#999', textAlign: 'center', marginBottom: 20 }}>juntos desde {dateStr}</p>}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <p style={{ fontWeight: 900, fontSize: 56, color: '#1a0010', lineHeight: 1, textAlign: 'center' }}>{time?.totalDays?.toLocaleString('pt-BR') ?? '—'}</p>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--tc,#C9184A)' }}>dias juntos</p>
          <div style={{ height: 1, width: 60, background: 'var(--tc,#C9184A)', opacity: 0.3, margin: '8px 0' }} />
          <p style={{ fontSize: 10, color: '#bbb', textAlign: 'center' }}>{totalHours.toLocaleString('pt-BR')} horas · {totalMinutes.toLocaleString('pt-BR')} minutos</p>
        </div>
        {trackInfo && <div style={{ marginBottom: 12 }}><MusicSticker trackInfo={trackInfo} dark={false} /></div>}
        <div style={{ height: 1, background: '#eee', margin: '8px 0 12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {qr ? <img src={qr} crossOrigin="anonymous" alt="QR" style={{ width: 44, height: 44, borderRadius: 8 }} /> : <div />}
          <p style={{ fontSize: 9, color: '#ccc', fontWeight: 700, letterSpacing: '0.1em' }}>softlovely.com</p>
        </div>
      </div>
    ),

    polaroid: (
      <div className="h-full flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #f0e6ea 0%, #fce4ec 100%)', padding: '16px 16px 20px' }}>
        {/* Moldura polaroid: padding igual nos 3 lados + maior embaixo */}
        <div style={{
          background: 'white',
          padding: '10px 10px 0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.1)',
          width: '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Foto dentro da moldura */}
          <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: '#f5e0e6', display: 'block' }}>
            {firstPhoto
              ? <img src={firstPhoto} crossOrigin="anonymous" alt="casal" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>❤️</div>
            }
          </div>
          {/* Área branca inferior (legenda dentro da moldura) */}
          <div style={{ height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 12, color: '#3a1a1a', textAlign: 'center', lineHeight: 1.2 }}>{displayTitle}</p>
          </div>
        </div>
        {/* Info abaixo da moldura */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 10 }}>
          <p style={{ fontSize: 8, color: '#8b5e6e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{dateStr ?? ''}</p>
          {time && <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 9, color: '#7a4040', textAlign: 'center' }}>❤ {time.totalDays.toLocaleString('pt-BR')} dias juntos</p>}
          {trackInfo && <MusicSticker trackInfo={trackInfo} dark={false} />}
          <p style={{ fontSize: 7, color: '#b08090', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>SoftLovely.com</p>
        </div>
      </div>
    ),
  }

  return (
    <div ref={ref} className="snap-section px-4 overflow-y-auto"
      style={{ background: `linear-gradient(160deg, #1a0010 0%, rgba(var(--tc-rgb,74,0,32), 0.9) 60%, #7B0033 100%)` }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['❤️','✨','🌹','💖','💋'].map((e, i) => (
          <span key={i} className="local-particle"
            style={{ left: `${8 + i * 20}%`, bottom: 0, fontSize: `${9 + (i % 3) * 3}px`, animationDuration: `${5 + i * 0.7}s`, animationDelay: `${i * 0.5}s` }}>
            {e}
          </span>
        ))}
      </div>

      <div className="section-content-lg relative z-10 w-full max-w-sm mx-auto flex flex-col items-center gap-3 py-8">

        <p className={`text-white/50 text-xs font-bold uppercase tracking-widest transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          Compartilhe nos Stories
        </p>

        {/* Seletor de template */}
        <div className={`flex gap-2 w-full transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '0.1s' }}>
          {TEMPLATES.map(t => (
            <button key={t.id} type="button" onClick={() => setTemplate(t.id)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{
                background: template === t.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                border:     template === t.id ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                color:      template === t.id ? 'white' : 'rgba(255,255,255,0.4)',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Card com ref para captura */}
        <div ref={cardRef}
          className={`stories-card transition-all duration-700 overflow-hidden ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} ${template === 'romantic' ? 'animate-glow' : ''}`}
          style={{ transitionDelay: '0.15s', borderRadius: template === 'polaroid' ? '4px' : '24px' }}>
          {cardContent[template]}
        </div>

        {/* Botão principal — gera imagem e abre Stories */}
        <button onClick={shareCard} disabled={downloading}
          className={`w-full py-4 rounded-xl font-black text-white text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '0.3s', background: 'linear-gradient(135deg,var(--tc,#C9184A),rgba(var(--tc-rgb,201,24,74),0.7))', boxShadow: '0 8px 24px rgba(var(--tc-rgb,201,24,74),0.4)' }}>
          {downloading
            ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> gerando imagem...</>
            : '📲 Compartilhar nos Stories'}
        </button>

        {/* Botão secundário — copiar link */}
        <button onClick={copy}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${visible ? 'opacity-100' : 'opacity-0'} ${copied ? 'bg-green-500 text-white' : ''}`}
          style={{ transitionDelay: '0.4s', background: copied ? '' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: copied ? 'white' : 'rgba(255,255,255,0.7)' }}>
          {copied ? '✅ Link copiado!' : '🔗 Copiar link da página'}
        </button>

        {qr && (
          <button onClick={downloadQr}
            className={`w-full py-3 rounded-xl font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '0.5s', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
            📥 Baixar QR Code
          </button>
        )}

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


  const loveLetter      = events.find(e => e.category === 'love_letter')
  const timelineEvents  = events.filter(e => e.category === 'timeline').sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0))
  const coverPhotoEvent = events.find(e => e.category === 'cover_photo')
  const surpriseEvent   = events.find(e => e.category === 'surprise_box')

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

  const themeColor = couple.themeColor || '#C9184A'
  const themeRgb   = hexToRgb(themeColor)

  return (
    <div className="snap-container font-sans" style={{ '--tc': themeColor, '--tc-rgb': themeRgb }}>

      {/* SECAO 1: Abertura */}
      <SectionOpening couple={couple} partners={partners} time={time}
        coverPhoto={coverPhotoEvent ? (coverPhotoEvent.imageUrl?.startsWith('http') ? coverPhotoEvent.imageUrl : `${API_BASE}${coverPhotoEvent.imageUrl}`) : null} />

      {/* SECAO 2: Coração animado */}
      <SectionHeart coupleName={coupleName} />

      {/* SECAO 2b: Música especial — logo após o coração */}
      {couple.musicUrl && <SectionMusicMemory musicUrl={couple.musicUrl} />}

      {/* SECAO 3: Contador */}
      {time && <SectionCounter time={time} />}

      {/* SECAO 3c: Contagem regressiva para o próximo aniversário */}
      {couple.anniversaryDate && <SectionAnniversaryCountdown anniversaryDate={couple.anniversaryDate} />}

      {/* SECAO Premium: Conquistas */}
      {time && <SectionAchievements time={time} />}

      {/* SECAO 4: Foto do casal com animação */}
      <SectionCouplePhoto events={events} coupleName={coupleName} couple={couple} />

      {/* SECAO 4c: Polaroid */}
      <SectionPolaroid events={events} />

      {/* SECAO Premium: Memória aleatória */}
      <SectionRandomMemory events={events} />

      {/* SECAO Premium: Timeline de momentos */}
      {timelineEvents.length > 0 && <SectionTimeline events={timelineEvents} />}

      {/* SECAO Premium: Carta de amor */}
      {loveLetter && <SectionLoveLetter letter={loveLetter} />}

      {/* SECAO Premium: Caixa surpresa */}
      {surpriseEvent && <SectionSurpriseBox event={surpriseEvent} />}

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
        musicUrl={couple.musicUrl}
      />

    </div>
  )
}
