import type { PortfolioProject } from '../data/media.generated'

export type ProjectCollection = {
  id: string
  title: string
  subtitle: string
  projects: PortfolioProject[]
}

const DATABASE_NAME = 'zhang-jin-portfolio'
const STORE_NAME = 'content'
const COLLECTIONS_KEY = 'project-collections-v2'
const LEGACY_COLLECTIONS_KEY = 'project-collections-v1'
const LEGACY_AIGC_KEY = 'aigc-projects'

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function getStoredValue<T>(database: IDBDatabase, key: string) {
  return new Promise<T | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key)
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
}

export async function loadProjectCollections(defaults: ProjectCollection[]) {
  if (typeof indexedDB === 'undefined') return null
  const database = await openDatabase()
  const stored = await getStoredValue<ProjectCollection[]>(database, COLLECTIONS_KEY)

  if (stored) {
    database.close()
    return stored
  }

  const legacyCollections = await getStoredValue<ProjectCollection[]>(database, LEGACY_COLLECTIONS_KEY)
  if (legacyCollections) {
    database.close()
    return defaults.map((defaultCollection) => {
      const legacyCollection = legacyCollections.find((collection) => collection.id === defaultCollection.id)
      if (!legacyCollection) return defaultCollection
      if (defaultCollection.id !== 'aigc') return legacyCollection

      const bundledProjects = defaultCollection.projects.filter((project) =>
        !legacyCollection.projects.some((legacyProject) => legacyProject.id === project.id))

      return {
        ...legacyCollection,
        title: defaultCollection.title,
        subtitle: defaultCollection.subtitle,
        projects: [...legacyCollection.projects, ...bundledProjects],
      }
    })
  }

  const legacyAigc = await getStoredValue<PortfolioProject[]>(database, LEGACY_AIGC_KEY)
  database.close()

  if (!legacyAigc) return null
  return defaults.map((collection) => {
    if (collection.id !== 'aigc') return collection
    const bundledProjects = collection.projects.filter((project) =>
      !legacyAigc.some((legacyProject) => legacyProject.id === project.id))
    return { ...collection, projects: [...legacyAigc, ...bundledProjects] }
  })
}

export async function saveProjectCollections(collections: ProjectCollection[]) {
  if (typeof indexedDB === 'undefined') return
  const database = await openDatabase()

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(collections, COLLECTIONS_KEY)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })

  database.close()
}

export async function clearProjectCollections() {
  if (typeof indexedDB === 'undefined') return
  const database = await openDatabase()

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(COLLECTIONS_KEY)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })

  database.close()
}

export function optimizeImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      const maxEdge = 1800
      const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      const context = canvas.getContext('2d')

      if (!context) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('图片处理失败'))
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl)
          if (!blob) {
            reject(new Error('图片处理失败'))
            return
          }

          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(blob)
        },
        'image/webp',
        0.86,
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('无法读取该图片'))
    }
    image.src = objectUrl
  })
}
