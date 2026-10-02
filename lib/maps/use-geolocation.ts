'use client'

import { useEffect, useState } from 'react'
import type { LatLng } from './types'

export type GeolocationStatus = 'pending' | 'active' | 'denied' | 'unavailable'

type State = {
    status: GeolocationStatus
    position: LatLng | null
    accuracy: number | null
    /** When the latest fix was taken (ms since epoch) */
    timestamp: number | null
}

/** Watches the device position. Starts asking for permission as soon as it's enabled. */
export function useGeolocation(enabled = true) {
    const [state, setState] = useState<State>({ status: 'pending', position: null, accuracy: null, timestamp: null })

    useEffect(() => {
        if (!enabled) return
        if (!('geolocation' in navigator)) {
            setState((s) => ({ ...s, status: 'unavailable' }))
            return
        }

        const id = navigator.geolocation.watchPosition(
            (pos) =>
                setState({
                    status: 'active',
                    position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp,
                }),
            (err) =>
                setState((s) => {
                    if (err.code === err.PERMISSION_DENIED) return { ...s, status: 'denied' }
                    // The watch keeps running after timeouts and brief signal loss, so keep the last fix meanwhile
                    if (s.position || err.code === err.TIMEOUT) return s
                    return { ...s, status: 'unavailable' }
                }),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
        )
        return () => navigator.geolocation.clearWatch(id)
    }, [enabled])

    return state
}
