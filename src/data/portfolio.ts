export type ProjectCategory = 'architecture' | 'ai' | 'data' | 'photography'

export type ProfileVariant = 'editorial' | '3d'

// 修改这一项即可在两版头像之间切换。
export const activeProfileVariant: ProfileVariant = 'editorial'

export const profileImages: Record<ProfileVariant, string> = {
  editorial: '/assets/profile/dsc00387-original.webp',
  '3d': '/assets/profile/zhang-jin-3d.webp',
}

export type Project = {
  id: string
  number: string
  title: string
  englishTitle: string
  category: ProjectCategory
  categoryLabel: string
  year: string
  status: string
  description: string
  tags: string[]
  image: string
  alt: string
  notice: string
}

export const categories = [
  { value: 'all', label: '全部' },
  { value: 'architecture', label: '建筑设计' },
  { value: 'ai', label: 'AI 设计' },
  { value: 'data', label: '数据分析' },
  { value: 'photography', label: '摄影' },
] as const

export const projects: Project[] = [
  {
    id: 'restorative-workplace',
    number: '01',
    title: '高层办公建筑共享空间优化策略研究',
    englishTitle: 'Restorative Workplace',
    category: 'architecture',
    categoryLabel: '建筑设计 / 研究',
    year: '2024—2026',
    status: '硕士研究',
    description:
      '以恢复性环境理论为基础，围绕共享办公人群的空间体验与真实需求，建立从用户研究到设计策略的完整闭环。',
    tags: ['恢复性环境', '共享空间', '设计策略'],
    image: '/assets/projects/office-shared-space.webp',
    alt: '高层办公建筑共享空间的概念视觉',
    notice: '概念视觉',
  },
  {
    id: 'age-friendly-community',
    number: '02',
    title: '社区养老空间适老化设计研究',
    englishTitle: 'Age-friendly Community',
    category: 'architecture',
    categoryLabel: '建筑设计 / 论文',
    year: '2025',
    status: '论文成果',
    description:
      '从人工智能视域重新审视社区养老空间的适老化需求，关注无障碍、安全、交往与尊严感之间的空间平衡。',
    tags: ['适老化', '社区空间', 'AI 视域'],
    image: '/assets/projects/age-friendly-community.webp',
    alt: '社区养老空间适老化设计的概念视觉',
    notice: '概念视觉',
  },
  {
    id: 'workspace-insight',
    number: '03',
    title: '共享办公人群满意度调研与洞察',
    englishTitle: 'Workspace Insight',
    category: 'data',
    categoryLabel: '数据分析 / 用户研究',
    year: '2024—2026',
    status: '研究分析',
    description:
      '通过满意度问卷整理空间环境、功能配置与使用体验反馈，识别关键痛点，并将数据结论转化为可执行的设计策略。',
    tags: ['问卷调研', '用户洞察', '数据表达'],
    image: '/assets/projects/workspace-data.webp',
    alt: '共享办公满意度调研与空间数据分析的概念视觉',
    notice: '概念视觉',
  },
  {
    id: 'ai-space-lab',
    number: '04',
    title: 'AI 辅助空间概念实验',
    englishTitle: 'Generative Space Lab',
    category: 'ai',
    categoryLabel: 'AI 设计 / 实验',
    year: '2026',
    status: 'CONCEPT STUDY',
    description:
      '以语言模型与 ComfyUI 为辅助工具，探索从概念语义、形态生成到空间氛围表达的工作流，并坚持人工判断与核验。',
    tags: ['ComfyUI', '生成式设计', '工作流'],
    image: '/assets/projects/ai-space-study.webp',
    alt: 'AI 辅助生成式空间实验的概念视觉',
    notice: '概念视觉',
  },
  {
    id: 'visual-archive',
    number: '05',
    title: '校园与城市空间影像档案',
    englishTitle: 'Spatial Image Archive',
    category: 'photography',
    categoryLabel: '摄影 / 影像记录',
    year: 'ONGOING',
    status: '作品更新中',
    description:
      '持续记录建筑、城市界面与日常空间中的光线、尺度和人的痕迹。首批个人摄影作品整理完成后将在此替换展示。',
    tags: ['建筑摄影', '城市观察', '影像档案'],
    image: '/assets/projects/urban-photography.webp',
    alt: '校园与城市空间影像档案的占位概念视觉',
    notice: '概念视觉 · 非本人摄影作品',
  },
]

// 后续增添滚动画廊图片时，只需把文件放入 public/assets/gallery，
// 再将路径添加到对应数组。组件会自动重复图片并形成连续滚动。
export const marqueeMedia = {
  photography: [
    {
      src: '/assets/projects/urban-photography.webp',
      alt: '城市空间摄影占位图',
    },
    {
      src: '/assets/projects/office-shared-space.webp',
      alt: '建筑空间摄影占位图',
    },
    {
      src: '/assets/projects/age-friendly-community.webp',
      alt: '社区空间摄影占位图',
    },
  ],
  ai: [
    {
      src: '/assets/projects/ai-space-study.webp',
      alt: 'AI 空间生成实验',
    },
    {
      src: '/assets/projects/workspace-data.webp',
      alt: 'AI 与空间数据概念视觉',
    },
    {
      src: '/assets/projects/office-shared-space.webp',
      alt: 'AI 建筑概念视觉',
    },
  ],
}

export const capabilities = [
  {
    number: '01',
    title: '建筑设计与深化',
    english: 'ARCHITECTURE',
    description: '从方案讨论、空间推演到图纸、模型与成果文件，关注细节一致性和落地表达。',
    tools: 'CAD · SketchUp · Rhino',
  },
  {
    number: '02',
    title: '视觉表达',
    english: 'VISUAL DIRECTION',
    description: '以清晰的信息层级组织汇报、投标和研究材料，让复杂内容获得准确而克制的视觉表达。',
    tools: 'Photoshop · Illustrator',
  },
  {
    number: '03',
    title: 'AI 辅助工作流',
    english: 'AI WORKFLOW',
    description: '使用多种大模型与节点式工作流辅助检索、创意发散和初稿整理，并保留人工复核。',
    tools: 'ChatGPT · DeepSeek · ComfyUI',
  },
  {
    number: '04',
    title: '用户研究与数据洞察',
    english: 'RESEARCH & DATA',
    description: '从问卷与使用反馈中识别需求和痛点，把用户洞察翻译为可落地的空间优化策略。',
    tools: 'Survey · Insight · Strategy',
  },
  {
    number: '05',
    title: '摄影记录',
    english: 'PHOTOGRAPHY',
    description: '关注建筑空间、现场氛围与城市日常，用影像建立对尺度、光线和叙事的敏感度。',
    tools: 'Architecture · Urban · Event',
  },
  {
    number: '06',
    title: '内容运营与项目协同',
    english: 'CONTENT OPS · BEGINNER',
    description: '具备资料整理、任务跟进、节点沟通与活动执行经验，正在系统学习内容运营方法。',
    tools: '入门阶段 · 持续学习',
  },
]
