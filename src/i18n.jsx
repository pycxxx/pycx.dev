import React, { createContext, useContext } from 'react'
import resources from '../locales'
import i18next from 'i18next'

i18next.init({
  lng: 'zh-TW',
  resources,
  ns: ['common'],
  react: {
    useSuspense: false
  }
})

const I18nContext = createContext({ lang: 'zh-TW' })

export const I18nProvider = ({ lang, children }) => {
  return (
    <I18nContext.Provider value={lang}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const lang = useContext(I18nContext)
  return {
    t: i18next.getFixedT(lang),
    lang
  }
}

export default i18next
