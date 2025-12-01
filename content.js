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
    showPanel();
  });

  wrapper.insertAdjacentElement("afterend", item);
}

function showPanel() {
  let panel = document.getElementById("customgpt-panel");
  if (panel) {
    panel.style.display = "block";
    return;
  }

  panel = document.createElement("div");
  panel.id = "customgpt-panel";
  Object.assign(panel.style, {
    position: "fixed",
    top: "80px",
    right: "20px",
    zIndex: 999999,
    background: "#222",
    padding: "20px",
    borderRadius: "12px",
    width: "260px",
    color: "white",
    boxShadow: "0 0 20px rgba(0,0,0,.4)"
  });

  panel.innerHTML = `
    <h3 style="margin:0 0 12px;">CustomGPT Settings</h3>
    <label>Background</label>
    <input id="cg-bg" type="color" style="width:100%; margin-bottom:12px;" />
    <label>Sidebar</label>
    <input id="cg-side" type="color" style="width:100%; margin-bottom:12px;" />
    <label>Text</label>
    <input id="cg-text" type="color" style="width:100%;" />
  `;

  document.body.appendChild(panel);

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

const obs = new MutationObserver(() => {
  if (document.querySelector("nav")) insertCustomGPTButton();
});
obs.observe(document.body, { childList: true, subtree: true });

insertCustomGPTButton();
