console.log("customGPT loaded (native-clone)");

const NATIVE_ITEM_HTML = `
<a tabindex="0" data-fill="" class="group __menu-item hoverable gap-1.5" data-sidebar-item="true" data-customgpt="1">
  <div class="flex items-center justify-center group-disabled:opacity-50 group-data-disabled:opacity-50 icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  </div>
  <div class="flex min-w-0 grow items-center gap-2.5">
    <div class="truncate">CustomGPT Settings</div>
  </div>
</a>
`;

function insertCustomGPTButton() {
  const nav = document.querySelector("nav");
  if (!nav) return;
  if (nav.querySelector("[data-customgpt]")) return;

  const gptsItem = [...nav.querySelectorAll("*")].find(
    el => el.textContent.trim() === "GPTs"
  );
  if (!gptsItem) return;

  const wrapper = gptsItem.closest("a, div");
  if (!wrapper || !wrapper.parentElement) return;

  const temp = document.createElement("div");
  temp.innerHTML = NATIVE_ITEM_HTML.trim();
  const item = temp.firstElementChild;

  item.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    showModal();
  });

  wrapper.parentElement.insertBefore(item, wrapper.nextSibling);
}

const STORAGE_KEY = "customgpt_toggles";
const COLOR_KEY = "customgpt_colors";

function saveToggles(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadToggles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      Library: true,
      Codex: true,
      GPTs: true
    };
  } catch {
    return { Library: true, Codex: true, GPTs: true };
  }
}

function saveColors(colors) {
  localStorage.setItem(COLOR_KEY, JSON.stringify(colors));
}
function loadColors() {
  try {
    return JSON.parse(localStorage.getItem(COLOR_KEY)) || {
      bg: "#000000",
      sidebar: "#27272a",
      text: "#ffffff",
      composer: null,
      composerAuto: true
    };
  } catch {
    return { bg: "#000000", sidebar: "#27272a", text: "#ffffff", composer: null, composerAuto: true };
  }
}

// FIX: wrap risky calls so errors stop being uncaught and you can see the real stack
function safeRun(label, fn) {
  try {
    fn();
  } catch (e) {
    console.error("CustomGPT error in " + label, e);
  }
}

// FIX: hardened applyToggles (avoid null/accidental nav hiding)
function applyToggles(state) {
  if (!state) state = loadToggles();

  const nav = document.querySelector("nav");
  if (!nav) return;

  const setVisibleByLabel = (label, on) => {
    const candidates = [...nav.querySelectorAll("a, button, [role='button'], li")];
    const row = candidates.find(n => (n.textContent || "").trim() === label);
    if (!row) return;
    row.style.display = on ? "" : "none";
  };

  setVisibleByLabel("Library", !!state.Library);
  setVisibleByLabel("Codex", !!state.Codex);
  setVisibleByLabel("GPTs", !!state.GPTs);
}

// Brightness adjust helper
function adjust(color, amount) {
  let c = color.replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const num = parseInt(c, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xFF) + amount;
  let b = (num & 0xFF) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function deriveComposer(bg) {
  const val = parseInt(bg.slice(1), 16);
  const brightness = ((val >> 16) & 255) * 0.3 + ((val >> 8) & 255) * 0.59 + (val & 255) * 0.11;

  return brightness < 128
    ? adjust(bg, +20)
    : adjust(bg, -20);
}

function applyColors(colors) {
  document.body.style.backgroundColor = colors.bg;

  const sidebar = document.querySelector("nav");
  if (sidebar) sidebar.style.backgroundColor = colors.sidebar;

  document.body.style.color = colors.text;

  const topDesktop = document.querySelector("#page-header");
  if (topDesktop) topDesktop.style.backgroundColor = colors.sidebar;

  const topMobile = document.querySelector(".draggable.h-header-height");
  if (topMobile) topMobile.style.backgroundColor = colors.sidebar;

  const asideBlocks = document.querySelectorAll("aside");
  if (asideBlocks[0]) asideBlocks[0].style.backgroundColor = colors.sidebar;
  if (asideBlocks[asideBlocks.length - 1])
    asideBlocks[asideBlocks.length - 1].style.backgroundColor = colors.sidebar;

  const main = document.querySelector("main");
  if (main) main.style.backgroundColor = colors.bg;

  const composer = document.querySelector("#composer-background, .composer, .sticky.bottom-0");
  if (composer) {
    const finalColor = colors.composerAuto
      ? deriveComposer(colors.bg)
      : colors.composer || deriveComposer(colors.bg);

    composer.style.backgroundColor = finalColor;
  }
}

function showModal() {
  if (document.getElementById("customgpt-modal")) {
    document.getElementById("customgpt-modal").style.display = "flex";
    return;
  }

  const state = loadToggles();
  const colors = loadColors();

  const overlay = document.createElement("div");
  overlay.id = "customgpt-modal";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999
  });

  const modal = document.createElement("div");
  Object.assign(modal.style, {
    background: "#2a2a2e",
    borderRadius: "10px",
    padding: "32px",
    width: "480px",
    boxShadow: "0 0 20px rgba(0,0,0,0.6)",
    color: "#e4e4e7",
    fontFamily: "system-ui, sans-serif",
    position: "relative",
    maxHeight: "80vh",
    overflowY: "auto"
  });

  modal.innerHTML = `
    <button id="customgpt-close" style="position:absolute; top:16px; right:16px; background:none; border:none; color:#aaa; font-size:20px; cursor:pointer;">×</button>
    <h2 style="font-size:1.5rem; font-weight:600; margin-bottom:1rem;">CustomGPT Settings</h2>

    <p style="margin-bottom:1.5rem; color:#a1a1aa;">Toggle sidebar sections below:</p>

    <div id="toggle-list" style="display:flex; flex-direction:column; gap:1.25rem; margin-bottom:2rem;">
      ${["Library", "Codex", "GPTs"].map(name => `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>${name}</span>
          <label class="switch" style="position:relative; display:inline-block; width:42px; height:22px;">
            <input type="checkbox" id="toggle-${name}" ${state[name] ? "checked" : ""} style="opacity:0; width:0; height:0;">
            <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:${state[name] ? '#10b981' : '#555'}; transition:.3s; border-radius:22px;"></span>
            <span style="position:absolute; height:18px; width:18px; left:${state[name] ? '22px' : '2px'}; bottom:2px; background:white; border-radius:50%; transition:.3s;"></span>
          </label>
        </div>
      `).join("")}
    </div>

    <hr style="border:none; border-top:1px solid #3f3f46; margin:1.5rem 0;">

    <h3 style="font-size:1.2rem; font-weight:600; margin-bottom:1rem;">Color Controls</h3>

    <div style="display:flex; flex-direction:column; gap:1rem;">
      <label>Background <input id="cg-bg" type="color" value="${colors.bg}" style="margin-left:12px;"></label>
      <label>Sidebar <input id="cg-side" type="color" value="${colors.sidebar}" style="margin-left:38px;"></label>
      <label>Text <input id="cg-text" type="color" value="${colors.text}" style="margin-left:62px;"></label>

      <label style="margin-top:1rem;">
        <input type="checkbox" id="cg-composer-auto" ${colors.composerAuto ? "checked" : ""}>
        Auto-adjust composer (Ask anything bar)
      </label>

      <div id="composer-manual-wrapper" style="display:${colors.composerAuto ? "none" : "block"}; margin-top:8px;">
        <label>Composer <input id="cg-composer" type="color" value="${colors.composer || deriveComposer(colors.bg)}"></label>
      </div>
    </div>

    <h3 style="font-size:1.1rem; font-weight:600; margin:1.5rem 0 1rem;">Presets</h3>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="preset" data-preset="default" style="padding:6px 12px; background:#3f3f46; color:#e4e4e7; border:none; border-radius:6px; cursor:pointer;">Default</button>
      <button class="preset" data-preset="midnight" style="padding:6px 12px; background:#1f1f22; color:#e4e4e7; border:none; border-radius:6px; cursor:pointer;">Midnight</button>
      <button class="preset" data-preset="ocean" style="padding:6px 12px; background:#004b70; color:#e4e4e7; border:none; border-radius:6px; cursor:pointer;">Ocean</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.getElementById("customgpt-close").onclick = () => (overlay.style.display = "none");
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.style.display = "none";
  });

  ["Library", "Codex", "GPTs"].forEach(name => {
    const input = document.getElementById(`toggle-${name}`);
    const bgTrack = input.nextElementSibling;
    const knob = bgTrack.nextElementSibling;
    function updateUI(on) {
      bgTrack.style.backgroundColor = on ? "#10b981" : "#555";
      knob.style.left = on ? "22px" : "2px";
    }
    input.addEventListener("change", () => {
      state[name] = input.checked;
      saveToggles(state);
      applyToggles(state);
      updateUI(input.checked);
    });
  });

  const bg = document.getElementById("cg-bg");
  const si = document.getElementById("cg-side");
  const tx = document.getElementById("cg-text");
  const compAuto = document.getElementById("cg-composer-auto");
  const compManualWrap = document.getElementById("composer-manual-wrapper");
  const compManual = document.getElementById("cg-composer");

  function updateColors() {
    const c = {
      bg: bg.value,
      sidebar: si.value,
      text: tx.value,
      composerAuto: compAuto.checked,
      composer: compAuto.checked ? null : compManual.value
    };
    applyColors(c);
    saveColors(c);
  }

  [bg, si, tx, compManual].forEach(i =>
    i.addEventListener("input", updateColors)
  );

  compAuto.addEventListener("change", () => {
    compManualWrap.style.display = compAuto.checked ? "none" : "block";
    updateColors();
  });

  modal.querySelectorAll(".preset").forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-preset");
      const presets = {
        default: { bg: "#000000", sidebar: "#27272a", text: "#ffffff" },
        midnight: { bg: "#0d0d0f", sidebar: "#1a1a1d", text: "#d4d4d8" },
        ocean: { bg: "#001f2b", sidebar: "#004b70", text: "#cce7ff" }
      };
      const chosen = presets[preset];
      const autoComposer = deriveComposer(chosen.bg);

      bg.value = chosen.bg;
      si.value = chosen.sidebar;
      tx.value = chosen.text;

      compAuto.checked = true;
      compManualWrap.style.display = "none";

      applyColors({
        ...chosen,
        composerAuto: true,
        composer: null
      });

      saveColors({
        ...chosen,
        composerAuto: true,
        composer: null
      });
    });
  });

  applyToggles(state);
  applyColors(colors);
}

// FIX: throttle observer + guard its work (prevents timing crashes)
let scheduled = false;

const obs = new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;

  requestAnimationFrame(() => {
    scheduled = false;

    safeRun("observer", () => {
      if (!document.querySelector("nav")) return;
      insertCustomGPTButton();
      applyToggles(loadToggles());
      applyColors(loadColors());
    });
  });
});

obs.observe(document.body, { childList: true, subtree: true });

// FIX: guard startup work too
safeRun("startup", () => {
  insertCustomGPTButton();
  applyToggles(loadToggles());
  applyColors(loadColors());
});
