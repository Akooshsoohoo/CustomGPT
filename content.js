console.log("customGPT loaded (native-clone)");

// ====== the exact HTML template you provided ======
const NATIVE_ITEM_HTML = `
<a tabindex="0" data-fill="" class="group __menu-item hoverable gap-1.5" data-sidebar-item="true">
  <div class="flex items-center justify-center group-disabled:opacity-50 group-data-disabled:opacity-50 icon">
    <!-- no icon for CustomGPT Settings -->
  </div>
  <div class="flex min-w-0 grow items-center gap-2.5">
    <div class="truncate">CustomGPT Settings</div>
  </div>
</a>
`;

// ===== Insert native-style sidebar button =====
function insertCustomGPTButton() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  // Already inserted?
  if (nav.querySelector("[data-customgpt]")) return;

  // Find “Projects” header text node
  const projects = [...nav.querySelectorAll("*")].find(
    el => el.textContent.trim() === "Projects"
  );
  if (!projects) return;

  const section = projects.closest("div");
  if (!section) return;

  // Convert native HTML → element
  const temp = document.createElement("div");
  temp.innerHTML = NATIVE_ITEM_HTML.trim();
  const item = temp.firstElementChild;

  // tag to find later
  item.setAttribute("data-customgpt", "1");

  // Disable navigation
  item.removeAttribute("href");
  item.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    showPanel();
  });

  // Insert just UNDER the “Projects” header
  // Find first project item under this header and insert before it
  let inserted = false;
  for (const child of section.children) {
    if (child !== projects && child.matches('[data-sidebar-item="true"]')) {
      section.insertBefore(item, child);
      inserted = true;
      break;
    }
  }

  if (!inserted) section.appendChild(item);
}

// ===== Settings Panel =====
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

// ===== Watch for rerenders & insert whenever needed =====
const obs = new MutationObserver(() => {
  if (document.querySelector("nav")) insertCustomGPTButton();
});
obs.observe(document.body, { childList: true, subtree: true });

// Attempt immediately on load
insertCustomGPTButton();
