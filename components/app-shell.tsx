'use client'

import { createContext, useContext, useState } from 'react'
import { Header } from './header'
import { BottomNav } from './bottom-nav'
import { ModalView, type Modal } from './modal-view'

const ModalContext = createContext<(modal: Modal) => void>(() => {})

export const useModal = () => useContext(ModalContext)

export function AppShell({ children }: { children: React.ReactNode }) {
    const [modal, setModal] = useState<Modal>(null)

    return (
        <ModalContext.Provider value={setModal}>
            <div className="app-shell">
                <Header />
                {children}
                <BottomNav />
                <ModalView modal={modal} close={() => setModal(null)} />
            </div>
        </ModalContext.Provider>
    )
}