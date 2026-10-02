'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Header } from './header'
import { BottomNav } from './bottom-nav'
import { ModalView, type Modal } from './modal-view'
import { MapsProvider } from './maps/maps-provider'

const ModalContext = createContext<(modal: Modal) => void>(() => {})

export const useModal = () => useContext(ModalContext)

// Full-screen pages that bring their own chrome instead of the header and bottom nav
const IMMERSIVE_PATHS = ['/route/map']

export function AppShell({ children }: { children: React.ReactNode }) {
    const [modal, setModal] = useState<Modal>(null)
    const immersive = IMMERSIVE_PATHS.includes(usePathname())

    // Lock page scroll while a modal is open
    useEffect(() => {
        if (!modal) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [modal])

    return (
        <ModalContext.Provider value={setModal}>
            <MapsProvider>
                <div className={immersive ? 'app-shell immersive' : 'app-shell'}>
                    {!immersive && <Header />}
                    {children}
                    {!immersive && <BottomNav />}
                </div>
            </MapsProvider>

            {/* Rendered on document.body so it can never be trapped under the header */}
            {modal &&
                createPortal(
                    <ModalView modal={modal} close={() => setModal(null)} />,
                    document.body
                )}
        </ModalContext.Provider>
    )
}