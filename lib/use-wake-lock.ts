'use client'

import { useEffect } from 'react'

/** Keeps the screen on while `active`. Browsers drop the lock when the tab is hidden, so it's re-requested on return. */
export function useWakeLock(active: boolean) {
    useEffect(() => {
        if (!active || !('wakeLock' in navigator)) return
        let lock: WakeLockSentinel | null = null
        let released = false

        const request = async () => {
            try {
                lock = await navigator.wakeLock.request('screen')
                if (released) await lock.release()
            } catch {
                // Not allowed (e.g. low battery mode); navigation still works
            }
        }
        const onVisible = () => {
            if (document.visibilityState === 'visible') void request()
        }

        void request()
        document.addEventListener('visibilitychange', onVisible)
        return () => {
            released = true
            document.removeEventListener('visibilitychange', onVisible)
            void lock?.release()
        }
    }, [active])
}
