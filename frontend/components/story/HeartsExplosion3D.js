import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createHeartGeometry, PALETTE, StudioLights, glossyMaterial } from '../landing/HeroHearts3D'

/* ══════════════════════════════════════════════════
   "SIM" EM 3D — um coração gigante brota no centro,
   pulsa e explode em dezenas de coraçõezinhos de
   porcelana que voam na direção da tela e caem.
   Fica por cima de tudo (sem capturar toques).
══════════════════════════════════════════════════ */

const POP_AT = 0.55 /* segundos até o coração grande estourar */
const rand = (a, b) => a + Math.random() * (b - a)

function Explosion({ themeColor, count }) {
  const geo = useMemo(createHeartGeometry, [])
  const mats = useMemo(() => [...PALETTE, { color: themeColor, metalness: 0.2, roughness: 0.15 }].map(glossyMaterial), [themeColor])
  useEffect(() => () => { geo.dispose(); mats.forEach(m => m.dispose()) }, [geo, mats])

  const parts = useMemo(() => Array.from({ length: count }, (_, i) => {
    const a = rand(0, Math.PI * 2), b = Math.acos(rand(-1, 1)), sp = rand(4, 11)
    return {
      p: new THREE.Vector3(rand(-0.3, 0.3), rand(-0.3, 0.3), 0),
      v: new THREE.Vector3(Math.sin(b) * Math.cos(a) * sp, Math.sin(b) * Math.sin(a) * sp + 3, Math.abs(Math.cos(b)) * sp * 0.7),
      spin: new THREE.Vector3(rand(-6, 6), rand(-8, 8), rand(-4, 4)),
      s: rand(0.16, 0.42),
      delay: POP_AT + (i % 3) * 0.08 + rand(0, 0.12),
      mat: i % mats.length,
    }
  }), [count, mats.length])

  const big = useRef()
  const meshes = useRef([])
  const t0 = useRef(null)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    if (t0.current == null) t0.current = state.clock.elapsedTime
    const t = state.clock.elapsedTime - t0.current

    /* coração grande: cresce com "mola", gira e estoura */
    if (big.current) {
      const g = big.current
      g.visible = t < POP_AT
      const k = Math.min(1, t / POP_AT)
      const elastic = 1 - Math.pow(2, -10 * k) * Math.cos(k * 12) /* sobe passando do ponto */
      g.scale.setScalar(Math.max(0.0001, elastic * 1.5 + (k > 0.85 ? (k - 0.85) * 4 : 0)))
      g.rotation.y = t * 5
    }

    for (let i = 0; i < parts.length; i++) {
      const m = meshes.current[i]
      if (!m) continue
      const q = parts[i]
      if (t < q.delay) { m.visible = false; continue }
      q.v.y -= 6.5 * dt
      q.v.multiplyScalar(0.99)
      q.p.addScaledVector(q.v, dt)
      m.visible = q.p.z < 5.3 && q.p.y > -9
      m.position.copy(q.p)
      m.rotation.x += q.spin.x * dt
      m.rotation.y += q.spin.y * dt
      m.rotation.z += q.spin.z * dt
      m.scale.setScalar(q.s * Math.min(1, (t - q.delay) * 7))
    }
  })

  return (
    <group>
      <mesh ref={big} geometry={geo} material={mats[mats.length - 1]} />
      {parts.map((q, i) => (
        <mesh key={i} ref={el => (meshes.current[i] = el)} geometry={geo} material={mats[q.mat]} visible={false} />
      ))}
    </group>
  )
}

export default function HeartsExplosion3D({ themeColor = '#C9184A' }) {
  const count = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 45 : 75), [])
  return (
    <div aria-hidden="true" className="fixed inset-0 z-[90] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} style={{ background: 'transparent' }}>
        <StudioLights />
        <Explosion themeColor={themeColor} count={count} />
      </Canvas>
    </div>
  )
}
