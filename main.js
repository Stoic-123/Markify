const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";
function createWindow() {
  const win = new BrowserWindow({
    title: "Markify",
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "assets", "logo.ico"),
    webPreferences: {
      nodeIntegration: true, // true security risk a bit but false we need a file preload.js
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "client", "dist", "index.html"));
  }
}
// App is ready
app.whenReady().then(() => {
  createWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
// Menu Template

const menu = [
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "Help",
            },
          ],
        },
      ]
    : []),
];

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
