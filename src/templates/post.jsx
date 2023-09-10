import React from 'react'
import { Link, graphql } from 'gatsby'
import Layout from '../components/Layout'
import HeadBase from '../components/Head'
import { getFullUrl } from '../utils'
import i18n from '../i18n'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'

export const Head = ({ data, pageContext }) => {
  const t = i18n.getFixedT(pageContext.lang)
  const { site: { siteMetadata: site }, mdx: post } = data

  return (
    <HeadBase
      title={t('post.title', { title: post.frontmatter.title })}
      description={post.frontmatter.description}
      canonicalUrl={getFullUrl(site.siteUrl, post.fields.canonicalPath)}>
      <meta itemProp='og:image' content={getFullUrl(site.siteUrl, post.path)} />
      <meta property='og:type' content='article' />
      <meta property='article:published_time' content={post.publishedAt} />
      {post.tags?.map(tag => (
        <meta property='article:tag' content={tag} key={tag} />
      ))}
    </HeadBase>
  )
}

export default function Post (all) {
  const { data, pageContext, children } = all
  const { mdx } = data
  const { frontmatter, fields } = mdx
  const { title, date, publishedAt, featuredImage } = frontmatter
  const tags = frontmatter.tags || []
  const { path } = fields
  const image = getImage(featuredImage)

  return (
    <Layout lang={pageContext.lang}>
      <div className='wrapper'>
        <div className='row row--full'>

          <div className='column column--center medium-12 large-12'>
            <GatsbyImage className='grey-bg CoverImage FlexEmbed FlexEmbed--16by9' image={image} alt="Featured image of the post" />
          </div>

          <div className='column column--center medium-12 large-10'>
            <article className='post' itemScope itemType='http://schema.org/BlogPosting'>

              <header className='post__header'>
                <h2 className='post__title' itemProp='name headline'>{title}</h2>
                <time className='post__date' dateTime={publishedAt} itemProp='datePublished'>{date}</time>
              </header>

              <div className='post-content' itemProp='articleBody'>
                <div>{children}</div>
                <div className='post__tags'>
                  {tags.map(tag => (
                    <Link to={path} key={tag}>{tag}</Link>
                  ))}
                </div>
              </div>
            </article>
          </div>

        </div>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($id: String!) {
    site {
      siteMetadata {
        siteUrl
      }
    }
    mdx(id: { eq: $id }) {
      fields {
        path
        canonicalPath
      }
      frontmatter {
        date(formatString: "YYYY/MM/DD")
        publishedAt: date
        title
        description
        tags
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 2400)
          }
        }
      }
    }
  }
`
