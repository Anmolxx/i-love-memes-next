(function () {
  console.log("[MemeWidget] Script loaded.");
 
  const API_URL = "https://staging.ilovememes.com/api/v1/memes";
  const PRINT_READY_BASE = "https://staging.ilovememes.com/api/v1/memes/";
 
  /* ----------------------------------------
     1. Load jQuery + Select2 if missing
  ---------------------------------------- */
  function loadScript(src) {
    console.log("[MemeWidget] Loading script:", src);
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => {
        console.log("[MemeWidget] Loaded:", src);
        resolve();
      };
      document.head.appendChild(s);
    });
  }
 
  function loadCSS(href) {
    console.log("[MemeWidget] Loading CSS:", href);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
 
  async function ensureDependencies() {
    console.log("[MemeWidget] Ensuring dependencies...");
 
    loadCSS("https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css");
 
    if (!window.jQuery) {
      console.log("[MemeWidget] jQuery not found. Loading...");
      await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
    } else {
      console.log("[MemeWidget] jQuery already present.");
    }
 
    if (!jQuery.fn.select2) {
      console.log("[MemeWidget] Select2 not found. Loading...");
      await loadScript("https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js");
    } else {
      console.log("[MemeWidget] Select2 already present.");
    }
 
    console.log("[MemeWidget] Dependencies ready.");
  }
 
  /* ----------------------------------------
     2. Auto-detect the best insert point
  ---------------------------------------- */
  function findInsertPoint() {
    console.log("[MemeWidget] Detecting insert point...");
 
    const selectors = [
      'form[action*="/cart/add"] button[type="submit"]',
      ".product-form__submit",
      "button.add-to-cart",
      "form[action*='/cart/add']",
    ];
 
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) {
        console.log("[MemeWidget] Insert point found:", s);
        return el;
      }
    }
 
    console.log("[MemeWidget] Fallback: Using BODY");
    return document.body;
  }
 
  /* ----------------------------------------
     3. Build Widget HTML
  ---------------------------------------- */
  function buildWidget() {
    console.log("[MemeWidget] Building widget UI...");
 
    const div = document.createElement("div");
    div.id = "meme-app";
    div.style.marginTop = "20px";
 
    div.innerHTML = `
      <input id="meme-input"
             type="text"
             placeholder="Enter Meme Slug"
             style="width:100%; padding:8px; border-radius:6px; margin-bottom:10px;" />
 
      <select id="meme-select"
              style="width:100%; padding:8px; border-radius:6px; margin-bottom:10px;">
        <option value="">Select Meme</option>
      </select>
 
      <a href="https://staging.ilovememes.com/meme"
         target="_blank"
         style="display:inline-block; margin:10px 0; padding:10px 15px; background:#000; color:#fff; border-radius:6px;">
         ➕ Create New Meme
      </a>
 
      <img id="meme-preview-img"
           src=""
           style="display:none; width:100px; margin-top:10px;" />
 
      <div id="meme-overlay"
           style="position:absolute; display:none; pointer-events:none;">
        <img id="meme-overlay-img"
             src=""
             style="position:absolute; object-fit:contain; pointer-events:none;" />
      </div>
    `;
    return div;
  }
 
  /* ----------------------------------------
     4. Hidden fields
  ---------------------------------------- */
  function getForms() {
    return Array.from(document.querySelectorAll('form[action*="/cart/add"]'));
  }
 
  function ensureHiddenFields() {
    console.log("[MemeWidget] Ensuring hidden fields...");
 
    getForms().forEach((form) => {
      let idF = form.querySelector('input[name="properties[meme_id]"]');
      let prF = form.querySelector('input[name="properties[print_ready_url]"]');
 
      if (!idF) {
        idF = document.createElement("input");
        idF.type = "hidden";
        idF.name = "properties[meme_id]";
        form.appendChild(idF);
      }
 
      if (!prF) {
        prF = document.createElement("input");
        prF.type = "hidden";
        prF.name = "properties[print_ready_url]";
        form.appendChild(prF);
      }
    });
 
    console.log("[MemeWidget] Hidden fields ready.");
  }
 
  function updateHiddenFields(id, slug) {
    console.log("[MemeWidget] Updating hidden fields:", slug);
 
    getForms().forEach((form) => {
      form.querySelector('input[name="properties[meme_id]"]').value = slug || "";
      form.querySelector('input[name="properties[print_ready_url]"]').value =
        slug ? `${PRINT_READY_BASE}${slug}/print-ready` : "";
    });
  }
 
  /* ----------------------------------------
     5. Patch AJAX cart
  ---------------------------------------- */
  function patchAjaxCart() {
    console.log("[MemeWidget] Patching fetch() for AJAX carts...");
 
    const originalFetch = window.fetch;
 
    window.fetch = function (res, cfg = {}) {
      try {
        const url = typeof res === "string" ? res : res.url;
 
        if (url.includes("/cart/add") && cfg.body) {
          const data = JSON.parse(cfg.body);
          const slug = localStorage.getItem("selected_meme_slug");
 
          if (slug) {
            console.log("[MemeWidget] Injecting meme into AJAX cart:", slug);
 
            data.properties = data.properties || {};
            data.properties.meme_id = slug;
            data.properties.print_ready_url = `${PRINT_READY_BASE}${slug}/print-ready`;
 
            cfg.body = JSON.stringify(data);
          }
        }
      } catch (e) {
        console.warn("[MemeWidget] AJAX patch error:", e);
      }
 
      return originalFetch(res, cfg);
    };
  }
 
  /* ----------------------------------------
     6. Overlay
  ---------------------------------------- */
  function getProductImage() {
    return document.querySelector(
      ".product__media img, .product-media img, .product-gallery img, .product__image img"
    );
  }
 
  function attachOverlay() {
    const img = getProductImage();
    const overlay = document.getElementById("meme-overlay");
 
    if (!img || !overlay) return;
 
    const parent = img.parentElement;
    parent.style.position = "relative";
 
    if (!parent.contains(overlay)) parent.appendChild(overlay);
  }
 
function updateOverlay(url) {
  console.log("[MemeWidget] Updating overlay:", url);
 
  const overlay = document.getElementById("meme-overlay");
  const overlayImg = document.getElementById("meme-overlay-img");
 
  attachOverlay();
 
  if (!url) {
    overlay.style.display = "none";
    return;
  }
 
  // Apply FIXED CSS every time
  overlay.style.display = "block";
  overlay.style.position = "absolute";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.maxWidth = "200px";
  overlay.style.maxHeight = "200px";
  overlay.style.pointerEvents = "none";
  overlay.style.top = "50%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
 
  overlayImg.src = url;
  overlayImg.style.top = "0";
  overlayImg.style.left = "0";
  overlayImg.style.width = "100%";
  overlayImg.style.height = "100%";
  overlayImg.style.position = "absolute";
  overlayImg.style.pointerEvents = "none";
  overlayImg.style.objectFit = "contain";
}
 
 
  /* ----------------------------------------
     7. Load memes + events
  ---------------------------------------- */
  async function loadMemes() {
    console.log("[MemeWidget] Fetching memes…", API_URL);
 
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
 
      console.log("[MemeWidget] Memes loaded:", json);
 
      const memes = json.items || [];
      const $select = jQuery("#meme-select");
 
      memes.forEach((m) => {
        console.log("------------[MemeWidget] Adding meme:------------", m);
        $select.append(
          `<option value="${m.slug}" data-id="${m.id}" data-image="${m.file.path || m.original}">
            ${m.title}
           </option>`
        );
      });
 
      // Initialize select2
      $select.select2({
        placeholder: "Search memes...",
        width: "100%",
        templateResult: (state) => {
          if (!state.element) return state.text;
          const img = state.element.dataset.image;
          return jQuery(`
            <div style="display:flex; align-items:center;">
              <img src="${img}" style="width:22px; height:22px; margin-right:6px;" />
              ${state.text}
            </div>
          `);
        },
      });
 
      console.log("[MemeWidget] Select2 initialized.");
 
      // Selection handler
      $select.on("change", function () {
        const opt = this.options[this.selectedIndex];
        const slug = opt.value;
        const img = opt.dataset.image;
 
        console.log("[MemeWidget] Selected meme:", slug);
 
        document.getElementById("meme-input").value = slug;
        localStorage.setItem("selected_meme_slug", slug);
 
        updateHiddenFields(slug, slug);
        updateOverlay(img);
      });
 
      // Manual input handler
      document.getElementById("meme-input").addEventListener("input", (e) => {
        const slug = e.target.value.trim();
        console.log("[MemeWidget] Manual input:", slug);
 
        const option = [...$select[0].options].find((o) => o.value === slug);
 
        if (option) {
          $select.val(slug).trigger("change");
        } else {
          updateHiddenFields("", slug);
          updateOverlay(null);
        }
 
        localStorage.setItem("selected_meme_slug", slug);
      });
 
      // Restore saved meme
      const saved = localStorage.getItem("selected_meme_slug");
      if (saved) {
        console.log("[MemeWidget] Restoring saved meme:", saved);
        $select.val(saved).trigger("change");
        document.getElementById("meme-input").value = saved;
      }
    } catch (err) {
      console.error("[MemeWidget] Error loading memes:", err);
    }
  }
 
  /* ----------------------------------------
     8. Initialize script
  ---------------------------------------- */
  async function init() {
    console.log("[MemeWidget] Initializing widget…");
 
    await ensureDependencies();
 
    const insertPoint = findInsertPoint();
    const widget = buildWidget();
 
    console.log("[MemeWidget] Inserting widget before:", insertPoint);
    insertPoint.parentNode.insertBefore(widget, insertPoint);
 
    ensureHiddenFields();
    patchAjaxCart();
    loadMemes();
 
    console.log("[MemeWidget] Widget initialized successfully.");
  }
 
  setTimeout(() => {
      console.log("[MemeWidget] Delay completed. Initializing now...");
      init();
    }, 2000); // 1.5 sec delay
  })();
 