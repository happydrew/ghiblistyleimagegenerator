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
  success: {
    type: 'page',
    title: 'Payment Success',
    display: 'hidden',
    theme: {
      layout: 'raw'
    }
  },
  credits: {
    type: 'page',
    title: 'My Credits',
    display: 'hidden',
    theme: {
      layout: 'raw'
    }
  },
  about: {
    type: 'page',
    title: 'About',
    href: '/#about'
  },
  features: {
    type: 'page',
    title: 'Features',
    href: '/#features'
  },
  pricing: {
    type: 'page',
    title: 'Pricing',
    theme: {
      layout: 'raw'
    }
  },
  examples: {
    type: 'page',
    title: 'Examples',
    href: '/#examples'
  },
  faq: {
    type: 'page',
    title: 'FAQ',
    href: '/#faq'
  },
  contact: {
    type: 'page',
    title: 'Contact',
    theme: {
      layout: 'raw'
    }
  },
  // "temp-purchase": {
  //   type: 'page',
  //   title: 'Temp Purchase',
  //   display: 'hidden',
  //   theme: {
  //     layout: 'raw'
  //   }
  // },
  "privacy-policy": {
    type: 'page',
    title: 'Privacy Policy',
    display: 'hidden',
    theme: {
      layout: 'default'
    }
  },
  "terms-of-service": {
    type: 'page',
    title: 'Terms of Service',
    display: 'hidden',
    theme: {
      layout: 'default'
    }
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
