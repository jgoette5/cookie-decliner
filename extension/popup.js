// ── DOM refs ───────────────────────────────────────────────────────────────
const toggle      = document.getElementById("enabled-toggle");
const toggleLabel = document.getElementById("toggle-label");
const totalCount  = document.getElementById("total-count");
const siteCount   = document.getElementById("site-count");
const logList     = document.getElementById("log-list");
const clearBtn    = document.getElementById("clear-log");
const reviewNudge = document.getElementById("review-nudge");

const REVIEW_NUDGE_THRESHOLD = 10; // show after N banners declined

// ── i18n ──────────────────────────────────────────────────────────────────
// Replace all UI strings with the user's browser-language version where
// available. Falls back to English (the default_locale) if missing.

function applyI18n() {
  const set = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.textContent = msg;
  };

  set("ui-title",          "uiTitle");
  set("ui-subtitle",       "uiSubtitle");
  set("ui-banners-label",  "uiBannersLabel");
  set("ui-sites-label",    "uiSitesLabel");
  set("ui-recent-label",   "uiRecentLabel");
  set("ui-review-prompt",  "uiReviewPrompt");
  set("ui-review-cta",     "uiReviewCta");
  set("ui-support-link",   "uiSupportLink");
  set("ui-footer",         "uiFooter");

  // Clear button
  const clear = document.getElementById("clear-log");
  if (clear) clear.textContent = chrome.i18n.getMessage("uiClear") || "Clear";
}

// ── Time helpers (localized) ──────────────────────────────────────────────

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return chrome.i18n.getMessage("timeJustNow") || "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}${chrome.i18n.getMessage("timeMinSuffix") || "m ago"}`;
  if (s < 86400) return `${Math.floor(s / 3600)}${chrome.i18n.getMessage("timeHourSuffix") || "h ago"}`;
  return `${Math.floor(s / 86400)}${chrome.i18n.getMessage("timeDaySuffix") || "d ago"}`;
}

// ── Render ────────────────────────────────────────────────────────────────

function renderLog(log) {
  // Clear safely (no innerHTML with untrusted hostnames)
  while (logList.firstChild) logList.removeChild(logList.firstChild);

  if (!log || !log.length) {
    const empty = document.createElement("div");
    empty.className = "log-empty";
    empty.textContent = chrome.i18n.getMessage("logEmpty") ||
      "No banners declined yet. Browse any site with a cookie banner.";
    logList.appendChild(empty);
    return;
  }

  log.slice(0, 20).forEach((entry) => {
    const item = document.createElement("div");
    item.className = "log-item";

    const dot = document.createElement("div");
    dot.className = "log-dot";

    const host = document.createElement("span");
    host.className = "log-host";
    host.title = entry.url || "";
    host.textContent = entry.url || "";

    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = timeAgo(entry.ts);

    item.appendChild(dot);
    item.appendChild(host);
    item.appendChild(time);
    logList.appendChild(item);
  });
}

function maybeShowReviewNudge(total) {
  if (total < REVIEW_NUDGE_THRESHOLD) return;
  chrome.storage.local.get({ reviewDismissed: false, reviewShownAt: 0 }, (data) => {
    if (data.reviewDismissed) return;
    reviewNudge.classList.add("show");
    if (!data.reviewShownAt) {
      chrome.storage.local.set({ reviewShownAt: Date.now() });
    }
  });
}

function load() {
  chrome.storage.local.get(
    { enabled: true, totalDeclined: 0, log: [] },
    (data) => {
      toggle.checked = data.enabled;
      toggleLabel.textContent = data.enabled
        ? chrome.i18n.getMessage("toggleActive") || "Active on all sites"
        : chrome.i18n.getMessage("togglePaused") || "Paused";

      totalCount.textContent = data.totalDeclined.toLocaleString();
      const uniqueSites = new Set((data.log || []).map((e) => e.url)).size;
      siteCount.textContent = uniqueSites.toLocaleString();

      renderLog(data.log);
      maybeShowReviewNudge(data.totalDeclined);
    }
  );
}

// ── Event wiring ──────────────────────────────────────────────────────────

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  toggleLabel.textContent = enabled
    ? chrome.i18n.getMessage("toggleActive") || "Active on all sites"
    : chrome.i18n.getMessage("togglePaused") || "Paused";
  chrome.storage.local.set({ enabled });
});

clearBtn.addEventListener("click", () => {
  chrome.storage.local.set({ log: [], totalDeclined: 0 }, load);
});

// When the user clicks the review link, treat it as dismissed so we don't
// keep nudging them after they've left a review.
document.getElementById("review-link").addEventListener("click", () => {
  chrome.storage.local.set({ reviewDismissed: true });
});

// ── Boot ──────────────────────────────────────────────────────────────────

applyI18n();
load();
