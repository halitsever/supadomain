import { defineConfig } from 'vitepress'

const site = 'https://halitsever.github.io/supadomain/'
const homeTitle = 'Self-hosted domain expiration monitoring'
const description = 'Supadomain is a self-hosted, open source domain expiration monitoring tool. It reads expiry dates over RDAP and sends a Slack alert before a domain expires.'

const repo = 'https://github.com/halitsever/supadomain'
const license = 'https://opensource.org/licenses/MIT'
const author = { '@type': 'Person', name: 'Halit Sever', url: 'https://github.com/halitsever' }

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${site}#app`,
      name: 'Supadomain',
      description,
      url: site,
      image: `${site}og.png`,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Node.js 18 or later',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      license,
      author,
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${site}#source`,
      name: 'Supadomain',
      codeRepository: repo,
      programmingLanguage: ['TypeScript', 'Vue'],
      runtimePlatform: 'Node.js',
      license,
      author,
      targetProduct: { '@id': `${site}#app` },
    },
  ],
}

export default defineConfig({
  base: '/supadomain/',
  lang: 'en',
  title: 'Supadomain',
  titleTemplate: ':title | Supadomain',
  description,
  cleanUrls: true,
  appearance: false,
  sitemap: { hostname: site },

  head: [
    /** Cloudflare Web Analytics, one token for every page on halitsever.github.io. */
    ['script', { defer: '', src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "dd7e54d3f48841c187d72d9dbb92a6b6"}' }],
    ['link', { rel: 'icon', href: '/supadomain/favicon.ico', sizes: '32x32' }],
    ['link', { rel: 'icon', href: '/supadomain/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#0b3fd8' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Supadomain' }],
    ['meta', { property: 'og:image', content: `${site}og.png` }],
    ['meta', { property: 'og:image:width', content: '1280' }],
    ['meta', { property: 'og:image:height', content: '640' }],
    ['meta', { property: 'og:image:alt', content: 'Supadomain dashboard listing domains by days left until expiry' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${site}og.png` }],
    ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)],
  ],

  transformPageData(pageData) {
    const isHome = pageData.relativePath === 'index.md'
    const title = pageData.frontmatter.title ?? pageData.title
    const url = site + pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
    const pageDescription = pageData.frontmatter.description ?? description
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: isHome ? `${homeTitle} | Supadomain` : `${title} | Supadomain` }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { name: 'twitter:title', content: isHome ? `${homeTitle} | Supadomain` : `${title} | Supadomain` }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
    )
  },

  markdown: {
    theme: 'github-light-default',
  },

  themeConfig: {
    logo: { src: '/favicon.svg', alt: '' },
    siteTitle: 'Supadomain',
    nav: [
      { text: 'Get started', link: '/guide/getting-started' },
      { text: 'Slack alerts', link: '/guide/slack-alerts' },
      { text: 'RDAP', link: '/guide/rdap-vs-whois' },
      { text: 'Configuration', link: '/guide/configuration' },
    ],
    sidebar: [
      {
        text: 'Guides',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'How to monitor domain expiration', link: '/guide/monitor-domain-expiration' },
          { text: 'Slack expiry alerts', link: '/guide/slack-alerts' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'RDAP vs WHOIS', link: '/guide/rdap-vs-whois' },
          { text: 'Configuration', link: '/guide/configuration' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: repo }],
    outline: { level: [2, 3], label: 'On this page' },
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/halitsever/supadomain/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Built by Halit Sever.',
    },
  },
})
