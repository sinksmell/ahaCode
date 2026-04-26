import { defineConfig, type HeadConfig } from 'vitepress'
import { version } from './_data/assets.json'

const siteUrl = 'https://sinksmell.github.io/ahaCode'
const siteTitle = 'ahaCode'
const ogImage = `${siteUrl}/og-image.png`

function resolvePagePath(relativePath: string) {
  if (!relativePath || relativePath === 'index.md')
    return '/'

  if (relativePath.endsWith('/index.md'))
    return `/${relativePath.slice(0, -'index.md'.length)}`

  return `/${relativePath.replace(/\.md$/, '.html')}`
}

function resolvePageUrl(relativePath: string) {
  return new URL(resolvePagePath(relativePath), siteUrl).toString()
}

function buildSeoHead({
  relativePath,
  pageTitle,
  pageDescription,
  isNotFound,
}: {
  relativePath: string
  pageTitle: string
  pageDescription: string
  isNotFound?: boolean
}): HeadConfig[] {
  if (isNotFound)
    return [['meta', { name: 'robots', content: 'noindex, nofollow' }]]

  const pageUrl = resolvePageUrl(relativePath)

  return [
    ['link', { rel: 'canonical', href: pageUrl }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: siteTitle }],
    ['meta', { property: 'og:title', content: pageTitle }],
    ['meta', { property: 'og:description', content: pageDescription }],
    ['meta', { property: 'og:url', content: pageUrl }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: pageTitle }],
    ['meta', { name: 'twitter:description', content: pageDescription }],
    ['meta', { name: 'twitter:image', content: ogImage }],
  ]
}

const enSidebar = [
  {
    text: 'General',
    items: [
      { text: 'Overview', link: '/documentation/' },
      { text: 'Storage', link: '/documentation/storage' },
      { text: 'Sync', link: '/documentation/sync' },
      { text: 'Themes', link: '/documentation/themes' },
    ],
  },
  {
    text: 'Code',
    items: [
      { text: 'Library', link: '/documentation/code/library' },
      { text: 'Folders', link: '/documentation/code/folders' },
      { text: 'Tags', link: '/documentation/code/tags' },
      { text: 'Snippets', link: '/documentation/code/snippets' },
      { text: 'Fragments', link: '/documentation/code/fragments' },
      { text: 'Description', link: '/documentation/code/description' },
      { text: 'Search', link: '/documentation/code/search' },
    ],
  },
  {
    text: 'AI',
    items: [
      { text: 'MCP Server', link: '/documentation/ai/' },
    ],
  },
]

const zhSidebar = [
  {
    text: '通用',
    items: [
      { text: '概览', link: '/zh/documentation/' },
      { text: '存储', link: '/zh/documentation/storage' },
      { text: '同步', link: '/zh/documentation/sync' },
      { text: '主题', link: '/zh/documentation/themes' },
    ],
  },
  {
    text: '代码',
    items: [
      { text: '资料库', link: '/zh/documentation/code/library' },
      { text: '文件夹', link: '/zh/documentation/code/folders' },
      { text: '标签', link: '/zh/documentation/code/tags' },
      { text: '代码片段', link: '/zh/documentation/code/snippets' },
      { text: '片段', link: '/zh/documentation/code/fragments' },
      { text: '描述', link: '/zh/documentation/code/description' },
      { text: '搜索', link: '/zh/documentation/code/search' },
    ],
  },
  {
    text: 'AI',
    items: [
      { text: 'MCP 服务', link: '/zh/documentation/ai/' },
    ],
  },
]

export default defineConfig({
  title: siteTitle,
  description: 'Free, open-source code snippets manager with Markdown vault storage, AI-powered search via MCP, and local-first design.',
  base: '/ahaCode/',

  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      return items.filter(item => !item.url.endsWith('/404.html'))
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/ahaCode/logo-64w.png' }],
  ],

  transformHead({ pageData, title, description }) {
    return buildSeoHead({
      relativePath: pageData.relativePath,
      pageTitle: title,
      pageDescription: description,
      isNotFound: pageData.isNotFound,
    })
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      description: '免费开源的代码片段管理器，基于 Markdown 存储，支持 MCP 协议的 AI 语义搜索，数据完全本地化。',
      themeConfig: {
        nav: [
          { text: '文档', link: '/zh/documentation/' },
          {
            text: version,
            items: [
              { text: '下载', link: '/zh/download/' },
              { text: '更新日志', link: 'https://github.com/sinksmell/ahaCode/releases' },
            ],
          },
        ],
        sidebar: {
          '/zh/documentation/': zhSidebar,
        },
        editLink: {
          pattern: 'https://github.com/sinksmell/ahaCode/edit/master/docs/website/:path',
          text: '在 GitHub 上编辑此页',
        },
        footer: {
          message: 'ahaCode 基于 AGPL v3 协议发布。Fork 自 <a href="https://github.com/massCodeIO/massCode">massCode</a>。',
          copyright: 'Copyright © 2024-present ahaCode Contributors',
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo-64w.png',

    nav: [
      { text: 'Documentation', link: '/documentation/' },
      {
        text: version,
        items: [
          { text: 'Download', link: '/download/' },
          { text: 'Change Log', link: 'https://github.com/sinksmell/ahaCode/releases' },
        ],
      },
    ],

    sidebar: {
      '/documentation/': enSidebar,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sinksmell/ahaCode' },
    ],

    footer: {
      message: 'ahaCode released under the AGPL v3 License. Forked from <a href="https://github.com/massCodeIO/massCode">massCode</a>.',
      copyright: 'Copyright © 2024-present ahaCode Contributors',
    },

    editLink: {
      pattern: 'https://github.com/sinksmell/ahaCode/edit/master/docs/website/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
