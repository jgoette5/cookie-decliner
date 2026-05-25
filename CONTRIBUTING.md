# Contributing to Cookie Decliner

Thanks for your interest. This is a small, focused project — keep contributions small and focused.

## Bug reports + CMP requests

If a site has a cookie banner that Cookie Decliner doesn't reject:

1. Search [existing issues](https://github.com/jgoette5/cookie-decliner/issues) first
2. If new, open an issue with:
   - The exact URL (or category — "any French news site")
   - A screenshot of the banner
   - What you see in DevTools (inspect the reject button → copy the outer HTML)

## Adding a new CMP selector

The biggest single contribution is recognizing new Consent Management Platforms.

1. Open `extension/content.js`
2. Find the `CMP_SELECTORS` array
3. Add the reject-button selector for the new CMP, grouped with a comment naming it
4. If the CMP has a container, add it to `BANNER_CONTAINER_SELECTORS`
5. Test by loading the extension unpacked and visiting a site that uses it
6. Open a PR

```javascript
// CMP_SELECTORS — example pattern
// NewCMP Name
"#new-cmp-reject-all",
".new-cmp-decline-button",
```

## Adding a new language

Two parts:

### 1. Translate the popup UI

Copy `extension/_locales/en/messages.json` to `extension/_locales/<lang>/messages.json` (use Chrome's [supported locale codes](https://developer.chrome.com/docs/extensions/reference/api/i18n#supported-locales)).

Translate only the `"message"` values. Leave keys unchanged.

### 2. Add reject-button text patterns

Open `extension/content.js` and add the new-language reject phrases to the `REJECT_TEXTS` array. Examples to include:

- "reject all" equivalent
- "decline all" equivalent
- "refuse cookies" equivalent
- "no, thanks" equivalent
- Short forms: "reject", "decline", "refuse", "deny" equivalents

Order matters — put longer phrases first so they match before shorter ones.

Test by setting your Chrome language to the new locale and visiting sites using that language. Open a PR.

## Code style

- JavaScript: no transpilation, no build step. Plain ES2020 that runs natively in Chrome MV3.
- 2-space indent.
- Comment WHY, not WHAT. Names should make the WHAT obvious.
- No dependencies. The whole project must work with zero `npm install`.

## What NOT to add

- Analytics / telemetry of any kind
- Network requests from the extension
- Third-party SDKs
- Tracking pixels
- Any feature that requires an account or backend service
- Anything that changes the core promise: 100% local, zero data leaves the browser

If your PR adds any of the above, it will be declined regardless of how useful the feature is.

## Releasing (maintainer notes)

1. Bump `version` in `extension/manifest.json`
2. Update `CHANGELOG.md`
3. Tag the commit: `git tag v1.x && git push --tags`
4. Zip the `extension/` folder (NOT the repo root)
5. Upload to Chrome Web Store developer dashboard
6. Once approved, create a GitHub release with the zip attached

```bash
# Zip command
cd extension && zip -r ../cookie-decliner-v1.x.zip . -x "*.DS_Store"
```
