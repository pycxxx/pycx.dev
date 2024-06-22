import MillionLint from '@million/lint'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['next-mdx-remote'],
  trailingSlash: true,
}

export default MillionLint.next({ rsc: true })(nextConfig)
