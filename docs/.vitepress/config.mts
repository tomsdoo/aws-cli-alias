import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/aws-cli-alias/',
  title: "AWS CLI Alias",
  description: "aliases for me",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'get started', link: '/getting-started' }
    ],

    sidebar: [
      {
        text: 'contents',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'geta', link: '/alias-geta' },
          { text: 'kv', link: '/alias-kv' },
          { text: 'note', link: '/alias-note' },
          { text: 'store', link: '/alias-store' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tomsdoo/aws-cli-alias' }
    ]
  }
})
