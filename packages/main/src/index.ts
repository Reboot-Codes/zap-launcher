import {app, BrowserWindow, shell} from 'electron';
import {join} from 'path';
import { URL } from 'url';
import os from 'os';

const homedir = os.homedir();
const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

app.disableHardwareAcceleration();

// Install "React Dev Tools"
if (import.meta.env.MODE === 'development') {
  app.whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({default: installExtension, REACT_DEVELOPER_TOOLS}) => installExtension(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    }))
    .catch(e => console.error('Failed install extension:', e));
}

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window, or else it'll look weird while vite loads
    frame: false, // No window controls, this uses keyboard shortcuts
    transparent: true,
    vibrancy: 'hud', // macOS requirement
    visualEffectState: 'active',
    roundedCorners: false,
    hasShadow: true,
    movable: false,
    resizable: false,
    height: 75,
    alwaysOnTop: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  });

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();

    /* if (import.meta.env.MODE === 'development') {
      mainWindow?.webContents.openDevTools(); <- That's annoying
    } */

    console.info(process.env.APPDATA || (process.platform == 'darwin' ? homedir + '/Library/Preferences' : homedir + "/.local/share"))
  });

  /**
   * External hyperlinks open in the default browser.
   *
   * @see https://stackoverflow.com/a/67409223
   */
   mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl = import.meta.env.MODE === 'development' && import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();


  await mainWindow.loadURL(pageUrl);
};


app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});


app.on('window-all-closed', () => {
  /* if (process.platform !== 'darwin') {
    app.quit(); <- Nope, this should run in the background; without any windows until called from a keyboard shortcut.
  } */
});


app.whenReady()
  .then(createWindow)
  .catch((e) => console.error('Failed create window:', e));


// Auto-updates
if (import.meta.env.PROD) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e));
}

