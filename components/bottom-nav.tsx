//D:\Web\delivery-driver-web-mobile-react-app\components\bottom-nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, History, House, Route as RouteIcon } from 'lucide-react'

const items = [
    { href: '/', label: 'Home', icon: House },
    { href: '/route', label: 'Route', icon: RouteIcon },
    { href: '/delivery', label: 'Delivery', icon: Box },
    { href: '/history', label: 'History', icon: History },
]

export function BottomNav() {
    const pathname = usePathname()

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href)

    return (
        <nav className="bottom-nav">
            {items.map(({ href, label, icon: Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className={isActive(href) ? 'nav-item active' : 'nav-item'}
                >
                    <Icon size={25} />
                    <span>{label}</span>
                </Link>
            ))}
        </nav>
    )
}