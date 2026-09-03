# Contributing to Magnesium UI

Thanks for helping.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # biome format + lint + imports
npm run typecheck
npm run build
```

Requires Node 18+, no other deps.

## Adding a component

```
src/components/MyComp/MyComp.tsx
src/components/MyComp/MyComp.module.css
```

- Use `cn()` + `var(--ui-*)` tokens — no hardcoded colors
- `forwardRef` if it renders a DOM node, `useId` for a11y
- Export in `src/index.ts` (alphabetical)
- Demo in `src/demo/sections/<Category>.tsx`

Keep it small. One dir per component, no extra abstractions.

## Code style

- **Biome** is the gate: `npm run check` must pass (`biome ci` in CI)
- Imports: `react` → `utils/index` → `*.css`, blank line between groups, A→Z
- No `any`, no `console.log`, no `TODO` left behind
- CSS Modules + tokens only, `prefers-reduced-motion` where you animate

## Commits

Conventional: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`

```
feat: add NumberField
fix: drawer body lock with counter
docs: update README preview
```

Keep commits focused. One feature per commit.

## Pull requests

1. Branch from `main`: `feat/my-comp`
2. `npm run check && npm run typecheck && npm run build` — must pass
3. Push, open PR, describe what changed and why
4. One approval, squash on merge

## Reporting issues

Use the issue template. Include: component, theme (light/dark), steps, expected vs actual, browser.

## Questions?

Open a discussion or ping in the repo. `agents.md` has the full agent guide.
