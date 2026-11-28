import { defineConfig } from 'vitepress'

const site = 'https://projects.halit.org/supadomain/'
const homeTitle = 'Self-hosted domain expiration monitoring'
const description = 'Supadomain is a self-hosted, open source domain expiration monitoring tool. It reads expiry dates over RDAP and sends a Slack alert before a domain expires.'

const repo = 'https://github.com/halitsever/supadomain'
const license = 'https://opensource.org/licenses/MIT'
const author = { '@type': 'Person', name: 'Halit Sever', url: 'https://github.com/halitsever' }

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${site}#source`,
      name: 'Supadomain',
      description,
      url: site,
      image: `${site}og.png`,
      codeRepository: repo,
      programmingLanguage: ['TypeScript', 'Vue'],
      runtimePlatform: 'Node.js',
      license,
      author,
    },
  ],
}

const person = { '@type': 'Person', name: 'Halit Sever', url: 'https://halit.org' }

/** BlogPosting and breadcrumbs for posts, FAQPage wherever the page shows an FAQ. */
function pageJsonLd(fm: Record<string, any>, url: string, title: string, pageDescription: string) {
  const graph: object[] = []
  if (fm.date) {
    graph.push(
      {
        '@type': 'BlogPosting',
        headline: fm.headline ?? title,
        description: pageDescription,
        url,
        mainEntityOfPage: url,
        datePublished: fm.date,
        dateModified: fm.date,
        inLanguage: 'en',
        image: `${site}og.png`,
        keywords: fm.keyword,
        author: person,
        publisher: person,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Supadomain', item: site },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${site}blog/` },
          { '@type': 'ListItem', position: 3, name: fm.headline ?? title, item: url },
        ],
      },
    )
  }
  if (fm.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: fm.faq.map((f: { q: string; a: string }) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>|`|\*\*/g, '') },
      })),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

export default defineConfig({
  /** keeps the page hash map out of every page's HTML, which Semrush reads as a low text-to-HTML ratio */
  metaChunk: true,
  base: '/supadomain/',
  lang: 'en',
  title: 'Supadomain',
  titleTemplate: ':title | Supadomain',
  description,
  cleanUrls: true,
  appearance: false,
  sitemap: { hostname: site },

  head: [
    /** Cloudflare Web Analytics, one token for every page on projects.halit.org. */
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
    const fm = pageData.frontmatter
    // Pages with titleTemplate: false already carry their full title.
    const fullTitle = isHome ? `${homeTitle} | Supadomain` : fm.titleTemplate === false ? title : `${title} | Supadomain`
    fm.head ??= []
    fm.head.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: fullTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { name: 'twitter:title', content: fullTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
    )
    if (fm.date) fm.head.push(['meta', { property: 'article:published_time', content: fm.date }])
    if (fm.date || fm.faq) fm.head.push(['script', { type: 'application/ld+json' }, JSON.stringify(pageJsonLd(fm, url, title, pageDescription))])
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
      { text: 'Expiry checker', link: '/domain-expiry-checker/' },
      { text: 'Blog', link: '/blog/', activeMatch: '/blog/' },
    ],
    sidebar: {
      '/blog/': [
        {
          text: 'Blog',
          items: [
            { text: 'All posts', link: '/blog/' },
            { text: 'Slack webhook URL', link: '/blog/slack-webhook-url' },
            { text: 'Domain renewal', link: '/blog/domain-renewal' },
            { text: 'Transfer an expired domain', link: '/blog/transfer-expired-domain' },
            { text: 'What happens to expired domains', link: '/blog/what-happens-to-expired-domains' },
            { text: 'Check a domain expiry date', link: '/blog/check-domain-expiry-date' },
            { text: 'RDAP redacted values', link: '/blog/rdap-server-redacted-the-value' },
            { text: 'No registry RDAP server', link: '/blog/no-registry-rdap-server' },
            { text: 'Domain expiry scam emails', link: '/blog/domain-expiry-scam-email' },
          ],
        },
        {
          text: 'Tools',
          items: [{ text: 'Domain expiry checker', link: '/domain-expiry-checker/' }],
        },
      ],
      '/guide/': [
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
      {
        text: 'More',
        items: [
          { text: 'Domain expiry checker', link: '/domain-expiry-checker/' },
          { text: 'Blog', link: '/blog/' },
        ],
      },
    ],
    },
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
