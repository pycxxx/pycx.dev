export const getFullUrl = (baseUrl, path) => {
  const url = new URL(path, baseUrl)
  return url.toString()
}
