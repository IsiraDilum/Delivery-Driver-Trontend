# Delivery screen

**Path:** `/delivery` · **File:** `app/delivery/page.tsx` · **Tab:** Delivery · **Also opened from:** "Confirm delivery" on the navigation screen after arrival

Proof of delivery at the current stop: tick off packages, verify the store, pick an outcome, name the receiver, optionally attach a photo, then complete. Ends on a success summary.

## Wireframe: form

```
┌──────────────────────────────────────┐
│ [logo] Waypoint            (☾)  (NS) │
├──────────────────────────────────────┤
│ STOP 1 OF 4 · WD-R14                 │
│ Confirm delivery                     │
│ Check the store. Hand over. You're done.
│ ┌──────────────────────────────────┐ │
│ │ (CURRENT STOP)        (✓ Arrived)│ │  stop card
│ │ Northgate Market                 │ │
│ │ 42 Negombo Road, Peliyagoda      │ │
│ │ ──────────────────────────────── │ │
│ │ 🚚 Rear loading bay · enter from │ │
│ │    Station Road                  │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Package handoff           (1 / 5)│ │
│ │ Select each package as you hand  │ │
│ │ it over.                         │ │
│ │ [✓] ▣ PKG-9040                 ✓ │ │
│ │       Fresh · Northgate Market   │ │
│ │ [ ] ▣ PKG-9041                   │ │
│ │ … PKG-9042, PKG-9043, PKG-9044   │ │
│ │ [   Select all packages  ✓✓    ] │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Complete the handoff             │ │
│ │ (✓) Arrival recorded             │ │
│ │     Manual check-in · demo location
│ │ ┌ (▦) Verify store QR          > ┐ │
│ │ │     Open sample store verification
│ │ └──────────────────────────────┘ │ │
│ │ Delivery outcome                 │ │
│ │ [ Delivered                    ▾]│ │
│ │ Receiver's name                  │ │
│ │ [ e.g. Anoma Perera            ] │ │
│ │ ┌╌📷 Add handoff photo ╌╌╌╌╌╌ + ┐ │ │  dashed
│ │ ╎   Optional · preview only, not uploaded
│ │ └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘ │ │
│ │ [     ✓✓ Complete delivery      ]│ │
│ │ Select all packages to mark as   │ │
│ │ delivered.                       │ │
│ └──────────────────────────────────┘ │
│ ┌╌📋 Report a parking fine ╌╌╌╌╌╌ > ┐ │  dashed
└──────────────────────────────────────┘
```

## Wireframe: success

```
┌──────────────────────────────────────┐
│               (✓✓)                   │  64px green circle
│         Delivery complete            │
│     Northgate Market · Stop 1 of 4   │
│ Outcome                    Delivered │
│ Packages                       5 / 5 │
│ Received by             Anoma Perera │
│ Photo                       Attached │
│ [        handoff photo           ]   │  if attached
│ [    Continue to next stop  →    ]   │
└──────────────────────────────────────┘
```

## Sections

### 1. Heading

| Element | Text |
|---|---|
| Eyebrow | `STOP 1 OF 4 · WD-R14` |
| Title | "Confirm delivery" |
| Subhead | "Check the store. Hand over. You're done." |

The page has extra bottom padding (`96px` + safe area) so the parking-fine link clears the tab bar.

### 2. Stop card (`.panel.stop-card`)

- Pills row (margin-bottom 14px):
  - "CURRENT STOP": `.status-purple`, 12px, padding 4px 8px.
  - "✓ Arrived": `.status-green`, 12px, padding 5px 9px, radius 7px, `--green-soft` / `--green-ink`, check 14px.
- Name "Northgate Market" 16px; address 14px `--muted`.
- Divider (14px margins).
- Instruction: Truck icon 20px + "Rear loading bay · enter from Station Road", 14px weight 500, gap 10px.

### 3. Package handoff (`.panel.handoff`)

- Header: "Package handoff" (17px), helper "Select each package as you hand it over." (13px `--muted`). Counter pill `{checked} / 5` on the right.
- **Package rows**, one per package (`PKG-9040` … `PKG-9044`). Each row is a full-width `button` with `aria-pressed`:
  - Checkbox 26px, radius 7px, 2px `--line-strong` border. When checked: `--purple` fill, white check 15px.
  - Box icon 20px `--muted`.
  - ID 15px `--ink` bold over "Fresh · Northgate Market" 12px `--muted`.
  - When checked, a green check 20px (`--green-ink`) at the far right.
  - Padding 12px 0, gap 12px, 1px `--line` divider.
- Initially only the first package is checked.
- "Select all packages ✓✓": secondary button (min-height 48px, radius 12px, 15px), margin-top 12px. Checks all five.

### 4. Complete the handoff (`.panel.complete-handoff`)

Column layout, gap 12px.

| Row | Content | Style |
|---|---|---|
| Arrival | 40px green circle with check + "Arrival recorded" / "Manual check-in · demo location" | circle `--green-soft` / `--green-ink`; title 14px, small 12px |
| Verify | 40px purple circle with QR icon + "Verify store QR" / "Open sample store verification" + chevron | full-width button, `--soft` fill, 1px `--line` border, radius 12px, padding 10px 12px. Opens the **verify** modal |
| Outcome | Label "Delivery outcome" + select: Delivered, Partial delivery, Unable to deliver | label 14px weight 600; control 16px, padding 11px 12px, radius 10px, 1px `--line-strong` border |
| Receiver | Label "Receiver's name" + input, placeholder "e.g. Anoma Perera", autocomplete off | same as above. **Hidden** when outcome is "Unable to deliver" |
| Photo | See below | |
| Complete | "✓✓ Complete delivery" | `--purple`, white, 15px weight 600, min-height 48px, radius 12px. Disabled: `--purple-disabled`, not-allowed cursor |
| Helper | Status text (below) | 13px `--muted`, centered |

Inputs are 16px so iOS Safari doesn't zoom in on focus.

#### Handoff photo

- **Empty:** dashed row (1.5px dashed `--line-strong`, radius 12px, padding 12px): Camera icon + "Add handoff photo" / "Optional · preview only, not uploaded" + plus icon. The row is a `<label>` for a visually hidden `<input type="file" accept="image/*">`; on phones this offers the camera or gallery.
- **Validation:** image files only ("Please choose an image file.") and under 10 MB ("Image must be under 10 MB."). Errors show in `--danger-text` 14px with `role="alert"`.
- **Selected:** preview box (`--soft`, 1px `--line`, radius 14px, padding 12px): 72px thumbnail (radius 10px, cover), file name (15px, ellipsis), "Change" link (`--purple-ink` 14px weight 700). A 32px round "✕" button top-right (`aria-label="Remove photo"`) removes it.
- The photo is only shown locally via an object URL (freed when replaced or when leaving). Nothing is uploaded.

#### Rules: when "Complete delivery" is enabled

| Outcome | Packages required | Receiver's name |
|---|---|---|
| Delivered | all 5 checked | required |
| Partial delivery | at least 1 and fewer than 5 | required |
| Unable to deliver | any | not asked |

Choosing an outcome also adjusts the checkboxes: **Delivered** checks all, **Unable to deliver** unchecks all, **Partial** leaves them.

#### Helper text

| Condition | Text |
|---|---|
| Delivered, not all packages checked | "Select all packages to mark as delivered." |
| Partial, none or all checked | "Select the packages you handed over (not all of them)." |
| Name required but empty | "Enter the receiver's name to continue." |
| Ready | "Everything looks good. You can complete the delivery." |

### 5. Parking fine link (`.parking-link`)

Full-width dashed button (1px dashed `--line-strong`, radius 12px, padding 14px, 14px weight 600): ClipboardList icon + "Report a parking fine" + chevron. Opens the **fine** modal.

### 6. Success view

Replaces the form after "Complete delivery".

- Centered `.success-card` panel.
- 64px circle (`--green-soft` / `--green-ink`) with CheckCheck 30px.
- Title: "Delivery complete", or "Stop recorded" when the outcome was "Unable to deliver".
- Subhead "Northgate Market · Stop 1 of 4".
- Summary list (rows 14px, padding 10px 0, 1px `--line` dividers; label `--muted`, value bold):
  - Outcome: the selected outcome.
  - Packages: `{checked} / 5`.
  - Received by: the receiver's name (omitted for "Unable to deliver").
  - Photo: "Attached" or "None".
- The photo full width, max 220px tall, radius 14px (only if attached).
- "Continue to next stop →" primary button linking to `/route`.

The result is not saved anywhere; reloading the page starts over.

## State

| State | Default |
|---|---|
| `checked` | `[true, false, false, false, false]` |
| `outcome` | `'Delivered'` |
| `receiver` | `''` |
| `photo` | `null` (`{ url, name }` when chosen) |
| `photoError` | `''` |
| `completed` | `false` |
