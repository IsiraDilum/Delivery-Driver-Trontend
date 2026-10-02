'use client'

import { useSyncExternalStore } from 'react'

const MINUTE = 60_000

function subscribe(onChange: () => void) {
    const id = setInterval(onChange, MINUTE)
    document.addEventListener('visibilitychange', onChange)
    return () => {
        clearInterval(id)
        document.removeEventListener('visibilitychange', onChange)
    }
}

// Rounded to the minute so the snapshot stays the same between ticks
const getSnapshot = () => Math.floor(Date.now() / MINUTE) * MINUTE
const getServerSnapshot = () => null

/** The device's current time, updated every minute. Null on the server, whose clock and time zone aren't the driver's. */
export function useNow() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
