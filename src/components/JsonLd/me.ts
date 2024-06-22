export const me = () => ({
  '@type': 'Person',
  name: process.env.NEXT_PUBLIC_AUTHOR_NAME,
  url: process.env.NEXT_PUBLIC_SITE_URL,
})
