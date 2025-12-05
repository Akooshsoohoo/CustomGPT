console.log("customGPT loaded (native-clone)");

const NATIVE_ITEM_HTML = `
<a tabindex="0" data-fill="" class="group __menu-item hoverable gap-1.5" data-sidebar-item="true">
  <div class="flex items-center justify-center group-disabled:opacity-50 group-data-disabled:opacity-50 icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
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
  if (!wrapper) return;

  const temp = document.createElement("div");
  temp.innerHTML = NATIVE_ITEM_HTML.trim();
  const item = temp.firstElementChild;
  item.setAttribute("data-customgpt", "1");
  item.removeAttribute("href");

  item.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    window.location.hash = "#customgpt";
  });

  wrapper.insertAdjacentElement("afterend", item);
}

function renderCustomGPTPage() {
  const existing = document.getElementById("customgpt-page");
  if (existing) {
    existing.style.display = "block";
    return;
  }

  const main = document.querySelector("main") || document.querySelector('[role="presentation"]');
  if (!main) return;

  const page = document.createElement("div");
  page.id = "customgpt-page";
  Object.assign(page.style, {
    color: "var(--text-primary, #e4e4e7)",
    padding: "48px 64px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "system-ui, sans-serif"
  });

  page.innerHTML = `
    <h1 style="font-size:1.75rem; font-weight:600; margin-bottom:1rem;">CustomGPT Settings</h1>
    <p style="margin-bottom:2rem; color:var(--text-secondary,#a1a1aa);">
      Configure appearance and behavior for your CustomGPT extension.
    </p>
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <div>
        <label style="display:block; margin-bottom:6px;">Background color</label>
        <input id="cg-bg" type="color" style="width:100%; height:36px; background:#1e1e20; border:none; border-radius:6px;" />
      </div>
      <div>
        <label style="display:block; margin-bottom:6px;">Sidebar color</label>
        <input id="cg-side" type="color" style="width:100%; height:36px; background:#1e1e20; border:none; border-radius:6px;" />
      </div>
      <div>
        <label style="display:block; margin-bottom:6px;">Text color</label>
        <input id="cg-text" type="color" style="width:100%; height:36px; background:#1e1e20; border:none; border-radius:6px;" />
      </div>
    </div>
  `;

  main.innerHTML = "";
  main.appendChild(page);

  const bg = document.getElementById("cg-bg");
  const si = document.getElementById("cg-side");
  const tx = document.getElementById("cg-text");

  function apply() {
    document.body.style.backgroundColor = bg.value;
    const sidebar = document.querySelector("nav");
    if (sidebar) sidebar.style.backgroundColor = si.value;
    document.body.style.color = tx.value;
  }

  [bg, si, tx].forEach(i => i.addEventListener("input", apply));
}

window.addEventListener("hashchange", () => {
  const page = document.getElementById("customgpt-page");
  if (window.location.hash === "#customgpt") {
    renderCustomGPTPage();
  } else if (page) {
    page.style.display = "none";
  }
});

const obs = new MutationObserver(() => {
  if (document.querySelector("nav")) insertCustomGPTButton();
});
obs.observe(document.body, { childList: true, subtree: true });

insertCustomGPTButton();
