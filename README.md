# Cookie Decliner — Auto Reject Banners

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=googlechrome)](https://chromewebstore.google.com/detail/cookie-decliner-%E2%80%94-auto-re/pgplomkmnnlpnjnhlcbgbjllgjemekdl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](extension/manifest.json)

**Auto-clicks "Reject All" on cookie consent banners across the web. Open source. 100% local. No tracking, no cloud, no account.**

Most cookie decliners either got bought by ad companies (RIP "I Don't Care About Cookies" → Avast) or quietly added telemetry. This one can't — the entire source is here for you to audit.

---

## How it works

Three detection layers, in order:

1. **CMP-specific selectors** — Direct selectors for 20+ Consent Management Platforms (Cookiebot, OneTrust, Usercentrics, TrustArc, Quantcast, Didomi, Iubenda, Osano, Klaro, Borlabs, Termly, CookieYes, Complianz, Admiral, Piwik PRO, Sourcepoint, GDPR Cookie Consent, and more).

2. **Text-matching inside known banner containers** — When a CMP isn't recognized, look for buttons labeled "reject", "decline", "refuse", "deny", etc. in any element that looks like a cookie banner. Works in **8 languages**: English, Spanish, French, German, Italian, Dutch, Portuguese, Polish.

3. **Universal text-match fallback** — Last resort: if the page has a probable consent banner present, scan all visible buttons for reject-language text.

Once a button is clicked, the MutationObserver disconnects to avoid lingering overhead. The whole thing stops after 15 seconds regardless.

## Privacy

| Question | Answer |
|---|---|
| Does this extension send any data anywhere? | **No.** Zero network requests from the extension itself. Audit `content.js` and `popup.js` if you want to verify. |
| Does this extension use any third-party SDKs? | **No.** |
| Does this extension have analytics? | **No.** |
| Does this extension require an account? | **No.** |
| Where is my decline history stored? | `chrome.storage.local` on your device only. Cleared when you uninstall. |
| What permissions does it use, and why? | `storage` — to remember the enabled/disabled toggle and decline count. `<all_urls>` content script — needed because cookie banners can appear on any site. |

The privacy policy in plain English is at [`index.html`](index.html) → [jgoette5.github.io/cookie-decliner](https://jgoette5.github.io/cookie-decliner/).

## Supported Consent Management Platforms

| CMP | Notes |
|---|---|
| Cookiebot | Direct selector |
| OneTrust | Direct selector |
| Usercentrics | Direct selector |
| TrustArc / TRUSTe | Direct selector |
| Quantcast Choice | Direct selector |
| Didomi | Direct selector |
| Borlabs Cookie | Direct selector |
| Osano | Direct selector |
| Iubenda | Direct selector |
| Complianz | Direct selector |
| Admiral | Direct selector |
| Klaro | Direct selector |
| CookieYes / CookieLaw | Direct selector |
| Termly | Direct selector |
| GDPR Cookie Consent (WordPress) | Direct selector |
| WP Cookie Notice | Direct selector |
| Piwik PRO | Direct selector |
| Sourcepoint | Direct selector |
| Custom / unknown | Falls back to text-match in 8 languages |

Found a CMP that doesn't work? [Open an issue](https://github.com/jgoette5/cookie-decliner/issues) with the site URL and a screenshot.

## Supported languages

The reject-button text matcher works in:

- 🇬🇧 English
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇮🇹 Italian (Italiano)
- 🇳🇱 Dutch (Nederlands)
- 🇧🇷 Portuguese (Português)
- 🇵🇱 Polish (Polski)

The popup UI is translated to each of these. Want to add another language? See [CONTRIBUTING.md](CONTRIBUTING.md).

## Install

**From Chrome Web Store (recommended):**
[Cookie Decliner — Auto Reject Banners](https://chromewebstore.google.com/detail/cookie-decliner-%E2%80%94-auto-re/pgplomkmnnlpnjnhlcbgbjllgjemekdl)

**From source (developer mode):**

1. Clone or download this repo
2. Open `chrome://extensions/`
3. Toggle **Developer mode** on (top right)
4. Click **Load unpacked**
5. Select the `extension/` folder

That's it — no build step.

## Project structure

```
cookie-decliner/
├── extension/              # The Chrome extension (what gets zipped & uploaded)
│   ├── manifest.json
│   ├── content.js          # Detection + click logic
│   ├── popup.html          # Toolbar popup UI
│   ├── popup.js            # Popup logic
│   ├── _locales/           # Internationalization
│   │   ├── en/messages.json
│   │   ├── es/messages.json
│   │   ├── fr/messages.json
│   │   ├── de/messages.json
│   │   ├── it/messages.json
│   │   ├── nl/messages.json
│   │   ├── pt_BR/messages.json
│   │   └── pl/messages.json
│   └── icons/
├── index.html              # Privacy policy (served by GitHub Pages)
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── CHANGELOG.md
```

## Contributing

PRs welcome for:

- New CMP selectors (see existing patterns in `content.js`)
- New language translations (copy `_locales/en/messages.json`)
- Reject-button text patterns for additional languages
- Bug fixes

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.

## License

[MIT](LICENSE). Fork it, modify it, sell it — just don't pretend you wrote the original.

## Why open source?

When [Avast acquired "I Don't Care About Cookies" in 2022](https://news.softpedia.com/news/avast-acquires-i-don-t-care-about-cookies-browser-extension-promises-it-won-t-add-tracking-535995.shtml), users who had trusted a privacy tool found themselves under an ad company. Avast pinky-promised no telemetry — but you have to trust them. With this extension, you don't have to trust anyone. The source is here. Read it.

If you can't or don't want to audit code, that's fine too — but you should at least know that this code *can* be audited, whereas closed-source extensions cannot.

## Support

If this saves you a few hundred annoying clicks a year, consider:

- ⭐ Star this repo
- ✍️ [Leave a review on the Chrome Web Store](https://chromewebstore.google.com/detail/pgplomkmnnlpnjnhlcbgbjllgjemekdl/reviews)
- ☕ [Buy me a coffee on Ko-fi](https://ko-fi.com/cookiedecliner)
- 🐛 [Report bugs / request CMPs](https://github.com/jgoette5/cookie-decliner/issues)

No subscription. No nag screens (well, one gentle review nudge after you've used it 10 times). Just a useful tool.
