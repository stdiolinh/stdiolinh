(function () {
  var year = document.getElementById("year");
  var sidebar = document.getElementById("site-sidebar");
  var toggle = document.querySelector(".nav-toggle");
  var scrim = document.getElementById("sidebar-scrim");
  var gate = document.getElementById("research-gate");
  var content = document.getElementById("research-content");
  var form = document.getElementById("research-form");
  var passInput = document.getElementById("research-pass");
  var err = document.getElementById("research-error");

  /**
   * SHA-256 hex of your passphrase — NOT server-side security on static hosting.
   * Change passphrase: run  printf '%s' 'your-new-passphrase' | shasum -a 256
   * then paste the hex below. Default passphrase: stdiolinh-research
   */
  var RESEARCH_PW_SHA256 =
    "2cb227f87a7e5c294a5fc56c0d91464daea0475a8b0e636ff572974da0deffd3";

  var SESSION_KEY = "stdiolinh_research_unlocked";

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function closeSidebar() {
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (sidebar) sidebar.classList.remove("is-open");
    if (scrim) {
      scrim.classList.remove("is-visible");
      scrim.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "";
  }

  function openSidebar() {
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (sidebar) sidebar.classList.add("is-open");
    if (scrim) {
      scrim.classList.add("is-visible");
      scrim.setAttribute("aria-hidden", "false");
    }
    document.body.style.overflow = "hidden";
  }

  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeSidebar();
      else openSidebar();
    });

    sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeSidebar);
    });
  }

  if (scrim) {
    scrim.addEventListener("click", closeSidebar);
  }

  function hex(buf) {
    return Array.from(new Uint8Array(buf))
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function sha256Hex(str) {
    if (!crypto || !crypto.subtle) {
      return Promise.reject(new Error("crypto.subtle unavailable"));
    }
    var data = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", data).then(hex);
  }

  function showResearchUnlocked() {
    if (gate) gate.hidden = true;
    if (content) content.hidden = false;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch (e) {}
  }

  function initResearchGate() {
    if (!gate || !content || !form) return;

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        showResearchUnlocked();
        return;
      }
    } catch (e) {}

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (err) {
        err.hidden = true;
        err.textContent = "";
      }
      var raw = passInput ? passInput.value : "";
      sha256Hex(raw)
        .then(function (hash) {
          if (hash === RESEARCH_PW_SHA256) {
            showResearchUnlocked();
            if (passInput) passInput.value = "";
          } else {
            if (err) {
              err.textContent = "That passphrase doesn’t match.";
              err.hidden = false;
            }
          }
        })
        .catch(function () {
          if (err) {
            err.textContent = "Could not verify (try a secure context / HTTPS).";
            err.hidden = false;
          }
        });
    });
  }

  initResearchGate();

  (function initTheme() {
    var key = "stdiolinh-theme";
    var root = document.documentElement;
    var btn = document.getElementById("theme-toggle");

    function setLabel() {
      if (!btn) return;
      var t = root.getAttribute("data-theme") || "dark";
      btn.setAttribute(
        "aria-label",
        t === "light" ? "Switch to dark theme" : "Switch to light theme"
      );
    }

    function apply(next) {
      var t = next === "light" ? "light" : "dark";
      root.setAttribute("data-theme", t);
      try {
        localStorage.setItem(key, t);
      } catch (e) {}
      setLabel();
    }

    setLabel();

    if (btn) {
      btn.addEventListener("click", function () {
        var cur = root.getAttribute("data-theme") || "dark";
        apply(cur === "light" ? "dark" : "light");
      });
    }
  })();
})();
