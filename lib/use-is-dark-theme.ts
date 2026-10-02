'use client'

import { useSyncExternalStore } from 'react'

// The header toggles `data-theme` on <html> directly, so observe the attribute.
function subscribe(onChange: () => void) {
    const observer = new MutationObserver(onChange)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
}

export function useIsDarkTheme() {
    return useSyncExternalStore(
        subscribe,
        () => document.documentElement.dataset.theme === 'dark',
        () => false
    )
}
