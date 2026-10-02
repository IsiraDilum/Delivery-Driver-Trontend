# Modals

**File:** `components/modal-view.tsx` · **Controlled by:** `components/app-shell.tsx`

Three dialogs shared by all screens: **incident**, **parking fine** and **store verification**. They are demo forms: every button just closes the dialog; nothing is saved or sent.

## How they open

`AppShell` keeps one `modal` state (`'incident' | 'fine' | 'verify' | null`) and exposes a setter through context:

```tsx
import { useModal } from '@/components/app-shell'

const setModal = useModal()
<button onClick={() => setModal('incident')}>…</button>
```

| Modal | Opened from |
|---|---|
| `incident` | Home "Report a fine" quick action; Route emergency tile; Navigation "Emergency" button |
| `fine` | Home "Log refuel" quick action; Delivery "Report a parking fine" link |
| `verify` | Delivery "Verify store QR" row |

While a modal is open:

- it is rendered into `document.body` through a portal, above everything (z-index 100), including the full-screen navigation page;
- the page behind it cannot scroll.

## Shared frame

| Part | Style |
|---|---|
| Backdrop | fixed, full screen, `#101c1688` (dark mode `#000a`), padding 16px, content centered |
| Dialog (`.modal`) | `--card`, width up to 400px, max-height 90dvh (scrolls inside), radius 20px, padding 22px 18px 18px, shadow `0 20px 60px #0003` |
| Title (`h2`) | 22px, letter-spacing −0.4px, margin-bottom 14px, 44px right padding to clear the close button |
| Close (`.close`) | 36px circle, `--soft`, X icon 20px `--muted`, top 16px / right 14px, `aria-label="Close"` |
| Labels | 14px weight 700, margin 12px 0 |
| Inputs / textareas | 16px, margin-top 6px, padding 11px 12px, radius 10px, 1px `--line-strong`; textareas min-height 96px and resize vertically |

## Incident: "Report an incident"

```
┌────────────────────────────────────┐
│ Report an incident             (✕) │
│ ┌────────────────────────────────┐ │
│ │ 📍 WD-R14 · Vehicle V-14       │ │  danger-soft context
│ │    Northgate Market · Stop 1 of 4
│ └────────────────────────────────┘ │
│ What type of incident?             │
│ ┌──────────────┐┌──────────────┐   │
│ │ 🔧           ││ ?            │   │
│ │ Vehicle      ││ Flat tyre    │   │
│ │ breakdown    ││              │   │
│ └──────────────┘└──────────────┘   │
│ │ ⚡ Accident / ││ ⇄ Road blocked│  │
│ │   collision  ││              │   │
│ │ ▣ Cargo issue││ ? Other      │   │
│ Details (optional)                 │
│ [ What happened? Are you in a safe │
│   location?                      ] │
│ [     Select an incident type    ] │  disabled until a type is chosen
└────────────────────────────────────┘
```

- **Context box** (`.incident-context`): `--danger-soft` fill, `--danger` text, radius 12px, padding 14px, MapPin 22px. "**WD-R14 · Vehicle V-14**" / "Northgate Market · Stop 1 of 4" (14px).
- **Label** "What type of incident?" 13px weight 700 `--muted`.
- **Type grid** (`role="radiogroup"`, `aria-label="Incident type"`): 2 columns, gap 10px. Each option is a `role="radio"` button with `aria-checked`: min-height 80px, padding 12px, radius 12px, 1px `--line`, `--card` fill, `--danger` icon (22px) and text (14px weight 600), stacked top to bottom.
  - Hover: `--danger` border.
  - Selected: `--danger` fill, white text (dark text in dark mode), 3px `--danger-soft` ring, check icon 16px top-right.

  | Option | Icon |
  |---|---|
  | Vehicle breakdown | Wrench |
  | Flat tyre | CircleHelp |
  | Accident / collision | Zap |
  | Road blocked | Route |
  | Cargo issue | Box |
  | Other | CircleHelp |

- **Details (optional)**: textarea, placeholder "What happened? Are you in a safe location?". Focus ring `--danger` border + 3px `--danger-soft`.
- **Button** (`.danger-button`, min-height 48px, radius 12px, 15px weight 700):
  - No type selected: disabled, `--soft` fill, `--muted` text, label "Select an incident type".
  - Type selected: `--danger` fill, white text, red shadow, label "Save incident report". Press shrinks to 98%.
- The selection resets every time the modal opens (the dialog is unmounted when closed).

## Parking fine: "Report a parking fine"

```
┌────────────────────────────────────┐
│ Report a parking fine          (✕) │
│ Link the fine to your delivery and │
│ add the ticket details.            │
│ ┌────────────────────────────────┐ │
│ │ 📍 Northgate Market            │ │  soft context
│ │    Rear loading bay · enter from Station Road
│ └────────────────────────────────┘ │
│ Fine amount (LKR)                  │
│ [ e.g. 1500                      ] │
│ Reason                             │
│ [ Explain the unloading or parking │
│   situation                      ] │
│ Ticket photo                       │
│ [                                ] │
│ [          Save record           ] │  primary (purple)
└────────────────────────────────────┘
```

- Copy "Link the fine to your delivery and add the ticket details." (14px `--muted`).
- **Context box** (`.fine-context`): `--soft` fill, radius 12px, padding 14px, MapPin 22px. "**Northgate Market**" / "Rear loading bay · enter from Station Road".
- Fields:
  - "Fine amount (LKR)": text input, placeholder "e.g. 1500".
  - "Reason": textarea, placeholder "Explain the unloading or parking situation".
  - "Ticket photo": plain text input with no placeholder or helper text.
- **Button** "Save record": primary button (`--purple`, white, min-height 48px, radius 12px).

## Store verification: "Verify the receiving store"

```
┌────────────────────────────────────┐
│ Verify the receiving store     (✕) │
│ Sample verification flow. No camera│
│ scanning is connected.             │
│                ⌗                   │  ScanLine icon, 72px
│          Northgate Market          │
│           STORE · WP-001           │
│          ( Sample code )           │
│ [       Verify sample store      ] │
└────────────────────────────────────┘
```

- Copy "Sample verification flow. No camera scanning is connected." (14px `--muted`).
- ScanLine icon 72px in `--purple-ink`, margin 20px 0 12px.
- "Northgate Market" (17px, centered), "STORE · WP-001" (14px `--muted`, centered).
- "Sample code" badge: `--soft`, `--muted`, 13px weight 700, padding 8px 12px, radius 8px, centered, margin 12px auto 18px.
- **Button** "Verify sample store": primary.

## Accessibility notes

- The close button has `aria-label="Close"`; the incident type grid is a proper radio group.
- The dialog has no `role="dialog"`, focus trap, or Escape-to-close yet. Add these when the modals become real forms.
