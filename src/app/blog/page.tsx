import BlogPosts from '@/components/BlogPosts'
import { getAllPostFiles } from '@/libs/blog'
import * as config from '@/libs/config'

export async function generateMetadata() {
  return {
    title: `Blog | ${config.siteName}`,
  }
}

export default async function BlogPage() {
  const files = getAllPostFiles()
  return (
    <main className="page-container">
      <h1 className="text-xl font-semibold mb-8">Blog Posts</h1>
      <BlogPosts files={files} />
    </main>
  )
}
