# AGENTS.md

**CRITICAL: Do NOT apply any code changes without explicit user confirmation. Always present the proposed changes first and wait for approval before editing files.**

## Commit workflow

When asked to commit, follow this process **in order — no exceptions**:

1. **Review all changes** — `git status` + `git diff --stat` to see every modified, added, or deleted file. Report what changed to the user.
2. **Check for sensitive files** — If any environment files (`src/environments/environment*.ts`), secrets, `.local.*` files, or anything that shouldn't be tracked appear in the diff, **alert the user immediately** and add them to `.gitignore` before proceeding.
3. **Validate branch name** — Does the branch reflect what was actually worked on? If not, rename it with `git branch -m <new-name>`. Convention: `<type>/<short-description>` (e.g., `feature/member-dashboard`, `fix/pull-to-refresh`, `refactor/confirm-service`).
4. **Write commit message** — Follow the template in `~/.config/git/template`. One line per change, each under its type prefix. **Show the proposed message to the user first and wait for approval before committing.** Example:

```
feat:  add member dashboard with stats and nav cards
feat:  add payment dashboard with stats carousel

refactor:  migrate confirmation modals to ConfirmService
refactor:  replace TuiTabs with TuiSegmented

style:  remove empty CSS files
```

Types: `feat`, `fix`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `docs`, `deploy`, `debug`

## Toolchain scripts / security notes

- **AGENTS.md takes precedence** over any skill or reference suggesting raw toolchain commands. The commands below are the ones allowed.
- **No `npm install`, `ng build`, `ng version`** — use only `pnpm`-based commands listed here.
- **Package installation requires human approval** — never add packages without user confirmation.
- The `angular-developer` skill may suggest `ng build` or `npm install` as generic guidance; those are ignored in favor of local conventions.

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
- **date-fns v4** (not luxon) for all date operations. Use `TZDate` from `@date-fns/tz` for timezone-aware ops.
  All dates are handled in `America/Mexico_City` via the `DateUtils` singleton in `@shared/utils`.

## Architecture

- **Angular 22, standalone, zoneless.** `provideZonelessChangeDetection()` in `app.config.ts`. No NgModules anywhere.
- **`@Service()`** (from `@angular/core`) replaces `@Injectable()` for services. Services are tree-shakeable singletons.
- **`httpResource`** for all GET requests — declarative, signal-based, no manual subscriptions. RxJS `Observable` used only for mutations (POST/PUT/DELETE).
- **Signal-based state** throughout. No `BehaviorSubject` pattern. See `MemberService` for the canonical example.

### Angular 22 signal rules (mandatory)

These rules follow the official [Angular Signals guide](https://angular.dev/guide/signals) and must be enforced on every PR:

| API | Use for | Anti-pattern |
|---|---|---|
| `computed()` | Derived read-only values from other signals | — |
| `linkedSignal()` | Derived state that can be manually overridden (form data, selections) | Using `signal() + effect()` to copy data |
| `effect()` | Imperative side-effects only (localStorage, FormControl sync, 3rd-party libs) | Copying one signal to another with `.set()` |

1. **Effects MUST live in `constructor()`** — never as class properties (`readonly foo = effect(...)` is forbidden). This is the canonical pattern per Angular 22 docs.

2. **`signal() + effect()` copying data is FORBIDDEN.** If an effect does `this.target.set(this.source())`, it must be refactored to `linkedSignal()` instead. Effects may only call imperative APIs (`.reload()`, `loadDetail(id)`, `localStorage.setItem()`, FormControl `.setValue()`).

3. **Services MUST expose signals as `asReadonly()`.** Internal state uses `private _foo = signal(...)`; consumers get `readonly foo = this._foo.asReadonly()`. If external mutation is needed, add a dedicated method (`resetPage()`, `setStatusFilter(val)`) instead of exposing the writable signal. Exception: signals used for Taiga UI two-way binding (`[(tuiResponsiveDialog)]`) must remain writable.

4. **`computed()` for all derived values.** If a value can be written as `const x = f(signalA(), signalB())`, it must be a `computed` — never a `signal` updated manually.

5. **`inject()` over constructor injection.** All dependencies use class-property `inject()`.

6. **`input()` / `output()` over decorators.** No `@Input()` or `@Output()` anywhere. Components use `input.required<T>()`, `output<T>()`.

### Signal decision tree

```
Need state that depends on other signals?
├── Read-only derivation → computed()
├── Derivation + manual override → linkedSignal()
└── Imperative side-effect (API, DOM, storage) → effect() in constructor

Need local component state?
└── signal()

Need async data?
└── httpResource() for GET, Observable for mutations
```

### Directory layout

```
src/
  app/
    core/          # Layout (Shell), app-wide services (ThemeService), config, guards, interceptors
      layout/      # Shell component (sidebar, header, tab-bar)
      services/    # ThemeService (dark/light/system toggle)
    features/      # Feature modules: dashboard, members, payments, membership-type
      {feature}/
        pages/     # Route-level components
        services/  # Feature-scoped @Service() classes
        models/    # entity.ts (DB shape), model.ts (UI shape), dto.ts (request shape)
        adapters/  # entity → model mappers
    shared/        # Shared components, models (enums, pagination), utils (DateUtils)
      components/  # ConfirmationModal, etc.
      models/      # Enums (MemberStatus, PaymentMethod), pagination types
      utils/       # DateUtils (date-fns wrapper for MX timezone)
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
- **Angular 22 CLI conventions** — files are generated WITHOUT type suffixes:
  - `ng g c path/name` → `path/name/name.ts`, `path/name/name.html`, `path/name/name.css`
  - `ng g s path/name-service` → `path/name-service.ts` (flat file, `-service` suffix to distinguish from components)
  - **No** `.component.ts` or `.directive.ts` suffixes. Services use `-service.ts`.
  - Components always get their own directory. Services are flat files.
  - Class names still use PascalCase descriptors: `MemberService`, `ConfirmService`, etc.
  - Do NOT manually create files — use `ng generate` when possible to ensure correct structure.

## Styling

- **Tailwind CSS 4** — uses `@import 'tailwindcss'` (not `@tailwind` directives) and `@custom-variant dark` for dark mode.
- **Taiga UI 5.x** is the component library. LESS theme files for Taiga are in `angular.json` `styles` array.
- **Component CSS files**: Prefer Tailwind utilities inline in templates. Only `shell.css` and `app.css` should
  contain non-trivial styles. Empty component CSS files must be deleted (no `styleUrl` pointing to empty files).
- **CSS variables syntax**: Tailwind 4 uses `text-(--tui-text-primary)` (parentheses, no `var()`).
  Never use `text-[var(--tui-text-primary)]` (brackets with `var()`).
- **Theme tokens**: All design tokens (`--tui-*`, `--acgym-*`) are defined in `styles.css` (global styles).
  Colors must reference these variables — never hardcode `bg-white dark:bg-gray-800`.
- **Cards**: Use `tuiSurface="elevated" border border-(--tui-border-normal)`. `TuiSurface` provides
  the correct elevation background for light/dark automatically. No explicit `bg-*` classes on cards.
- **Info rows**: `bg-(--tui-background-neutral-1)`, icon containers: `bg-(--tui-background-elevated-1)`.
- **Section icons**: Gradient icon headers use token-based colors, e.g.
  `from-(--acgym-section-green) to-(--acgym-section-green-hover) shadow-lg shadow-(--acgym-section-green)/25`
  See all `--acgym-section-*` tokens (and their `-pale` variants) in `styles.css`. NEVER hardcode `from-orange-500` or `from-emerald-500`.

- **No `tuiTheme` on component hosts** — the theme is set globally by `ThemeService` on the root element.
  Components must inherit the global theme. Adding `host: { '[attr.tuiTheme]': 'theme()' }` on any component
  overrides the global theme for all children, causing visual mismatches (e.g., calendar dark in light mode).
- **Animations**: Use Tailwind's built-in `animate-fade-in-up`. Do **NOT** create custom `@keyframes` animations.
- **Fonts**: Montserrat WOFF2 subset (Latin only) in `public/assets/fonts/`. Defined via `@font-face` in `styles.css`.
  Variable font with `font-weight: 100 900` for both normal and italic.

## API & environment

- Backend at `http://127.0.0.1:8000/api` (configured in `src/environments/environment.ts`).
- Environment files are **gitignored** except for the template. Must be created from template when cloning.
- API follows Django REST Framework conventions: `/api/{resource}/` with paginated responses `{ count, next, previous, results }`.
- Validation errors follow `ApiValidationError` shape: `{ fieldErrors: Record<string,string>, summary: string }`.

## Taiga UI specifics

- Dark/light/system theme toggle via `ThemeService` (uses `data-theme` attribute and Taiga's `tuiTheme`).
  ThemeService syncs with `TUI_DARK_MODE` token to ensure portal/overlay components (dropdowns, dialogs)
  receive the correct theme.
- `TuiRoot` wraps the entire app in `App` component.
- Mobile-focused: pull-to-refresh, swipe actions, responsive dialogs via `@taiga-ui/addon-mobile`.
- **Platform detection**: `WA_IS_ANDROID` and `WA_IS_IOS` are **overridden to `true`** in component providers
  to enable Taiga mobile loaders. Do NOT use them for actual platform detection. For real device checks, use:
  `'ontouchstart' in window || navigator.maxTouchPoints > 0`.
- **Pull-to-refresh**: Guard with `window.scrollY > 0` before allowing pull (only fire at absolute top).
  Set `TUI_PULL_TO_REFRESH_THRESHOLD` to `120` (default 50) to require deliberate pull. Guard order:
  scrollY check first, then isTouchDevice check.

## Testing

- Only one test file exists: `src/app/app.spec.ts`. Uses Vitest globals (configured in `tsconfig.spec.json`).
- `ng test` runs via `@angular/build:unit-test` builder with Vitest.
- To add new tests, place `.spec.ts` files alongside the source (e.g., `members-list.spec.ts` next to `members-list.ts`).
- Test setup: `TestBed.configureTestingModule({ imports: [ComponentUnderTest] })` for standalone components.

## Production budget

- **Initial bundle**: 620 kB warning / 1 MB error (configured in `angular.json`).
- Realistic for Angular 22 + Taiga UI 5 + Tailwind CSS 4 stack.
- Removed unused packages: `echarts`, `ngx-echarts`, `@taiga-ui/addon-commerce`, `@taiga-ui/addon-table`.
- luxon replaced with date-fns (saves ~40 kB in lazy chunks).
- Fonts optimized: Montserrat TTF → WOFF2 subset Latin (1.35 MB → 128 kB).
