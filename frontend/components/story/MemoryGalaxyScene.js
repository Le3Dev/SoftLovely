import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { createHeartGeometry, StudioLights, glossyMaterial } from '../landing/HeroHearts3D'

/* ══════════════════════════════════════════════════
   GALÁXIA DE MEMÓRIAS — as fotos viram polaroides
   numa espiral em volta de um coração 3D. O scroll
   gira a espiral e desce a câmera: cada foto passa
   pela frente, uma de cada vez.
══════════════════════════════════════════════════ */

const STEP_ANGLE = 0.95  /* rad entre uma foto e a próxima */
const STEP_Y = 0.85      /* descida por foto */
const BG = '#14030C'

const damp = (cur, target, lambda, dt) => cur + (target - cur) * (1 - Math.exp(-lambda * dt))

function Polaroid({ url, index, total, radius, state }) {
  const tex = useLoader(THREE.TextureLoader, url, l => l.setCrossOrigin('anonymous'))
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
  }, [tex])

  /* tamanho da foto respeitando a proporção original */
  const img = tex.image
  const aspect = img && img.height ? img.width / img.height : 0.75
  const maxW = 1.5, maxH = 1.8
  const w = aspect > maxW / maxH ? maxW : maxH * aspect
  const h = w / aspect
  const border = 0.09

  const ref = useRef()
  const angle = index * STEP_ANGLE
  const y = ((total - 1) / 2) * STEP_Y - index * STEP_Y
  const tilt = (index % 2 ? 1 : -1) * 0.06

  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    /* a foto que está de frente cresce um pouco */
    let d = (angle + state.rot) % (Math.PI * 2)
    if (d > Math.PI) d -= Math.PI * 2
    if (d < -Math.PI) d += Math.PI * 2
    const front = Math.max(0, Math.cos(d))
    g.scale.setScalar(0.85 + front * front * 0.3)
    g.position.y = y + Math.sin(clock.elapsedTime * 0.8 + index) * 0.05
  })

  return (
    <group ref={ref} position={[Math.sin(angle) * radius, y, Math.cos(angle) * radius]} rotation={[0, angle, tilt]}>
      {/* moldura branca, com a "barra" de baixo mais larga */}
      <mesh position={[0, -0.09, -0.005]}>
        <planeGeometry args={[w + border * 2, h + border * 2 + 0.18]} />
        <meshBasicMaterial color="#FBF5F0" side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* verso: a mesma foto, para a espiral não mostrar molduras vazias */}
      <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Galaxy({ photos, progress, themeColor }) {
  const camera = useThree(s => s.camera)
  const size = useThree(s => s.size)
  const total = photos.length
  const radius = size.width < 640 ? 2.6 : 3.4
  /* afasta a câmera até a foto da frente caber folgada: ~55% da altura
     em tela deitada, ~58% da largura em tela em pé */
  const aspect = size.width / Math.max(1, size.height)
  const k = 2 * Math.tan((45 * Math.PI) / 360)
  const camDist = radius + Math.max(2.4 / 0.55 / k, 2.0 / 0.58 / aspect / k)

  const heartGeo = useMemo(createHeartGeometry, [])
  const heartMat = useMemo(() => glossyMaterial({ color: themeColor, metalness: 0.25, roughness: 0.14 }), [themeColor])
  useEffect(() => () => { heartGeo.dispose(); heartMat.dispose() }, [heartGeo, heartMat])

  const spiral = useRef()
  const heart = useRef()
  const state = useMemo(() => ({ rot: 0, y: ((total - 1) / 2) * STEP_Y }), [total])

  useFrame((s, delta) => {
    const dt = Math.min(delta, 1 / 20)
    const p = Math.min(1, Math.max(0, progress.get()))
    const topY = ((total - 1) / 2) * STEP_Y
    /* a foto i fica de frente quando rot = -i·STEP_ANGLE */
    const targetRot = -p * (total - 1) * STEP_ANGLE
    const targetY = topY - p * (total - 1) * STEP_Y
    state.rot = damp(state.rot, targetRot, 6, dt)
    state.y = damp(state.y, targetY, 6, dt)
    if (spiral.current) spiral.current.rotation.y = state.rot

    camera.position.set(Math.sin(s.clock.elapsedTime * 0.3) * 0.25, state.y + 0.35, camDist)
    camera.lookAt(0, state.y, 0)

    if (heart.current) {
      heart.current.position.y = state.y
      heart.current.rotation.y = s.clock.elapsedTime * 0.6
      heart.current.scale.setScalar(1.25 + Math.sin(s.clock.elapsedTime * 2.4) * 0.05)
    }
  })

  return (
    <>
      <fog attach="fog" args={[BG, camDist - 0.5, camDist + radius + 3]} />
      <mesh ref={heart} geometry={heartGeo} material={heartMat} />
      <group ref={spiral}>
        {photos.map((url, i) => (
          <Suspense key={i} fallback={null}>
            <Polaroid url={url} index={i} total={total} radius={radius} state={state} />
          </Suspense>
        ))}
      </group>
      <Sparkles count={60} scale={[radius * 3, (total + 2) * STEP_Y, radius * 3]} size={3} speed={0.3} color={themeColor} opacity={0.7} />
    </>
  )
}

export default function MemoryGalaxyScene({ photos, progress, themeColor = '#C9184A', running = true }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas frameloop={running ? 'always' : 'never'} camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} style={{ background: 'transparent' }}>
        <StudioLights />
        <Stars radius={30} depth={20} count={900} factor={2} saturation={0} fade speed={0.5} />
        <Galaxy photos={photos} progress={progress} themeColor={themeColor} />
      </Canvas>
    </div>
  )
}
