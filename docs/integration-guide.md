# Integration guide: moving the driver screens into another repository

There are two ways to bring these screens into an existing project. Choose based on whether the target repo is a Next.js app you want the screens to live **inside**, or whether you just want this code **kept alongside** with its history.

| Option | Best for | Result |
|---|---|---|
| **A. Copy the files** (recommended) | Target is a Next.js (App Router) app | Screens run as part of the target app, sharing its deploy |
| **B. Git subtree / merge histories** | You want this repo's commit history preserved, or the target is a monorepo | This app lives in a sub-folder (e.g. `driver-app/`) and runs as its own Next.js app |

---

## Option A: copy into an existing Next.js app

### 1. Requirements in the target app

- Next.js 14+ with the **App Router** (`app/` directory). Developed on Next.js 16 / React 19.
- TypeScript, with the `@/*` path alias pointing at the project root (`"paths": { "@/*": ["./*"] }` in `tsconfig.json`). If the target uses `src/`, point the alias at `./src/*` and place the folders below inside `src/`.

### 2. Install dependencies

```bash
npm install @vis.gl/react-google-maps lucide-react zod
npm install -D @types/google.maps
```

(`next/font/google` and `react-dom` are already part of a Next.js app.)

### 3. Copy the files

Copy these from this repo into the same paths in the target. To avoid clashing with existing pages, you can put the screens under a route segment such as `app/driver/…` (see step 6).

```
app/
  page.tsx                   → Home
  route/page.tsx
  route/map/page.tsx
  delivery/page.tsx
  history/page.tsx
  history/journeys-panel.tsx
  history/trips.ts
  api/maps/route/route.ts    → POST /api/maps/route
  globals.css                → see step 5 (do not overwrite the target's file)
components/
  app-shell.tsx
  header.tsx
  bottom-nav.tsx
  modal-view.tsx
  maps/maps-provider.tsx
  maps/route-map.tsx
lib/
  route-data.ts
  use-now.ts
  use-wake-lock.ts
  use-is-dark-theme.ts
  maps/  (types.ts, routes-api.ts, use-route.ts, use-geolocation.ts, navigation.ts, voice.ts, format.ts)
public/images/logo.png       → header logo and favicon
```

Not needed by the driver screens: `components/ui/button.tsx`, `components/logo.tsx`, `lib/utils.ts`, `prisma/`.

### 4. Environment variables

Add to the target's `.env.local` and to its hosting provider (e.g. Vercel):

```bash
GOOGLE_MAPS_API_KEY=                 # server, Routes API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=     # browser, Maps JavaScript API (restrict by referrer)
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=      # optional
```

Add the target app's domains to the browser key's referrer list. See [Google Maps integration](google-maps.md).

### 5. Styles

All driver styles are plain CSS classes in `app/globals.css`. Generic class names such as `.panel`, `.content`, `.chip`, `.modal`, `.primary-button` may collide with the target's styles, and the file sets global rules on `html`, `body`, headings and buttons.

Pick one approach:

- **Target has no conflicting styles:** copy the file as `app/driver.css` (drop the three `@import` lines at the top if the target doesn't use Tailwind 4 / shadcn) and import it from the driver layout (step 6).
- **Target has its own design system:** scope the styles. Wrap every selector in a parent class, e.g. with PostCSS (`postcss-prefix-selector` with `prefix: '.driver-app'`) or by hand, and give the driver layout's wrapper that class. Move `:root` tokens and the `:root[data-theme='dark']` block to `.driver-app` and `.driver-app[data-theme='dark']`.

Things the CSS assumes:

- `html` and `body` have a dark backdrop (`#101410`) behind the 430px phone column.
- The font is provided as `--font-app` (Plus Jakarta Sans).
- Dark mode is driven by `data-theme="dark"` on `<html>`.

### 6. Layout

The driver screens need `AppShell` (header, tab bar, modal context, maps provider) around them. In a target app with its own root layout, add a **nested layout** for the driver section instead of changing the root:

```tsx
// app/driver/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google'
import { AppShell } from '@/components/app-shell'
import '../driver.css'

const font = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-app' })

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={font.variable}>
            <AppShell>{children}</AppShell>
        </div>
    )
}
```

Also bring over from `app/layout.tsx` as needed:

- `viewport` with `viewportFit: 'cover'` (safe areas on notched phones) and the `themeColor` values;
- the inline theme script that sets `data-theme` before first paint (prevents a light flash for dark-mode users).

### 7. If you mount under a sub-path (e.g. `/driver`)

Internal links and path checks are absolute and must get the prefix:

| File | Change |
|---|---|
| `components/bottom-nav.tsx` | tab `href`s `/`, `/route`, `/delivery`, `/history`; in `isActive`, the exact-match special case for `'/'` becomes `'/driver'` (otherwise Home stays highlighted on every tab) |
| `components/app-shell.tsx` | `IMMERSIVE_PATHS = ['/route/map']` → `['/driver/route/map']` |
| `app/page.tsx` | links to `/route/map` |
| `app/route/page.tsx` | "View route" link `/route/map` |
| `app/route/map/page.tsx` | back link `/route`, "Confirm delivery" `/delivery` |
| `app/delivery/page.tsx` | "Continue to next stop" `/route` |

Leave `/api/maps/route` as is: it is an API route, not a page.

Search for them with:

```bash
grep -rnE "href=\"/|'/route|'/delivery|'/history" app components
```

### 8. Verify

```bash
npx tsc --noEmit -p .
npm run dev
```

Check each screen at a phone width, the map loads, "Start navigation" works with location allowed, and the three modals open.

---

## Option B: keep history with git

### B1. Subtree (code lives in a sub-folder of the target repo)

From the **target** repository:

```bash
git subtree add --prefix=driver-app https://github.com/IsiraDilum/Delivery-Driver-Trontend.git main
```

This brings the whole app, with history, into `driver-app/`. It stays a separate Next.js app: run it with `cd driver-app && npm install && npm run dev`, and deploy it as its own project (on Vercel, set the project's **Root Directory** to `driver-app`).

Pull later changes from this repo with:

```bash
git subtree pull --prefix=driver-app https://github.com/IsiraDilum/Delivery-Driver-Trontend.git main
```

### B2. Merge unrelated histories (files land at the root of the target)

Only use this when the target repo is empty or has no overlapping files: `package.json`, `app/layout.tsx`, `app/globals.css` and so on will conflict.

```bash
git remote add driver https://github.com/IsiraDilum/Delivery-Driver-Trontend.git
git fetch driver
git checkout -b add-driver-screens
git merge driver/main --allow-unrelated-histories
# resolve conflicts, then
git commit
git remote remove driver
```

After either option, if you want the screens inside the target app rather than as a separate app, continue with Option A steps 2–8, moving the files out of the sub-folder.

---

## Checklist

- [ ] Dependencies installed (`@vis.gl/react-google-maps`, `lucide-react`, `zod`, `@types/google.maps`)
- [ ] Files copied, `@/*` alias resolves
- [ ] Env vars set locally and on the host; browser key referrers include the new domain
- [ ] Driver CSS imported (and scoped if needed); font variable `--font-app` provided
- [ ] `AppShell` wraps the driver pages
- [ ] Paths updated if mounted under a prefix
- [ ] Type-check passes; screens verified on a phone-sized viewport
- [ ] No API keys committed
