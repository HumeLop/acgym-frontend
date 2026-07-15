# Changelog

## [1.1.1] - 2026-07-15

### Fixed (v1.1.1)

- Emergency contact, phone, and notes fields hidden when empty on member detail
- Member name wraps to 2 lines instead of truncating in detail header
- Backend pagination param name from `pageSize` to `page_size`

### Added (v1.1.1)

- Infinite scroll pagination on inactive members list

## [1.1.0] - 2026-07-15

### Added (v1.1.0)

- Inactive members list page with search by inactivity days
- Payment renewal from member details and member list
- DEPLOY.md with release workflow documentation

### Fixed (v1.1.0)

- Race condition: multiple simultaneous 401 responses no longer trigger parallel refresh calls
- Refresh token now correctly persisted on rotation
- Dashboard charts no longer overflow on iPhone 12 Pro
- Search button clipping in inactive members panel on iOS
- Mobile theme button hover now visible in light mode

## [1.0.1] - 2026-07-15

### Fixed (v1.0.1)

- Use `dvh` instead of `vh` for viewport height in iOS PWA standalone (tab bar cutoff)
- Add `safe-area-bottom` to form containers (Submit button hidden behind home indicator)
- Add `inputmode`, `autocorrect`, and `autocapitalize` to form fields (iOS keyboard and autocorrect)
- Add GPU layer (`translateZ(0)`) to tab-bar-mobile to prevent scroll jitter on iOS
- Fix FABs by separating `position: fixed` from `transform` (known iOS Safari bug)
- Fix tab bar icon clipping with `overflow: visible` on iOS
- Fix calendar overlay tap passthrough with `bg-transparent cursor-pointer`
- Add `apple-mobile-web-app-capable` and dark mode `theme-color` to manifest
- Stack confirm-dialog buttons vertically to prevent overflow on iOS
- Add `translateZ(0)` to global `.sticky` to fix `backdrop-blur` flickering on iOS

## [1.0.0] - 2026-07-01

### Added (v1.0.0)

- Initial release: dashboard, member management, payments, memberships, and users
- PWA with standalone support for Android and iOS
- Light/dark/system theme
- JWT authentication
