import fs from 'node:fs'
import { serialize } from 'next-mdx-remote/serialize'
import Content from './Content'
import { File } from '@/libs/blog'

export default async function Container({ file }: { file: File }) {
  const content = fs.readFileSync(file.filePath, 'utf-8')
  const excludeFrontMatter = content.replace(/---\s*([\s\S]*?)\s*---/, '')
  const mdxSource = await serialize(excludeFrontMatter)
  return <Content file={file} source={mdxSource} />
}
