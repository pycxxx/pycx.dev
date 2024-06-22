import { File, PostMetadata } from '@/libs/blog'
import { me } from './me'

export const blogPost = (file: File<PostMetadata>) => {
  return {
    '@type': 'BlogPosting',
    headline: file.metadata.title,
    datePublished: file.metadata.date.toISOString(),
    abstract: file.metadata.excerpt,
    author: [me()],
  }
}
