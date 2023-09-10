import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

export default function Head ({ title, description, canonicalUrl, children }) {
  const { site } = useStaticQuery(
    graphql`
          query {
            site {
              siteMetadata {
                siteUrl
              }
            }
          }
        `
  )

  return (
    <>
      <title>{title}</title>
      <meta property='og:title' content={title} />
      <meta name='twitter:title' content={title} />

      <meta name='description' content={description} />
      <meta property='og:description' content={description} />
      <meta name='twitter:description' content={description} />

      {children}
      {canonicalUrl && <link rel='canonical' href={canonicalUrl} />}
      <script>
        window.base_url = {JSON.stringify(site.siteMetadata.siteUrl)};
      </script>
    </>
  )
}
