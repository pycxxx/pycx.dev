import RSS from 'rss'
import * as config from '@/libs/config'
import { getAllPostFiles } from '@/libs/blog'

export async function GET() {
  const files = getAllPostFiles()

  const rss = new RSS({
    title: 'PYC',
    site_url: `${config.siteUrl}`,
    feed_url: `${config.siteUrl}/feed`,
    pubDate: new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}`,
  })

  for (const file of files) {
    rss.item({
      title: file.metadata.title,
      url: `${config.siteUrl}/${file.urlPath}`,
      date: file.metadata.date,
      description: file.metadata.excerpt,
    })
  }

  return new Response(rss.xml(), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
    },
  })
}
