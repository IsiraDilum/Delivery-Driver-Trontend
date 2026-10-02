import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { AppShell } from '@/components/app-shell'
import './globals.css'

const font = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-app',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Waypoint · Driver app',
    description: 'A focused delivery driver route and handoff workspace.',
    generator: 'v0.app',
    icons: {
        icon: '/images/logo.png',
        apple: '/images/logo.png',
    },
}

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f5f0ff' },
        { media: '(prefers-color-scheme: dark)', color: '#191527' },
    ],
}

// Runs before first paint so there is no light flash when the saved theme is dark
const themeScript = `try{var t=localStorage.getItem('theme')||'light';document.documentElement.dataset.theme=t}catch(e){}`

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={font.variable} suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="antialiased">
        <AppShell>{children}</AppShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
        </html>
    )
}