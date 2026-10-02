# Navigation screen

**Path:** `/route/map` · **File:** `app/route/map/page.tsx` · **Opened from:** "Start journey" and "Ready to go" (Home), "View route" (Route)

Full-screen, in-app turn-by-turn navigation to the current stop. Directions never open Google Maps; everything runs inside the app with live GPS, a following camera, rerouting and spoken prompts.

## Layout

The page is `position: fixed; inset: 0` inside the 430px column (same width as other screens), z-index 30. The header and bottom tab bar are hidden (`/route/map` is listed in `IMMERSIVE_PATHS` in `components/app-shell.tsx`), and the page behind it cannot scroll.

It is a vertical flex column: the **map** takes all remaining height and the **stop card** is docked at the bottom.

### Preview (before Start)

```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │ [←]  Navigation      Stop 1 of 4 │ │  floating app bar
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ [↱]  60 m                        │ │  turn card (white)
│ │      Turn right toward …         │ │
│ └──────────────────────────────────┘ │
│                                      │
│            map (fit to driver        │
│            + current stop)           │
│                                      │
│ (GPS ±10 m)            [🔔 Emergency]│
│ Google                  Map data ©…  │  attribution kept visible
├──────────────────────────────────────┤
│ (STOP 1 · FRESH)          1.4 km away│  stop card
│ Northgate Market             10:58 PM│
│ 42 Negombo Road, Peliyagoda       ETA│
│ ◷ Delivery window 6:30–8:00 AM       │
│ [        ➤ Start navigation        ] │
└──────────────────────────────────────┘
```

### Navigating

```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │ [↱]  250 m                       │ │  turn card (purple, larger)
│ │      Turn right onto Main St     │ │  app bar hidden
│ │      Then turn left onto …       │ │
│ └──────────────────────────────────┘ │
│                                      │
│        map follows the driver        │
│        (zoom 17)                     │
│                                [🔊]  │  mute
│ [⌖ Recenter]                         │  only after the driver pans
│ (GPS ±8 m)             [🔔 Emergency]│
├──────────────────────────────────────┤
│ Northgate Market             11:08 PM│
│ 42 Negombo Road, Peliyagoda       ETA│
│ ┌───────┐┌───────┐┌──────────────┐   │
│ │1.2 km ││4 min  ││6:30–8:00 AM  │   │  trip stats
│ │to go  ││drive  ││window        │   │
│ └───────┘└───────┘└──────────────┘   │
│ [        ✕ End navigation          ] │  secondary button
└──────────────────────────────────────┘
```

## Elements and exact styles

### Floating app bar (`.nav-topbar`): preview only

- Absolute, top `calc(10px + safe-area-top)`, left/right 10px, z-index 6.
- `--card` fill, radius 16px, padding `6px 12px 6px 6px`, gap 10px, shadow `0 4px 16px rgba(0,0,0,.14)`.
- Back button (`.nav-back`): 40×40px, radius 12px, `--soft` fill, ArrowLeft 20px, links to `/route`.
- Title "Navigation" 18px weight 800, letter-spacing −0.2px, fills the remaining width.
- "Stop 1 of 4" 13px weight 700 `--muted`.
- Hidden while navigating.

### Turn card (`.nav-turn`)

`aria-live="polite"`. Absolute, left/right 10px, z-index 5. Background, colour and position animate over 250ms.

| | Preview | Navigating |
|---|---|---|
| Position | top `calc(70px + safe-area-top)` (below the app bar) | top `calc(10px + safe-area-top)` |
| Fill / text | `--card` / `--ink` | `--purple` / white |
| Padding, radius | 8px 10px, 14px | 10px 12px, 14px |
| Icon tile | 38px, radius 12px, `--purple` fill, white icon 22px | 46px, radius 14px, white 18% fill, icon 28px |
| Distance (`strong`) | 17px | 22px |
| Instruction (`span`) | 13px `--muted` | 14px weight 600, white 90% |
| "Then …" line | hidden | 12px weight 600, 80% opacity, one line with ellipsis |

**Content, in priority order**

1. Arrived: CheckCheck icon, "You've arrived" / stop name.
2. Route failed and none cached: "Route unavailable" / error message.
3. Route loaded: distance to the next maneuver (e.g. "250 m") / the maneuver instruction. While navigating, a "Then {next instruction}" line when there is a following step.
4. Loading: "Calculating route…" / stop address.

**Maneuver icons** (lucide): turn left/sharp left → CornerUpLeft; turn right/sharp right → CornerUpRight; slight left, fork left, ramp left → ArrowUpLeft; slight right, fork right, ramp right → ArrowUpRight; U-turn left → Undo2; U-turn right → Redo2; roundabout left → RotateCcw; roundabout right → RotateCw; merge → Merge; ferry → Ship; destination → MapPin; anything else → ArrowUp.

If a step comes back without an instruction text, the card falls back to "Arrive at {stop name}".

### Map

- Fills the space between top and stop card, no radius.
- Shows the route line, numbered stop markers (current stop active), the driver's blue dot, and the depot marker only when there is no GPS fix.
- Full one-finger gestures (`gestureHandling: 'greedy'`). Map padding `{ top: 160, right: 44, bottom: 80, left: 44 }` keeps the route clear of the overlays.
- **Camera modes:**
  - **fit** (preview, or no GPS): frames the driver (or depot) and the current stop. Re-frames when the map is resized.
  - **follow** (navigating with GPS): zooms to 17 on the driver, then pans smoothly with every GPS update.
  - **free** (navigating, after the driver drags the map): the camera stays where the driver left it until "Recenter".

### Map overlays

All overlays sit at least 30px above the bottom edge so Google's logo and "Map data" attribution stay visible (required by Google's terms).

| Overlay | When | Position | Style |
|---|---|---|---|
| GPS label (`.nav-gps`) | always | left 10px, bottom 36px | 11px weight 600 `--muted` on `--glass`, padding 4px 8px, radius 8px |
| Emergency (`.nav-emergency`) | always | right 10px, bottom 30px | min-height 44px, padding 0 16px, radius 14px, `--card` fill, 1px `--danger-line` border, `--danger-text` 700, BellRing 20px + "Emergency", red shadow. Opens the incident modal |
| Recenter (`.nav-recenter`) | navigating, GPS on, after a drag | left 10px, bottom 64px | `.nav-map-button`: min-height 44px, radius 14px, `--card` fill, 1px `--line` border, `--purple-ink` 700, LocateFixed 18px + "Recenter" |
| Mute (`.nav-mute`) | navigating | right 10px, bottom 84px | 44×44px map button with Volume2 / VolumeX 20px; `aria-pressed` when muted (icon turns `--muted`) |

**GPS label text**

| Status | Text |
|---|---|
| Waiting for the first fix | "Locating…" (preview) / "Waiting for GPS…" (navigating) |
| Active | "GPS ±{accuracy} m", or "Off route · recalculating" while navigating off route |
| Permission denied | "Location off · route from depot" |
| No GPS available | "No GPS · route from depot" |

### Stop card (`.nav-card`)

- Docked at the bottom (not overlaying the map), z-index 6, `--card` fill, upward shadow `0 -6px 24px rgba(0,0,0,.12)`.
- Padding `12px 16px calc(12px + safe-area-bottom)`, column gap 10px.

| Row | Preview | Navigating |
|---|---|---|
| Label row | Pill "STOP 1 · FRESH" (12px) + "{distance} away" 13px weight 700 `--muted` | hidden |
| Main row | Stop name 16px weight 800, address 13px `--muted`; right: ETA clock 19px weight 800 over "ETA" 13px | same |
| Info row | `.nav-window`: clock icon 16px + "Delivery window 6:30–8:00 AM", 13px weight 600, `--soft` fill, radius 12px, padding 8px 10px | `.nav-trip-stats`: 3 tiles in columns `1fr 1fr 1.4fr`, gap 6px. Each tile `--soft`, radius 12px, padding 8px 10px; value 14px weight 800 `--ink` over caption 11px weight 600 `--muted`: "{distance} to go", "{duration} drive", "{window} window" |
| Arrived | "✓ Confirm delivery" primary CTA linking to `/delivery` | same |
| Action | "➤ Start navigation" (`.nav-cta`: `--purple`, white 15px weight 700, min-height 46px, radius 14px). Disabled (`--purple-disabled`) while there is no route or location is blocked; then the helper "Turn on location to get turn-by-turn directions." (13px, centered) | "✕ End navigation" (`.nav-cta.secondary`: `--card` fill, 1px `--purple` border, `--purple-ink` text) |

On screens 360px wide or narrower (container query), trip-stat tiles use 8px padding and 13px values.

## Behaviour

### Route calculation

- The route goes from `routeOrigin` through the remaining stops. `routeOrigin` starts at the depot and switches to the driver's GPS position on the first fix.
- **Rerouting:**
  - On the first GPS fix.
  - In preview: when the driver has moved more than **250 m** from the route origin.
  - While navigating: when off route, at most once every **10 s**.
  - On Start: if the driver is more than **30 m** from the route origin.
- Routes are cached for 2 minutes per request (see [Google Maps](../google-maps.md)).

### Progress tracking

- Every GPS update is snapped onto the step polylines of leg 1 (`trackProgress` in `lib/maps/navigation.ts`), looking at most 4 steps ahead of the furthest step reached.
- Progress never moves backwards on the same route.
- The driver is **off route** when more than `max(50 m, GPS accuracy)` from the nearest step.
- Each step's instruction describes the maneuver at its start, so the turn card shows the instruction of the **next** step and the distance to the end of the current one.

### Arrival

The driver has arrived when within **60 m** of the stop, or while navigating, on route, with less than **30 m** left. Shows the arrived state and the "Confirm delivery" button.

### ETA

Remaining time = leg duration × (remaining distance ÷ leg distance). ETA = the later of route-fetch time and the latest GPS fix time, plus the remaining time. Shown as a clock time, e.g. "11:08 PM".

### Voice guidance (`lib/maps/voice.ts`)

- Uses the browser's Web Speech API, British English (`en-GB`). Distances are spoken in full ("300 metres", "1.2 kilometres").
- Each prompt is spoken once per step of each route:
  - On Start: "Starting navigation to {stop}" (spoken from the tap, which also unlocks audio on iOS).
  - More than 80 m from the turn: "In {distance}, {instruction}".
  - Within 80 m: "{instruction}" (skipped if the heads-up was given within 160 m).
  - Off route: "Recalculating route".
  - Arrival: "You have arrived at {stop}".
- Urgent prompts (now, off route, arrival, start) interrupt; others queue.
- Mute stops speech immediately. Leaving the screen stops speech.

### Other

- **Screen wake lock:** the screen stays on while navigating (`lib/use-wake-lock.ts`), and the lock is re-acquired when the tab becomes visible again.
- **GPS** (`lib/maps/use-geolocation.ts`): `watchPosition` with high accuracy, max age 5 s, timeout 20 s. Timeouts and brief signal loss keep the last fix instead of failing; only a denied permission or no fix at all blocks Start.
- **End navigation** returns to the preview layout and stops speech. Starting again clears spoken prompts.

## State

| State | Purpose |
|---|---|
| `navigating` | Preview vs. driving layout |
| `following` | Follow camera vs. free camera (false after a drag) |
| `muted` | Voice on or off |
| `routeOrigin`, `hasGpsRoute` | Where the current route starts; whether it was calculated from GPS |
| `stepFloor` | Furthest step reached on the current route |

## Constants

| Constant | Value |
|---|---|
| `PREVIEW_REROUTE_M` | 250 |
| `OFF_ROUTE_RETRY_MS` | 10 000 |
| `START_REROUTE_M` | 30 |
| `ARRIVAL_RADIUS_M` | 60 |
| `PROMPT_NOW_M` | 80 |
| Follow zoom | 17 |
| Off-route threshold | 50 m (or GPS accuracy if larger) |
| Lookahead steps | 4 |
