export default {
  logo: <span>pindown.ai docs</span>,
  project: {
    link: 'https://github.com/yourusername/pindownai'
  },
  docsRepositoryBase: 'https://github.com/yourusername/pindownai/tree/main/docs',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – pindown.ai'
    }
  },
  footer: {
    text: '© 2024 pindown.ai. All rights reserved.'
  }
}
