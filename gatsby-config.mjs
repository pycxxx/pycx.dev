import * as path from 'path'
import * as url from 'url'

const __dirname = path.dirname(url.fileURLToPath(new URL(import.meta.url)))

/**
 * @type {import('gatsby').GatsbyConfig}
 */
export default {
  siteMetadata: {
    siteUrl: 'https://pycx.dev',
    github: 'pycxxx',
    twitter: null,
    email: 'hi@pycx.dev'
  },
  plugins: [
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-plugin-image',
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: path.resolve(__dirname, 'content/posts/')
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: path.resolve(__dirname, 'content/pages/')
      }
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: [`.md`, `.mdx`],
        gatsbyRemarkPlugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 1200,
            },
          },
        ],
      }
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
        {
          site {
            siteMetadata {
              title
              description
              siteUrl
              site_url: siteUrl
            }
          }
        }
        `,
        feeds: [
          generateFeedOptions('zh-TW'),
          generateFeedOptions('en'),
        ],
      },
    },
  ]
}

function generateFeedOptions(lang) {
  return {
    serialize: ({ query: { site, allMdx } }) => {
      return allMdx.nodes.map(node => {
        return Object.assign({}, node.frontmatter, {
          description: node.excerpt,
          date: node.frontmatter.date,
          url: site.siteMetadata.siteUrl + node.fields.path,
          guid: site.siteMetadata.siteUrl + node.fields.path,
          custom_elements: [{ "content:encoded": node.excerpt }],
        })
      })
    },
    query: `
      {
        allMdx(
          filter: { fields: { pageType: { eq: "post" }, lang: { eq: "${lang}" } } },
          sort: { frontmatter: { date: DESC } },
        ) {
          nodes {
            excerpt
            fields {
              slug
            }
            frontmatter {
              title
              date
            }
          }
        }
      }
    `,
    output: `/${lang === 'zh-TW' ? '' : lang}/feed.xml`.replace(/\/+/g, '/'),
    title: 'PYC',
  }
}