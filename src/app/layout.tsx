import type { Metadata } from 'next'
import './globals.css'
import PageHeader from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-Hant">
      <head>
        {/* If we use the metadata variable to add the link, there will be a slash at the end of the path. */}
        <link rel="alternative" type="application/rss+xml" href={process.env.NODE_ENV + '/feed.xml'} title="RSS feed" />
      </head>
      <body>
        <PageHeader />
        {children}
        <footer className="page-container mb-5 mt-14">
          <p className="text-sm">© {new Date().getFullYear()} All rights reserved</p>
        </footer>
      </body>
    </html>
  )
}
