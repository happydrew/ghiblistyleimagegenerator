/* eslint-env node */

/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: "https://baseballbrosio.fun",
  generateIndexSitemap: false,
  generateRobotsTxt: false,
  // output: "export", // Set static output here
  exclude: ["/icon.svg"]
}
