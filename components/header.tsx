'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function Header() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    // Load saved theme on mount
    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
        const initial = saved ?? 'light'
        setTheme(initial)
        document.documentElement.setAttribute('data-theme', initial)
    }, [])

    function toggleTheme() {
        const next = theme === 'light' ? 'dark' : 'light'
        setTheme(next)
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('theme', next)
    }

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
                    aria-label="Toggle theme"
                    onClick={toggleTheme}
                >
                    {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                </button>
                <div className="avatar" aria-label="User profile">NS</div>
            </div>
        </header>
    )
}