import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './MagicRings.css'

const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;
uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
uniform vec2 uResolution, uMouse;
uniform vec3 uColor, uColorTwo;
uniform int uRingCount;
const float HP = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
}

float ring(vec2 p, float ri, float cut, float t0, float px) {
  float t = mod(uTime + t0, CYCLE);
  float r = ri + t / CYCLE * uScaleRate;
  float d = abs(length(p) - r);
  float a = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}

void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;
  p -= uMouse * uMouseInfluence;
  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
  p /= sc;
  vec3 c = vec3(0.0);
  float rcf = max(float(uRingCount) - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (i >= uRingCount) break;
    float fi = float(i);
    vec2 pr = p - fi * uParallax * uMouse;
    vec3 rc = mix(uColor, uColorTwo, fi / rcf);
    c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
  }
  c *= 1.0 + uBurst * 2.0;
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
}
`

type MagicRingsProps = {
  color?: string
  colorTwo?: string
  ringCount?: number
  speed?: number
  attenuation?: number
  lineThickness?: number
  baseRadius?: number
  radiusStep?: number
  scaleRate?: number
  opacity?: number
  blur?: number
  noiseAmount?: number
  rotation?: number
  ringGap?: number
  fadeIn?: number
  fadeOut?: number
  followMouse?: boolean
  mouseInfluence?: number
  hoverScale?: number
  parallax?: number
  clickBurst?: boolean
}

export default function MagicRings({
  color = '#8ba7ff',
  colorTwo = '#c8e9f5',
  speed = 0.65,
  ringCount = 6,
  attenuation = 11,
  lineThickness = 1.4,
  baseRadius = 0.24,
  radiusStep = 0.095,
  scaleRate = 0.08,
  opacity = 0.72,
  blur = 0,
  noiseAmount = 0.035,
  rotation = -12,
  ringGap = 1.48,
  fadeIn = 0.7,
  fadeOut = 0.5,
  followMouse = true,
  mouseInfluence = 0.12,
  hoverScale = 1.08,
  parallax = 0.025,
  clickBurst = true,
}: MagicRingsProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef<Required<MagicRingsProps>>({} as Required<MagicRingsProps>)
  const mouseRef = useRef<[number, number]>([0, 0])
  const smoothMouseRef = useRef<[number, number]>([0, 0])
  const hoverAmountRef = useRef(0)
  const isHoveredRef = useRef(false)
  const burstRef = useRef(0)

  propsRef.current = {
    color, colorTwo, speed, ringCount, attenuation, lineThickness, baseRadius, radiusStep,
    scaleRate, opacity, blur, noiseAmount, rotation, ringGap, fadeIn, fadeOut, followMouse,
    mouseInfluence, hoverScale, parallax, clickBurst,
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    } catch {
      return
    }

    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    camera.position.z = 1
    const uniforms = {
      uTime: { value: 0 },
      uAttenuation: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color() },
      uColorTwo: { value: new THREE.Color() },
      uLineThickness: { value: 0 },
      uBaseRadius: { value: 0 },
      uRadiusStep: { value: 0 },
      uScaleRate: { value: 0 },
      uRingCount: { value: 0 },
      uOpacity: { value: 1 },
      uNoiseAmount: { value: 0 },
      uRotation: { value: 0 },
      uRingGap: { value: 1.6 },
      uFadeIn: { value: 0.5 },
      uFadeOut: { value: 0.75 },
      uMouse: { value: new THREE.Vector2() },
      uMouseInfluence: { value: 0 },
      uHoverAmount: { value: 0 },
      uHoverScale: { value: 1 },
      uParallax: { value: 0 },
      uBurst: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true })
    const geometry = new THREE.PlaneGeometry(1, 1)
    scene.add(new THREE.Mesh(geometry, material))

    const resize = () => {
      const width = Math.max(1, mount.clientWidth)
      const height = Math.max(1, mount.clientHeight)
      const dpr = Math.min(window.devicePixelRatio, 1.6)
      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height, false)
      uniforms.uResolution.value.set(width * dpr, height * dpr)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    const onMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect()
      mouseRef.current = [(event.clientX - rect.left) / rect.width - 0.5, -((event.clientY - rect.top) / rect.height - 0.5)]
    }
    const onMouseEnter = () => { isHoveredRef.current = true }
    const onMouseLeave = () => { isHoveredRef.current = false; mouseRef.current = [0, 0] }
    const onClick = () => { burstRef.current = 1 }
    mount.addEventListener('mousemove', onMouseMove)
    mount.addEventListener('mouseenter', onMouseEnter)
    mount.addEventListener('mouseleave', onMouseLeave)
    mount.addEventListener('click', onClick)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frameId = 0
    let elapsed = 0
    let lastTime = 0
    let visible = false

    const renderFrame = (time: number) => {
      frameId = requestAnimationFrame(renderFrame)
      const props = propsRef.current
      const delta = lastTime === 0 ? 0 : Math.min(time - lastTime, 100)
      lastTime = time
      elapsed += delta * 0.001 * (reduceMotion ? 0 : props.speed)
      smoothMouseRef.current[0] += (mouseRef.current[0] - smoothMouseRef.current[0]) * 0.08
      smoothMouseRef.current[1] += (mouseRef.current[1] - smoothMouseRef.current[1]) * 0.08
      hoverAmountRef.current += ((isHoveredRef.current ? 1 : 0) - hoverAmountRef.current) * 0.08
      burstRef.current *= 0.94

      uniforms.uTime.value = elapsed
      uniforms.uAttenuation.value = props.attenuation
      uniforms.uColor.value.set(props.color)
      uniforms.uColorTwo.value.set(props.colorTwo)
      uniforms.uLineThickness.value = props.lineThickness
      uniforms.uBaseRadius.value = props.baseRadius
      uniforms.uRadiusStep.value = props.radiusStep
      uniforms.uScaleRate.value = props.scaleRate
      uniforms.uRingCount.value = Math.min(10, props.ringCount)
      uniforms.uOpacity.value = props.opacity
      uniforms.uNoiseAmount.value = props.noiseAmount
      uniforms.uRotation.value = (props.rotation * Math.PI) / 180
      uniforms.uRingGap.value = props.ringGap
      uniforms.uFadeIn.value = props.fadeIn
      uniforms.uFadeOut.value = props.fadeOut
      uniforms.uMouse.value.set(...smoothMouseRef.current)
      uniforms.uMouseInfluence.value = props.followMouse ? props.mouseInfluence : 0
      uniforms.uHoverAmount.value = hoverAmountRef.current
      uniforms.uHoverScale.value = props.hoverScale
      uniforms.uParallax.value = props.parallax
      uniforms.uBurst.value = props.clickBurst ? burstRef.current : 0
      renderer.render(scene, camera)
    }

    const start = () => {
      if (visible && frameId === 0) {
        lastTime = 0
        frameId = requestAnimationFrame(renderFrame)
      }
    }
    const stop = () => {
      if (frameId) cancelAnimationFrame(frameId)
      frameId = 0
    }
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      visible ? start() : stop()
    })
    visibilityObserver.observe(mount)

    return () => {
      stop()
      observer.disconnect()
      visibilityObserver.disconnect()
      mount.removeEventListener('mousemove', onMouseMove)
      mount.removeEventListener('mouseenter', onMouseEnter)
      mount.removeEventListener('mouseleave', onMouseLeave)
      mount.removeEventListener('click', onClick)
      renderer.dispose()
      material.dispose()
      geometry.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="magic-rings-container" style={blur ? { filter: `blur(${blur}px)` } : undefined} aria-hidden="true" />
}
