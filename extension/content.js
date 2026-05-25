/**
 * Cookie Decliner — content.js
 *
 * Strategy:
 *   1. Check if extension is enabled (default: on)
 *   2. Run CMP-specific selectors for the biggest platforms
 *   3. Fall back to text-matching any visible button with reject/decline
 *      language across 8 languages (EN, ES, FR, DE, IT, NL, PT, PL)
 *   4. Use a MutationObserver to catch banners that load after the page
 *   5. Report back to the popup via chrome.storage what happened
 *
 * Open source: https://github.com/jgoette5/cookie-decliner
 */

(function () {
  // Don't run inside iframes (avoids double-firing on embedded consent frames)
  if (window !== window.top) return;

  // ── Config ────────────────────────────────────────────────────────────────

  // Reject-button text patterns across multiple languages.
  // Ordered longest-first to prefer specific matches over generic ones.
  // We match in ALL languages regardless of browser locale because a user's
  // browser may be set to EN while they browse a German news site.
  const REJECT_TEXTS = [
    // English (long → short)
    "continue without accepting",
    "reject all cookies",
    "decline all cookies",
    "refuse all cookies",
    "deny all cookies",
    "reject non-essential cookies",
    "reject all",
    "decline all",
    "refuse all",
    "deny all",
    "reject cookies",
    "decline cookies",
    "refuse cookies",
    "do not accept",
    "don't accept",
    "no, thanks",
    "no thanks",
    "i decline",
    "i refuse",
    "opt out",
    "reject",
    "decline",
    "refuse",
    "deny",

    // Spanish
    "rechazar todas las cookies",
    "rechazar todos los cookies",
    "denegar todas las cookies",
    "rechazar todo",
    "rechazar todas",
    "rechazar todos",
    "denegar todo",
    "no aceptar",
    "no, gracias",
    "rechazar cookies",
    "rechazar",
    "rehusar",
    "denegar",

    // French
    "continuer sans accepter",
    "tout refuser",
    "tout rejeter",
    "refuser tout",
    "refuser tous les cookies",
    "refuser les cookies",
    "refuser et fermer",
    "non, merci",
    "je refuse",
    "ne pas accepter",
    "refuser",
    "rejeter",
    "décliner",

    // German
    "ohne einwilligung weiter",
    "ohne einwilligung fortfahren",
    "alle cookies ablehnen",
    "alle ablehnen",
    "alles ablehnen",
    "nicht akzeptieren",
    "nein, danke",
    "nein danke",
    "cookies ablehnen",
    "ablehnen",
    "verweigern",

    // Italian
    "rifiuta tutti i cookie",
    "rifiuta tutti",
    "rifiuta tutto",
    "rifiutare tutto",
    "non accettare",
    "no, grazie",
    "rifiuta i cookie",
    "rifiuta",
    "rifiutare",

    // Dutch
    "alle cookies weigeren",
    "alles weigeren",
    "alle weigeren",
    "niet accepteren",
    "nee, dank u",
    "nee, bedankt",
    "weigeren",
    "afwijzen",

    // Portuguese
    "rejeitar todos os cookies",
    "rejeitar todos",
    "rejeitar tudo",
    "recusar tudo",
    "não aceitar",
    "não, obrigado",
    "rejeitar",
    "recusar",

    // Polish
    "odrzuć wszystkie pliki cookie",
    "odrzuć wszystkie",
    "odrzuć wszystko",
    "odrzuć cookies",
    "nie akceptuję",
    "nie, dziękuję",
    "odrzuć",
    "odmów",
  ];

  // CMP-specific selectors — each maps to known "reject" button selectors
  // for the major Consent Management Platforms.
  const CMP_SELECTORS = [
    // Cookiebot (used by millions of EU sites)
    "#CybotCookiebotDialogBodyButtonDecline",
    "#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll",
    ".CybotCookiebotDialogBodyButton[id*='Decline']",

    // OneTrust (one of the largest CMPs globally)
    "#onetrust-reject-all-handler",
    ".ot-pc-refuse-all-handler",
    "button#onetrust-reject-all-handler",

    // TrustArc / TRUSTe
    ".pdynamicbutton .call",
    "#truste-consent-required",
    ".truste_overlay .pdynamicbutton",

    // Quantcast Choice
    ".qc-cmp2-summary-buttons button:last-child",
    "[data-id='banner-decline-button']",

    // Didomi
    "#didomi-notice-disagree-button",
    ".didomi-continue-without-agreeing",
    "[data-testid='notice-decline-action']",

    // Usercentrics
    "[data-testid='uc-deny-all-button']",
    "#usercentrics-root button[data-testid='uc-deny-all-button']",

    // Borlabs Cookie (WordPress plugin)
    ".borlabs-cookie-btn-decline",
    "#borlabsCookieDeclineBtn",

    // Osano
    ".osano-cm-denyAll",
    ".osano-cm-button--type_denyAll",

    // Iubenda
    ".iubenda-cs-reject-btn",
    "#iubFooterBtn",

    // Complianz (WordPress)
    ".cc-decline",
    ".complianz-decline",

    // Admiral
    ".admiral-reject-all",

    // Klaro
    ".klaro .cm-btn-decline",
    "#klaro .decline",

    // CookieYes / CookieLaw
    ".cky-btn-reject",
    "[data-cky-tag='reject-button']",

    // Termly
    "#termly-consent-banner button[id*='decline']",
    "#termly-code-snippet-support .decline-btn",

    // GDPR Cookie Consent (WordPress plugin)
    "#gdpr-cookie-decline",
    ".gdpr-cookie-decline",

    // WP Cookie Notice
    "#cn-refuse-cookie",

    // Piwik PRO
    "[id='ppms_cm_reject-all']",
    ".ppms_cm_reject-all",

    // Sourcepoint
    "button[title*='Reject' i]",
    "button[title*='Disagree' i]",

    // Generic patterns that many custom implementations use
    "[class*='reject-all']",
    "[class*='decline-all']",
    "[class*='refuse-all']",
    "[id*='reject-all']",
    "[id*='decline-all']",
    "[aria-label*='reject' i]",
    "[aria-label*='decline' i]",
    "[data-action='reject']",
    "[data-action='decline']",
  ];

  // Selectors that identify cookie banner CONTAINERS
  // Used to restrict text-match search to relevant areas.
  const BANNER_CONTAINER_SELECTORS = [
    "#CybotCookiebotDialog",
    "#onetrust-banner-sdk",
    "#onetrust-consent-sdk",
    ".qc-cmp2-container",
    "#didomi-popup",
    "#usercentrics-root",
    ".borlabs-cookie",
    ".osano-cm-window",
    ".iubenda-cs-container",
    "#klaro",
    ".cky-consent-container",
    "#termly-consent-banner",
    "#gdpr-cookie-notice",
    "[id*='cookie-banner']",
    "[id*='cookie-consent']",
    "[id*='cookie-notice']",
    "[id*='cookie-popup']",
    "[id*='cookiebanner']",
    "[id*='cookieconsent']",
    "[class*='cookie-banner']",
    "[class*='cookie-consent']",
    "[class*='cookie-notice']",
    "[class*='cookie-popup']",
    "[class*='cookiebanner']",
    "[class*='cookieconsent']",
    "[class*='consent-banner']",
    "[class*='consent-popup']",
    "[class*='consent-modal']",
    "[class*='gdpr-banner']",
    "[class*='gdpr-popup']",
    "[role='dialog'][aria-label*='cookie' i]",
    "[role='dialog'][aria-label*='consent' i]",
    "[role='alertdialog'][aria-label*='cookie' i]",
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function normalizeText(str) {
    return str.toLowerCase().replace(/[\s ]+/g, " ").trim();
  }

  function textMatchesReject(el) {
    const text = normalizeText(
      el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || ""
    );
    if (!text) return false;
    return REJECT_TEXTS.some(
      (pattern) =>
        text === pattern ||
        text.startsWith(pattern + " ") ||
        text.endsWith(" " + pattern)
    );
  }

  function safeClick(el) {
    try {
      el.click();
      return true;
    } catch (e) {
      return false;
    }
  }

  function logDecline(method, selector) {
    const entry = {
      url: location.hostname,
      method,
      selector,
      ts: Date.now(),
    };
    chrome.storage.local.get({ log: [], totalDeclined: 0 }, (data) => {
      const log = [entry, ...data.log].slice(0, 200);
      chrome.storage.local.set({
        log,
        totalDeclined: data.totalDeclined + 1,
        lastDeclined: location.hostname,
        lastDeclinedAt: Date.now(),
      });
    });
  }

  // ── Core: try to find and click a reject button ───────────────────────────

  function tryDecline() {
    // Layer 1: CMP-specific known selectors
    for (const sel of CMP_SELECTORS) {
      try {
        const el = document.querySelector(sel);
        if (el && isVisible(el)) {
          if (safeClick(el)) {
            logDecline("cmp-selector", sel);
            return true;
          }
        }
      } catch (e) {
        // Invalid selector — skip
      }
    }

    // Layer 2: Text-match within known banner containers
    for (const containerSel of BANNER_CONTAINER_SELECTORS) {
      try {
        const container = document.querySelector(containerSel);
        if (!container || !isVisible(container)) continue;

        const buttons = container.querySelectorAll(
          "button, [role='button'], a.btn, a[class*='button'], input[type='button'], input[type='submit']"
        );
        for (const btn of buttons) {
          if (isVisible(btn) && textMatchesReject(btn)) {
            if (safeClick(btn)) {
              logDecline("text-match-in-container", containerSel);
              return true;
            }
          }
        }
      } catch (e) {
        // Skip bad selectors
      }
    }

    // Layer 3: Universal text-match across all visible buttons
    // Only runs if the page actually has a likely consent banner present
    const hasBanner = BANNER_CONTAINER_SELECTORS.some((sel) => {
      try { return !!document.querySelector(sel); } catch { return false; }
    });

    if (hasBanner) {
      const allButtons = document.querySelectorAll(
        "button, [role='button'], input[type='button'], input[type='submit']"
      );
      for (const btn of allButtons) {
        if (isVisible(btn) && textMatchesReject(btn)) {
          if (safeClick(btn)) {
            logDecline("text-match-universal", btn.className || btn.id || "unknown");
            return true;
          }
        }
      }
    }

    return false;
  }

  // ── MutationObserver: catch banners that load dynamically ─────────────────

  let attempts = 0;
  const MAX_ATTEMPTS = 8;
  let debounceTimer = null;

  function scheduleTry() {
    if (attempts >= MAX_ATTEMPTS) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      attempts++;
      const declined = tryDecline();
      if (declined) {
        observer.disconnect();
      }
    }, 300);
  }

  const observer = new MutationObserver((mutations) => {
    const hasNewNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasNewNodes) scheduleTry();
  });

  // ── Boot ──────────────────────────────────────────────────────────────────

  chrome.storage.local.get({ enabled: true }, (data) => {
    if (!data.enabled) return;

    // First try immediately (for banners already in the DOM)
    tryDecline();

    // Then watch for dynamically injected banners
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Stop observing after 15 seconds to avoid lingering overhead
    setTimeout(() => observer.disconnect(), 15000);
  });
})();
