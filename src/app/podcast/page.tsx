import BlogPosts from '@/components/BlogPosts'
import { getAllPostFilesByTag } from '@/libs/blog'

export default function PodcastPage() {
  const files = getAllPostFilesByTag('podcast', false)
  return (
    <main className="page-container">
      <section>
        <h1 className="text-xl font-semibold mb-8">Podcast 技術</h1>
        <p className="mb-5">
          這邊紀錄我之前在工作中研究過的相關技術。
          <br />
          最近在回想一些當初使用的技術時，發覺好像記憶開始有模糊了。
          <br />
          再不寫下來很快就會忘光。
        </p>
        <BlogPosts files={files} />
      </section>
    </main>
  )
}
