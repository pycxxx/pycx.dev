import { File, PostMetadata } from '@/libs/blog'
import { format } from 'date-fns/format'
import Link from 'next/link'

export default function BlogPosts({ files }: { files: File<PostMetadata>[] }) {
  return (
    <div className="flex flex-col gap-2">
      {files.map(file => (
        <Link key={file.urlPath} href={`/posts/${file.urlPath}`} className="flex gap-2">
          <time dateTime={file.metadata.date.toISOString()} className="text-zinc-500">
            {format(file.metadata.date, 'yyyy-MM-dd')}
          </time>
          <span>{file.metadata.title}</span>
        </Link>
      ))}
    </div>
  )
}
