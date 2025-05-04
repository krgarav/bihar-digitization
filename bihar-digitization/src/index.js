const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
// Import the Express app and startServer function
const { app: expressApp, startServer } = require("./server");
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Vite dev or dist
  // if (process.env.NODE_ENV === "development") {
  win.loadURL("http://localhost:5173").catch((err) => {
    console.error("Failed to load Vite dev server:", err);
  });
  win.webContents.openDevTools();
  // } else {
  //   win.loadFile("dist/index.html");
  // }
}

// Start Electron app
app.whenReady().then(async () => {
  // Start the Express server before opening the window
  // Start the backend server
  await startServer();

  // Start Express listening on port (only after DB sync)
  expressApp.listen(4000, () => {
    console.log("Express server running on http://localhost:4000");
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// IPC: return list of image paths from Documents
ipcMain.handle("get-images", async () => {
  const dir = path.join(os.homedir(), "Documents", "images");
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

  try {
    const files = fs.readdirSync(dir);
    const imageFiles = files.filter((file) =>
      validExtensions.includes(path.extname(file).toLowerCase())
    );

    const base64Images = imageFiles.map((filename) => {
      const filePath = path.join(dir, filename);
      const ext = path.extname(filename).substring(1); // remove dot
      const base64 = fs.readFileSync(filePath).toString("base64");
      return {
        name: filename,
        src: `data:image/${ext};base64,${base64}`,
      };
    });

    return base64Images;
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("get-done-pdfs", async () => {
  const dir = path.join(os.homedir(), "Documents", "images", "done");
  const validExtensions = [".pdf"];

  try {
    const files = fs.readdirSync(dir);
    const pdfFiles = files.filter((file) =>
      validExtensions.includes(path.extname(file).toLowerCase())
    );

    const base64Pdfs = pdfFiles.map((filename) => {
      const filePath = path.join(dir, filename);
      const base64 = fs.readFileSync(filePath).toString("base64");
      return {
        name: filename,
        src: `data:application/pdf;base64,${base64}`,
      };
    });

    return base64Pdfs;
  } catch (err) {
    return { error: err.message };
  }
});

// ipcMain.handle("get-image-list", async () => {
//   const dir = path.join(os.homedir(), "Documents", "images");
//   const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
//   const files = fs.readdirSync(dir);
//   const imageFiles = files.filter(file =>
//     validExtensions.includes(path.extname(file).toLowerCase())
//   );
//   return imageFiles; // just names
// });

ipcMain.handle("get-image-list", async (event, offset = 0, limit = 50) => {
  const dir = path.join(os.homedir(), "Documents", "images");
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  const files = fs.readdirSync(dir);

  const imageFiles = files
    .filter((file) =>
      validExtensions.includes(path.extname(file).toLowerCase())
    )
    .slice(offset, offset + limit);

  return imageFiles.map((name) => ({
    name,
    src: `http://localhost:4000/thumbnail/${encodeURIComponent(name)}`, // or another thumbnail endpoint
  }));
});

ipcMain.handle("search-images", async (event, query) => {
  const dir = path.join(os.homedir(), "Documents", "images");
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

  try {
    const files = fs.readdirSync(dir);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return (
        validExtensions.includes(ext) &&
        file.toLowerCase().includes(query.toLowerCase())
      );
    });

    return imageFiles; // Only names, not base64 or thumbnails
  } catch (err) {
    return { error: err.message };
  }
});
