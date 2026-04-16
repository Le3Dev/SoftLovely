import { useEffect, useRef, useState } from 'react'

/* pontos paramétricos do coração */
function buildHeartTargets(n, scale, cx, cy) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const x =  16 * Math.pow(Math.sin(t), 3)
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    pts.push({ x: cx + x * scale, y: cy + y * scale })
  }
  return pts
}

/* embaralha array (Fisher-Yates) para ordem aleatória de aparecimento */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function HeartDotsAnimation({ coupleName = '' }) {
  const canvasRef  = useRef(null)
  const stateRef   = useRef({ dots: [], raf: null, done: false, started: false, beginTime: 0 })
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    /* ─── inicializa / reinicializa ─────────────────── */
    function init() {
      cancelAnimationFrame(stateRef.current.raf)

      /* tamanho real em pixels físicos (nítido em retina / OLED) */
      const dpr = window.devicePixelRatio || 1
      const W   = canvas.offsetWidth  || window.innerWidth
      const H   = canvas.offsetHeight || window.innerHeight

      canvas.width  = W * dpr
      canvas.height = H * dpr
      ctx.scale(dpr, dpr)

      /* quantidade responsiva: menos pontos = mais leve no mobile */
      const N     = W < 420 ? 160 : W < 768 ? 200 : 240
      const scale = Math.min(W, H) / 56
      const cx    = W / 2
      const cy    = H / 2 + (H < 600 ? 10 : 20) /* leve offset vertical */

      const targets = buildHeartTargets(N, scale, cx, cy)

      /* ordem de aparecimento aleatória → efeito mais orgânico */
      const order = shuffle(Array.from({ length: N }, (_, i) => i))

      /*
       * STAGGER: cada ponto começa a se mover num tempo diferente.
       * Total de stagger = 7 s  →  cada ponto tem delay = index * (7000 / N) ms
       * Depois que começa, o spring leva ~2-3 s para convergir.
       * Resultado total: ~9-10 s para o coração ficar completo.
       */
      const TOTAL_STAGGER_MS = 7000

      stateRef.current.dots = targets.map((t, i) => {
        /* posição inicial: nuvem espalhada ao redor do centro */
        const angle  = Math.random() * Math.PI * 2
        const radius = (0.3 + Math.random() * 0.55) * Math.min(W, H)
        return {
          x:  cx + Math.cos(angle) * radius,
          y:  cy + Math.sin(angle) * radius,
          tx: t.x,
          ty: t.y,
          vx: 0,
          vy: 0,
          r:  (W < 420 ? 2.2 : 2.6) + Math.random() * 1.6,
          done:   false,
          active: false,
          delay:  order[i] * (TOTAL_STAGGER_MS / N), /* ms */
        }
      })

      stateRef.current.done    = false
      stateRef.current.started = false
      setComplete(false)
    }

    /* ─── desenha estado final estático ────────────── */
    function drawFinal() {
      const dpr = window.devicePixelRatio || 1
      const W   = canvas.width  / dpr
      const H   = canvas.height / dpr
      ctx.clearRect(0, 0, W, H)
      stateRef.current.dots.forEach(dot => {
        ctx.beginPath()
        ctx.arc(dot.tx, dot.ty, dot.r, 0, Math.PI * 2)
        ctx.fillStyle  = '#C9184A'
        ctx.shadowColor = 'rgba(201,24,74,0.9)'
        ctx.shadowBlur  = 14
        ctx.fill()
        ctx.shadowBlur = 0
      })
    }

    /* ─── loop de animação ──────────────────────────── */
    function draw(timestamp) {
      const dpr     = window.devicePixelRatio || 1
      const W       = canvas.width  / dpr
      const H       = canvas.height / dpr
      const elapsed = timestamp - stateRef.current.beginTime

      ctx.clearRect(0, 0, W, H)

      const dots   = stateRef.current.dots
      let allDone  = true

      dots.forEach(dot => {
        /* ativa o ponto quando chega o seu momento */
        if (!dot.active) {
          if (elapsed >= dot.delay) {
            dot.active = true
          } else {
            allDone = false
            return /* ponto ainda "dormindo" — não desenha */
          }
        }

        if (!dot.done) {
          allDone = false
          const dx   = dot.tx - dot.x
          const dy   = dot.ty - dot.y
          const dist = Math.hypot(dx, dy)

          if (dist < 1.2) {
            dot.x    = dot.tx
            dot.y    = dot.ty
            dot.vx   = 0
            dot.vy   = 0
            dot.done = true
          } else {
            /*
             * Spring suave e lento:
             *  - amortecimento 0.96  → energia dissipada devagar
             *  - atração 0.009       → força de atração fraca
             * Resultado: ~2-3 s para cada ponto convergir após ativar.
             */
            dot.vx = dot.vx * 0.96 + dx * 0.009
            dot.vy = dot.vy * 0.96 + dy * 0.009
            dot.x += dot.vx
            dot.y += dot.vy
          }
        }

        /* cor: transição branca → rosa conforme aproxima */
        const dx  = dot.tx - dot.x
        const dy  = dot.ty - dot.y
        const d   = Math.hypot(dx, dy)
        const pct = dot.done ? 1 : Math.max(0, 1 - d / (Math.min(W, H) * 0.55))

        const alpha = 0.15 + pct * 0.85
        const r     = Math.round(201)
        const g     = Math.round(24  + (1 - pct) * 100)
        const b     = Math.round(74  + (1 - pct) * 120)

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
        if (dot.done) {
          ctx.fillStyle   = '#C9184A'
          ctx.shadowColor = 'rgba(201,24,74,0.85)'
          ctx.shadowBlur  = 12
        } else {
          ctx.fillStyle  = `rgba(${r},${g},${b},${alpha.toFixed(2)})`
          ctx.shadowBlur = 0
        }
        ctx.fill()
        ctx.shadowBlur = 0
      })

      if (allDone && !stateRef.current.done) {
        stateRef.current.done = true
        setComplete(true)
        return /* para o loop após coração completo */
      }

      stateRef.current.raf = requestAnimationFrame(draw)
    }

    /* ─── inicia animação ───────────────────────────── */
    function start() {
      if (stateRef.current.started) return
      stateRef.current.started   = true
      /* delay curto antes de começar: dá tempo do scroll snap estabilizar */
      setTimeout(() => {
        stateRef.current.beginTime = performance.now()
        stateRef.current.raf = requestAnimationFrame(draw)
      }, 300)
    }

    init()

    /* ─── IntersectionObserver: inicia quando entra na tela ─ */
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      if (stateRef.current.done) drawFinal()
      else                       start()
    }, { threshold: 0.1 })
    observer.observe(canvas)

    /* ─── ResizeObserver: responsivo no mobile ───────── */
    const resizeObs = new ResizeObserver(() => {
      const wasStarted = stateRef.current.started
      init()
      if (wasStarted) start()
    })
    resizeObs.observe(canvas.parentElement || canvas)

    return () => {
      observer.disconnect()
      resizeObs.disconnect()
      cancelAnimationFrame(stateRef.current.raf)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" style={{ touchAction: 'none' }} />

      {complete && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
          <p
            className="font-black text-center animate-fadeInScale"
            style={{
              fontSize: 'clamp(1.6rem, 8vw, 3.5rem)',
              color: '#C9184A',
              textShadow: '0 0 40px rgba(201,24,74,0.9), 0 0 80px rgba(201,24,74,0.5)',
              animationDuration: '1.2s',
              lineHeight: 1.15,
            }}
          >
            {coupleName || '❤️'}
          </p>
        </div>
      )}
    </div>
  )
}
