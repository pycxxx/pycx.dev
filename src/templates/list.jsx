import React from 'react'
import Layout from '../components/Layout'
import { graphql } from 'gatsby'
import PostCard from '../components/PostCard'
import Pagination from '../components/Pagination'
import HeadBase from '../components/Head'
import i18n from '../i18n'
import { getFullUrl } from '../utils'

export const Head = ({ data, pageContext }) => {
  const t = i18n.getFixedT(pageContext.lang)
  const { site: { siteMetadata: site } } = data

  return (
    <HeadBase
      title={t('list.title')}
      description={t('site.description')}
      canonicalUrl={getFullUrl(site.siteUrl, pageContext.canonicalPath)}>
      <meta property='og:type' content='website' />
    </HeadBase>
  )
}

const List = ({ data, pageContext }) => {
  const posts = data.allMdx.nodes

  return (
    <Layout lang={pageContext.lang}>
      <main className='wrapper' role='main'>

        <div className='row row--full'>
          <div className='post-list'>
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <div className='row row--full'>
          <Pagination pageContext={pageContext} />
        </div>

      </main>
    </Layout>
  )
}

export default List

export const pageQuery = graphql`
  query ($lang: String!, $skip: Int!, $limit: Int!) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    allMdx(filter: { fields: { lang: { eq: $lang }, pageType: { eq: "post" } } }, skip: $skip, limit: $limit, sort: { frontmatter: { date: DESC } }) {
      nodes {
        id
        fields {
          slug
          path
        }
        frontmatter {
          date(formatString: "YYYY/MM/DD")
          title
          featured
          featuredImage {
            childImageSharp {
              gatsbyImageData(width: 600)
            }
          }
        }
      }
    }
  }
`
