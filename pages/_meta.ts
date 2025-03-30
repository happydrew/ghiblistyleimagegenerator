export default {
  index: {
    type: 'page',
    title: 'Home',
    display: 'hidden',
    //layout: 'raw',
    theme: {
      layout: 'raw'
    }
  },
  about: {
    type: 'page',
    title: 'About',
    href: '#about'
  },
  features: {
    type: 'page',
    title: 'Features',
    href: '#features'
  },
  examples: {
    type: 'page',
    title: 'Examples',
    href: '#examples'
  },
  faq: {
    type: 'page',
    title: 'FAQ',
    href: '#faq'
  },


  // docs: {
  //   type: 'page',
  //   title: 'Documentation'
  // },
  // concat: {
  //   type: 'page',
  //   title: 'Concat',
  //   theme: {
  //     layout: 'raw'
  //   }
  // },
  404: {
    type: 'page',
    theme: {
      timestamp: false,
      typesetting: 'article'
    }
  }
}
