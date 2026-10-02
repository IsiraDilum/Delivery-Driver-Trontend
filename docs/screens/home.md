# Home screen

**Path:** `/` · **File:** `app/page.tsx` · **Tab:** Home

The driver's start-of-day screen: a greeting with today's date, a summary of today's route, quick actions, and the next stop with a button to start navigating.

## Wireframe

```
┌──────────────────────────────────────┐
│ [logo] Waypoint            (☾)  (NS) │  header
├──────────────────────────────────────┤
│ FRIDAY, 2 OCTOBER                    │  eyebrow (live date)
│ Good evening, Ravi.                  │  h1 (time-of-day greeting)
│ Let's make every stop count.         │  subhead
│ ┌──────────────────────────────────┐ │
│ │ ⇄ TODAY'S ROUTE     (Ready to go)│ │  purple route card
│ │ LP-6387  Peliyagoda → Colombo    │ │
│ │ 04        │ 19        │ 7.7km    │ │
│ │ delivery  │ packages  │ planned  │ │
│ │ stops     │           │ distance │ │
│ │ ──────────────────────────────── │ │
│ │ ◷ First delivery before 8:00 AM  │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────┐ ┌─────────────────┐ │
│ │ ⛽ Log refuel >│ │ 🔔 Report a fine>│ │  quick actions
│ └──────────────┘ └─────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Your next stop             1 / 4 │ │
│ │ Northgate Market         11:08   │ │
│ │ 42 Negombo Road, …      PM · ETA │ │
│ │ ▣ 5 packages  ➤ 1.4 km away Fresh│ │
│ │ [      Start journey  →        ] │ │
│ └──────────────────────────────────┘ │
│   ( Home | Route | Delivery | History )  tab bar
└──────────────────────────────────────┘
```

## Sections

### 1. Date and greeting

| Element | Content | Style |
|---|---|---|
| Eyebrow | Today's date, uppercase: `FRIDAY, 2 OCTOBER` | 12px, weight 600, `--muted`, margin-bottom 6px |
| Title | `{greeting}, Ravi.` (the final dot is `--purple-ink`) | 26px, weight 800 |
| Subhead | "Let's make every stop count." | 15px, `--muted`, margin-bottom 18px |

**Behaviour**

- The date and greeting come from the **device clock** via `useNow()` (`lib/use-now.ts`), not the server (Vercel runs in UTC, which would show the wrong day near midnight in Sri Lanka).
- `useNow()` re-reads the clock every minute and when the tab becomes visible, so the date rolls over at midnight.
- Greeting: before 12:00 "Good morning", before 17:00 "Good afternoon", otherwise "Good evening".
- During server rendering the date line is blank (a non-breaking space) and the title reads "Hello, Ravi." for one frame.
- Date format (`formatLongDate`): `{weekday}, {day} {month}` in English, e.g. "Friday, 2 October".

### 2. Today's route card (`.route-card.purple-card`)

- `--purple` fill, white text, radius 16px, padding 16px.
- **Header row:** route icon 16px + "TODAY'S ROUTE" (13px) on the left; "Ready to go" outline pill on the right (1px white border, radius 20px, 12px weight 600) that links to `/route/map`.
- **Route ID:** `LP-6387` 22px weight 800, followed by "Peliyagoda → Colombo" 12px at 85% opacity. Margin 14px top, 12px bottom.
- **Stats row:** three equal columns separated by 1px `#b4a0ff` lines (10px padding/margin either side):

| Value | Caption | Source |
|---|---|---|
| `04` (stops, zero-padded) | delivery stops | `STOPS.length` |
| `19` | packages | sum of `packages` across stops |
| `7.7` + small `km` | planned distance | Routes API total distance; `--` until loaded |

  Values 20px weight 800 (unit 12px); captions 11px at 90% opacity.
- **Footer:** 1px `#b4a0ff` top border, padding-top 10px, clock icon 14px + "First delivery before 8:00 AM" 13px.

### 3. Quick actions (`.quick-actions`)

Two equal buttons in a grid, gap 10px, margin 12px 0.

| Button | Icon | Opens |
|---|---|---|
| Log refuel | Fuel | the **parking fine** modal (`fine`) |
| Report a fine | BellRing | the **incident** modal (`incident`) |

Each: `--card` fill, 1px `--line` border, radius 12px, padding 12px, 14px weight 600, purple leading icon 18px, trailing chevron 16px `--muted` pushed right.

> The labels and the modals they open are swapped in the current code ("Log refuel" opens the fine form, "Report a fine" opens the incident form). Keep or fix this deliberately when rebuilding.

### 4. Next stop (`.next-stop`)

`--card` panel, radius 16px, padding 16px.

- **Header:** "Your next stop" 17px; pill `1 / 4` (current stop number / total).
- **Main row:**
  - Left: stop name 16px weight 800 ("Northgate Market"), address 13px `--muted`.
  - Right: ETA time 20px weight 800 (e.g. `11:08`) over `PM · ETA` 11px `--muted`. Shows `--:--` / `ETA` until the route loads.
  - ETA = time the route was fetched + the driving duration of leg 1 (depot → stop 1).
- **Meta row** (wraps, gaps 6px/12px, 12px `--muted`, icons 14px): package icon + "5 packages", navigation icon + "1.4 km away" (leg 1 distance, `—` until loaded), and a category tag ("Fresh": `--green-soft` fill, `--green-ink`, 11px, padding 3px 7px).
- **Button:** "Start journey →" primary button linking to `/route/map`.

## Data

| Value | Source |
|---|---|
| Route ID, stops, depot, current stop | `lib/route-data.ts` (`ROUTE_ID`, `STOPS`, `CURRENT_STOP_INDEX`, `TOTAL_PACKAGES`) |
| Distance and ETA | `useRoute(PLANNED_ROUTE)`: depot → all stops (see [Google Maps](../google-maps.md)) |
| Date and greeting | `useNow()` |
