'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menu = [
  { title: 'Home', url: '/' },
  { title: 'Blog', url: '/blog/' },
]

const getActiveUrl = (pathname: string) => {
  if (pathname === '/') {
    return '/'
  }
  return (menu.slice(1).find(item => pathname.startsWith(item.url)) || menu[0]).url
}

export default function PageHeader() {
  const pathname = usePathname()
  const activeUrl = getActiveUrl(pathname)

  return (
    <header className="page-container mt-5 mb-16">
      <nav className="overflow-hidden">
        <ul className="flex -mx-3">
          {menu.map(item => (
            <li key={item.url} className="px-3">
              <Link
                href={item.url}
                className={clsx('menu-item after:bottom-2 block py-4', { 'menu-item-active': activeUrl === item.url })}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
