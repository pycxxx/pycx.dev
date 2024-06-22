import { File } from '@/libs/blog'
import { createContext, useContext } from 'react'

const FileContext = createContext<File | null>(null)

export const FileProvider = FileContext.Provider

export const useFilePath = () => {
  const file = useContext(FileContext)
  if (!file) {
    throw new Error('useFilePath must be used within a FileProvider')
  }
  return file
}
