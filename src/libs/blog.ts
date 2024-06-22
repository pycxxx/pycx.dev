import createDatabase from 'better-sqlite3'

const db = createDatabase('markdown.db')

interface FileRow {
  _id: string
  file_path: string
  extension: string
  url_path: string
  filetype: string | null
  metadata: string
}

const draftCondition = process.env.NODE_ENV === 'development' ? '' : `and json_extract(metadata, '$.draft') is null`

export interface File<T extends object = {}> {
  _id: string
  filePath: string
  extension: string
  urlPath: string
  fileType: string | null
  metadata: T
}

export interface PostMetadata {
  title: string
  date: Date
  tags: string[]
  excerpt: string
}

const fileToPostFile = (row: FileRow): File<PostMetadata> => {
  const metadata = JSON.parse(row.metadata)
  return {
    _id: row._id,
    filePath: row.file_path,
    urlPath: row.url_path,
    extension: row.extension,
    fileType: row.filetype,
    metadata: {
      title: metadata.title,
      date: new Date(metadata.date ?? 0),
      tags: metadata.tags ?? [],
      excerpt: metadata.excerpt,
    },
  }
}

export const getPostFile = (urlPath: string) => {
  const stmt = db.prepare<[string], FileRow>(
    `
      select * from files
      where url_path = ?
      and extension = 'mdx'
      ${draftCondition}
    `
  )

  const row = stmt.get(urlPath)

  if (!row) {
    return null
  }

  return fileToPostFile(row)
}

export const getAllPostFiles = () => {
  const files: File<PostMetadata>[] = []

  const stmt = db.prepare<{}, FileRow>(
    `
      select * from files
      where extension = 'mdx'
      ${draftCondition}
      order by strftime('%s', json_extract(metadata, '$.date')) desc
    `
  )

  const rows = stmt.all({})

  for (const row of rows) {
    files.push(fileToPostFile(row))
  }

  return files
}

export const getAllPostFilesByTag = (tag: string, desc = true) => {
  const files: File<PostMetadata>[] = []

  const stmt = db.prepare<[string], FileRow>(
    `
      select * from files
      where "extension" = 'mdx'
      and exists (
        select 1
        from json_each(json_extract(metadata, '$.tags'))
        where value = ?
      )
      order by strftime('%s', json_extract(metadata, '$.date')) ${desc ? 'desc' : 'asc'}
      ${draftCondition}
    `
  )

  const rows = stmt.all(tag)

  for (const row of rows) {
    files.push(fileToPostFile(row))
  }

  return files
}

export const getPostFiles = ({ page = 0, limit = 10 }: { page?: number; limit?: number } = {}) => {
  const files: File<PostMetadata>[] = []

  const stmt = db.prepare<[number, number], FileRow>(
    `
      select * from files
      where extension = 'mdx'
      ${draftCondition}
      order by strftime('%s', json_extract(metadata, '$.date')) desc
      limit ?
      offset ?
    `
  )

  const rows = stmt.all(limit, page * limit)

  for (const row of rows) {
    files.push(fileToPostFile(row))
  }

  return files
}

export const getAllImageFiles = () => {
  const files: File[] = []

  const stmt = db.prepare<{}, FileRow>(
    `
      select * from files
      where extension = 'jpg' or extension = 'jpeg' or extension = 'png'
      ${draftCondition}
    `
  )

  const rows = stmt.all({})

  for (const row of rows) {
    files.push({
      _id: row._id,
      filePath: row.file_path,
      urlPath: row.url_path,
      extension: row.extension,
      fileType: row.filetype,
      metadata: {},
    })
  }

  return files
}
