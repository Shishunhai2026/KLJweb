// eslint-config-next 16 直接导出扁平配置数组（Linter.Config[]），
// 通过 package.json 的 exports 映射暴露子路径，无需文件后缀。
import next from 'eslint-config-next'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'coverage/**',
      'data/**',
      'next-env.d.ts',
      // 客户原始资料，非项目源码
      '产品资料/**',
      '产品图片/**',
      '网站首页轮播图片/**',
    ],
  },
  ...next,
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      // 内容集合中大量使用「先解构再展开」的不可变写法，允许未使用的占位变量
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]

export default eslintConfig
