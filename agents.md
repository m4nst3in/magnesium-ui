# Magnesium UI — Agent Guide

> Lightweight React + TypeScript UI kit. CSS Modules + design tokens. Vercel/Linear aesthetic. Zero runtime deps. Package: `@m4nst3in/magnesium-ui`.

## Stack

- React 19 peer `>=18`, TypeScript strict, Vite 6 + `vite-plugin-dts`
- CSS Modules + `tokens.css`/`base.css` — no Tailwind, no CSS-in-JS
- Single dep `clsx` (bundled)
- Tokens: zinc palette, `var(--ui-*)` semantic variables, `data-theme="dark"` toggle

## Structure

```
src/
  components/<Name>/<Name>.tsx + <Name>.module.css   # one dir per component
  demo/
    App.tsx            # shell: header + layout (sidebar + 4 categories)
    sections/          # Fundamentals, Forms, Navigation, Overlays (one file each)
    demo.css           # layout + category styles
    main.tsx           # React root
  styles/
    tokens.css         # :root + :root[data-theme='dark'] variables
    base.css           # reset
  utils/
    cn.ts              # clsx wrapper
    bodyScrollLock.ts  # counter-based body lock
  index.ts             # barrel — alphabetical exports
  index.css            # @import tokens + base
```

## Commands

```bash
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # dist/ (index.js, index.cjs, index.d.ts, magnesium-ui.css)
```

## Conventions

- **Imports:** external `react` → internal `../../utils`/`../index` → `*.module.css`, blank line between groups, alphabetical within group, combine duplicate `from` paths
- **Components:** `forwardRef` + `cn` + `styles` + tokens only (no hardcoded colors), `useId` for a11y, `aria-*` where needed
- **Types:** `type` imports inline, no `any`, `unknown` + guard for external input, `satisfies` for literals
- **Styling:** CSS Modules, `var(--ui-*)` only, `data-theme="dark"` overrides in `tokens.css`, `prefers-reduced-motion` disables transitions
- **Barrel:** `src/index.ts` is alphabetical, `export { cn }` last

## Components (31)

`Accordion/Collapsible`, `Alert`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Card`, `Checkbox`, `Combobox`, `Command/Kbd`, `CopyButton`, `DatePicker`, `Drawer/Sheet`, `DropdownMenu`, `EmptyState`, `FileDrop/FileIcon`, `Input`, `Modal`, `NumberField`, `Pagination`, `Progress`, `RadioGroup`, `Select`, `Skeleton`, `Slider`, `Spinner`, `Switch`, `Table`, `Tabs`, `Textarea`, `Toast`, `Tooltip`

## Adding a Component

1. `src/components/MyComp/MyComp.tsx` + `MyComp.module.css` — use `cn`, tokens, `forwardRef` if needed
2. Export in `src/index.ts` (keep alphabetical)
3. Add demo to `src/demo/sections/<Category>.tsx` (Fundamentals/Forms/Navigation/Overlays)
4. `npm run typecheck && npm run build` — must pass

## Theme

```ts
document.documentElement.dataset.theme = 'dark' // or 'light'
```

Override in app CSS:

```css
:root { --ui-primary: rebeccapurple; --ui-primary-hover: #4b2d8f; }
```

## Build Output

`dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts`, `dist/magnesium-ui.css` — `exports["./styles.css"]` points to `magnesium-ui.css`

## Git & Publish

- Repo: `m4nst3in/magnesium-ui` (private, `main`)
- Commit: `feat: magnesium-ui initial — clean`
- Publish: `npm publish --access public` (requires granular token with Bypass 2FA)
