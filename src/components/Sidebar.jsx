import React from 'react'
import { useStaticQuery, graphql, Link } from 'gatsby'
import SearchForm from './SearchForm'
import { useI18n } from '../i18n'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons'

export default function Sidebar () {
  const { t, lang } = useI18n()
  const { site: { siteMetadata: site }, allMdx: { edges: pages } } = useStaticQuery(
    graphql`
    query {
        site {
          siteMetadata {
            siteUrl
            github
            twitter
            email
          }
        }
        allMdx(filter: {fields: {pageType: {eq: "page"}}}) {
          edges {
            node {
              id
              frontmatter {
                title
              }
              fields {
                slug
                lang
                path
              }
            }
          }
        }
      }
        `
  )

  // https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
  // useStaticQuery is not accepting variables, so we have to filter the pages here
  const filteredPages = pages.filter(page => page.node.fields.lang === lang)

  return (
    <>
      <div className='sidebar'>
        <div className='row'>

          <div className='column small-10 large-12'>
            <h1 className='sidebar__logo logo'><Link to='/'>{t('site.name')}</Link></h1>
            <div className='sidebar__description font-small'>{t('site.description')}</div>
          </div>

          <label className='off-canvas-toggle'><span data-icon='ei-navicon' data-size='s' /></label>

          <div className='off-canvas-content'>

            <div className='column small-12 large-12'>
              <nav className='navigation' role='navigation'>
                <ul className='list-bare text-center'>
                  {filteredPages.map(page => (
                    <li key={page.node.id}>
                      <Link className='page-link' title={page.node.frontmatter.title} to={page.node.fields.path}>{page.node.frontmatter.title}</Link>
                    </li>
                  ))}
                  <li><Link title="RSS Feed" className='subscribe-button icon-feed' to='/feed.xml'>RSS</Link></li>
                </ul>
              </nav>
            </div>

            <div className='column small-12 large-12'>
              <ul className='social-nav social-icons'>
                {site.github && (
                  <li>
                    <Link title="GitHub" to={`http://www.github.com/${site.github}`} target='_blank' rel='noreferrer'>
                      <FontAwesomeIcon icon={faGithub} />
                    </Link>
                  </li>
                )}

                {site.twitter && (
                  <li>
                    <Link title="Twitter" to={`http://www.twitter.com/${site.twitter}`} target='_blank' rel='noreferrer'>
                      <FontAwesomeIcon icon={faTwitter} />
                    </Link>
                  </li>
                )}

                {site.email && (
                  <li>
                    <Link title="Email" to={`mailto:${site.email}`} target='_blank' rel='noreferrer'>
                      <FontAwesomeIcon icon={faEnvelope} />
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div className='sidebar__bottom'>
              <div className='column small-12 large-12'>
                <div className='font-tiny'>
                  &copy; {new Date().getFullYear()} {t('site.name')}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <SearchForm />
    </>
  )
}
