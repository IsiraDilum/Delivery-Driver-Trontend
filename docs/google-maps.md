# Google Maps integration

The app uses two Google products:

| Product | Used for | Called from |
|---|---|---|
| **Maps JavaScript API** | Drawing the map, markers and route line | The browser, via `@vis.gl/react-google-maps` |
| **Routes API** (`computeRoutes`) | Traffic-aware driving route, legs, turn-by-turn steps | The server, via `POST /api/maps/route` |

Directions are never handed off to the Google Maps app; navigation runs entirely inside this app.

## API keys

Use **two separate keys** so the server key is never exposed to the browser. Copy `.env.example` to `.env.local` (git-ignored) and fill in:

| Variable | Where it runs | Enable in Google Cloud | Restrict by |
|---|---|---|---|
| `GOOGLE_MAPS_API_KEY` | Server only (route handler) | Routes API | API restriction: Routes API (IP restriction is optional; Vercel IPs change) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser (bundled into the page) | Maps JavaScript API | HTTP referrers: your domains, e.g. `https://your-app.vercel.app/*`, `http://localhost:3000/*` |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Browser, optional | Map Management → Map ID (JavaScript, vector) | n/a |

- Billing must be enabled on the Google Cloud project.
- Without a Map ID the app falls back to `DEMO_MAP_ID`, which works for development. Advanced markers need a Map ID either way.
- On Vercel, add the same variables under **Project → Settings → Environment Variables** and redeploy (`NEXT_PUBLIC_*` values are baked in at build time).
- Never commit real keys. Only `.env.example` (empty values) belongs in git.

## Data flow

```
Page (Home / Route / Navigation)
  └─ useRoute({ origin, stops })              lib/maps/use-route.ts
       └─ POST /api/maps/route                 app/api/maps/route/route.ts (zod validation)
            └─ computeRoute()                  lib/maps/routes-api.ts (server-only key)
                 └─ routes.googleapis.com/directions/v2:computeRoutes
  └─ <RouteMap route={…} stops={…} … />        components/maps/route-map.tsx
       └─ <APIProvider> in AppShell            components/maps/maps-provider.tsx
```

## Server: `POST /api/maps/route`

**Request**

```json
{
  "origin": { "lat": 6.9682715, "lng": 79.888416 },
  "stops": [{ "lat": 6.97, "lng": 79.89 }, { "lat": 6.95, "lng": 79.86 }]
}
```

- `lat` −90…90, `lng` −180…180.
- `stops`: 1–26 points. The last one is the destination; the others become intermediates (the Routes API allows 25 intermediates).

**Response** (`RouteResult`, `lib/maps/types.ts`)

```ts
type RouteResult = {
  distanceMeters: number
  durationSeconds: number
  encodedPolyline: string          // whole route, for drawing
  legs: {
    distanceMeters: number
    durationSeconds: number
    steps: {
      distanceMeters: number
      durationSeconds: number
      instruction: string          // first line only, e.g. "Turn right onto Main St"
      maneuver: string             // e.g. "TURN_RIGHT"; defaults to "STRAIGHT"
      start: { lat: number; lng: number }
      end: { lat: number; lng: number }
      polyline: string             // step geometry, used for progress tracking
    }[]
  }[]
}
```

There is one leg per stop: leg 0 is origin → stop 1, leg 1 is stop 1 → stop 2, and so on.

**Errors** (JSON `{ "error": "…" }`)

| Status | Message | Cause |
|---|---|---|
| 400 | Invalid route request | Body failed validation |
| 500 | GOOGLE_MAPS_API_KEY is not set | Missing server key |
| 502 | Could not calculate the route | Routes API returned an error (details are logged on the server) |
| 404 | No drivable route found for these stops | Routes API returned no route |
| 500 | Could not calculate the route | Any other failure |

**Routes API request settings:** `travelMode: DRIVE`, `routingPreference: TRAFFIC_AWARE`, `languageCode: en`, `units: METRIC`, `cache: no-store`.

**Field mask** (the Routes API bills by requested fields, so only these are asked for):

```
routes.distanceMeters, routes.duration, routes.polyline.encodedPolyline,
routes.legs.distanceMeters, routes.legs.duration,
routes.legs.steps.distanceMeters, routes.legs.steps.staticDuration,
routes.legs.steps.navigationInstruction,
routes.legs.steps.startLocation, routes.legs.steps.endLocation,
routes.legs.steps.polyline.encodedPolyline
```

## Client: `useRoute(request)`

```ts
const { route, fetchedAt, error, loading } = useRoute({ origin, stops })
```

- Pass `null` to wait (e.g. until GPS is available).
- Responses are cached in memory for **2 minutes** per identical request, so Home, Route and Navigation share one request.
- While a new request loads, the previous route stays available (no flashing).
- `fetchedAt` (ms) is used with leg durations to show ETAs.
- Failed requests are removed from the cache so the next render retries.

## Map component: `<RouteMap>`

| Prop | Purpose |
|---|---|
| `route` | Draws the polyline: a 9px white (dark mode `#141a16`) casing under a 5px purple line (`#6734ed`, dark `#9d7bff`) |
| `stops`, `activeIndex` | Numbered markers; active is highlighted, earlier ones marked done |
| `depot` | Warehouse marker |
| `driver` | Blue "you are here" dot |
| `fitPoints`, `fitKey` | Points to frame, and a key that triggers re-framing (so GPS updates don't fight the user's panning) |
| `padding` | Map padding used when framing |
| `interactive` | `true`: one-finger gestures (`greedy`); `false`: two-finger (`cooperative`) so the page scrolls |
| `camera` | `fit`, `follow` (zoom 17, pans with each GPS update) or `free` |
| `onUserPan` | Called on drag start (navigation uses it to pause following) |
| `status` | Small label shown on top of the map |

Other details:

- Default UI and clickable POIs are turned off; the map uses fractional zoom.
- Dark mode switches the map's colour scheme.
- Framing never zooms in closer than about a 1 km box (`MIN_SPAN_DEG = 0.01`), and re-frames whenever the map container is resized.

**Fallback messages** (shown in place of the map):

- "Map unavailable · NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set"
- "Google Maps failed to load · check the API key and enabled APIs" (bad key, referrer not allowed, or API not enabled)

`MapsProvider` wraps the whole app in `<APIProvider apiKey={…} region="LK">`, so the Maps script loads once and survives page changes. Without a browser key it renders children without the provider.

## Navigation helpers

| File | What it does |
|---|---|
| `lib/maps/navigation.ts` | `decodePolyline()` decodes Google encoded polylines; `trackProgress()` snaps a GPS fix onto the leg's step polylines and returns the current step, distance to the next maneuver, distance remaining, and whether the driver is off route (more than 50 m or the GPS accuracy, whichever is larger) |
| `lib/maps/use-geolocation.ts` | `watchPosition` (high accuracy, 5 s max age, 20 s timeout); status `pending`, `active`, `denied` or `unavailable` |
| `lib/maps/voice.ts` | `speak(text, { interrupt })`, `stopSpeaking()`, `spokenDistance(m)` using Web Speech with `en-GB` |
| `lib/use-wake-lock.ts` | Keeps the screen on while navigating |
| `lib/maps/format.ts` | `formatDistance` ("350 m", "1.4 km"), `formatDuration` ("5 min", "1 h 5 min"), `formatClock` ("11:08 PM"), `distanceBetween` (haversine metres), plus date helpers |

See [Navigation screen](screens/navigation.md) for how these combine.

## Cost notes

- Each route calculation is one Routes API request (billed at the "Advanced" tier because it is traffic-aware with intermediates).
- The 2-minute cache and the reroute limits (250 m in preview, one attempt per 10 s while off route) keep request counts low.
- Map loads are billed per page load of the Maps JavaScript API; the single `APIProvider` avoids reloading on navigation.

## Troubleshooting

| Symptom | Check |
|---|---|
| "Map unavailable · …not set" | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` missing; restart `pnpm dev` / redeploy after adding it |
| "Google Maps failed to load" | Maps JavaScript API enabled? Referrer list includes the current URL (including port and `https`)? Billing on? |
| "GOOGLE_MAPS_API_KEY is not set" | Server key missing in `.env.local` or Vercel env vars |
| "Could not calculate the route" | Routes API enabled for the server key? Check the server log for Google's message |
| Navigation won't start | Location permission denied in the browser; GPS requires `https` (or `localhost`) |
| No voice | Device muted, or the browser has no English voice installed; voice starts only after tapping "Start navigation" |
