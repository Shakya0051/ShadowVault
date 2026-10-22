# ◈ ShadowVault — Private File Management Dashboard

**Your secrets. Your space.**

ShadowVault is a privacy-focused file management web application that allows users to organize files, create folders, manage personal notes, and access their content through a modern dashboard. It features a sleek dark interface, password-protected access, and browser-based file storage.

## ✨ Features

- 🔐 **Password-Protected Access** — Access your vault through a password screen.
- 📁 **File Management** — Upload, preview, download, and organize files.
- 🗂️ **Folder Management** — Create folders to organize your content.
- 📝 **Private Notes** — Create and manage personal notes.
- 🔍 **Search Functionality** — Find files and folders quickly.
- 🗑️ **Trash Management** — Restore deleted items or permanently delete them.
- 🕒 **Recent Files** — Access recently used items.
- 🎨 **Dark & Light Themes** — Switch between different visual themes.
- 📱 **Responsive Design** — Use the dashboard on desktop and mobile screens.
- 💾 **Local Browser Storage** — Store file contents locally using IndexedDB and application metadata using LocalStorage.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling, animations, and responsive layout |
| JavaScript | Application logic and interactions |
| IndexedDB | Local storage for file contents |
| LocalStorage | Application metadata and preferences |
| VS Code Live Server | Local development and testing |

## 📂 Project Structure

```text
ShadowVault/
├── index.html       # Main application interface
├── style.css        # Styling and responsive design
├── script.js        # Application logic and file handling
└── README.md        # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser such as Chrome, Edge, or Firefox.
- Visual Studio Code.
- The Live Server extension for VS Code (recommended).

### Installation

**1. Clone the repository**

```App
https://shadowvault-t8zy.vercel.app/
```

Replace `https://github.com/Shakya0051/ShadowVault` with your actual repository URL.

**2. Open the project**

Open the `ShadowVault` folder in Visual Studio Code.

**3. Check the files**

Make sure `index.html`, `style.css`, and `script.js` are in the same directory.

**4. Run the application**

- Open `index.html` in VS Code.
- Right-click inside the editor.
- Select **Open with Live Server**.

The application should open in your browser.

## 💻 How to Use

1. Open ShadowVault in your browser.
2. Create or enter your vault password, depending on the current password setup.
3. Upload files using the upload buttons.
4. Create folders to organize your content.
5. Add personal notes when needed.
6. Use the search bar to locate items.
7. Preview or download supported files.
8. Manage deleted items through the Trash section.
9. Change the theme or lock your vault using the dashboard controls.

*Available actions depend on the features implemented in the current version of `script.js`.*

## 💾 Data Storage

ShadowVault uses browser-based storage:

- **IndexedDB:** Stores uploaded file contents.
- **LocalStorage:** Stores application metadata and preferences.

Data is generally kept within the browser profile on the device where it was created. It does not automatically synchronize with other devices or a cloud database.

**Important:** Clearing browser site data may delete stored files. Export or back up important files separately.

## 🔒 Security Notice

ShadowVault is a personal project demonstrating browser-based file management and password-gated access.

The password screen alone does not provide strong data security. Unless encryption and secure authentication are implemented, stored data should not be considered encrypted or protected against someone with access to the browser profile or developer tools.

Do not store highly sensitive documents in this version.

## 🌐 Deployment

ShadowVault can be hosted using static website hosting services such as:

- GitHub Pages
- Vercel
- Netlify

To deploy, upload the project files to your repository and configure the hosting service to serve `index.html` from the correct directory.

**Note:** Deployment does not automatically add cloud storage, account authentication, or cross-device synchronization.

## 🔮 Future Improvements

- Client-side encryption for stored files.
- Secure user authentication.
- Cloud backup and synchronization.
- File sharing with access controls.
- Storage usage visualization.
- Improved file filtering and sorting.
- Progressive Web App (PWA) support.

## 🎯 Project Objective

The objective of ShadowVault is to create a clean, responsive, and easy-to-use file management experience while exploring frontend development, browser storage, UI design, and application state management.

## 👨‍💻 Author

**Your Name**

GitHub: [https://github.com/shakya0051](https://github.com/Shakya0051/ShadowVault)

---

If you find this project useful, consider giving the repository a ⭐.

*Built with HTML, CSS, and JavaScript.*
