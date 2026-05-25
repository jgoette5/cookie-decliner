# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3] — 2026-05-25

### Added
- **Internationalization (i18n)** — Popup UI now translated to 8 languages: English, Spanish, French, German, Italian, Dutch, Brazilian Portuguese, Polish
- **Reject-button text matching in 8 languages** — `content.js` now recognizes reject/decline language across all 8 supported locales (previously English only)
- **Sourcepoint CMP support** — added selectors for Sourcepoint consent banners
- **Open source release** — full source now public on [GitHub](https://github.com/jgoette5/cookie-decliner) under MIT license

### Changed
- **Review nudge fixed** — now uses the correct Chrome Web Store review URL, no longer suffers from a redefinition bug that prevented it from showing on first load
- **Review nudge dismissal** — clicking the review link now marks it dismissed so it doesn't reappear
- Refactored `popup.js` to remove innerHTML usage for user-supplied content (defense-in-depth)

### Fixed
- Cleaner DOM construction in the recent-activity log
- Review prompt visibility logic (was incorrectly defined after the first `load()` call)

## [1.2] — 2026-04-23

- Listing metadata updates
- Minor selector additions

## [1.0] — 2026-04-17

- Initial release
- Manifest V3 extension
- 8 major CMP selectors (Cookiebot, OneTrust, TrustArc, Quantcast, Didomi, Usercentrics, Borlabs, Osano)
- Universal text-match fallback in English
- MutationObserver-based late-banner detection
- Toolbar popup with enable/disable toggle, decline count, and recent activity log
