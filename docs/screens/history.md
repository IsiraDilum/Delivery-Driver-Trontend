# History screen

**Path:** `/history` · **Files:** `app/history/page.tsx`, `app/history/journeys-panel.tsx`, `app/history/trips.ts` · **Tab:** History

Past trips with summary metrics, a period filter, a trip-status filter, plus placeholders for reports and sync.

## Wireframe

```
┌──────────────────────────────────────┐
│ [logo] Waypoint            (☾)  (NS) │
├──────────────────────────────────────┤
│ Trip history                   [⚙•]  │  h1 + filter toggle
│ YOUR WORK, ALL IN ONE PLACE          │  eyebrow (or period name)
│ ┌──────────────────────────────────┐ │
│ │ PERIOD                           │ │  filter panel (when open)
│ │ (Last 7 days)(Last 30 days)(All time)
│ │ Reset                            │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────┐ ┌─────────────────┐ │
│ │ ⇄ Recent trips│ │ ◷ On-time rate  │ │
│ │ 4            │ │ 92%             │ │  metric cards (2×2)
│ │ 12 Sep – 1 Oct│ │ Average across  │ │
│ └──────────────┘ └─────────────────┘ │
│ ┌──────────────┐ ┌─────────────────┐ │
│ │ ➤ Distance    │ │ ▣ Packages      │ │
│ │ 537km        │ │ 184             │ │
│ │ Completed trips│ │ Handed over    │ │
│ └──────────────┘ └─────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Recent journeys    [All trips ▾] │ │
│ │ [🚚] WD-R13        (100% on time)│ │
│ │      1 Oct 2026 · 6h 12m         │ │
│ │      7 stops · 142 km            │ │
│ │ [🚚] WD-R11        ( 80% on time)│ │
│ │ …                                │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Reports & records             📋 │ │
│ │              📋                  │ │
│ │         No reports yet           │ │
│ │ Your fine and fuel records will  │ │
│ │ appear here.                     │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │  purple-soft card
│ │ ☁ Your records are up to date    │ │
│ │   Demo records stay on this device.
│ │   View sync queue →              │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## Sections

### 1. Heading and period filter

- Title "Trip history" (26px), with the eyebrow **below** it (12px, margin 0): "YOUR WORK, ALL IN ONE PLACE", or the selected period in capitals ("LAST 7 DAYS", "ALL TIME") when it isn't the default.
- **Filter toggle** (38px, `aria-label="Filter trip history"`, `aria-controls="history-filters"`). It is active (purple) while open or when the period isn't the default, with a dot in the latter case.
- **Filter panel** (`.filter-panel.history-filters`): `--card` fill with a 1px `--line` border (unlike the Route panel, because it sits on the page background), radius 12px, padding 12px, margin-bottom 12px.
  - Group "PERIOD" (`role="group"`, `aria-label="Time period"`): chips "Last 7 days", "Last 30 days" (default), "All time". Chips here use a `--soft` fill; the selected one is `--purple` with white text.
  - "Reset" when the period isn't the default.

### 2. Metric cards (`.metric-grid`)

2×2 grid, gap 10px. Each card: `--card`, 1px `--line`, radius 16px, padding 14px. Label row (icon 16px + label, 13px `--muted`), value 28px weight 800 with an optional small unit (45% size, `--muted`), description 12px `--muted`.

| Card | Icon | Value | Description |
|---|---|---|---|
| Recent trips | Route | number of trips in the period | date range "{oldest} – {newest}" (e.g. "12 Sep – 1 Oct"), a single date when only one trip, or "No trips in this period" |
| On-time rate | Clock | average on-time %, or "—" with no trips | "Average across trips" |
| Distance | Navigation | total km + "km" | "Completed trips" |
| Packages | Package | total packages | "Handed over" |

All four update when the period changes.

### 3. Recent journeys (`JourneysPanel`)

- Header: "Recent journeys" + a **dropdown**.
  - Button `.select-button`: current label + chevron 16px. 13px weight 700, 1px `--line-strong` border, radius 10px, padding 7px 10px. While open: purple border, chevron rotated 180°. `aria-haspopup="listbox"`, `aria-expanded`.
  - Menu `.select-options` (`role="listbox"`): anchored to the right, 6px below, min-width 190px, padding 4px, 1px `--line`, radius 12px, `--card`, shadow `0 10px 28px rgba(0,0,0,.22)`.
  - Options (`role="option"`, min-height 42px, 14px weight 600, radius 8px):

    | Option | Shows |
    |---|---|
    | All trips (default) | every trip in the period |
    | Fully on time | trips at 100% |
    | With delays | trips below 100% |

    Each option has a count badge (12px, `--soft` pill) for the current period. The selected option is `--purple-ink` on `--soft` with a check icon.
  - Closes on selection, a tap outside, or Escape.
- **Trip rows** (`.journey`): padding 12px 0, gap 12px, 1px `--line` divider (none on the last row).
  - 40px truck tile (`--soft`, radius 12px, Truck 20px `--muted`).
  - Trip ID 15px; "{date} · {duration}" 12px `--muted`, e.g. "1 Oct 2026 · 6h 12m"; "{stops} stops · {km} km" 12px bold `--muted`.
  - Status pill at the right, 11px, padding 4px 8px: "{n}% on time". Green (`.status-green`) at 100%, amber text (`.status-amber`) otherwise.
- **Empty:** "No trips in this period." when the period has none, otherwise "No trips match this filter." (13px `--muted`, centered).

### 4. Reports & records (`.panel.reports`)

Header "Reports & records" + ClipboardList icon. Empty state: ClipboardList 32px, "No reports yet" (15px bold `--ink`), "Your fine and fuel records will appear here." (13px `--muted`). Static: nothing is stored yet.

### 5. Sync card (`.panel.sync-card`)

`--purple-soft` fill. UploadCloud icon 20px `--purple-ink`, "Your records are up to date" (15px bold), "Demo records stay on this device." (13px `--muted`), text button "View sync queue →" (14px `--purple-ink`, no action yet).

## Dates

Trip dates are computed in the browser as "today minus `daysAgo`", using `useNow()`. During server rendering the dates are left out: the trip rows show only the duration, and the "Recent trips" card shows the period label instead of a range. They fill in on the first client render.

Formats: `formatDayMonth` → "25 Sep"; `formatShortDate` → "25 Sep 2026".

## Data (`app/history/trips.ts`)

| ID | Days ago | Duration | Stops | km | Packages | On time |
|---|---|---|---|---|---|---|
| WD-R13 | 1 | 6h 12m | 7 | 142 | 48 | 100% |
| WD-R11 | 3 | 4h 48m | 5 | 98 | 34 | 80% |
| WD-R08 | 9 | 7h 30m | 9 | 176 | 61 | 89% |
| WD-R05 | 20 | 5h 10m | 6 | 121 | 41 | 100% |
| WD-R02 | 41 | 5h 46m | 6 | 133 | 39 | 83% |

Resulting metrics:

| Period | Trips | On time | Distance | Packages |
|---|---|---|---|---|
| Last 7 days | 2 | 90% | 240 km | 82 |
| Last 30 days (default) | 4 | 92% | 537 km | 184 |
| All time | 5 | 90% | 670 km | 223 |

## State

| State | Where | Default |
|---|---|---|
| `filtersOpen` | page | `false` |
| `period` | page | `'30d'` |
| `filter` | `JourneysPanel` | `'all'` |
| `open` (dropdown) | `JourneysPanel` | `false` |

The trip-status filter is applied to whatever the period filter returns, so both combine.

## Known issue

`.status-amber` in `globals.css` has an invalid background (`var(--card)0db`), so the amber pill shows only amber text with no fill. It was most likely meant to be `#fff0db`; replace it with `background: var(--amber-soft)` (`#fff0db` light, `#3a2c15` dark) to get the intended pale amber fill.
