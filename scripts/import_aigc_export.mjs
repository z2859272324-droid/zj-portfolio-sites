import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const exportPath = process.argv[2]

if (!exportPath) {
  throw new Error('请提供“导出配置”生成的 JSON 文件路径。')
}

const payload = JSON.parse(fs.readFileSync(path.resolve(exportPath), 'utf8'))
const aigcCollection = payload.collections?.find((collection) => collection.id === 'aigc')

if (!aigcCollection) {
  throw new Error('导出文件中没有找到 AIGC 板块。')
}

const assetsRoot = path.join(root, 'public', 'assets')
const targetRoot = path.join(assetsRoot, 'aigc')

if (path.dirname(targetRoot) !== assetsRoot || path.basename(targetRoot) !== 'aigc') {
  throw new Error('AIGC 素材输出路径校验失败。')
}

fs.rmSync(targetRoot, { recursive: true, force: true })
fs.mkdirSync(targetRoot, { recursive: true })

const extensionByMime = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const projects = aigcCollection.projects.map((project, projectIndex) => {
  const projectFolder = `project-${String(projectIndex + 1).padStart(2, '0')}`
  const projectTarget = path.join(targetRoot, projectFolder)
  fs.mkdirSync(projectTarget, { recursive: true })

  const images = project.images.map((image, imageIndex) => {
    if (!image.src.startsWith('data:')) return image

    const match = image.src.match(/^data:([^;]+);base64,(.+)$/s)
    if (!match) throw new Error(`无法解析 ${project.title} 的第 ${imageIndex + 1} 张图片。`)

    const extension = extensionByMime[match[1]] ?? 'bin'
    const filename = `${String(imageIndex + 1).padStart(2, '0')}.${extension}`
    fs.writeFileSync(path.join(projectTarget, filename), Buffer.from(match[2], 'base64'))

    return {
      src: `/assets/aigc/${projectFolder}/${filename}`,
      alt: image.alt || `${project.title} · 图 ${imageIndex + 1}`,
    }
  })

  return {
    id: project.id,
    number: String(projectIndex + 1).padStart(2, '0'),
    title: project.title,
    category: project.category || 'AIGC',
    images,
  }
})

const generatedSource = [
  '// 此文件由 scripts/import_aigc_export.mjs 根据站长工作台导出配置生成。',
  "import type { PortfolioProject } from './media.generated'",
  '',
  `export const savedAigcProjects: PortfolioProject[] = ${JSON.stringify(projects, null, 2)}`,
  '',
].join('\n')

fs.writeFileSync(path.join(root, 'src', 'data', 'aigc.generated.ts'), generatedSource, 'utf8')

console.log(JSON.stringify({
  projects: projects.length,
  images: projects.reduce((sum, project) => sum + project.images.length, 0),
  titles: projects.map((project) => project.title),
}, null, 2))
