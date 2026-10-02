'use client'

import { useEffect, useState } from 'react'
import type { RouteRequest, RouteResult } from './types'

// Traffic-aware ETAs go stale, but pages that share a route shouldn't each pay for a request.
const CACHE_TTL_MS = 2 * 60 * 1000

type CacheEntry = { fetchedAt: number; promise: Promise<RouteResult> }
const cache = new Map<string, CacheEntry>()

async function fetchRoute(request: RouteRequest): Promise<RouteResult> {
    const res = await fetch('/api/maps/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.error ?? 'Could not load the route')
    return data as RouteResult
}

function loadRoute(key: string): CacheEntry {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) return hit

    const entry: CacheEntry = { fetchedAt: Date.now(), promise: fetchRoute(JSON.parse(key)) }
    entry.promise.catch(() => cache.delete(key))
    cache.set(key, entry)
    return entry
}

type State = {
    key: string | null
    route: RouteResult | null
    fetchedAt: number
    error: string | null
}

/**
 * Fetches a driving route through the stops. Pass `null` to wait (e.g. for a GPS fix).
 * While a new request loads, the previous route stays available so the map doesn't flash.
 */
export function useRoute(request: RouteRequest | null) {
    const key = request ? JSON.stringify(request) : null
    const [state, setState] = useState<State>({ key: null, route: null, fetchedAt: 0, error: null })

    useEffect(() => {
        if (!key) return
        let cancelled = false
        const entry = loadRoute(key)
        entry.promise.then(
            (route) => {
                if (!cancelled) setState({ key, route, fetchedAt: entry.fetchedAt, error: null })
            },
            (err: unknown) => {
                if (!cancelled) {
                    const error = err instanceof Error ? err.message : 'Could not load the route'
                    setState((s) => ({ ...s, key, error }))
                }
            }
        )
        return () => {
            cancelled = true
        }
    }, [key])

    return {
        route: state.route,
        fetchedAt: state.fetchedAt,
        error: state.key === key ? state.error : null,
        loading: key !== null && state.key !== key,
    }
}
