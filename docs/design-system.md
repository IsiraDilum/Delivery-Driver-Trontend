# Design system

All styles live in `app/globals.css`. Values below are the ones that apply on screen (the "PHONE LAYOUT" section overrides the older desktop values earlier in the file).

## Layout

| Element | Rule |
|---|---|
| Page background (`html`, `body`) | `#101410` (visible around the column on wide screens) |
| App column (`.app-shell`) | `width: 100%`, `max-width: 430px`, centered, `min-height: 100vh`, background `--surface` |
| Column shadow (viewport wider than 430px) | `0 0 0 1px var(--line), 0 12px 48px rgba(0,0,0,.25)` |
| Page content (`.content`) | padding `20px 16px`, bottom padding `calc(92px + env(safe-area-inset-bottom))` to clear the tab bar |
| Viewport | `viewportFit: 'cover'`; header, tab bar and navigation overlays add `env(safe-area-inset-*)` so nothing sits under the notch or home indicator |
| Theme colour | light `#f5f0ff`, dark `#191527` |

## Colour tokens

Set on `:root`; dark values apply when `<html data-theme="dark">`.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--purple` | `#6734ed` | `#6734ed` | Primary buttons, active tab, active chips, route card |
| `--purple-ink` | `#6734ed` | `#b9a4ff` | Purple text and icons |
| `--purple-soft` | `#e5dcff` | `#2c2350` | Pills, avatar, active filter toggle |
| `--purple-disabled` | `#b49af4` | `#4a3d85` | Disabled primary buttons |
| `--ink` | `#182920` | `#eaf1ec` | Main text |
| `--muted` | `#66766d` | `#9fb0a6` | Secondary text and icons |
| `--surface` | `#f5f8f6` | `#141a16` | App background |
| `--card` | `#ffffff` | `#1d2420` | Cards, panels, modals |
| `--soft` | `#eff3f0` | `#252e29` | Subtle fills (chips, rows, icon tiles) |
| `--line` | `#dce4df` | `#2b3530` | Borders and dividers |
| `--line-strong` | `#c5d0c9` | `#3a463f` | Input borders, dashed outlines |
| `--topbar` | `#f5f0ff` | `#191527` | Header background |
| `--green-ink` | `#20784f` | `#5ad19a` | Success text |
| `--green-soft` | `#e5f4eb` | `#17382a` | Success fills |
| `--danger` | `#bc4346` | `#f08a8d` | Emergency, incident |
| `--danger-text` | `#c62828` | `#ff9a9a` | Emergency button text |
| `--danger-soft` | `#fde8e8` | `#3a1f21` | Incident context box |
| `--danger-line` | `#f3c1c1` | `#5a2f31` | Emergency button border |
| `--amber-text` | `#b56915` | `#f0b45a` | "Below 100% on time" status |
| `--amber-soft` | `#fff0db` | `#3a2c15` | Defined but currently unused (intended fill for `.status-amber`) |
| `--map-bg` | `#edf2ef` | `#1b2420` | Map placeholder |
| `--glass` | `rgba(255,255,255,.88)` | `rgba(29,36,32,.88)` | GPS label over the map |

Fixed colours: the route card divider `#b4a0ff`, driver location dot `#1a73e8`, modal backdrop `#101c1688` (dark `#000a`).

## Typography

Font: **Plus Jakarta Sans** (400, 500, 600, 700, 800) with system fallbacks. Headings `h1–h4` use weight 800.

| Role | Size | Weight / other | Examples |
|---|---|---|---|
| Page title (`.content h1`) | 26px | 800, line-height 1.15, letter-spacing −0.6px | "Your route", "Trip history" |
| Eyebrow | 12px | 600, uppercase text, letter-spacing .06em, `--muted` | "FRIDAY, 2 OCTOBER" |
| Subhead | 15px | line-height 1.4, `--muted` | "One stop at a time." |
| Section heading (`.panel h2`) | 17px | 800 | "Stop sequence" |
| Card title | 15–16px | 800 | Stop name, trip ID |
| Body / secondary | 13–14px | 400–600 | Addresses, details |
| Small labels | 11–12px | 600–700 | Stat captions, pills |
| Big numbers | 20–28px | 800 | Route stats 20px, metrics 28px, ETA 20px |
| Buttons | 15px | 700 | "Start journey" |
| Inputs | 16px | 400 | Kept at 16px so iOS does not zoom on focus |

## Radius, spacing, shadow

| Item | Value |
|---|---|
| Panels and cards | radius 16px, padding 16px (14px for metric cards), gap between panels 12px |
| Buttons | radius 12px, min-height 48px |
| Chips | radius 999px, min-height 34px |
| Small icon tiles | radius 12px (40×40px) |
| Bottom tab bar | radius 16px, shadow `0 14px 28px #1b332b25` |
| Floating map controls | radius 14px, shadow `0 4px 12px rgba(0,0,0,.14)` |
| Dropdown menu | radius 12px, shadow `0 10px 28px rgba(0,0,0,.22)` |

## Shared components

### Header (`components/header.tsx`, `.topbar`)

- Sticky at the top, z-index 20, background `--topbar`, 1px bottom border `--line`.
- Padding `calc(10px + safe-area-top) 16px 10px`.
- Left: logo image `/images/logo.png` 34×34px radius 9px, then "Waypoint" 19px weight 700 `--purple-ink`, gap 10px.
- Right (gap 8px):
  - Theme toggle: 40×40px circle, `--card` fill, 1px `--line-strong` border, Moon icon (light) or Sun icon (dark) 20px. Toggles `data-theme` on `<html>` and saves `theme` in `localStorage`.
  - Avatar: 40×40px circle, `--purple-soft` fill, "NS" 14px weight 600 `--purple-ink`.
- Hidden on the navigation screen.

### Bottom tab bar (`components/bottom-nav.tsx`, `.bottom-nav`)

- Fixed, centered: `bottom: calc(8px + safe-area-bottom)`, `width: min(100% − 24px, 406px)`.
- `--card` fill, 1px `--line` border, radius 16px, padding 4px, 4 equal columns.
- Items: Home (House), Route (Route), Delivery (Box), History (History). Icon 20px above an 11px weight-600 label, gap 3px, padding `7px 6px 6px`, radius 12px.
- Active item: `--purple` fill, white text. `/` is active only on exactly `/`; other tabs are active for any path starting with their href (so `/route/map` would highlight Route).
- Hidden on the navigation screen.

### Panel (`.panel`)

`--card` fill, 1px `--line` border, radius 16px, padding 16px, margin-bottom 12px. Header row (`.card-row`) is a flex row with space-between, 10px gap, `h2` 17px.

### Buttons

| Class | Look |
|---|---|
| `.primary-button` | Full width, `--purple` fill, white 15px weight 700, min-height 48px, radius 12px, icon 18px after the label |
| `.secondary-action` | Full width, `--card` fill, 1px `--purple` border, `--purple-ink` text |
| `.text-button` | No background, `--purple-ink` 14px weight 700, trailing arrow 16px |
| `.danger-button` | Full width, `--danger` fill white text with a red glow; disabled: `--soft` fill, `--muted` text |
| `.icon-button` | 40×40px circle, `--card` fill, `--line-strong` border |

### Pills and status

| Class | Look |
|---|---|
| `.step-pill`, `.status-purple` | `--purple-soft` fill, `--purple-ink` text, 12px weight 700, padding 4px 8px, radius 6px |
| `.status-green` | `--green-soft` fill, `--green-ink` text, 12px, padding 5px 9px, radius 7px, optional 14px check icon |
| `.status-amber` | `--amber-text` text, 12px weight 700 (its background value is invalid in the CSS, so it renders without a fill) |
| `.outline-pill` | 1px white border, radius 20px, white 12px weight 600 (used on the purple card) |

### Filter toggle and panel (Route and History)

- **Toggle (`.filter-toggle`):** 38×38px, radius 10px, 1px `--line` border, transparent, `--muted` sliders icon 20px.
  - Active (panel open or a non-default choice): `--purple-soft` fill, no border, `--purple-ink` icon.
  - When a non-default choice is applied, a 7px `--purple` dot sits at top 6px, right 6px with a 2px `--card` ring.
  - `aria-expanded` and `aria-controls` point at the panel.
- **Panel (`.filter-panel`):** column, gap 12px, padding 12px, radius 12px, `--soft` fill. History variant (`.history-filters`): `--card` fill with 1px `--line` border, margin-bottom 12px.
- **Chip group:** label 12px weight 700 uppercase `--muted`, then wrapping chips with 6px gap.
- **Chip (`.chip`):** min-height 34px, padding 0 12px, pill radius, 1px `--line` border, `--card` fill (History: `--soft`), 13px weight 600. Selected (`aria-pressed="true"`): `--purple` fill and border, white text.
- **Reset (`.filter-reset`):** text button, `--purple-ink` 13px weight 700, only shown when a non-default choice is applied.
- **Summary (`.filter-summary`):** 12px weight 600 `--muted`, e.g. "Showing 2 of 4 stops · most packages".

### Dropdown (History "All trips", `.select-menu`)

- Trigger (`.select-button`): `--card` fill, 1px `--line-strong` border, radius 10px, padding 7px 10px, 13px weight 700, chevron 16px. Open: border `--purple`, chevron rotated 180°.
- Menu (`.select-options`): absolute, 6px below, right-aligned, min-width 190px, padding 4px, `--card` fill, 1px `--line` border, radius 12px, shadow.
- Options: 42px tall, radius 8px, 14px weight 600, a count badge (pill, `--soft` fill, 12px `--muted`) pushed right, and a 16px check on the selected option. Selected: `--soft` fill, `--purple-ink` text.
- Closes on selection, on a pointer-down outside, and on Escape. `role="listbox"` / `role="option"` with `aria-selected`.

### Map markers (`components/maps/route-map.tsx`)

| Marker | Look |
|---|---|
| Stop | 34px circle, 3px `--purple` border, `--card` fill, number 15px weight 700 `--purple-ink` |
| Active stop | 40px, `--purple` fill, white border and number 17px |
| Completed stop | `--line-strong` border, `--muted` number |
| Depot | 34px rounded square (radius 10px), `--ink` border, warehouse icon 16px |
| Driver | 18px `#1a73e8` dot, 3px white border, 6px blue halo `rgba(26,115,232,.25)` |
| Route line | 9px white casing (dark theme `#141a16`, 90% opacity) under a 5px `#6734ed` line (dark `#9d7bff`) |

## Motion and touch

- All buttons and links: no tap highlight, `touch-action: manipulation` (no double-tap zoom delay).
- Press feedback: `transform: scale(.96)` on press (`.94` for filter toggles), 120ms ease.
- Colour changes animate over 200ms. The navigation turn card animates background, colour and position over 250ms.
- Pages behind the navigation screen and behind open modals cannot scroll.

## Accessibility notes

- Icon-only buttons have `aria-label`s ("Sort and filter stops", "Filter trip history", "Report an emergency", "Back to route overview").
- Toggle-style buttons use `aria-pressed` (chips, package rows, mute, theme).
- The navigation turn card is `aria-live="polite"`.
- Decorative icons are `aria-hidden`.
- Focus ring: `3px solid var(--purple)` with 2px offset on `:focus-visible`.
