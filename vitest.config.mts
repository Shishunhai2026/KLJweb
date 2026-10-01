import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    // 内容校验测试需要读取真实 content 目录，放宽默认超时
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      // 这三处「出错即事故」：计分、护栏、内容 Schema
      thresholds: {
        'lib/isi/**': { branches: 100, functions: 100, lines: 100, statements: 100 },
        'lib/ai/guardrails/**': { branches: 100, functions: 100, lines: 100, statements: 100 },
        'lib/content/schema.ts': { branches: 100, functions: 100, lines: 100, statements: 100 },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
