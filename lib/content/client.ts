import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'
import type { z } from 'zod'

/**
 * 内容加载层。
 *
 * 所有内容以文件形式存放于 content/，构建期读取并校验。
 * 没有数据库——这正是「无需运行数据库即可编辑内容」这条要求的基础。
 *
 * ⚠️ 只能在 Node 环境（构建期 / 服务端 / 脚本）使用。
 */

export const CONTENT_ROOT = path.join(process.cwd(), 'content')

export interface ParsedFile<T> {
  /** 绝对路径，用于 log 定位 */
  filePath: string
  /** 相对 content/ 的路径，报错时展示这个更易读 */
  relativePath: string
  /** 由文件名推导出的 slug（不含扩展名） */
  fileSlug: string
  data: T
  /** MDX 正文；YAML 集合为空字符串 */
  body: string
}

/** 内容校验失败。携带**全部**问题，避免修一个报一个。 */
export class ContentValidationError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(`内容校验失败，共 ${issues.length} 处问题：\n${issues.join('\n')}`)
    this.name = 'ContentValidationError'
    this.issues = issues
  }
}

function walkFiles(dir: string, ext: string): string[] {
  if (!existsSync(dir)) return []

  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...walkFiles(full, ext))
    } else if (entry.name.endsWith(ext)) {
      found.push(full)
    }
  }
  // 排序保证构建产物稳定，避免每次构建的数组顺序不同导致 diff 噪音
  return found.sort()
}

function formatIssues(error: z.ZodError, label: string): string[] {
  return error.issues.map((issue) => {
    const where = issue.path.length > 0 ? issue.path.join('.') : '(根)'
    return `  · ${label} → ${where}：${issue.message}`
  })
}

interface LoadOptions {
  /**
   * 是否把 MDX 正文注入到 frontmatter 的 body 字段后再校验。
   * 用于「正文写在 MDX、正文又必须是 Schema 必填字段」的集合（如产品知识）。
   */
  injectBody?: boolean
}

/**
 * 加载 .mdx 集合：frontmatter 走 Schema 校验，正文原样保留。
 */
export function loadMdxCollection<T>(
  dirRelative: string,
  schema: z.ZodType<T>,
  options: LoadOptions = {},
): ParsedFile<T>[] {
  const dir = path.join(CONTENT_ROOT, dirRelative)
  const files = walkFiles(dir, '.mdx')
  const results: ParsedFile<T>[] = []
  const issues: string[] = []

  for (const filePath of files) {
    const relativePath = path.relative(CONTENT_ROOT, filePath).replace(/\\/g, '/')
    const fileSlug = path.basename(filePath, '.mdx')

    let raw: matter.GrayMatterFile<string>
    try {
      raw = matter(readFileSync(filePath, 'utf8'))
    } catch (cause) {
      issues.push(`  · ${relativePath} → frontmatter 解析失败：${String(cause)}`)
      continue
    }

    const candidate = options.injectBody
      ? { ...raw.data, body: raw.content.trim() }
      : raw.data

    const parsed = schema.safeParse(candidate)
    if (!parsed.success) {
      issues.push(...formatIssues(parsed.error, relativePath))
      continue
    }

    // slug 必须与文件名一致，否则站内链接会指向不存在的路径
    const slug = (parsed.data as { slug?: unknown }).slug
    if (typeof slug === 'string' && slug !== fileSlug) {
      issues.push(
        `  · ${relativePath} → frontmatter 的 slug 是「${slug}」，与文件名「${fileSlug}」不一致`,
      )
      continue
    }

    results.push({ filePath, relativePath, fileSlug, data: parsed.data, body: raw.content.trim() })
  }

  if (issues.length > 0) throw new ContentValidationError(issues)
  return results
}

/**
 * 加载 .yaml 集合：整个文件即一条数据。
 */
export function loadYamlCollection<T>(
  dirRelative: string,
  schema: z.ZodType<T>,
): ParsedFile<T>[] {
  const dir = path.join(CONTENT_ROOT, dirRelative)
  const files = walkFiles(dir, '.yaml')
  const results: ParsedFile<T>[] = []
  const issues: string[] = []

  for (const filePath of files) {
    const relativePath = path.relative(CONTENT_ROOT, filePath).replace(/\\/g, '/')
    const fileSlug = path.basename(filePath, '.yaml')

    let parsedYaml: unknown
    try {
      parsedYaml = parseYaml(readFileSync(filePath, 'utf8'))
    } catch (cause) {
      issues.push(`  · ${relativePath} → YAML 解析失败：${String(cause)}`)
      continue
    }

    const parsed = schema.safeParse(parsedYaml)
    if (!parsed.success) {
      issues.push(...formatIssues(parsed.error, relativePath))
      continue
    }

    const slug = (parsed.data as { slug?: unknown }).slug
    if (typeof slug === 'string' && slug !== fileSlug) {
      issues.push(
        `  · ${relativePath} → 文件中的 slug 是「${slug}」，与文件名「${fileSlug}」不一致`,
      )
      continue
    }

    results.push({ filePath, relativePath, fileSlug, data: parsed.data, body: '' })
  }

  if (issues.length > 0) throw new ContentValidationError(issues)
  return results
}
