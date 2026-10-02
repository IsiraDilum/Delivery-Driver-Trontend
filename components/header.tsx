'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

export function Header() {
    const [theme, setTheme] = useState<Theme>('light')

    // layout.tsx has already set data-theme before paint; just sync the icon
    useEffect(() => {
        setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
    }, [])

    function toggleTheme() {
        const next: Theme = theme === 'light' ? 'dark' : 'light'
        setTheme(next)
        document.documentElement.dataset.theme = next
        try {
            localStorage.setItem('theme', next)
        } catch {}
    }

    const isDark = theme === 'dark'

    return (
        <header className="topbar">
            <div className="brand">
                <img src="/images/logo.png" alt="" className="logo" />
                <span className="brand-name">Waypoint</span>
            </div>

            <div className="header-actions">
                <button
                    type="button"
                    className="icon-button"
                    onClick={toggleTheme}
                    aria-pressed={isDark}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDark ? <Sun size={24} aria-hidden="true" /> : <Moon size={24} aria-hidden="true" />}
                </button>
                <div className="avatar" aria-label="User profile">NS</div>
            </div>
        </header>
    )
}