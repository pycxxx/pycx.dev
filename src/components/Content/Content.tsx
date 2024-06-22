'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { FileProvider, useFilePath } from './FilePathContext'
import { getImageUrl } from '@/libs/images'
import { File } from '@/libs/blog'
import Image from 'next/image'

function ContentImage({ src, alt }: { src: string; alt: string }) {
  const file = useFilePath()
  const source = getImageUrl(file.urlPath, src)
  return <Image unoptimized alt={alt} src={source} />
}

const components = { img: ContentImage }

export default function Content({
  source,
  file,
}: {
  source: MDXRemoteSerializeResult<Record<string, unknown>, Record<string, unknown>>
  file: File
}) {
  return (
    <FileProvider value={file}>
      <MDXRemote {...source} components={components as any} />
    </FileProvider>
  )
}
