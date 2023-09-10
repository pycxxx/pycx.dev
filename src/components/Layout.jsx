import * as React from 'react'
import { I18nProvider, useI18n } from '../i18n'
import Sidebar from './Sidebar'
import {Helmet} from "react-helmet"

export default function Container ({ children, lang }) {
  return (
    <I18nProvider lang={lang}>
      <Layout>{children}</Layout>
    </I18nProvider>
  )
}

function Layout({ children }) {
  const { t } = useI18n()
  return (
      <div className='off-canvas-container'>
        <Helmet htmlAttributes={{ lang: t('htmlLang') }} />
        <Sidebar />
        {children}
      </div>
  )
}