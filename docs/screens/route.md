# Route screen

**Path:** `/route` · **File:** `app/route/page.tsx` · **Tab:** Route

An overview of the whole day: a map of the route and the list of stops, which the driver can sort and filter.

## Wireframe

```
┌──────────────────────────────────────┐
│ [logo] Waypoint            (☾)  (NS) │
├──────────────────────────────────────┤
│ Your route                     [🔔]  │  h1 + emergency tile
│ One stop at a time. You're on track. │
│ ┌──────────────────────────────────┐ │
│ │ Route at a glance  View route →  │ │
│ │ ┌──────────────────────────────┐ │ │
│ │ │   map: depot, stops 1–4,     │ │ │  220px tall
│ │ │   purple route line          │ │ │
│ │ └──────────────────────────────┘ │ │
│ │ ⌖ Peliyagoda depot  4 stops · 7.7 km · 21 min │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Stop sequence               [⚙•] │ │  filter toggle
│ │ ┌ SORT ───────────────────────┐  │ │
│ │ │ (Route order)(Earliest window)│ │ │  filter panel (when open)
│ │ │ (Most packages)              │  │ │
│ │ │ SHOW                         │  │ │
│ │ │ (All stops)(Fresh)(Frozen)(Dry)│ │ │
│ │ │ Reset                        │  │ │
│ │ └──────────────────────────────┘  │ │
│ │ Showing 2 of 4 stops · most packages │
│ │ (1) Northgate Market             │ │
│ │     5 packages · Fresh · 6:30–8:00 AM · 1.4 km, 5 min drive │
│ │     Rear loading bay · enter from Station Road │
│ │ ──────────────────────────────── │ │
│ │ (2) Riverside Grocer …           │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## Sections

### 1. Heading

- Title "Your route" (26px), subtitle "One stop at a time. You're on track." (15px `--muted`).
- **Emergency tile** on the right (`.alert-tile`): 48×48px, radius 14px, `--card` fill, BellRing icon 22px in `--danger`. Opens the **incident** modal. `aria-label="Open emergency incident report"`.

### 2. Route at a glance (`.panel.map-panel`)

- Header: "Route at a glance" + text button "View route →" linking to `/route/map`.
- **Map** (`.map`): 220px tall, radius 12px, margin-top 12px. Shows the depot marker, numbered stop markers (stop 1 highlighted as active) and the route line. Framed to fit the depot and all stops. Uses two-finger ("cooperative") gestures so the page can still scroll.
- While loading, a small label "Loading route…" sits top-right on the map; on failure it shows the error message.
- **Footer** (13px `--muted`, padding-top 12px): pin icon + "Peliyagoda depot" on the left; bold "4 stops · 7.7 km · 21 min" on the right (distance and time appear once the route loads).

### 3. Stop sequence (`.panel.sequence`)

#### Header

"Stop sequence" + the **filter toggle** (see [design system](../design-system.md#filter-toggle-and-panel-route-and-history)). Tapping it opens or closes the filter panel. The toggle is purple while open or while a non-default sort/filter is applied, with a dot in the latter case.

#### Filter panel (`.filter-panel`, `id="sequence-options"`)

| Group | Options | Default |
|---|---|---|
| Sort | Route order · Earliest window · Most packages | Route order |
| Show | All stops · Fresh · Frozen · Dry (built from the categories present in the stop data) | All stops |

- "Reset" appears when the sort or filter is not the default and restores both defaults.
- Sorting:
  - **Route order:** original order.
  - **Earliest window:** by the start time of the delivery window. "6:30–8:00 AM" starts at 6:30 AM; a start without AM/PM borrows the end's period.
  - **Most packages:** descending package count.
  - Ties keep route order.
- Filtering keeps only stops whose `category` matches.

#### Summary line

Shown only when not default: "Showing {visible} of {total} stops" plus " · {sort label in lower case}" when sorted, e.g. "Showing 2 of 4 stops · most packages".

#### Stop rows (`.sequence-row`)

- Flex row, gap 12px, padding 14px 0, 1px `--line` divider (none after the last row).
- **Number badge:** 32px circle, 2px `--line` border, 14px `--muted`. The current stop is filled `--purple` with white text.
  - The badge always shows the stop's **route position** (1–4), even when re-sorted, so the driving order stays visible.
- **Title:** stop name 16px weight 800.
- **Line 1** (13px `--muted`): `{packages} packages · {category} · {window}` and, once the route loads, ` · {leg distance}, {leg duration} drive`.
- **Line 2** (13px `--muted`): access instructions, e.g. "Rear loading bay · enter from Station Road".

## State

| State | Type | Default | Notes |
|---|---|---|---|
| `optionsOpen` | boolean | `false` | Panel visibility |
| `sort` | `'route' \| 'window' \| 'packages'` | `'route'` | |
| `category` | `string \| null` | `null` (all) | |

State is local to the page and resets when the driver leaves it.

## Stop data (sample)

| # | Name | Packages | Window | Category | Instructions |
|---|---|---|---|---|---|
| 1 | Northgate Market | 5 | 6:30–8:00 AM | Fresh | Rear loading bay · enter from Station Road |
| 2 | Riverside Grocer | 4 | 6:00–8:00 AM | Fresh | Curbside unloading · contact receiver on arrival |
| 3 | Harbour Foods | 6 | 8:00–10:00 AM | Frozen | Side gate · ask security for the goods-in desk |
| 4 | Pettah Central Mart | 4 | 9:00–11:00 AM | Dry | Short-stay bay on Main Street · max 15 minutes |
