import React from 'react'
import i18next from '../i18n'

export default function Head ({ title, description, canonicalUrl, lang, children }) {
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
    </>
  )
}
