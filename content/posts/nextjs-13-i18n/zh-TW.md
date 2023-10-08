---
title: Next.js 13 App Router 搭配 i18next
description: 各種 i18n 解決方案都沒有支援 App Router 支援得很好，這邊紀錄了 i18next 的作法
date: '2023-09-23T04:23:44.442Z'
featuredImage: ./featured.jpeg
featuredImageAuthor:
  name: Christopher Gower
  url: https://unsplash.com/photos/m_HRfLhgABo
category: Frontend
tags:
  - Frontend
  - Next.js
  - React
  - i18next
---

各種 i18n 解決方案都沒有支援 App Router 支援得很好，這邊紀錄了 i18next 的作法。

## 為什麼原有的解決方案不可行？

Next.js 的 App Router 支援了 React 的 Server Component，而 Server Component 不支援 Context。大部分的 I18n 解決方案都依賴 Context，讓我們在使用時可以用類似這樣的寫法：

```ts
const { t } = useTranslation()
t('hello')
```

## 自己處理時有哪些事情要做？

1. 判斷使用者希望看到什麼語言，且要在網址上做出區別
2. Client Component 在 SSR、CSR 的情況下 i18n 都要正常運作
3. Server Component 也要可以使用 i18n 也要正常運作

## 判斷使用者希望看到什麼語言

一般來說，我們會希望網址上能呈現使用者現在看到的語言是什麼，可能在 domain 上（`tw.domain.com/page`）或是在 path 上（`domain.com/tw/page`）。當沒辦法從網址上判斷時，改從使用者的語言偏好設定（`accept-language`）判斷出最適合的語言並轉址到相對應的網址。

這部分大致上參考了 [Next.js 文件](https://nextjs.org/docs/app/building-your-application/routing/internationalization) 的做法。有些地方不太一樣，標記在註解中。

```ts
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { NextRequest } from 'next/server'
import { languages, fallbackLng } from 'src/i18n/settings'

// 實作文件中的 getLocale
function getLocale(request: NextRequest) {
  const headers = { 'accept-language': request.headers.get('accept-language') ?? '' }
  const acceptLanguages = new Negotiator({ headers }).languages()
  return match(acceptLanguages, languages, fallbackLng)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 在測試的過程中發現有些這些 request 也會進到 middleware，他們不該被翻譯，所以濾掉
  if (/^\/(_next|locales|fonts|images)\//.test(pathname)) {
    return
  }

  const pathnameHasLocale = languages.some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) return

  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`

  return Response.redirect(request.nextUrl)
}
```

## 支援 Client Component

因為我用的 i18next，所以一開始就看到了這篇文章 [i18n with Next.js 13 and app directory / App Router (an i18next guide)](https://locize.com/blog/next-13-app-dir-i18n/)。一開始大量參考他的做法，慢慢的把多餘的地方刪掉，並修正一些範例存在的問題。

範例中的 `middleware.js` 可以忽略，用我們前面的程式碼就可以了。為了避免 `initI18next` 完成前畫面就先 render 出來，我們還是把 Provider 加回到來並標註為 Client Component。

```ts
// src/providers/i18n.ts
'use client'

import { initI18next } from 'src/i18n'
import i18n from 'i18next'
import { FC, PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'

export const I18nProvider: FC<PropsWithChildren<{ lang: string }>> = ({ children, lang }) => {
  // 考慮 SSR 的情況，直接執行
  void initI18next(lang)

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
```

```ts
// src/i18n/client.ts
'use client'

import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions, languages } from './settings'

const runsOnServerSide = typeof window === 'undefined'

// 避免重複執行
let initialized = false

export const initI18next = async (lang?: string) => {
  if (initialized) {
    return
  }
  initialized = true
  await i18next
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        async (language: string, namespace: string) => await import(`./locales/${language}/${namespace}.json`)
      )
    )
    .init({
      ...getOptions(),
      lng: lang,
      preload: runsOnServerSide ? languages : [],
    })
}

```

使用時跟以往一樣，直接從 `react-i18next` import `usTranslation` 來用。

## 支援 Server Component

i18next 文章的 `useTranslation` 每用一次都要重跑 `initI18next`，這有點怪。這邊改成 singleton 同時又不會因 parallel 執行造成問題的寫法。

```ts
// src/i18n/server.ts
import 'server-only'

import { cache } from 'react'
import { createInstance, i18n } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { getOptions } from './settings'

const i18nCache = cache(() => {
  let i18nInstance: i18n | undefined
  return {
    get: () => i18nInstance,
    set: (instance: i18n) => {
      i18nInstance = instance
    },
  }
})

export const initI18next = async (lng: string, ns?: string | string[]) => {
  let i18nInstance = i18nCache().get()
  if (i18nInstance) {
    return i18nInstance
  }

  i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        async (language: string, namespace: string) => await import(`./locales/${language}/${namespace}.json`)
      )
    )
    .init({
      ...getOptions(lng, ns),
      preload: [lng],
    })

  i18nCache().set(i18nInstance)
}

export function getTranslation(ns: string | string[] | undefined, options: { keyPrefix?: string } = {}) {
  const i18nInstance = i18nCache().get()
  if (!i18nInstance) {
    throw new Error('i18n is not initialized')
  }
  return {
    t: i18nInstance.getFixedT(i18nInstance.language, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
    i18n: i18nInstance,
  }
}
```

然後 root layout 加上 `initI18next`

```ts
const RootLayout: FC<PropsWithChildren<{ params: { lang: string } }>> = ({ children, params }) => {
  await initI18next(params.lang)
  // ...
}
```

需要翻譯時時從 `src/i18n/server.ts` import `getTranslation` 來用。

## `next/link`

以前 `next/link` 有 `locale` prop，在多語系的時候滿方便的，但在 App Router 下這個 prop 被拿掉了。所以只能自己處理。

```ts
'use client'

import { usePathname } from 'next/navigation'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { useTranslation } from 'react-i18next'
import { PropsWithChildren } from 'react'

export interface LinkProps extends Omit<NextLinkProps, 'href'> {
  locale?: string
  href: string
}

export default function Link({ locale, href, ...restProps }: PropsWithChildren<LinkProps>) {
  const currentPathname = usePathname().split('/').slice(1).join('/')
  const { i18n } = useTranslation()
  const isExternalLink = /^.+:\/\//.test(href)

  if (isExternalLink) {
    return <NextLink href={href} {...restProps} />
  }

  if (!locale) {
    locale = i18n.language
  }

  const url = new URL(href, `http://dummy${currentPathname}`)
  const linkPathname = `/${locale}${url.pathname}`

  return <NextLink href={linkPathname} {...restProps} />
}
```