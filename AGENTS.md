# AGENTS.md

## Quick commands

```bash
pnpm start          # dev server (pnpm required, not npm/yarn)
pnpm test           # run Vitest (NOT Jasmine/Karma)
pnpm build          # production build → dist/
pnpm format         # Biome format (TS/CSS) + Prettier (HTML)
pnpm lint           # Biome lint
```

## Toolchain quirks

- **pnpm only.** `packageManager` is pinned to `pnpm@11.7.0`. Never use npm or yarn.
- **Vitest** for testing (configured via `@angular/build:unit-test`). No Karma/Jasmine config exists.
- **Biome 2.5** handles lint + format for `.ts` and `.css`. **Prettier** handles `.html` only. There is no ESLint config.
- **No semicolons**, single quotes, 2-space indent, trailing commas (`es5`). Line width: 120 (TS) / 100 (HTML).
- **`import type`** is enforced by Biome linter (`useImportType: "on"`). All type-only imports must use `import type { ... }`.

## Architecture

- **Angular 22, standalone, zoneless.** `provideZonelessChangeDetection()` in `app.config.ts`. No NgModules anywhere.
- **`@Service()`** (from `@angular/core`) replaces `@Injectable()` for services. Services are tree-shakeable singletons.
- **`httpResource`** for all GET requests — declarative, signal-based, no manual subscriptions. RxJS `Observable` used only for mutations (POST/PUT/DELETE).
- **Signal-based state** throughout. No `BehaviorSubject` pattern. See `MemberService` for the canonical example.

### Directory layout

```
src/
  app/
    core/          # Layout (Shell) + app-wide services (ThemeService)
    features/      # Feature modules: dashboard, members, payments, membership-type
      {feature}/
        pages/     # Route-level components
        services/  # Feature-scoped @Service() classes
        models/    # entity.ts (DB shape), model.ts (UI shape), dto.ts (request shape)
        adapters/  # entity → model mappers
    shared/        # Shared components, models (enums, pagination), utils (DateUtils)
  environments/    # environment.ts (gitignored except template; API URL here)
```

### Path aliases (tsconfig.json)

```ts
@app/*           → src/app/*
@core/*          → src/app/core/*
@shared/*        → src/app/shared/*
@features/*      → src/app/features/*
@environments/*  → src/environments/*
```

## Component generation

- `ng generate component` **skips tests by default** (configured in `angular.json` schematics). Do not create `.spec.ts` files for new components unless explicitly asked.
- Component styles use **CSS** (not SCSS/LESS). Tailwind CSS 4 via `@import 'tailwindcss'` in `styles.css`.
- Components are standalone with `imports: [...]` in the decorator — no NgModules.

## Styling

- **Tailwind CSS 4** — uses `@import 'tailwindcss'` (not `@tailwind` directives) and `@custom-variant dark` for dark mode.
- **Taiga UI 5.x** is the component library. LESS theme files for Taiga are in `angular.json` `styles` array.
- Component CSS files use Tailwind utilities. Global CSS classes like `.modal-container`, `.content-area`, `.sticky` are in `styles.css`.

## API & environment

- Backend at `http://127.0.0.1:8000/api` (configured in `src/environments/environment.ts`).
- Environment files are **gitignored** except for the template. Must be created from template when cloning.
- API follows Django REST Framework conventions: `/api/{resource}/` with paginated responses `{ count, next, previous, results }`.
- Validation errors follow `ApiValidationError` shape: `{ fieldErrors: Record<string,string>, summary: string }`.

## Taiga UI specifics

- Dark/light/system theme toggle via `ThemeService` (uses `data-theme` attribute and Taiga's `tuiTheme`).
- `TuiRoot` wraps the entire app in `App` component.
- Mobile-focused: pull-to-refresh, swipe actions, responsive dialogs via `@taiga-ui/addon-mobile`.
- `@ng-web-apis/platform` provides `WA_IS_ANDROID`, `WA_IS_IOS` for platform detection.

## Testing

- Only one test file exists: `src/app/app.spec.ts`. Uses Vitest globals (configured in `tsconfig.spec.json`).
- `ng test` runs via `@angular/build:unit-test` builder with Vitest.
- To add new tests, place `.spec.ts` files alongside the source (e.g., `members-list.spec.ts` next to `members-list.ts`).
- Test setup: `TestBed.configureTestingModule({ imports: [ComponentUnderTest] })` for standalone components.
