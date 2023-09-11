import * as React from 'react'
import { I18nProvider, useI18n } from '../i18n'
import Sidebar from './Sidebar'

export default function Container ({ children, lang }) {
  return (
    <I18nProvider lang={lang}>
      <Layout>{children}</Layout>
    </I18nProvider>
  )
}

function Layout({ children }) {
  return (
      <div className='off-canvas-container'>
        <Sidebar />
        {children}
      </div>
  )
}