import images from './manifest'

export const getImageUrl = (docUrl: string, imageSrc: string) => {
  if (/^\//.test(imageSrc)) {
    return imageSrc
  }
  const imageUrlPath = docUrl + imageSrc.replace(/\.\//g, '/')
  return images[imageUrlPath]
}
