import * as config from '@/libs/config'
import BlogPosts from '@/components/BlogPosts'
import JsonLd from '@/components/JsonLd'
import { me } from '@/components/JsonLd/me'
import { getPostFiles } from '@/libs/blog'

export async function generateMetadata() {
  return {
    title: config.siteName,
  }
}

export default function Home() {
  const files = getPostFiles({ limit: 5 })
  return (
    <main className="page-container">
      <JsonLd data={me()} />
      <section className="mb-5">
        <h1 className="text-xl font-semibold mb-8">PYC</h1>
        <p>
          {`軟體工程師，擅長網頁前後端開發。`}
          <br />
          {`喜歡 Podcast，對於相關技術稍微有點研究。`}
        </p>
      </section>

      <section>
        <BlogPosts files={files} />
      </section>
    </main>
  )
}
