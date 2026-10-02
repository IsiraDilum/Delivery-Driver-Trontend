import { NextResponse } from 'next/server'
import { z } from 'zod'
import { computeRoute, RoutesApiError } from '@/lib/maps/routes-api'

const latLng = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
})

// Routes API allows at most 25 intermediates + destination
const body = z.object({
    origin: latLng,
    stops: z.array(latLng).min(1).max(26),
})

export async function POST(req: Request) {
    const parsed = body.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid route request' }, { status: 400 })
    }

    try {
        const route = await computeRoute(parsed.data)
        return NextResponse.json(route)
    } catch (err) {
        if (err instanceof RoutesApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status })
        }
        console.error('Route calculation failed', err)
        return NextResponse.json({ error: 'Could not calculate the route' }, { status: 500 })
    }
}
