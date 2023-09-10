import * as path from 'path'
import groupBy from 'lodash/groupBy.js'
import chunk from 'lodash/chunk.js'
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const POSTS_DIR = path.resolve(__dirname, 'content/posts/')
const PAGES_DIR = path.resolve(__dirname, 'content/pages/')
const POSTS_PER_PAGE = 12
const DEFAULT_LANG = 'zh-TW'

export const createPages = async function (options) {
  await createPostPages(options)
  await createListPages(options)
}

export const onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === 'Mdx') {
    const { contentFilePath } = node.internal
    const lang = getLangFromPath(contentFilePath)
    const slug = getSlugFromPath(contentFilePath)
    const pageType = getPageTypeFromPath(contentFilePath)
    const path = generatePath(slug, lang)
    const canonicalPath = generatePath(slug)

    createNodeField({
      node,
      name: 'lang',
      value: lang
    })

    createNodeField({
      node,
      name: 'slug',
      value: slug
    })

    createNodeField({
      node,
      name: 'pageType',
      value: pageType
    })

    createNodeField({
      node,
      name: 'path',
      value: path
    })

    createNodeField({
      node,
      name: 'canonicalPath',
      value: canonicalPath
    })
  }
}

export const createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  const typeDefs = `
    type Fields {
      lang: String
      slug: String
      pageType: String
      path: String
      canonicalPath: String
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
      featured: Boolean
      tags: [String]
      featuredImage: File @fileByRelativePath
    }

    type Mdx implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type SiteSiteMetadata {
      github: String
      twitter: String
      email: String
    }
  `

  createTypes(typeDefs)
}

function generatePath (slug, lang = DEFAULT_LANG) {
  let path = `/${lang}/${slug}`

  if (lang === DEFAULT_LANG) {
    path = `/${slug}`
  }

  return path.replace(/\/+/g, '/')
}

function getLangFromPath (filePath) {
  return path.basename(filePath, path.extname(filePath))
}

function getSlugFromPath (filePath) {
  return path.basename(path.dirname(filePath))
}

function getPageTypeFromPath (filePath) {
  if (filePath.startsWith(POSTS_DIR)) {
    return 'post'
  }
  if (filePath.startsWith(PAGES_DIR)) {
    return 'page'
  }
  return 'unknown'
}

function generatePathForListPage (page, lang) {
  return generatePath(page === 0 ? '/' : `page/${page + 1}`, lang)
}

async function createPostPages ({ graphql, actions }) {
  const { data } = await graphql(`
      query {
        allMdx {
          edges {
            node {
              id
              fields {
                path
                canonicalPath
                lang
              }
              internal {
                contentFilePath
              }
            }
          }
        }
      }
    `)

  data.allMdx.edges.forEach(({ node }) => {
    const { path: nodePath, lang, canonicalPath } = node.fields

    actions.createPage({
      path: nodePath,
      component: path.resolve(__dirname, './src/templates/post.jsx') + `?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        id: node.id,
        lang,
        canonicalPath
      }
    })
  })
}

async function createListPages ({ graphql, actions }) {
  const { data } = await graphql(`
      query {
        allMdx(
          filter: {fields: {pageType: {eq: "post"}}}
          sort: {frontmatter: {date: ASC}}
        ) {
          edges {
            node {
              id
              frontmatter {
                date(formatString: "YYYY/MM/DD")
              }
              fields {
                slug
                lang
              }
              internal {
                contentFilePath
              }
            }
          }
        }
      }
    `)

  const grouppedData = groupBy(data.allMdx.edges, ({ node }) => node.fields.lang)

  for (const [lang, posts] of Object.entries(grouppedData)) {
    const chunkedPosts = chunk(posts, POSTS_PER_PAGE)
    chunkedPosts.forEach((chunk, i) => {
      actions.createPage({
        path: generatePathForListPage(i, lang),
        component: path.resolve(__dirname, './src/templates/list.jsx'),
        context: {
          lang,
          skip: i * POSTS_PER_PAGE,
          limit: POSTS_PER_PAGE,
          currentPage: i + 1,
          totalPages: chunkedPosts.length,
          canonicalPath: generatePathForListPage(i),
          nextPagePath: i + 1 < chunkedPosts.length ? generatePathForListPage(i + 1, lang) : null,
          prevPagePath: i ? generatePathForListPage(i - 1, lang) : null
        }
      })
    })
  }
}

export function onCreateWebpackConfig({ actions }) {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
      }
    }
  })
}