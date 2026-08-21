import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ImagePlus,
  Mail,
  Menu,
  Pencil,
  Phone,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import {
  capabilities,
} from './data/portfolio'
import {
  aigcProjects,
  architectureProjects,
  photographyRows,
  type GalleryMedia,
  type PortfolioProject,
} from './data/media.generated'
import {
  clearProjectCollections,
  loadProjectCollections,
  optimizeImageFile,
  saveProjectCollections,
  type ProjectCollection,
} from './lib/portfolioStore'
import Antigravity from './components/effects/Antigravity'
import MagicBento from './components/effects/MagicBento'
import MagicRings from './components/effects/MagicRings'

const ease = [0.22, 1, 0.36, 1] as const

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

function ContactButton({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`contact-pill ${compact ? 'contact-pill--compact' : ''}`} href="#contact">
      <span>联系我</span>
      <ArrowUpRight size={compact ? 16 : 19} strokeWidth={1.8} aria-hidden="true" />
    </a>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const links = [
    { id: 'about', label: '关于' },
    { id: 'experience', label: '经历' },
    { id: 'projects', label: '项目' },
    { id: 'strengths', label: '优势' },
  ]

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="返回首页">
        ZJ<span>®</span>
      </a>
      <nav className="desktop-nav" aria-label="主导航">
        {links.map(({ id, label }) => (
          <a href={`#${id}`} key={id}>
            {label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <ContactButton compact />
        <button
          className="menu-button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? '关闭导航' : '打开导航'}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            aria-label="移动端导航"
          >
            {links.map(({ id, label }, index) => (
              <a href={`#${id}`} key={id} onClick={() => setOpen(false)}>
                <span>0{index + 1}</span>
                {label}
              </a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)}>
              <span>05</span>联系
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="hero" id="top">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/media/hero-v2.mp4" type="video/mp4" />
      </video>
      <div className="hero-shade" />
      <Header />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-title-wrap">
        <motion.p
          className="hero-kicker"
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          ARCHITECTURE · AI · DATA · PHOTOGRAPHY
        </motion.p>
        <motion.h1
          className="hero-title"
          initial={reduceMotion ? false : { opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease }}
        >
          ZHANG JIN
        </motion.h1>
      </div>
      <div className="hero-bottom">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          在空间、算法与影像之间，
          <br />
          寻找设计的下一种表达。
        </motion.p>
        <motion.div
          className="hero-role"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.7 }}
        >
          <span>南京 / 徐州</span>
          <span>建筑学硕士 · 2026</span>
        </motion.div>
        <motion.a
          className="scroll-cue"
          href="#about"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          向下探索 <ArrowDown size={17} aria-hidden="true" />
        </motion.a>
      </div>
    </section>
  )
}

function MarqueeRow({
  items,
}: {
  items: GalleryMedia[]
}) {
  const renderItems = (duplicate: boolean) =>
    items.map((item) => (
      <figure className="marquee-tile" key={`${duplicate ? 'copy' : 'original'}-${item.src}`}>
        <img src={item.src} alt={duplicate ? '' : item.alt} loading="lazy" draggable="false" />
      </figure>
    ))

  return (
    <div className="marquee-row">
      <div className="marquee-track">
        <div className="marquee-group">{renderItems(false)}</div>
        <div className="marquee-group" aria-hidden="true">{renderItems(true)}</div>
      </div>
    </div>
  )
}

function MarqueeGallery() {
  return (
    <section className="marquee-section" aria-label="摄影作品滚动画廊">
      {photographyRows.map((items, row) => (
        <div className={row % 2 ? 'marquee-row-wrap marquee-row-wrap--reverse' : 'marquee-row-wrap'} key={row}>
          <MarqueeRow items={items} />
        </div>
      ))}
      <p className="gallery-note">59 张摄影作品 · 四行自动循环</p>
    </section>
  )
}

function About() {
  return (
    <section className="about section-shell" id="about">
      <div className="about-antigravity" aria-hidden="true">
        <Antigravity
          count={260}
          magnetRadius={8}
          ringRadius={6}
          waveSpeed={0.38}
          waveAmplitude={0.55}
          particleSize={1.05}
          color="#8eaef9"
          autoAnimate
          particleVariance={0.9}
          rotationSpeed={0.08}
          depthFactor={1.15}
          pulseSpeed={1.2}
          fieldStrength={7}
        />
      </div>
      <div className="about-atmosphere" aria-hidden="true" />
      <div className="section-index">01 / ABOUT</div>
      <div className="about-layout">
        <Reveal className="portrait-card">
          <div className="portrait-frame">
            <img src="/assets/profile/dsc00387-original.webp" alt="张进摄影作品《DSC00387-1》" />
            <div className="portrait-meta">
              <span>ZHANG JIN</span>
              <span>2026届建筑学硕士</span>
            </div>
          </div>
        </Reveal>
        <div className="about-copy">
          <Reveal>
            <p className="body-large">
              我是张进。聚焦建筑空间、AI 辅助设计与用户研究。
            </p>
            <p className="about-philosophy">
              建筑设计是我的基础，AI 与数据延伸设计方法，摄影让我保持对现实空间的敏感。
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const educationExperience = [
  {
    date: '2023.09—2026.06',
    title: '南京工业大学 · 建筑学硕士',
    meta: '建筑设计及其理论 / 2023—2025 二等奖学金',
  },
  {
    date: '2018.09—2023.06',
    title: '常州工学院 · 建筑学本科',
    meta: '“远瀚杯”优秀奖 / “晋陵杯”优秀奖',
  },
]

const internshipExperience = [
  {
    date: '2024.08—2025.01',
    title: '江苏建筑材料研究设计院有限公司',
    meta: '建筑实习生 / 方案深化、图纸、建模与投标材料',
  },
  {
    date: '2022.10—2022.12',
    title: '江苏建筑设计工程有限公司',
    meta: '建筑实习生 / 资料整理、进度跟踪与成果汇报',
  },
]

function ExperienceGroup({
  title,
  english,
  items,
}: {
  title: string
  english: string
  items: typeof educationExperience
}) {
  return (
    <div className="experience-group">
      <div className="experience-group-header">
        <h3>{title}</h3>
        <span>{english}</span>
      </div>
      <div className="experience-group-list">
        {items.map((item, index) => (
          <Reveal className="experience-item" delay={index * 0.08} key={item.date}>
            <span className="experience-number">0{index + 1}</span>
            <span className="experience-date">{item.date}</span>
            <div>
              <h4>{item.title}</h4>
              <p>{item.meta}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

function Experience() {
  return (
    <section className="experience section-shell" id="experience">
      <div className="section-index section-index--light">02 / EXPERIENCE</div>
      <Reveal>
        <h2 className="display-heading display-heading--dark experience-heading">经历与研究</h2>
      </Reveal>
      <div className="experience-groups">
        <ExperienceGroup title="教育经历" english="EDUCATION" items={educationExperience} />
        <ExperienceGroup title="实习经历" english="EXPERIENCE" items={internshipExperience} />
      </div>
      <Reveal className="research-strip">
        <span>RESEARCH OUTPUT</span>
        <p>《基于恢复性环境理论的高层办公建筑共享空间优化策略研究》</p>
        <p>《人工智能视域下社区养老空间适老化设计研究》</p>
      </Reveal>
    </section>
  )
}

function PortfolioCard({
  project,
  editable = false,
  onEdit,
  onDelete,
}: {
  project: PortfolioProject
  editable?: boolean
  onEdit?: (project: PortfolioProject) => void
  onDelete?: (project: PortfolioProject) => void
}) {
  const [imageIndex, setImageIndex] = useState(0)
  const hasImages = project.images.length > 0
  const activeImage = project.images[imageIndex]
  const displayTitle = project.title.replace(/^\d+[.、]\s*/, '')

  useEffect(() => {
    setImageIndex((current) => project.images.length > 0 ? Math.min(current, project.images.length - 1) : 0)
  }, [project.images.length])

  const showImage = (direction: -1 | 1) => {
    setImageIndex((current) => (current + direction + project.images.length) % project.images.length)
  }

  return (
    <article className={`portfolio-card ${project.category === 'ARCHITECTURE' ? 'portfolio-card--architecture' : ''} ${project.category === 'AIGC' ? 'portfolio-card--aigc' : ''} ${hasImages ? '' : 'portfolio-card--placeholder'}`}>
      <div className="portfolio-card-media">
        {activeImage ? (
          <motion.img
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            initial={{ opacity: 0.35, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease }}
            loading="lazy"
            draggable="false"
          />
        ) : (
          <div className="portfolio-placeholder" aria-label="图片待添加">
            <span>+</span>
            <p>IMAGE SLOT</p>
          </div>
        )}
        <div className="portfolio-card-topline">
          <span>{project.category}</span>
          <span>{hasImages ? `${String(imageIndex + 1).padStart(2, '0')} / ${String(project.images.length).padStart(2, '0')}` : '待补充图片'}</span>
        </div>
        {project.images.length > 1 && (
          <div className="portfolio-image-controls" aria-label={`${displayTitle} 图片切换`}>
            <button onClick={() => showImage(-1)} aria-label={`查看 ${displayTitle} 上一张图片`}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <button onClick={() => showImage(1)} aria-label={`查看 ${displayTitle} 下一张图片`}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div className="portfolio-card-caption">
        <span>{project.number}</span>
        <div className="portfolio-card-title-row">
          <h4>{displayTitle}</h4>
          {editable && (
            <div className="portfolio-edit-actions" onPointerDown={(event) => event.stopPropagation()}>
              <button onClick={() => onEdit?.({ ...project, images: [...project.images] })} aria-label={`编辑 ${displayTitle}`}>
                <Pencil size={16} aria-hidden="true" />
                编辑
              </button>
              <button className="portfolio-delete-button" onClick={() => onDelete?.(project)} aria-label={`删除 ${displayTitle}`}>
                <Trash2 size={16} aria-hidden="true" />
                删除
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function ProjectRail({
  title,
  subtitle,
  projects,
  editable = false,
  onEdit,
  onDelete,
  headerAction,
}: {
  title: string
  subtitle: string
  projects: PortfolioProject[]
  editable?: boolean
  onEdit?: (project: PortfolioProject) => void
  onDelete?: (project: PortfolioProject) => void
  headerAction?: React.ReactNode
}) {
  const railRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()

  const moveRail = (direction: -1 | 1) => {
    const rail = railRef.current
    const card = rail?.querySelector<HTMLElement>('.portfolio-card')
    if (!rail || !card) return
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap || '0')
    rail.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' })
  }

  useEffect(() => {
    if (paused || editable || reduceMotion || projects.length < 2) return
    const timer = window.setInterval(() => {
      const rail = railRef.current
      const card = rail?.querySelector<HTMLElement>('.portfolio-card')
      if (!rail || !card) return
      const gap = Number.parseFloat(getComputedStyle(rail).columnGap || '0')
      const step = card.offsetWidth + gap
      const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - step * 0.45
      rail.scrollTo({ left: atEnd ? 0 : rail.scrollLeft + step, behavior: 'smooth' })
    }, 4200)
    return () => window.clearInterval(timer)
  }, [editable, paused, projects.length, reduceMotion])

  return (
    <section className="project-collection" aria-label={`${title}项目`}>
      <div className="project-collection-heading">
        <div>
          <p>{subtitle}</p>
          <h3>{title}</h3>
        </div>
        <div className="project-collection-actions">
          {headerAction}
          <div className="project-rail-controls">
            <button onClick={() => moveRail(-1)} aria-label={`向左浏览${title}`}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <button onClick={() => moveRail(1)} aria-label={`向右浏览${title}`}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {editable && (
        <div className="project-editor-notice">
          <span>编辑模式</span>
          修改会自动保存在当前浏览器中
        </div>
      )}
      {projects.length > 0 ? (
        <div
          className="project-rail"
          ref={railRef}
          onMouseEnter={() => {
            if (!editable) setPaused(true)
          }}
          onMouseLeave={() => {
            if (!editable) setPaused(false)
          }}
          onFocus={() => {
            if (!editable) setPaused(true)
          }}
          onBlur={() => {
            if (!editable) setPaused(false)
          }}
          onPointerDown={() => {
            if (!editable) setPaused(true)
          }}
          onPointerUp={() => {
            if (!editable) setPaused(false)
          }}
        >
          {projects.map((project) => (
            <PortfolioCard project={project} editable={editable} onEdit={onEdit} onDelete={onDelete} key={project.id} />
          ))}
        </div>
      ) : (
        <div className="project-empty-state">
          <ImagePlus aria-hidden="true" />
          <p>当前板块还没有项目，可在管理模式中新增。</p>
        </div>
      )}
      {!editable && projects.length > 0 && (
        <p className="project-rail-hint">自动播放中 · 可左右滑动 · 卡片内箭头切换项目图片</p>
      )}
    </section>
  )
}

function ProjectEditor({
  project,
  onClose,
  onSave,
}: {
  project: PortfolioProject
  onClose: () => void
  onSave: (project: PortfolioProject) => void
}) {
  const [title, setTitle] = useState(project.title)
  const [images, setImages] = useState(project.images)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const addImages = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError('')

    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file, index) => ({
          src: await optimizeImageFile(file),
          alt: `${title || 'AIGC 项目'} · 图 ${images.length + index + 1}`,
        })),
      )
      setImages((current) => [...current, ...uploaded])
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div className="aigc-editor-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.div
        className="aigc-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aigc-editor-title"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="aigc-editor-header">
          <div>
            <span>PROJECT EDITOR</span>
            <h3 id="aigc-editor-title">编辑项目</h3>
          </div>
          <button className="aigc-editor-close" onClick={onClose} aria-label="关闭编辑器">
            <X aria-hidden="true" />
          </button>
        </div>

        <label className="aigc-editor-field">
          <span>项目标题</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="输入项目标题" autoFocus />
        </label>

        <div className="aigc-editor-upload-row">
          <div>
            <span>项目图片</span>
            <p>支持一次上传多张图片，上传顺序即浏览顺序。</p>
          </div>
          <label className="aigc-upload-button">
            <ImagePlus size={18} aria-hidden="true" />
            {uploading ? '处理中…' : '上传图片'}
            <input type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => addImages(event.target.files)} />
          </label>
        </div>

        <div className="aigc-editor-images">
          {images.length > 0 ? images.map((image, index) => (
            <figure key={`${image.src.slice(0, 40)}-${index}`}>
              <img src={image.src} alt={image.alt} />
              <figcaption>图 {String(index + 1).padStart(2, '0')}</figcaption>
              <button onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} aria-label={`删除第 ${index + 1} 张图片`}>
                <X size={15} aria-hidden="true" />
              </button>
            </figure>
          )) : (
            <div className="aigc-editor-image-empty">尚未上传图片</div>
          )}
        </div>

        {error && <p className="aigc-editor-error" role="alert">{error}</p>}

        <div className="aigc-editor-footer">
          <button className="aigc-secondary-button" onClick={onClose}>取消</button>
          <button
            className="aigc-primary-button"
            disabled={!title.trim() || uploading}
            onClick={() => onSave({ ...project, title: title.trim(), images })}
          >
            <Save size={17} aria-hidden="true" />
            保存项目
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CollectionEditor({
  collection,
  onClose,
  onSave,
}: {
  collection: ProjectCollection
  onClose: () => void
  onSave: (collection: ProjectCollection) => void
}) {
  const [title, setTitle] = useState(collection.title)
  const [subtitle, setSubtitle] = useState(collection.subtitle)

  return (
    <motion.div className="aigc-editor-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.div
        className="aigc-editor collection-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-editor-title"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="aigc-editor-header">
          <div>
            <span>COLLECTION EDITOR</span>
            <h3 id="collection-editor-title">编辑板块</h3>
          </div>
          <button className="aigc-editor-close" onClick={onClose} aria-label="关闭板块编辑器">
            <X aria-hidden="true" />
          </button>
        </div>
        <label className="aigc-editor-field">
          <span>板块名称</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：数据分析" autoFocus />
        </label>
        <label className="aigc-editor-field">
          <span>英文标签</span>
          <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="例如：DATA & INSIGHT" />
        </label>
        <div className="aigc-editor-footer">
          <button className="aigc-secondary-button" onClick={onClose}>取消</button>
          <button
            className="aigc-primary-button"
            disabled={!title.trim() || !subtitle.trim()}
            onClick={() => onSave({
              ...collection,
              title: title.trim(),
              subtitle: subtitle.trim().toUpperCase(),
              projects: collection.projects.map((project) => ({ ...project, category: subtitle.trim().toUpperCase() })),
            })}
          >
            <Save size={17} aria-hidden="true" />
            保存板块
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const defaultProjectCollections: ProjectCollection[] = [
  {
    id: 'architecture',
    title: '建筑设计',
    subtitle: 'ARCHITECTURE',
    projects: architectureProjects,
  },
  {
    id: 'aigc',
    title: 'AIGC',
    subtitle: 'GENERATIVE DESIGN',
    projects: aigcProjects,
  },
]

const renumberProjects = (items: PortfolioProject[]) => items.map((item, index) => ({
  ...item,
  number: String(index + 1).padStart(2, '0'),
}))

function Projects() {
  const ownerStudioAvailable = import.meta.env.DEV
  const [collections, setCollections] = useState<ProjectCollection[]>(defaultProjectCollections)
  const [contentReady, setContentReady] = useState(false)
  const [editingEnabled, setEditingEnabled] = useState(false)
  const [editingProject, setEditingProject] = useState<{ collectionId: string; project: PortfolioProject } | null>(null)
  const [editingCollection, setEditingCollection] = useState<ProjectCollection | null>(null)

  useEffect(() => {
    loadProjectCollections(defaultProjectCollections)
      .then((stored) => {
        if (stored) setCollections(stored.map((collection) => ({ ...collection, projects: renumberProjects(collection.projects) })))
      })
      .finally(() => setContentReady(true))
  }, [])

  useEffect(() => {
    if (!contentReady || !ownerStudioAvailable) return
    saveProjectCollections(collections).catch(() => undefined)
  }, [collections, contentReady, ownerStudioAvailable])

  const createProject = (collection: ProjectCollection) => {
    const nextNumber = String(collection.projects.length + 1).padStart(2, '0')
    setEditingProject({
      collectionId: collection.id,
      project: {
        id: `${collection.id}-${Date.now()}`,
        number: nextNumber,
        title: `${collection.title}项目 ${nextNumber}`,
        category: collection.subtitle,
        images: [],
      },
    })
  }

  const saveProject = (collectionId: string, project: PortfolioProject) => {
    setCollections((current) => current.map((collection) => {
      if (collection.id !== collectionId) return collection
      const exists = collection.projects.some((item) => item.id === project.id)
      const projects = exists
        ? collection.projects.map((item) => item.id === project.id ? project : item)
        : [...collection.projects, project]
      return { ...collection, projects: renumberProjects(projects) }
    }))
    setEditingProject(null)
  }

  const deleteProject = (collectionId: string, project: PortfolioProject) => {
    if (!window.confirm(`确定删除“${project.title}”吗？`)) return
    setCollections((current) => current.map((collection) => collection.id === collectionId
      ? { ...collection, projects: renumberProjects(collection.projects.filter((item) => item.id !== project.id)) }
      : collection))
  }

  const saveCollection = (collection: ProjectCollection) => {
    setCollections((current) => current.some((item) => item.id === collection.id)
      ? current.map((item) => item.id === collection.id ? collection : item)
      : [...current, collection])
    setEditingCollection(null)
  }

  const createCollection = () => {
    setEditingCollection({
      id: `collection-${Date.now()}`,
      title: '新板块',
      subtitle: 'NEW COLLECTION',
      projects: [],
    })
  }

  const deleteCollection = (collection: ProjectCollection) => {
    if (!window.confirm(`确定删除“${collection.title}”板块及其全部项目吗？`)) return
    setCollections((current) => current.filter((item) => item.id !== collection.id))
  }

  const resetCollections = async () => {
    if (!window.confirm('确定恢复为素材文件生成的建筑板块和 6 个 AIGC 默认卡片吗？')) return
    await clearProjectCollections()
    setCollections(defaultProjectCollections)
  }

  return (
    <section className="projects section-shell" id="projects">
      <div className="section-index">03 / PROJECTS</div>
      <div className="projects-heading projects-heading--with-owner-tools">
        <Reveal>
          <h2 className="display-heading">PROJECTS</h2>
        </Reveal>
        {ownerStudioAvailable && (
          <div className="owner-studio-toolbar">
            {editingEnabled && (
              <>
                <button className="aigc-add-button" onClick={createCollection}>
                  <Plus size={17} aria-hidden="true" />
                  新增板块
                </button>
                <button className="owner-reset-button" onClick={resetCollections}>恢复默认</button>
              </>
            )}
            <button className={editingEnabled ? 'aigc-manage-button is-active' : 'aigc-manage-button'} onClick={() => setEditingEnabled((current) => !current)}>
              <Pencil size={16} aria-hidden="true" />
              {editingEnabled ? '退出工作台' : '业主工作台'}
            </button>
          </div>
        )}
      </div>

      {collections.map((collection) => (
        <ProjectRail
          key={collection.id}
          title={collection.title}
          subtitle={collection.subtitle}
          projects={collection.projects}
          editable={ownerStudioAvailable && editingEnabled}
          onEdit={(project) => setEditingProject({ collectionId: collection.id, project })}
          onDelete={(project) => deleteProject(collection.id, project)}
          headerAction={ownerStudioAvailable && editingEnabled ? (
            <div className="aigc-header-actions">
              <button className="aigc-add-button" onClick={() => createProject(collection)}>
                <Plus size={17} aria-hidden="true" />
                新增项目
              </button>
              <button className="collection-edit-button" onClick={() => setEditingCollection(collection)}>
                <Pencil size={16} aria-hidden="true" />
                编辑板块
              </button>
              <button className="collection-delete-button" onClick={() => deleteCollection(collection)}>
                <Trash2 size={16} aria-hidden="true" />
                删除板块
              </button>
            </div>
          ) : undefined}
        />
      ))}

      <AnimatePresence>
        {editingProject && (
          <ProjectEditor
            project={editingProject.project}
            onClose={() => setEditingProject(null)}
            onSave={(project) => saveProject(editingProject.collectionId, project)}
          />
        )}
        {editingCollection && <CollectionEditor collection={editingCollection} onClose={() => setEditingCollection(null)} onSave={saveCollection} />}
      </AnimatePresence>
    </section>
  )
}

function Strengths() {
  return (
    <section className="strengths section-shell" id="strengths">
      <div className="section-index">04 / CAPABILITIES</div>
      <Reveal>
        <h2 className="display-heading">个人优势</h2>
      </Reveal>
      <MagicBento
        className="capability-grid"
        particleCount={10}
        spotlightRadius={320}
        glowColor="132, 174, 255"
        enableTilt
        enableMagnetism
        clickEffect
      >
        {capabilities.map((item, index) => (
          <Reveal className="capability-card" delay={(index % 3) * 0.08} key={item.number}>
            <div className="capability-top">
              <span>{item.number}</span>
              <ArrowUpRight size={22} strokeWidth={1.4} aria-hidden="true" />
            </div>
            <div className="capability-body">
              <p className="capability-english">{item.english}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="capability-tools">{item.tools}</span>
            </div>
          </Reveal>
        ))}
      </MagicBento>
    </section>
  )
}

function Contact() {
  return (
    <footer className="contact" id="contact">
      <div className="contact-rings" aria-hidden="true">
        <MagicRings
          color="#7694e8"
          colorTwo="#bce7ef"
          ringCount={7}
          speed={0.42}
          attenuation={13}
          lineThickness={1.15}
          baseRadius={0.2}
          radiusStep={0.078}
          scaleRate={0.062}
          opacity={0.72}
          noiseAmount={0.025}
          rotation={-14}
          followMouse
          mouseInfluence={0.1}
          hoverScale={1.08}
          parallax={0.02}
          clickBurst
        />
      </div>
      <div className="contact-rings-veil" aria-hidden="true" />
      <div className="section-index">05 / CONTACT</div>
      <div className="contact-content">
        <Reveal>
          <p className="contact-kicker">AVAILABLE FOR OPPORTUNITIES & COLLABORATION</p>
          <h2>
            LET'S BUILD
            <br />
            WHAT'S NEXT.
          </h2>
        </Reveal>
        <div className="contact-links">
          <Reveal>
            <a href="mailto:2859272324@qq.com">
              <Mail aria-hidden="true" />
              <span>
                <small>EMAIL</small>
                2859272324@qq.com
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Reveal>
          <Reveal delay={0.08}>
            <a href="tel:+8617260241008">
              <Phone aria-hidden="true" />
              <span>
                <small>PHONE</small>
                +86 172 6024 1008
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </div>
      <div className="contact-footer">
        <span>© 2026 ZHANG JIN</span>
        <span>DESIGNED FOR THE NEXT CHAPTER</span>
        <a href="#top">
          回到顶部 <ChevronUp size={16} aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <main>
      <Hero />
      <MarqueeGallery />
      <About />
      <Experience />
      <Projects />
      <Strengths />
      <Contact />
    </main>
  )
}
