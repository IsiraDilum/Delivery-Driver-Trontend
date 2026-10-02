# Waypoint driver app: documentation

Waypoint is a phone-first web app for delivery drivers. A driver sees today's route, navigates to each stop with in-app turn-by-turn directions, confirms the handoff at the store, and reviews past trips.

These documents describe every screen's functionality and exact UI, the shared design system, and the Google Maps integration, so the screens can be rebuilt or merged into another codebase.

## Contents

| Document | What it covers |
|---|---|
| [Design system](design-system.md) | Layout, colour tokens (light and dark), typography, spacing, shared components, motion |
| [Home screen](screens/home.md) | `/`: greeting, live date, today's route card, quick actions, next stop |
| [Route screen](screens/route.md) | `/route`: route map, stop sequence with sort and filter |
| [Navigation screen](screens/navigation.md) | `/route/map`: full-screen map with turn-by-turn guidance and voice |
| [Delivery screen](screens/delivery.md) | `/delivery`: package handoff, outcome, receiver, photo, success view |
| [History screen](screens/history.md) | `/history`: period filter, metrics, journeys with status filter |
| [Modals](screens/modals.md) | Incident report, parking fine, store verification |
| [Google Maps integration](google-maps.md) | API keys, Routes API proxy, map component, navigation logic, voice |
| [Integration guide](integration-guide.md) | How to move these screens into another repository |

## App at a glance

- **Phone-only layout.** Every screen renders in a 430px-wide column. On a phone it fills the screen; on a tablet or desktop it shows as a centered column with a shadow.
- **Five routes**, four of them reachable from the bottom tab bar:

| Path | Screen | Tab |
|---|---|---|
| `/` | Home | Home |
| `/route` | Route overview | Route |
| `/route/map` | Navigation (full screen, no header or tab bar) | none |
| `/delivery` | Confirm delivery | Delivery |
| `/history` | Trip history | History |

- **Light and dark themes**, toggled from the header and remembered in `localStorage`.
- **Three modals** (incident, fine, verify) opened from several screens.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript (strict) |
| Styling | One global stylesheet, `app/globals.css` (plain CSS classes and CSS variables; Tailwind is imported but not used by these screens) |
| Icons | `lucide-react` |
| Maps | `@vis.gl/react-google-maps` (Maps JavaScript API) plus Google Routes API via a server route |
| Validation | `zod` (route API request body) |
| Font | Plus Jakarta Sans via `next/font/google`, weights 400–800 |

## Folder structure

```
app/
  layout.tsx              Root layout: font, viewport, theme script, AppShell
  globals.css             All styles (tokens, components, screens, phone layout, dark mode)
  page.tsx                Home
  route/page.tsx          Route overview
  route/map/page.tsx      Navigation
  delivery/page.tsx       Confirm delivery
  history/page.tsx        Trip history (period filter, metrics)
  history/journeys-panel.tsx  Recent journeys list with status dropdown
  history/trips.ts        Sample trip data
  api/maps/route/route.ts POST /api/maps/route: Routes API proxy
components/
  app-shell.tsx           Header + page + bottom nav, modal context, maps provider
  header.tsx              Top bar: logo, theme toggle, avatar
  bottom-nav.tsx          Bottom tab bar
  modal-view.tsx          The three modals
  maps/maps-provider.tsx  Loads the Maps JavaScript API once
  maps/route-map.tsx      Map with route line, markers, camera modes
lib/
  route-data.ts           Sample route: depot, stops, current stop
  use-now.ts              Device clock, updated every minute
  use-wake-lock.ts        Keeps the screen on while navigating
  use-is-dark-theme.ts    Watches the data-theme attribute
  maps/types.ts           Route types
  maps/routes-api.ts      Server-only Routes API client
  maps/use-route.ts       Client hook with 2-minute cache
  maps/use-geolocation.ts GPS watch hook
  maps/navigation.ts      Polyline decoding and progress tracking
  maps/voice.ts           Spoken prompts (Web Speech API)
  maps/format.ts          Distance, duration, clock and date formatting
```

## Running locally

```bash
pnpm install          # or npm install
cp .env.example .env.local   # then fill in the Google Maps keys
pnpm dev              # http://localhost:3000
```

`next.config.mjs` sets `ignoreBuildErrors: true`, so run `npx tsc --noEmit -p .` to type-check.

## Sample data

Until a backend exists, the screens use sample data:

- **Route and stops:** `lib/route-data.ts`. Route `LP-6387`, depot in Peliyagoda, four stops in Colombo, the driver is always on stop 1.
- **Trips:** `app/history/trips.ts`, dated relative to today.
- **Delivery:** five packages `PKG-9040` to `PKG-9044` for Northgate Market.
- **Driver:** "Ravi", avatar initials "NS", vehicle "V-14".

Modal forms and "Complete delivery" do not save anything yet.
