import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

/* ══════════════════════════════════════════════════
   HERO 3D — corações de "porcelana/cromo" flutuando
   · sobem devagar em profundidade (com névoa vinho)
   · a câmera acompanha o mouse (parallax)
   · ao rolar, os corações vêm na direção da tela
   · toque/clique solta uma explosão de coraçõezinhos
══════════════════════════════════════════════════ */

const CAM_Z = 6
const POOL = 48
const BURST = 14

export const PALETTE = [
  { color: '#FF4D7A', metalness: 0.1,  roughness: 0.16 },
  { color: '#C9184A', metalness: 0.15, roughness: 0.2 },
  { color: '#FFCCD5', metalness: 0.05, roughness: 0.12 },
  { color: '#FFFFFF', metalness: 0,    roughness: 0.08 },
  { color: '#F7A8B8', metalness: 1,    roughness: 0.22 }, /* rosé metálico */
]

/* forma clássica do coração em bézier, extrudada com bisel bem arredondado */
export function createHeartGeometry() {
  const s = new THREE.Shape()
  s.moveTo(25, 25)
  s.bezierCurveTo(25, 25, 20, 0, 0, 0)
  s.bezierCurveTo(-30, 0, -30, 35, -30, 35)
  s.bezierCurveTo(-30, 55, -10, 77, 25, 95)
  s.bezierCurveTo(60, 77, 80, 55, 80, 35)
  s.bezierCurveTo(80, 35, 80, 0, 50, 0)
  s.bezierCurveTo(35, 0, 25, 25, 25, 25)
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 14, bevelEnabled: true, bevelThickness: 10, bevelSize: 9, bevelSegments: 8, curveSegments: 28,
  })
  g.center()
  g.rotateZ(Math.PI) /* a forma original nasce de cabeça para baixo */
  g.scale(1 / 110, 1 / 110, 1 / 110)
  g.computeVertexNormals()
  return g
}

const rand = (a, b) => a + Math.random() * (b - a)

/* luz de estúdio + reflexos gerados localmente (sem baixar HDR) — usado
   também pelas cenas 3D da página do casal */
export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <pointLight position={[-4, -2, 3]} color="#FF4D7A" intensity={20} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 4, 4]} rotation-x={Math.PI / 2.5} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#FFB3C1" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer form="ring" intensity={4} color="#FF4D7A" position={[0, -3, -4]} scale={3} />
      </Environment>
    </>
  )
}

export function glossyMaterial(p) {
  return new THREE.MeshPhysicalMaterial({ ...p, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.4 })
}

function HeartField({ count, progress, burstRef, pointer }) {
  const camera = useThree(s => s.camera)
  const geo = useMemo(createHeartGeometry, [])
  const mats = useMemo(() => PALETTE.map(glossyMaterial), [])
  useEffect(() => () => { geo.dispose(); mats.forEach(m => m.dispose()) }, [geo, mats])

  /* posições normalizadas (-1..1 da tela na profundidade de cada coração) */
  const hearts = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: rand(-1, 1), y: rand(-1.2, 1.2), z: rand(-10, -1),
    s: rand(0.35, 0.95), rx: rand(-0.4, 0.4), ry: rand(0, Math.PI * 2),
    vr: rand(-0.45, 0.45), vy: rand(0.12, 0.35), phase: rand(0, Math.PI * 2),
    mat: i % PALETTE.length,
  })), [count])
  const pool = useMemo(() => Array.from({ length: POOL }, (_, i) => ({
    life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), s: 0, spin: 0, mat: i % PALETTE.length,
  })), [])

  const meshes = useRef([])
  const poolMeshes = useRef([])
  const cursor = useRef(0)

  useEffect(() => {
    burstRef.current = (nx, ny) => {
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * CAM_Z
      const x = nx * halfH * camera.aspect + camera.position.x
      const y = ny * halfH + camera.position.y
      for (let k = 0; k < BURST; k++) {
        const b = pool[cursor.current++ % POOL]
        const a = rand(0, Math.PI * 2)
        const sp = rand(1.8, 4.6)
        b.p.set(x, y, 0)
        b.v.set(Math.cos(a) * sp, Math.sin(a) * sp + 1.6, rand(-1, 1.5))
        b.life = 1
        b.s = rand(0.14, 0.3)
        b.spin = rand(-10, 10)
      }
    }
    return () => { burstRef.current = null }
  }, [burstRef, camera, pool])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const t = state.clock.elapsedTime
    const p = progress ? Math.min(1, Math.max(0, progress.get())) : 0

    camera.position.x += (pointer.current.x * 0.7 - camera.position.x) * 0.04
    camera.position.y += (pointer.current.y * 0.45 - camera.position.y) * 0.04
    camera.lookAt(0, 0, -3)

    const tanH = Math.tan((camera.fov * Math.PI) / 360)
    const push = p * 7.5
    /* em tela em pé o hero é estreito e alto: corações menores para não cobrir o título */
    const fit = Math.min(1, Math.max(0.42, camera.aspect / 0.9))

    for (let i = 0; i < hearts.length; i++) {
      const m = meshes.current[i]
      if (!m) continue
      const h = hearts[i]
      h.y += h.vy * dt * 0.12
      if (h.y > 1.3) { h.y = -1.3; h.x = rand(-1, 1) }
      const z = h.z + push
      const dist = CAM_Z - z
      m.visible = dist > 0.9
      const halfH = tanH * dist
      m.position.set(h.x * halfH * camera.aspect * 1.05, h.y * halfH + Math.sin(t * 0.6 + h.phase) * 0.15, z)
      m.rotation.set(h.rx + Math.sin(t * 0.4 + h.phase) * 0.35, h.ry + t * h.vr, Math.sin(t * 0.5 + h.phase) * 0.2)
      m.scale.setScalar(h.s * fit)
    }

    for (let i = 0; i < pool.length; i++) {
      const m = poolMeshes.current[i]
      if (!m) continue
      const b = pool[i]
      if (b.life <= 0) { m.visible = false; continue }
      b.life -= dt / 1.5
      b.v.y -= 4.2 * dt
      b.v.multiplyScalar(0.985)
      b.p.addScaledVector(b.v, dt)
      m.visible = true
      m.position.copy(b.p)
      m.rotation.y += b.spin * dt
      m.rotation.z = Math.sin(b.life * 6) * 0.3
      const grow = Math.min(1, (1 - b.life) * 8)
      const fade = b.life < 0.3 ? b.life / 0.3 : 1
      m.scale.setScalar(Math.max(0.0001, b.s * grow * fade * (0.5 + fit * 0.5)))
    }
  })

  return (
    <group>
      {hearts.map((h, i) => (
        <mesh key={i} ref={el => (meshes.current[i] = el)} geometry={geo} material={mats[h.mat]} />
      ))}
      {pool.map((b, i) => (
        <mesh key={`b${i}`} ref={el => (poolMeshes.current[i] = el)} geometry={geo} material={mats[b.mat]} visible={false} />
      ))}
    </group>
  )
}

/* running=false congela o canvas quando o hero sai da tela */
export default function HeroHearts3D({ progress, burstRef, running = true }) {
  const pointer = useRef({ x: 0, y: 0 })
  const count = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 14 : 26), [])

  useEffect(() => {
    const move = e => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      <Canvas
        frameloop={running ? 'always' : 'never'}
        camera={{ position: [0, 0, CAM_Z], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#8A0A3A', 7, 18]} />
        <StudioLights />

        <HeartField count={count} progress={progress} burstRef={burstRef} pointer={pointer} />
      </Canvas>
    </div>
  )
}
