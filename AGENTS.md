# AGENTS.md

Guide for AI coding assistants (Claude Code, Cursor, Copilot, Codex and others) working on **Vega Web Portal**. Human developers can read it too: it is the short version of the project's conventions.

## Project

Multi-portal service booking platform on Next.js 16 (App Router), React 19, TypeScript (strict) and Tailwind CSS v4. Backend API at `http://127.0.0.1:4000`.

## Commands

| Command          | Purpose                             |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Dev server on http://localhost:3000 |
| `npm run build`  | Production build                    |
| `npm run lint`   | ESLint                              |
| `npm run typecheck` | `tsc --noEmit`                   |
| `npm run format` | Prettier                            |

Run `npm run lint` and `npm run typecheck` after every change.

## Where things live

- `app/(portals)/` portal pages for admin, user, vendor, and service boy with their own layouts
- `app/(auth)/` authentication screen templates
- `app/login/` main login page with API integration
- `app/register/` customer registration
- `app/vendor/register/` vendor registration
- `config/site.ts` site name, URL, author info
- `components/ui/` primitives: `Button`, `Card`, `Input`, `Select`, `Textarea`, `Checkbox`, `Badge`, `Avatar`, `Skeleton`, etc.
- `components/layout/` sidebar, header, user menu, breadcrumb, footer
- `lib/api/client.ts` Axios API client configuration
- `lib/api/services/` API service functions for each portal
- `lib/api/types.ts` TypeScript types for API responses
- `store/` Redux Toolkit store and slices
- `app/globals.css` all design tokens (colors, radius, shadows, type scale)

## Conventions

### Adding a page

1. Create `app/(portals)/<portal>/<section>/page.tsx`.
2. Export `metadata` with a `title`; the root layout adds ` | Vega Web Portal`.
3. If the page needs state or effects, put the UI in `view.tsx` with `"use client"` and keep `page.tsx` as a server file that exports `metadata` and renders the view.
4. Start the page with appropriate header component.
5. Connect to Redux store for state management.

### Styling

- Use theme tokens, never hard-coded hex colors: `bg-card`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-success/10` and so on.
- Brand color is `#1b1e85` - use for primary actions and branding.
- Radius scale: cards `rounded-xl`, buttons and inputs `rounded-lg`, small chips `rounded-md`, pills `rounded-full`.
- Shadows: `shadow-card` (resting), `shadow-dropdown` (menus, hover), `shadow-modal` (dialogs).
- Smallest text is `text-2xs` (11px). Do not go below it.
- Dark mode is class based (`next-themes`). `dark:` variants follow the `.dark` class.

### Components and accessibility

- Use the form primitives (`Input`, `Select`, `Textarea`, `Checkbox`) with a `label` so the label is linked to the control.
- Icon-only buttons and links need an `aria-label`.
- Card titles render as `h2` under the page `h1`; keep heading levels in order.
- Wrap wide tables in `overflow-x-auto` and give them the `data-table` class.
- Icons come from `lucide-react`. Import each icon by name; do not import the whole library.

### State Management

- Use Redux Toolkit for global state
- Use `useAppDispatch` and `useAppSelector` hooks from `store/hooks.ts`
- API calls go through async thunks in slices
- Local component state with `useState` for UI-only concerns

### API Integration

- Base URL configured in `lib/api/client.ts`
- Service functions in `lib/api/services/`
- Types defined in `lib/api/types.ts`
- Error handling in async thunks with `rejectWithValue`

### Next.js 16

This version has breaking changes from older Next.js releases. Before using a Next.js API, read the matching guide in `node_modules/next/dist/docs/`.

## Portals

| Portal | Path | Role |
|--------|------|------|
| Admin | `/admin/*` | System administration |
| Customer | `/user/*` | Book services |
| Vendor | `/vendor/*` | Manage business |
| Service Boy | `/serviceboy/*` | Handle jobs |

## Author

**Vega Services** - [vegaservices.com](https://vegaservices.com)
