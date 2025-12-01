console.log("customGPT loaded");

// Create a floating panel
const panel = document.createElement("div");
panel.id = "customgpt-panel";
panel.innerHTML = `
  <h3 style="margin:0 0 8px;">customGPT</h3>

  <label>Background</label>
  <input id="bg-color" type="color" />

  <label>Sidebar</label>
  <input id="sidebar-color" type="color" />

  <label>Text</label>
  <input id="text-color" type="color" />
`;
document.body.appendChild(panel);

// Background listener
document.getElementById("bg-color").addEventListener("input", (e) => {
  document.body.style.backgroundColor = e.target.value;
});

// Sidebar listener (ChatGPT uses <nav>)
document.getElementById("sidebar-color").addEventListener("input", (e) => {
  const sidebar = document.querySelector("nav");
  if (sidebar) {
    sidebar.style.backgroundColor = e.target.value;
  }
});

// Text listener
document.getElementById("text-color").addEventListener("input", (e) => {
  document.body.style.color = e.target.value;
  document.querySelectorAll("*").forEach(el => {
    el.style.color = e.target.value;
  });
});
