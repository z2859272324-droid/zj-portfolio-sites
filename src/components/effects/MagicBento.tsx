import { Children, useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap } from 'gsap'
import './MagicBento.css'

type MagicBentoProps = {
  children: ReactNode
  className?: string
  particleCount?: number
  spotlightRadius?: number
  glowColor?: string
  enableTilt?: boolean
  enableMagnetism?: boolean
  clickEffect?: boolean
}

function useDisableMotion() {
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)')
    const update = () => setDisabled(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return disabled
}

function BentoEffectCard({
  children,
  particleCount,
  glowColor,
  enableTilt,
  enableMagnetism,
  clickEffect,
  disabled,
}: {
  children: ReactNode
  particleCount: number
  glowColor: string
  enableTilt: boolean
  enableMagnetism: boolean
  clickEffect: boolean
  disabled: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLSpanElement[]>([])

  const clearParticles = () => {
    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        opacity: 0,
        scale: 0,
        duration: 0.25,
        onComplete: () => particle.remove(),
      })
    })
    particlesRef.current = []
  }

  const createParticles = () => {
    const card = cardRef.current
    if (!card || disabled) return
    const { width, height } = card.getBoundingClientRect()

    Array.from({ length: particleCount }).forEach((_, index) => {
      const particle = document.createElement('span')
      particle.className = 'magic-bento-particle'
      particle.style.left = `${Math.random() * width}px`
      particle.style.top = `${Math.random() * height}px`
      particle.style.setProperty('--particle-color', glowColor)
      card.appendChild(particle)
      particlesRef.current.push(particle)

      gsap.fromTo(
        particle,
        { opacity: 0, scale: 0 },
        {
          opacity: 0.85,
          scale: 1,
          delay: index * 0.035,
          duration: 0.28,
          ease: 'back.out(1.8)',
        },
      )
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 90,
        y: (Math.random() - 0.5) * 90,
        opacity: 0.25,
        duration: 1.6 + Math.random() * 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })
  }

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card || disabled) return
    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const dx = x - rect.width / 2
    const dy = y - rect.height / 2

    if (enableTilt) {
      gsap.to(card, {
        rotateX: (-dy / rect.height) * 9,
        rotateY: (dx / rect.width) * 9,
        transformPerspective: 900,
        duration: 0.18,
        ease: 'power2.out',
      })
    }
    if (enableMagnetism) {
      gsap.to(card, { x: dx * 0.025, y: dy * 0.025, duration: 0.28, ease: 'power2.out' })
    }
  }

  const handleLeave = () => {
    const card = cardRef.current
    clearParticles()
    if (!card || disabled) return
    gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.38, ease: 'power2.out' })
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card || disabled || !clickEffect) return
    const rect = card.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'magic-bento-ripple'
    ripple.style.left = `${event.clientX - rect.left}px`
    ripple.style.top = `${event.clientY - rect.top}px`
    ripple.style.setProperty('--particle-color', glowColor)
    card.appendChild(ripple)
    gsap.fromTo(ripple, { scale: 0, opacity: 0.55 }, { scale: 12, opacity: 0, duration: 0.75, onComplete: () => ripple.remove() })
  }

  useEffect(() => () => clearParticles(), [])

  return (
    <div
      ref={cardRef}
      className="magic-bento-card"
      onMouseEnter={createParticles}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export default function MagicBento({
  children,
  className = '',
  particleCount = 10,
  spotlightRadius = 340,
  glowColor = '143, 184, 255',
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
}: MagicBentoProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const disabled = useDisableMotion()

  const handleGridMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const grid = gridRef.current
    const spotlight = spotlightRef.current
    if (!grid || !spotlight || disabled) return
    const gridRect = grid.getBoundingClientRect()
    const x = event.clientX - gridRect.left
    const y = event.clientY - gridRect.top
    spotlight.style.setProperty('--spotlight-x', `${x}px`)
    spotlight.style.setProperty('--spotlight-y', `${y}px`)
    spotlight.style.opacity = '1'

    grid.querySelectorAll<HTMLElement>('.magic-bento-card').forEach((card) => {
      const rect = card.getBoundingClientRect()
      const relativeX = ((event.clientX - rect.left) / rect.width) * 100
      const relativeY = ((event.clientY - rect.top) / rect.height) * 100
      const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2))
      card.style.setProperty('--glow-x', `${relativeX}%`)
      card.style.setProperty('--glow-y', `${relativeY}%`)
      card.style.setProperty('--glow-radius', `${spotlightRadius}px`)
      card.style.setProperty('--glow-intensity', String(Math.max(0, 1 - distance / spotlightRadius)))
    })
  }

  const hideSpotlight = () => {
    if (spotlightRef.current) spotlightRef.current.style.opacity = '0'
    gridRef.current?.querySelectorAll<HTMLElement>('.magic-bento-card').forEach((card) => card.style.setProperty('--glow-intensity', '0'))
  }

  return (
    <div
      ref={gridRef}
      className={`${className} magic-bento-grid`}
      style={{ '--magic-glow': glowColor } as React.CSSProperties}
      onMouseMove={handleGridMove}
      onMouseLeave={hideSpotlight}
    >
      <div ref={spotlightRef} className="magic-bento-spotlight" aria-hidden="true" />
      {Children.toArray(children).map((child, index) => (
        <BentoEffectCard
          key={index}
          particleCount={particleCount}
          glowColor={glowColor}
          enableTilt={enableTilt}
          enableMagnetism={enableMagnetism}
          clickEffect={clickEffect}
          disabled={disabled}
        >
          {child}
        </BentoEffectCard>
      ))}
    </div>
  )
}
