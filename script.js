
"use strict";

/* =========================================
   SHADOWVAULT - JAVASCRIPT
   Front-end prototype, not secure storage.
========================================= */

const $ = selector => document.querySelector(selector);

const DATA_KEY = "shadowvault_data_v2";
const PASSWORD_KEY = "shadowvault_custom_password";
const THEME_KEY = "shadowvault_theme";

const STARTER_ITEMS = [
  { id: "folder-1", name: "Personal", type: "folder", updatedAt: Date.now() },
  { id: "folder-2", name: "College", type: "folder", updatedAt: Date.now() },
  { id: "folder-3", name: "Projects", type: "folder", updatedAt: Date.now() },
  { id: "folder-4", name: "Private Notes", type: "folder", updatedAt: Date.now() }
];

let items = loadItems();
let currentView = "Dashboard";
let activeItemId = null;
let listMode = false;
let toastTimer;
let drawerMode = "";

/* ---------- INITIAL DATA ---------- */

function loadItems() {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (!saved) return STARTER_ITEMS.map(item => ({ ...item }));

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : STARTER_ITEMS.map(item => ({ ...item }));
  } catch {
    return STARTER_ITEMS.map(item => ({ ...item }));
  }
}

function saveItems() {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(items));
    return true;
  } catch {
    showToast("Browser storage is full. Changes may not be saved.");
    return false;
  }
}

function getPassword() {
  return localStorage.getItem(PASSWORD_KEY);
}

function setPassword(password) {
  try {
    localStorage.setItem(PASSWORD_KEY, password);
    return true;
  } catch {
    return false;
  }
}

function makeId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ---------- GENERAL HELPERS ---------- */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getIcon(item) {
  if (item.type === "folder") return "📁";
  if (item.type === "note") return "📝";

  const ext = item.name.split(".").pop().toLowerCase();

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "🖼️";
  if (ext === "pdf") return "📕";
  if (["doc", "docx"].includes(ext)) return "📘";
  if (["zip", "rar", "7z"].includes(ext)) return "🗜️";
  if (["txt", "md"].includes(ext)) return "📄";
  if (["js", "html", "css", "py"].includes(ext)) return "💻";

  return "📦";
}

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function setActiveNav() {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === currentView);
  });
}

/* ---------- PASSWORD LOCK ---------- */

function lockVault() {
  closeDrawer();
  $("#sidebar").classList.remove("open");
  $("#overlay").classList.remove("show");

  $("#app").hidden = true;
  $("#lockScreen").style.display = "grid";
  $("#lockScreen").classList.remove("hidden");
  $("#lockError").textContent = "";
  $("#vaultPassword").value = "";

  setTimeout(() => $("#vaultPassword").focus(), 50);
}

function unlockVault(password) {
  if (password !== getPassword()) {
    $("#lockError").textContent = "Incorrect password. Please try again.";
    $("#vaultPassword").value = "";
    $("#vaultPassword").focus();
    return false;
  }

  $("#lockError").textContent = "";
  $("#vaultPassword").value = "";
  $("#lockScreen").classList.add("hidden");
  $("#app").hidden = false;

  setTimeout(() => {
    $("#lockScreen").style.display = "none";
  }, 450);

  return true;
}

function initializePassword() {
  // First-time setup: choose a password instead of using a hardcoded default.
  if (getPassword()) {
    $("#lockScreen").style.display = "grid";
    $("#app").hidden = true;
    return;
  }

  $("#lockScreen").innerHTML = `
    <div class="lock-card">
      <div class="brand-mark">◈</div>
      <h1>Shadow<span>Vault</span></h1>
      <p class="subtitle">Create your vault password.</p>
      <form id="setupPasswordForm">
        <label for="setupPassword">Create password (8+ characters)</label>
        <input id="setupPassword" type="password"
          minlength="8" autocomplete="new-password" required>
        <label for="setupPasswordConfirm">Confirm password</label>
        <input id="setupPasswordConfirm" type="password"
          minlength="8" autocomplete="new-password" required>
        <p id="setupError" class="error" role="alert"></p>
        <button class="primary-btn full-width" type="submit">
          Create vault →
        </button>
      </form>
      <p class="lock-footer">Choose a password you can remember.</p>
    </div>
  `;

  $("#app").hidden = true;

  $("#setupPasswordForm").addEventListener("submit", event => {
    event.preventDefault();

    const password = $("#setupPassword").value;
    const confirmation = $("#setupPasswordConfirm").value;

    if (password.length < 8) {
      $("#setupError").textContent = "Use at least 8 characters.";
      return;
    }

    if (password !== confirmation) {
      $("#setupError").textContent = "Passwords do not match.";
      return;
    }

    if (!setPassword(password)) {
      $("#setupError").textContent = "Could not save your password.";
      return;
    }

    showToast("Vault password created.");
    $("#lockScreen").innerHTML = `
      <div class="lock-card">
        <div class="brand-mark">◈</div>
        <h1>Shadow<span>Vault</span></h1>
        <p class="subtitle">Your secrets. Your space.</p>
        <div class="lock-badge">🔒 PRIVATE VAULT</div>
        <form id="unlockForm">
          <label for="vaultPassword">Vault password</label>
          <input id="vaultPassword" type="password"
            autocomplete="current-password" required autofocus>
          <p id="lockError" class="error" role="alert"></p>
          <button class="primary-btn full-width" type="submit">
            Unlock my vault →
          </button>
        </form>
        <p class="lock-footer">Your private space awaits.</p>
      </div>
    `;

    connectUnlockForm();
    $("#vaultPassword").focus();
  });
}

function connectUnlockForm() {
  const form = $("#unlockForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    unlockVault($("#vaultPassword").value);
  });
}

/* ---------- STATISTICS AND DASHBOARD ---------- */

function updateStats() {
  $("#fileCount").textContent =
    items.filter(item => item.type !== "folder" && !item.deleted).length;

  $("#folderCount").textContent =
    items.filter(item => item.type === "folder" && !item.deleted).length;
}

function render() {
  updateStats();

  const query = $("#searchInput").value.trim().toLowerCase();
  let visibleItems = items.filter(item => !item.deleted);

  if (currentView === "Files") {
    visibleItems = visibleItems.filter(item => item.type !== "folder");
  } else if (currentView === "Folders") {
    visibleItems = visibleItems.filter(item => item.type === "folder");
  } else if (currentView === "Recent") {
    visibleItems = visibleItems
      .filter(item => item.type !== "folder")
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } else if (currentView === "Trash") {
    visibleItems = items.filter(item => item.deleted);
  } else if (currentView === "Settings") {
    visibleItems = [];
  }

  if (query) {
    visibleItems = visibleItems.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  }

  $("#viewTitle").textContent = query
    ? "Search results"
    : currentView === "Dashboard" ? "Your vault" : currentView;

  $("#viewDescription").textContent = query
    ? `Results matching "${query}"`
    : currentView === "Trash"
      ? "Items you've moved to the trash."
      : currentView === "Settings"
        ? "Manage your password and preferences."
        : "Your files and folders, all in one place.";

  if (currentView === "Settings" && !query) {
    $("#itemGrid").innerHTML = `
      <article class="item-card">
        <div class="item-top"><span class="item-icon">🔐</span></div>
        <span class="item-name">Password management</span>
        <span class="item-meta">Change your vault password.</span>
        <button class="primary-btn settings-password-btn" style="margin-top:18px">
          Change password
        </button>
      </article>
      <article class="item-card">
        <div class="item-top"><span class="item-icon">☼</span></div>
        <span class="item-name">Appearance</span>
        <span class="item-meta">Toggle light and dark themes using the top button.</span>
      </article>
      <article class="item-card">
        <div class="item-top"><span class="item-icon">🔒</span></div>
        <span class="item-name">Lock vault</span>
        <span class="item-meta">Return to the password screen.</span>
        <button class="primary-btn settings-lock-btn" style="margin-top:18px">
          Lock now
        </button>
      </article>
    `;
  } else {
    $("#itemGrid").innerHTML = visibleItems.map(item => `
      <article class="item-card" data-id="${escapeHTML(item.id)}">
        <div class="item-top">
          <span class="item-icon">${getIcon(item)}</span>
          <button class="item-menu" data-action="menu"
            data-id="${escapeHTML(item.id)}" aria-label="Item options">⋯</button>
        </div>
        <span class="item-name">${escapeHTML(item.name)}</span>
        <span class="item-meta">${
          item.type === "folder"
            ? `${items.filter(child => child.parentId === item.id && !child.deleted).length} items`
            : item.type === "note"
              ? "Private note · Browser storage"
              : formatSize(item.size)
        }</span>
      </article>
    `).join("");
  }

  $("#itemGrid").classList.toggle("list-view", listMode);
  $("#viewToggle").textContent = listMode ? "▦ Grid" : "☷ List";

  $("#emptyState").hidden = visibleItems.length > 0 ||
    (currentView === "Settings" && !query);

  if (currentView === "Settings" && !query) {
    $(".settings-password-btn").addEventListener("click", showPasswordForm);
    $(".settings-lock-btn").addEventListener("click", lockVault);
  }
}

/* ---------- SLIDING DRAWER ---------- */

function openDrawer(id) {
  const item = items.find(entry => entry.id === id);
  if (!item) return;

  activeItemId = id;
  drawerMode = "item";

  $("#drawerContent").innerHTML = `
    <div class="drawer-icon">${getIcon(item)}</div>
    <h2>${escapeHTML(item.name)}</h2>
    <p>${item.type === "folder" ? "Folder" : item.type === "note" ? "Text note" : "File"}</p>
    <p>${item.type === "folder"
      ? "Organize related files together."
      : item.type === "note"
        ? "This note is saved in your browser."
        : `Size: ${formatSize(item.size)}`}</p>

    ${item.type === "note" ? `
      <div style="white-space:pre-wrap;overflow-wrap:anywhere">
        ${escapeHTML(item.content || "")}
      </div>` : ""}

    <div class="drawer-actions">
      ${item.type === "file" ? `
        <button data-action="open" data-id="${escapeHTML(id)}">↗ Open file</button>
        <button data-action="download" data-id="${escapeHTML(id)}">↓ Download file record</button>` : ""}

      ${item.type === "note" ? `
        <button data-action="edit" data-id="${escapeHTML(id)}">✎ Edit note</button>
        <button data-action="download" data-id="${escapeHTML(id)}">↓ Download note</button>` : ""}

      ${item.deleted ? `
        <button data-action="restore" data-id="${escapeHTML(id)}">↶ Restore</button>
        <button class="danger" data-action="permanent" data-id="${escapeHTML(id)}">Delete permanently</button>` : `
        <button data-action="rename" data-id="${escapeHTML(id)}">✎ Rename</button>
        <button class="danger" data-action="delete" data-id="${escapeHTML(id)}">♲ Move to trash</button>`}
    </div>
  `;

  $("#drawer").classList.add("open");
  $("#overlay").classList.add("show");
}

function closeDrawer() {
  $("#drawer").classList.remove("open");
  $("#overlay").classList.remove("show");
  activeItemId = null;
  drawerMode = "";
}

/* ---------- CHANGE PASSWORD ---------- */

function showPasswordForm() {
  drawerMode = "password";
  activeItemId = null;

  $("#drawerContent").innerHTML = `
    <div class="drawer-icon">🔐</div>
    <h2>Change password</h2>
    <p>Verify your current password before setting a new one.</p>

    <form id="changePasswordForm" class="password-form">
      <label for="currentPassword">Current password</label>
      <input id="currentPassword" type="password"
        autocomplete="current-password" required>

      <label for="newPassword">New password</label>
      <input id="newPassword" type="password"
        autocomplete="new-password" minlength="8" required>

      <label for="confirmPassword">Confirm new password</label>
      <input id="confirmPassword" type="password"
        autocomplete="new-password" minlength="8" required>

      <p id="passwordMessage" class="form-message" role="status"></p>

      <button class="primary-btn full-width" type="submit">
        Save new password →
      </button>
    </form>
  `;

  $("#drawer").classList.add("open");
  $("#overlay").classList.add("show");

  $("#changePasswordForm").addEventListener("submit", event => {
    event.preventDefault();

    const current = $("#currentPassword").value;
    const next = $("#newPassword").value;
    const confirm = $("#confirmPassword").value;
    const message = $("#passwordMessage");

    message.className = "form-message error";

    if (current !== getPassword()) {
      message.textContent = "Your current password is incorrect.";
      return;
    }

    if (next.length < 8) {
      message.textContent = "Use at least 8 characters.";
      return;
    }

    if (next === current) {
      message.textContent = "Choose a different password.";
      return;
    }

    if (next !== confirm) {
      message.textContent = "The new passwords do not match.";
      return;
    }

    if (!setPassword(next)) {
      message.textContent = "Could not save the password in this browser.";
      return;
    }

    closeDrawer();
    showToast("Vault password changed.");
  });
}

/* ---------- CREATE ITEMS ---------- */

function addFolder() {
  const name = prompt("Enter a name for your new folder:");
  if (!name || !name.trim()) return;

  items.push({
    id: makeId(),
    name: name.trim(),
    type: "folder",
    updatedAt: Date.now()
  });

  saveItems();
  currentView = "Folders";
  setActiveNav();
  render();
  showToast("Folder created.");
}

function addNote() {
  const name = prompt("Give your note a title:");
  if (!name || !name.trim()) return;

  const content = prompt("Write your note:");
  if (content === null) return;

  const note = {
    id: makeId(),
    name: name.trim(),
    type: "note",
    content,
    updatedAt: Date.now()
  };

  items.push(note);
  saveItems();
  currentView = "Files";
  setActiveNav();
  render();
  openDrawer(note.id);
  showToast("Note saved in browser storage.");
}

function addFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) return;

  files.forEach(file => {
    items.push({
      id: makeId(),
      name: file.name,
      type: "file",
      size: file.size,
      mime: file.type,
      updatedAt: Date.now()
    });
  });

  saveItems();
  currentView = "Files";
  setActiveNav();
  render();

  showToast(`${files.length} file(s) added to the list.`);
}

/* ---------- ITEM ACTIONS ---------- */

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function handleAction(action, id) {
  const item = items.find(entry => entry.id === id);
  if (!item) return;

  if (action === "menu") {
    openDrawer(id);
    return;
  }

  if (action === "rename") {
    const name = prompt("Enter a new name:", item.name);
    if (!name || !name.trim()) return;
    item.name = name.trim();
    item.updatedAt = Date.now();
  } else if (action === "delete") {
    item.deleted = true;
    item.updatedAt = Date.now();
    closeDrawer();
    showToast("Moved to trash.");
  } else if (action === "restore") {
    item.deleted = false;
    item.updatedAt = Date.now();
    closeDrawer();
    showToast("Item restored.");
  } else if (action === "permanent") {
    if (!confirm("Permanently remove this item from the demo list?")) return;

    items = items.filter(entry => entry.id !== id);
    closeDrawer();
    showToast("Item removed.");
  } else if (action === "edit" && item.type === "note") {
    const content = prompt("Edit your note:", item.content || "");
    if (content === null) return;

    item.content = content;
    item.updatedAt = Date.now();
    showToast("Note updated.");
  } else if (action === "download") {
    if (item.type === "note") {
      downloadText(`${item.name}.txt`, item.content || "");
    } else {
      downloadText(`${item.name}-record.txt`,
        `Name: ${item.name}\nType: ${item.type}\nSize: ${formatSize(item.size)}`);
    }
    return;
  } else if (action === "open" && item.type === "file") {
    showToast("The original file is not stored by this prototype.");
    return;
  }

  saveItems();
  render();
}

/* ---------- EVENT LISTENERS ---------- */

$("#uploadBtn").addEventListener("click", () => $("#fileInput").click());
$("#heroUpload").addEventListener("click", () => $("#fileInput").click());

$("#fileInput").addEventListener("change", event => {
  addFiles(event.target.files);
  event.target.value = "";
});

$("#folderBtn").addEventListener("click", addFolder);
$("#noteBtn").addEventListener("click", addNote);
$("#emptyAddBtn").addEventListener("click", addFolder);

$("#searchInput").addEventListener("input", render);

$("#viewToggle").addEventListener("click", () => {
  listMode = !listMode;
  render();
});

$("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");

  try {
    localStorage.setItem(
      THEME_KEY,
      document.body.classList.contains("light") ? "light" : "dark"
    );
  } catch {}
});

$("#lockBtn").addEventListener("click", lockVault);
$("#menuBtn").addEventListener("click", () => {
  $("#sidebar").classList.add("open");
  $("#overlay").classList.add("show");
});

$("#closeDrawer").addEventListener("click", closeDrawer);
$("#backBtn").addEventListener("click", closeDrawer);

$("#overlay").addEventListener("click", () => {
  closeDrawer();
  $("#sidebar").classList.remove("open");
  $("#overlay").classList.remove("show");
});

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    currentView = button.dataset.view;
    setActiveNav();
    $("#searchInput").value = "";
    render();

    $("#sidebar").classList.remove("open");
    $("#overlay").classList.remove("show");
  });
});

$("#itemGrid").addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");

  if (actionButton) {
    handleAction(actionButton.dataset.action, actionButton.dataset.id);
    return;
  }

  if (event.target.closest("button")) return;

  const card = event.target.closest("[data-id]");
  if (card) openDrawer(card.dataset.id);
});

$("#drawerContent").addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (button) handleAction(button.dataset.action, button.dataset.id);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeDrawer();
    $("#sidebar").classList.remove("open");
    $("#overlay").classList.remove("show");
  }

  if (event.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $("#searchInput").focus();
  }
});

/* ---------- START APPLICATION ---------- */

try {
  if (localStorage.getItem(THEME_KEY) === "light") {
    document.body.classList.add("light");
  }
} catch {}

initializePassword();
connectUnlockForm();
render();
