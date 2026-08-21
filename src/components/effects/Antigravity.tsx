import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import './Antigravity.css'

type AntigravityProps = {
  count?: number
  magnetRadius?: number
  ringRadius?: number
  waveSpeed?: number
  waveAmplitude?: number
  particleSize?: number
  lerpSpeed?: number
  color?: string
  autoAnimate?: boolean
  particleVariance?: number
  rotationSpeed?: number
  depthFactor?: number
  pulseSpeed?: number
  particleShape?: 'capsule' | 'sphere' | 'box' | 'tetrahedron'
  fieldStrength?: number
}

type Particle = {
  t: number
  speed: number
  mx: number
  my: number
  mz: number
  cx: number
  cy: number
  cz: number
  randomRadiusOffset: number
}

function AntigravityInner({
  count = 260,
  magnetRadius = 8,
  ringRadius = 6.4,
  waveSpeed = 0.42,
  waveAmplitude = 0.65,
  particleSize = 1.25,
  lerpSpeed = 0.055,
  color = '#9ebcff',
  autoAnimate = true,
  particleVariance = 0.85,
  rotationSpeed = 0.025,
  depthFactor = 0.75,
  pulseSpeed = 2.4,
  particleShape = 'capsule',
  fieldStrength = 12,
}: AntigravityProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { viewport } = useThree()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const lastMousePos = useRef({ x: 0, y: 0 })
  const lastMouseMoveTime = useRef(0)
  const virtualMouse = useRef({ x: 0, y: 0 })

  const particles = useMemo<Particle[]>(() => Array.from({ length: count }, () => {
    const x = (Math.random() - 0.5) * (viewport.width || 100)
    const y = (Math.random() - 0.5) * (viewport.height || 100)
    const z = (Math.random() - 0.5) * 20
    return {
      t: Math.random() * 100,
      speed: 0.01 + Math.random() / 200,
      mx: x,
      my: y,
      mz: z,
      cx: x,
      cy: y,
      cz: z,
      randomRadiusOffset: (Math.random() - 0.5) * 2,
    }
  }), [count, viewport.height, viewport.width])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const pointerDistance = Math.hypot(state.pointer.x - lastMousePos.current.x, state.pointer.y - lastMousePos.current.y)
    if (pointerDistance > 0.001) {
      lastMouseMoveTime.current = Date.now()
      lastMousePos.current = { x: state.pointer.x, y: state.pointer.y }
    }

    let destinationX = (state.pointer.x * state.viewport.width) / 2
    let destinationY = (state.pointer.y * state.viewport.height) / 2
    if (autoAnimate && Date.now() - lastMouseMoveTime.current > 1800) {
      const time = state.clock.getElapsedTime()
      destinationX = Math.sin(time * 0.35) * (state.viewport.width / 4)
      destinationY = Math.cos(time * 0.55) * (state.viewport.height / 4)
    }

    virtualMouse.current.x += (destinationX - virtualMouse.current.x) * 0.045
    virtualMouse.current.y += (destinationY - virtualMouse.current.y) * 0.045
    const targetX = virtualMouse.current.x
    const targetY = virtualMouse.current.y
    const globalRotation = state.clock.getElapsedTime() * rotationSpeed

    particles.forEach((particle, index) => {
      particle.t += particle.speed / 2
      const projection = 1 - particle.cz / 50
      const projectedX = targetX * projection
      const projectedY = targetY * projection
      const dx = particle.mx - projectedX
      const dy = particle.my - projectedY
      const distance = Math.hypot(dx, dy)
      let x = particle.mx
      let y = particle.my
      let z = particle.mz * depthFactor

      if (distance < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation
        const wave = Math.sin(particle.t * waveSpeed + angle) * 0.5 * waveAmplitude
        const deviation = particle.randomRadiusOffset * (5 / (fieldStrength + 0.1))
        const radius = ringRadius + wave + deviation
        x = projectedX + radius * Math.cos(angle)
        y = projectedY + radius * Math.sin(angle)
        z += Math.sin(particle.t) * waveAmplitude * depthFactor
      }

      particle.cx += (x - particle.cx) * lerpSpeed
      particle.cy += (y - particle.cy) * lerpSpeed
      particle.cz += (z - particle.cz) * lerpSpeed
      dummy.position.set(particle.cx, particle.cy, particle.cz)
      dummy.lookAt(projectedX, projectedY, particle.cz)
      dummy.rotateX(Math.PI / 2)
      const distanceFromRing = Math.abs(Math.hypot(particle.cx - projectedX, particle.cy - projectedY) - ringRadius)
      const ringScale = Math.max(0, Math.min(1, 1 - distanceFromRing / 10))
      const scale = ringScale * (0.8 + Math.sin(particle.t * pulseSpeed) * 0.2 * particleVariance) * particleSize
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {particleShape === 'capsule' && <capsuleGeometry args={[0.08, 0.32, 4, 7]} />}
      {particleShape === 'sphere' && <sphereGeometry args={[0.16, 12, 12]} />}
      {particleShape === 'box' && <boxGeometry args={[0.22, 0.22, 0.22]} />}
      {particleShape === 'tetrahedron' && <tetrahedronGeometry args={[0.22]} />}
      <meshBasicMaterial color={color} transparent opacity={0.78} />
    </instancedMesh>
  )
}

export default function Antigravity(props: AntigravityProps) {
  return (
    <div className="antigravity-container" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 50], fov: 35 }} dpr={[1, 1.45]}>
        <AntigravityInner {...props} />
      </Canvas>
    </div>
  )
}
