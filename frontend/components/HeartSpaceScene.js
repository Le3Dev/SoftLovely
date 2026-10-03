import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles, PointMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const COUNT = 260
const SCALE = 0.14

function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3)
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
  return [x, y]
}

/* progress (MotionValue 0→1, opcional): quando vem, o scroll comanda a
   formação do coração em vez do relógio */
function HeartParticles({ color, active, onSettled, progress }) {
  const groupRef    = useRef()
  const posAttrRef  = useRef()
  const posAttrRef2 = useRef()
  const settledRef  = useRef(false)
  const startTimeRef = useRef(null)

  const { targets, starts, positions } = useMemo(() => {
    const targets = new Float32Array(COUNT * 3)
    const starts  = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const t = (i / COUNT) * Math.PI * 2
      const [hx, hy] = heartPoint(t)
      const jitter = (Math.random() - 0.5)

      targets[i * 3 + 0] = hx * SCALE + jitter * 0.05
      targets[i * 3 + 1] = hy * SCALE + jitter * 0.05
      targets[i * 3 + 2] = (Math.random() - 0.5) * 0.5 /* profundidade — dá volume "nebulosa" sem perder a silhueta */

      const r     = 6 + Math.random() * 5
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      starts[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      starts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      starts[i * 3 + 2] = r * Math.cos(phi)
    }
    return { targets, starts, positions: starts.slice() }
  }, [])

  useFrame((state) => {
    let t
    if (progress) {
      t = Math.min(1, Math.max(0, progress.get()))
    } else {
      if (!active) return
      if (startTimeRef.current == null) startTimeRef.current = state.clock.elapsedTime
      const elapsed = state.clock.elapsedTime - startTimeRef.current
      const dur     = 3.4
      t = Math.min(1, elapsed / dur)
    }
    const ease    = 1 - Math.pow(1 - t, 3)

    const arr = posAttrRef.current?.array
    if (arr) {
      for (let i = 0; i < COUNT * 3; i++) {
        arr[i] = starts[i] + (targets[i] - starts[i]) * ease
      }
      posAttrRef.current.needsUpdate = true
      if (posAttrRef2.current) posAttrRef2.current.needsUpdate = true
    }

    if (t >= 1 && !settledRef.current) {
      settledRef.current = true
      onSettled?.()
    }

    if (groupRef.current) {
      const settled = settledRef.current
      /* balanço suave e limitado — nunca gira a ponto de perder a silhueta do coração */
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * (settled ? 0.22 : 0.12)
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.16) * 0.06
      const breathe = settled ? 1 + Math.sin(state.clock.elapsedTime * 1.3) * 0.035 : 1
      groupRef.current.scale.setScalar(breathe)
    }
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute ref={posAttrRef} attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        </bufferGeometry>
        <PointMaterial
          size={0.16}
          color={color}
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {/* núcleo extra menor e mais denso — reforça o contorno do coração */}
      <points>
        <bufferGeometry>
          <bufferAttribute ref={posAttrRef2} attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        </bufferGeometry>
        <PointMaterial
          size={0.05}
          color="white"
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

/* afasta a câmera o suficiente para o coração (~4.5 × 4.1) caber inteiro,
   inclusive em telas em pé, onde a largura é o limite */
function FitCamera() {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const k = 2 * Math.tan((camera.fov * Math.PI) / 360)
    camera.position.z = Math.max(6.2, 5.2 / k, 5.6 / aspect / k)
    camera.updateProjectionMatrix()
  }, [camera, size])
  return null
}

/* running=false pausa o render (o canvas com bloom é caro; só roda na tela) */
export default function HeartSpaceScene({ themeColor = '#C9184A', active = true, onSettled, progress, running = true }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={running ? 'always' : 'never'}
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <FitCamera />
        <ambientLight intensity={0.5} />

        <Stars radius={60} depth={45} count={900} factor={2.2} saturation={0} fade speed={0.35} />
        <Sparkles count={36} scale={7.5} size={2.2} speed={0.3} color={themeColor} opacity={0.55} />

        <HeartParticles color={themeColor} active={active} onSettled={onSettled} progress={progress} />

        <EffectComposer>
          <Bloom intensity={1.3} luminanceThreshold={0.08} luminanceSmoothing={0.85} mipmapBlur radius={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
