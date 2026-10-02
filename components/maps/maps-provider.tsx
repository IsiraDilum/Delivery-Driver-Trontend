'use client'

import { APIProvider } from '@vis.gl/react-google-maps'

export const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
export const MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

/** Loads the Maps JavaScript API once for the whole app, so moving between pages doesn't reload it. */
export function MapsProvider({ children }: { children: React.ReactNode }) {
    if (!MAPS_API_KEY) return <>{children}</>
    return (
        <APIProvider apiKey={MAPS_API_KEY} region="LK">
            {children}
        </APIProvider>
    )
}
