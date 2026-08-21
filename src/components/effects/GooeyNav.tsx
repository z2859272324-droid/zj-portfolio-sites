import { useEffect, useRef, useState } from 'react'
import './GooeyNav.css'

export type GooeyNavItem = { label: string; href: string }

type GooeyNavProps = {
  items: GooeyNavItem[]
  animationTime?: number
  particleCount?: number
  particleDistances?: [number, number]
  particleR?: number
  timeVariance?: number
  colors?: number[]
  initialActiveIndex?: number
}

export default function GooeyNav({
  items,
  animationTime = 520,
  particleCount = 16,
  particleDistances = [56, 8],
  particleR = 220,
  timeVariance = 520,
  colors = [1, 2, 3, 1, 2, 3, 4],
  initialActiveIndex = 0,
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLUListElement>(null)
  const filterRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<number[]>([])
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex)

  const noise = (value = 1) => value / 2 - Math.random() * value
  const getXY = (distance: number, index: number, total: number) => {
    const angle = ((360 + noise(8)) / total) * index * (Math.PI / 180)
    return [distance * Math.cos(angle), distance * Math.sin(angle)] as const
  }

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const position = element.getBoundingClientRect()
    const styles = {
      left: `${position.x - containerRect.x}px`,
      top: `${position.y - containerRect.y}px`,
      width: `${position.width}px`,
      height: `${position.height}px`,
    }
    Object.assign(filterRef.current.style, styles)
    Object.assign(textRef.current.style, styles)
    textRef.current.innerText = element.innerText
  }

  const makeParticles = (element: HTMLElement) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const totalTime = animationTime * 2 + timeVariance
    element.style.setProperty('--gooey-time', `${totalTime}ms`)

    for (let index = 0; index < particleCount; index += 1) {
      const time = animationTime * 2 + noise(timeVariance * 2)
      const start = getXY(particleDistances[0], particleCount - index, particleCount)
      const end = getXY(particleDistances[1] + noise(7), particleCount - index, particleCount)
      const rotationSeed = noise(particleR / 10)
      const rotation = rotationSeed > 0 ? (rotationSeed + particleR / 20) * 10 : (rotationSeed - particleR / 20) * 10
      element.classList.remove('active')

      const timeout = window.setTimeout(() => {
        const particle = document.createElement('span')
        const point = document.createElement('span')
        particle.className = 'gooey-particle'
        point.className = 'gooey-point'
        particle.style.setProperty('--start-x', `${start[0]}px`)
        particle.style.setProperty('--start-y', `${start[1]}px`)
        particle.style.setProperty('--end-x', `${end[0]}px`)
        particle.style.setProperty('--end-y', `${end[1]}px`)
        particle.style.setProperty('--gooey-time', `${time}ms`)
        particle.style.setProperty('--scale', `${1 + noise(0.2)}`)
        particle.style.setProperty('--color', `var(--gooey-color-${colors[Math.floor(Math.random() * colors.length)]}, white)`)
        particle.style.setProperty('--rotate', `${rotation}deg`)
        particle.appendChild(point)
        element.appendChild(particle)
        requestAnimationFrame(() => element.classList.add('active'))
        timeoutRef.current.push(window.setTimeout(() => particle.remove(), time))
      }, 24)
      timeoutRef.current.push(timeout)
    }
  }

  const activate = (element: HTMLElement, index: number) => {
    if (activeIndex === index) return
    setActiveIndex(index)
    updateEffectPosition(element)
    filterRef.current?.querySelectorAll('.gooey-particle').forEach((particle) => particle.remove())
    textRef.current?.classList.remove('active')
    if (textRef.current) {
      void textRef.current.offsetWidth
      textRef.current.classList.add('active')
    }
    if (filterRef.current) makeParticles(filterRef.current)
  }

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return
    const update = () => {
      const activeLink = navRef.current?.querySelectorAll('a')[activeIndex]
      if (activeLink) updateEffectPosition(activeLink)
    }
    update()
    textRef.current?.classList.add('active')
    const observer = new ResizeObserver(update)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [activeIndex])

  useEffect(() => () => timeoutRef.current.forEach(window.clearTimeout), [])

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav aria-label="主导航">
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li key={item.href} className={activeIndex === index ? 'active' : ''}>
              <a
                href={item.href}
                onClick={(event) => activate(event.currentTarget, index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') activate(event.currentTarget, index)
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="gooey-effect gooey-filter" ref={filterRef} aria-hidden="true" />
      <span className="gooey-effect gooey-text" ref={textRef} aria-hidden="true" />
    </div>
  )
}
