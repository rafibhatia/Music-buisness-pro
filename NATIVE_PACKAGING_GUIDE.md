# Native Desktop Packaging Guide
## How to Create `.exe`, `.dmg`, and `.deb` Installers for Music Business Pro

This guide will walk you through packaging your Music Business Pro web app as a native desktop application with downloadable installers for Windows, Mac, and Linux.

---

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager (comes with Node.js)
- **Git** (optional but recommended) - [Download here](https://git-scm.com/)
- **Code editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

**For Mac users building Mac installers:**
- Xcode Command Line Tools: Run `xcode-select --install` in Terminal

**For Windows users building Windows installers:**
- No additional requirements

---

## Part 1: Export Your Code from Figma Make

### Step 1: Download All Files

1. **Save all files from your Figma Make project** to a folder on your computer
2. Create a new folder called `music-business-pro` on your desktop
3. Copy the entire project structure into this folder

Your folder structure should look like this:

```
music-business-pro/
├── App.tsx
├── INSTALLATION.md
├── components/
├── public/
├── styles/
└── index.html
```

---

## Part 2: Set Up the Project for Electron

### Step 2: Initialize Node.js Project

Open your terminal/command prompt and navigate to your project folder:

```bash
cd ~/Desktop/music-business-pro
```

Initialize a new Node.js project:

```bash
npm init -y
```

### Step 3: Install Required Dependencies

Install Vite (build tool for React):

```bash
npm install --save-dev vite @vitejs/plugin-react
```

Install React and dependencies:

```bash
npm install react react-dom
```

Install Electron and Electron Builder:

```bash
npm install --save-dev electron electron-builder concurrently wait-on cross-env
```

Install additional dependencies your app uses:

```bash
npm install lucide-react recharts react-slick sonner@2.0.3 react-hook-form@7.55.0
```

### Step 4: Create Vite Configuration

Create a file called `vite.config.js` in your project root:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 3000,
  },
});
```

### Step 5: Create Main Entry Point

Create a file called `main.js` in your project root (this is the Electron main process):

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'public/icon-192.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    backgroundColor: '#111827',
    titleBarStyle: 'default',
    show: false,
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### Step 6: Create App Entry Point

Create a file called `src/main.tsx` (or rename your App.tsx):

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Note:** You'll need to move your existing files into a `src` folder:

```bash
mkdir src
mv App.tsx src/
mv components src/
mv styles src/
```

Update all import paths to reflect the new structure (e.g., `'./components/Dashboard'` stays the same).

### Step 7: Update package.json

Open `package.json` and update it with the following:

```json
{
  "name": "music-business-pro",
  "version": "1.0.0",
  "description": "Complete music business management application",
  "main": "main.js",
  "author": "Your Name",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron": "cross-env NODE_ENV=development electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && npm run electron\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "build": {
    "appId": "com.musicbusinesspro.app",
    "productName": "Music Business Pro",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "main.js",
      "public/**/*",
      "package.json"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "icon": "public/icon-192.png"
    },
    "mac": {
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ],
      "icon": "public/icon-192.png",
      "category": "public.app-category.business"
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        }
      ],
      "icon": "public/icon-192.png",
      "category": "Office"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### Step 8: Update index.html

Update your `index.html` to work with Vite:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Complete music business management application">
  <title>Music Business Pro - Business Manager</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

Move `index.html` to the project root (not inside `src`).

---

## Part 3: Test Your Setup

### Step 9: Test in Development Mode

Run the development server:

```bash
npm run electron:dev
```

This will:
1. Start the Vite development server
2. Open your app in an Electron window
3. Enable hot-reloading for development

**If everything works correctly, you should see your app running in a desktop window!**

---

## Part 4: Build Native Installers

### Step 10: Build for Windows (.exe installer)

```bash
npm run electron:build:win
```

**Output:** `release/Music Business Pro Setup 1.0.0.exe`

This creates a Windows installer that users can download and run.

### Step 11: Build for Mac (.dmg installer)

**Note:** Can only be built on a Mac computer.

```bash
npm run electron:build:mac
```

**Output:** `release/Music Business Pro-1.0.0.dmg` (and .app file)

This creates a Mac disk image installer.

### Step 12: Build for Linux (.deb and AppImage)

```bash
npm run electron:build:linux
```

**Output:**
- `release/Music Business Pro-1.0.0.AppImage`
- `release/Music Business Pro_1.0.0_amd64.deb`

### Step 13: Build for All Platforms

To build for all platforms at once (requires platform-specific tools):

```bash
npm run electron:build
```

**Note:** Building for Mac requires a Mac. Building for Windows can be done on Windows, Mac, or Linux with Wine.

---

## Part 5: Distribute Your Installers

### Step 14: Locate Your Installers

After building, your installers will be in the `release/` folder:

```
release/
├── Music Business Pro Setup 1.0.0.exe          (Windows)
├── Music Business Pro-1.0.0.dmg                (Mac)
├── Music Business Pro-1.0.0.AppImage           (Linux)
└── Music Business Pro_1.0.0_amd64.deb          (Linux Debian)
```

### Step 15: Share Your Installers

You can now distribute these files to users:

1. **Upload to cloud storage** (Google Drive, Dropbox, etc.)
2. **Host on your website** for download
3. **Share via email** or file transfer
4. **Publish to app stores** (requires additional setup)

Users can download and install like any normal desktop application!

---

## Troubleshooting

### "Module not found" errors

- Make sure all imports use correct paths
- Check that all dependencies are installed: `npm install`
- Verify `vite.config.js` is configured correctly

### Build fails on Windows

- Install Windows Build Tools: `npm install --global windows-build-tools`
- Run Command Prompt as Administrator

### Build fails on Mac

- Install Xcode Command Line Tools: `xcode-select --install`
- Agree to Xcode license: `sudo xcodebuild -license`

### Icon not showing

- Ensure icon files are in `public/` folder
- Icons should be PNG format (192x192 minimum)
- For better quality, create 512x512 icons
- For Windows, consider converting to `.ico` format
- For Mac, consider converting to `.icns` format

### App is too large

- Remove unused dependencies
- Optimize images
- Remove source maps from production build
- Use `asar` packaging (enabled by default)

---

## Advanced: Code Signing (Optional)

To avoid security warnings when users install:

### Windows Code Signing

1. Purchase a code signing certificate
2. Install certificate on your computer
3. Add to `package.json`:

```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "password"
}
```

### Mac Code Signing

1. Enroll in Apple Developer Program ($99/year)
2. Create signing certificates in Xcode
3. Add to `package.json`:

```json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAM_ID)"
}
```

---

## File Size Expectations

- **Windows installer**: ~150-250 MB
- **Mac installer**: ~150-250 MB  
- **Linux AppImage**: ~150-250 MB

The size includes Electron runtime and Chromium browser.

---

## Next Steps

### Auto-Updates

To add automatic updates, use `electron-updater`:

```bash
npm install electron-updater
```

Configure in `main.js` and host updates on a server.

### Custom Splash Screen

Add a splash screen while the app loads:

Create `splash.html` and load it first in `main.js`.

### Installer Customization

Customize the installer appearance:
- Add custom images
- Change installer text
- Add license agreements
- Customize install options

---

## Resources

- **Electron Documentation**: https://www.electronjs.org/docs
- **Electron Builder**: https://www.electron.build/
- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/

---

## Summary

You've now learned how to:

✅ Export your Figma Make project  
✅ Set up Electron and build tools  
✅ Package as native desktop app  
✅ Create installers for Windows, Mac, and Linux  
✅ Distribute your app to users  

**Your users can now download a `.exe`, `.dmg`, or `.deb` file and install Music Business Pro just like any other desktop application!**

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Development (with hot reload)
npm run electron:dev

# Build for Windows
npm run electron:build:win

# Build for Mac
npm run electron:build:mac

# Build for Linux
npm run electron:build:linux

# Build for all platforms
npm run electron:build
```

Good luck with your native desktop app! 🚀
