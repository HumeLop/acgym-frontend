# Changelog

## [1.0.1] - 2026-07-15

### Fixed

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

### Added

- Initial release: dashboard, member management, payments, memberships, and users
- PWA with standalone support for Android and iOS
- Light/dark/system theme
- JWT authentication
