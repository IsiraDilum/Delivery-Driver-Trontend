//D:\Web\delivery-driver-web-mobile-react-app\components\header.tsx
import { Moon } from 'lucide-react'

export function Header() {
    return (
        <header className="topbar">
            <img src="/images/logo.png" alt="Company logo" className="logo" />
            <div className="header-actions">
                <button className="icon-button" aria-label="Toggle theme">
                    <Moon size={24} />
                </button>
                <div className="avatar">NS</div>
            </div>
        </header>
    )
}