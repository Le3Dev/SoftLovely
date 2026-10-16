import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { HEART_PATH } from '../../lib/scrollMotion'

/* ══════════════════════════════════════════════════
   "ESCREVA VOCÊS NAS ESTRELAS" — milhares de estrelas
   giram numa galáxia, se juntam escrevendo os nomes
   (da esquerda para a direita) e depois desenham um
   coração em volta deles. Cada estrela é uma mola: um
   toque espalha tudo e elas voltam sozinhas.
══════════════════════════════════════════════════ */

const FONT = '"Dancing Script", cursive'
const PALETTE = [['#FFFFFF', 0.3], ['#FFB3C1', 0.35], ['#FF4D7A', 0.22], ['#FFD6A5', 0.13]]
const HEART_HOLD_MS = 3600

function pickColor() {
  let r = Math.random()
  for (const [c, w] of PALETTE) { if ((r -= w) <= 0) return c }
  return '#FFFFFF'
}

/* desenha "Nome ♥ Nome" num canvas 2D e devolve os pixels acesos como pontos */
async function sampleNames(n1, n2, stacked, budget) {
  try { await document.fonts.load(`700 150px ${FONT}`) } catch {}
  const size = 150
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.font = `700 ${size}px ${FONT}`
  const w1 = ctx.measureText(n1).width
  const w2 = ctx.measureText(n2).width
  const hs = size * 0.55, gap = size * 0.22, pad = 30, lineH = size * 1.1
  const W = stacked ? Math.max(w1, w2, hs) + pad * 2 : w1 + w2 + hs + gap * 2 + pad * 2
  const H = stacked ? lineH * 2 + hs + gap * 2 + pad * 2 : lineH + pad * 2
  c.width = Math.ceil(W)
  c.height = Math.ceil(H)

  ctx.font = `700 ${size}px ${FONT}`
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'
  const heart = (cx, cy) => {
    const k = hs / 20
    ctx.save()
    ctx.translate(cx - 12 * k, cy - 12 * k)
    ctx.scale(k, k)
    ctx.fill(new Path2D(HEART_PATH))
    ctx.restore()
  }
  if (stacked) {
    ctx.textAlign = 'center'
    let y = pad + lineH / 2
    ctx.fillText(n1, W / 2, y)
    y += lineH / 2 + gap + hs / 2
    heart(W / 2, y)
    y += hs / 2 + gap + lineH / 2
    ctx.fillText(n2, W / 2, y)
  } else {
    ctx.textAlign = 'left'
    let x = pad
    ctx.fillText(n1, x, H / 2)
    x += w1 + gap
    heart(x + hs / 2, H / 2)
    x += hs + gap
    ctx.fillText(n2, x, H / 2)
  }

  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height)
  let filled = 0
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) filled++
  const step = Math.max(1, Math.round(Math.sqrt(filled / (budget * 1.2))))
  const pts = []
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 128) pts.push(x - width / 2, height / 2 - y)
    }
  }
  return { pts, w: width, h: height, step }
}

function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]] }
  return a
}

/* coloca as estrelas [from, to) sobre o texto amostrado, dentro da caixa pedida;
   o atraso varre da esquerda para a direita, como se escrevesse */
function placeText(sample, out, delays, from, to, { cx, cy, maxW, maxH, delay0, sweep }) {
  const m = sample.pts.length / 2
  if (!m) return
  const s = Math.min(maxW / sample.w, maxH / sample.h)
  const order = shuffled(m)
  const halfW = (sample.w / 2) * s
  for (let i = from; i < to; i++) {
    const k = i - from
    const j = order[k % m]
    const jit = k >= m ? sample.step * s : 0
    const x = sample.pts[j * 2] * s + cx + (Math.random() - 0.5) * jit
    const y = sample.pts[j * 2 + 1] * s + cy + (Math.random() - 0.5) * jit
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.3
    delays[i] = delay0 + ((x - cx + halfW) / (2 * halfW || 1)) * sweep + Math.random() * 0.25
  }
}

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale * (38.0 / -mv.z);
    vColor = aColor;
    vAlpha = 0.65 + 0.35 * sin(uTime * 2.5 + aSize * 37.0 + position.x * 3.0);
  }
`
const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = exp(-dot(c, c) * 18.0);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`

function Swarm({ count, names, active, burstKey }) {
  const size = useThree(s => s.size)
  const viewport = useThree(s => s.viewport)
  const dpr = useThree(s => s.viewport.dpr)
  const clock = useThree(s => s.clock)
  const groupRef = useRef()

  const S = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new THREE.Color()
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const st = {
      pos, vel: new Float32Array(count * 3),
      cur: new Float32Array(count * 3), nxt: new Float32Array(count * 3),
      release: new Float32Array(count).fill(Infinity),
      onGal: new Uint8Array(count).fill(1), nxtGal: new Uint8Array(count),
      stiff: new Float32Array(count), damp: new Float32Array(count),
      gr: new Float32Array(count), ga: new Float32Array(count), gh: new Float32Array(count),
      ph: new Float32Array(count),
    }
    for (let i = 0; i < count; i++) {
      const k = 7 + Math.random() * 14
      st.stiff[i] = k
      st.damp[i] = 2 * Math.sqrt(k) * 0.62 /* um pouco abaixo do crítico: chega com um leve "quique" */
      const r = Math.pow(Math.random(), 0.8)
      st.gr[i] = r
      st.ga[i] = (i % 3) * 2.094 + r * 3.4 + (Math.random() - 0.5) * 0.7 * (1 - r * 0.4)
      st.gh[i] = (Math.random() - 0.5) * 0.18 * (1.2 - r)
      st.ph[i] = Math.random() * Math.PI * 2
      const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1), d = 6 + Math.random() * 6
      pos[i * 3] = d * Math.sin(b) * Math.cos(a)
      pos[i * 3 + 1] = d * Math.sin(b) * Math.sin(a)
      pos[i * 3 + 2] = d * Math.cos(b)
      col.set(pickColor())
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b
      sizes[i] = Math.random() < 0.05 ? 2.2 + Math.random() : 0.6 + Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    st.geo = geo
    return st
  }, [count])

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
    vertexShader, fragmentShader,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), [])
  useEffect(() => () => { S.geo.dispose(); mat.dispose() }, [S, mat])

  /* agenda a troca de alvo de cada estrela */
  const morph = (targets, delays, toGalaxy = false) => {
    const t0 = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      if (!toGalaxy) {
        S.nxt[i * 3] = targets[i * 3]
        S.nxt[i * 3 + 1] = targets[i * 3 + 1]
        S.nxt[i * 3 + 2] = targets[i * 3 + 2]
      }
      S.nxtGal[i] = toGalaxy ? 1 : 0
      S.release[i] = t0 + delays[i]
    }
  }

  const vw = Math.round(viewport.width * 100) / 100
  const vh = Math.round(viewport.height * 100) / 100
  const portrait = size.width < size.height * 1.05

  /* galáxia → nomes → coração com os nomes dentro */
  useEffect(() => {
    if (!active) return
    let cancelled = false
    let timer
    const [n1, n2] = names
    ;(async () => {
      const flat = await sampleNames(n1, n2, portrait, count)
      const stack = portrait ? flat : await sampleNames(n1, n2, true, count * 0.45)
      if (cancelled) return

      const targets = new Float32Array(count * 3)
      const delays = new Float32Array(count)
      placeText(flat, targets, delays, 0, count, {
        cx: 0, cy: 0, maxW: vw * 0.88, maxH: vh * (portrait ? 0.82 : 0.5), delay0: 0.1, sweep: 1.5,
      })
      morph(targets, delays)

      timer = setTimeout(() => {
        if (cancelled) return
        const hT = new Float32Array(count * 3)
        const hD = new Float32Array(count)
        const nHeart = Math.floor(count * 0.5)
        const Hs = Math.min((vw * 0.84) / 34, (vh * 0.9) / 31)
        for (let i = 0; i < nHeart; i++) {
          const t = Math.random() * Math.PI * 2
          const band = Math.random() < 0.12 ? Math.sqrt(Math.random()) * 0.92 : 1 + (Math.random() - 0.5) * 0.07
          const x = 16 * Math.pow(Math.sin(t), 3)
          const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5
          hT[i * 3] = x * band * Hs
          hT[i * 3 + 1] = y * band * Hs
          hT[i * 3 + 2] = (Math.random() - 0.5) * 0.5
          hD[i] = (t / (Math.PI * 2)) * 1.6 + Math.random() * 0.15 /* desenha o contorno dando a volta */
        }
        placeText(stack, hT, hD, nHeart, count, {
          cx: 0, cy: 0.3 * Hs, maxW: 19.5 * Hs, maxH: 13.5 * Hs, delay0: 0.9, sweep: 0.9,
        })
        morph(hT, hD)
      }, HEART_HOLD_MS)
    })()
    return () => { cancelled = true; clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names[0], names[1], active, portrait, vw, vh, count])

  /* toque: empurrão aleatório em todas as estrelas — as molas trazem de volta */
  useEffect(() => {
    if (!burstKey) return
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1)
      const f = 3 + Math.random() * 6
      S.vel[i * 3] += f * Math.sin(b) * Math.cos(a)
      S.vel[i * 3 + 1] += f * Math.sin(b) * Math.sin(a)
      S.vel[i * 3 + 2] += f * Math.cos(b)
    }
  }, [burstKey, count, S])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20) /* tolera celulares mais lentos sem a mola "explodir" */
    const t = state.clock.elapsedTime
    mat.uniforms.uTime.value = t
    mat.uniforms.uScale.value = dpr * (size.height / 600)

    const R = Math.min(vw * 0.48, vh * 0.75)
    const tilt = 1.05, ct = Math.cos(tilt), stl = Math.sin(tilt)
    const { pos, vel, cur, nxt, release, onGal, nxtGal, stiff, damp, gr, ga, gh, ph } = S
    const out = S.geo.attributes.position.array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      if (t >= release[i]) {
        cur[i3] = nxt[i3]; cur[i3 + 1] = nxt[i3 + 1]; cur[i3 + 2] = nxt[i3 + 2]
        onGal[i] = nxtGal[i]
        release[i] = Infinity
      }
      let tx, ty, tz
      if (onGal[i]) {
        const r = gr[i]
        const a = ga[i] + t * (0.22 / (0.35 + r))
        const x = Math.cos(a) * r * R, z = Math.sin(a) * r * R, y = gh[i] * R
        tx = x
        ty = y * ct - z * stl
        tz = y * stl + z * ct
      } else {
        tx = cur[i3]; ty = cur[i3 + 1]; tz = cur[i3 + 2]
      }
      const k = stiff[i], c = damp[i]
      vel[i3] += ((tx - pos[i3]) * k - vel[i3] * c) * dt
      vel[i3 + 1] += ((ty - pos[i3 + 1]) * k - vel[i3 + 1] * c) * dt
      vel[i3 + 2] += ((tz - pos[i3 + 2]) * k - vel[i3 + 2] * c) * dt
      pos[i3] += vel[i3] * dt
      pos[i3 + 1] += vel[i3 + 1] * dt
      pos[i3 + 2] += vel[i3 + 2] * dt
      const w = 0.018
      out[i3] = pos[i3] + Math.sin(t * 0.9 + ph[i]) * w
      out[i3 + 1] = pos[i3 + 1] + Math.cos(t * 0.7 + ph[i]) * w
      out[i3 + 2] = pos[i3 + 2]
    }
    S.geo.attributes.position.needsUpdate = true

    const g = groupRef.current
    if (g) {
      g.rotation.y += (state.pointer.x * 0.28 - g.rotation.y) * 0.05
      g.rotation.x += (-state.pointer.y * 0.16 - g.rotation.x) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <points geometry={S.geo} material={mat} frustumCulled={false} />
    </group>
  )
}

/* onCanvas recebe o <canvas> WebGL (para gerar a imagem dos Stories) */
export default function StarNamesScene({ names, active, running = true, burstKey, onCanvas }) {
  const count = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 3600 : 6500), [])
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={running ? 'always' : 'never'}
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => onCanvas?.(gl.domElement)}
      >
        <Stars radius={40} depth={30} count={1400} factor={2.4} saturation={0} fade speed={0.6} />
        <Swarm count={count} names={names} active={active} burstKey={burstKey} />
      </Canvas>
    </div>
  )
}
