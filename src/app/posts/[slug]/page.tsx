import Content from '@/components/Content'
import JsonLd from '@/components/JsonLd'
import { blogPost } from '@/components/JsonLd/blog-post'
import { getAllPostFiles, getPostFile } from '@/libs/blog'
import { format } from 'date-fns/format'
import * as config from '@/libs/config'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return getAllPostFiles().map(file => ({ slug: file.urlPath }))
}

export async function generateMetadata({ params: { slug } }: { params: { slug: string } }) {
  const file = getPostFile(slug)

  if (!file) {
    return {}
  }

  return {
    title: `${file.metadata.title} | ${config.siteName}`,
    description: file.metadata.excerpt,
  }
}

export default function PostPage({ params: { slug } }: { params: { slug: string } }) {
  const file = getPostFile(slug)

  if (!file) {
    return notFound()
  }

  return (
    <main className="page-container">
      <JsonLd data={blogPost(file)} />
      <article className="prose prose-stone">
        <header className="mb-5">
          <h1 className="text-xl font-semibold mb-1">{file.metadata.title}</h1>
          <time dateTime={file.metadata.date.toISOString()} className="text-zinc-500">
            {format(file.metadata.date, 'yyyy-MM-dd')}
          </time>
        </header>
        <Content file={file} />
      </article>
    </main>
  )
}
