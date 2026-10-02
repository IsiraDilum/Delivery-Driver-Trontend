'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Header } from './header'
import { BottomNav } from './bottom-nav'
import { ModalView, type Modal } from './modal-view'

const ModalContext = createContext<(modal: Modal) => void>(() => {})

export const useModal = () => useContext(ModalContext)

export function AppShell({ children }: { children: React.ReactNode }) {
    const [modal, setModal] = useState<Modal>(null)

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
            <div className="app-shell">
                <Header />
                {children}
                <BottomNav />
            </div>

            {/* Rendered on document.body so it can never be trapped under the header */}
            {modal &&
                createPortal(
                    <ModalView modal={modal} close={() => setModal(null)} />,
                    document.body
                )}
        </ModalContext.Provider>
    )
}