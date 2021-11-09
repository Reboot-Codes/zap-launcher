import { app, BrowserWindow, shell, globalShortcut } from 'electron';
import {join} from 'path';
import { URL } from 'url';
import os from 'os';

const homedir = os.homedir();
const isSingleInstance = app.requestSingleInstanceLock();

// Hide the dock icon on macOS
app.dock.hide()

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
    height: 70,
    alwaysOnTop: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  });
  mainWindow?.setPosition(mainWindow?.getPosition()[0], mainWindow?.getPosition()[1] - 210, false);
  mainWindow?.setSkipTaskbar(true);

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and the listener event: `ready-to-show`, to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();

    /* if (import.meta.env.MODE === 'development') {
      mainWindow?.webContents.openDevTools(); <- That's annoying
    } */
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

app.on('ready', () => console.info(process.env.APPDATA || (process.platform == 'darwin' ? homedir + '/Library/Preferences' : homedir + "/.local/share")))

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



app.whenReady().then(() => {
  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('Alt+Space', () => {
    console.log('Alt+Space is pressed')

    if (mainWindow !== null) {
      app.hide();
      mainWindow.destroy();
      mainWindow = null;
      console.log('Closed Box')
    } else if (mainWindow === null) {
      createWindow().then(() => {
          mainWindow?.focus();
          console.log('Opened Box')
      });
    }
  })

  if (!ret) {
    console.error('Failed to Register Global Shortcut!')
    app.exit(1);
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('Alt+Space'))
})

app.whenReady().then(() => {
  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('Control+Alt+Shift+Q', () => {
    console.log('Control+Alt+Shift+Q is pressed')
    app.quit();
    app.exit(0);
  })

  if (!ret) {
    console.error('Failed to Register Global Shortcut!')
    app.exit(1);
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('Control+Alt+Shift+Q'))
})
