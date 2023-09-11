import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import i18next from '../i18n'

export default function Head ({ title, description, canonicalUrl, lang, children }) {
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
  const t = i18next.getFixedT(lang)

  return (
    <>
      <html lang={t('htmlLang')} />
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
