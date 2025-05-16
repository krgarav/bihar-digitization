const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  dialog,
  nativeTheme,
} = require("electron");
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
      enableBlinkFeatures: "CSSColorAdjust",
    },
  });
  nativeTheme.themeSource = "dark";
  // Vite dev or dist
  win.webContents.session.clearStorageData({
    storages: ["localstorage"],
  });
  // if (process.env.NODE_ENV === "development") {
  win.loadURL("http://localhost:4000").catch((err) => {
    console.error("Failed to load Vite dev server:", err);
  });
  win.webContents.openDevTools();
  Menu.setApplicationMenu(null);
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

ipcMain.handle("get-image-list", async (event, offset = 0, limit = 50, dir) => {
  try {
    if (!dir) {
      throw new Error("Directory path is required.");
    }

    // Normalize the directory path (convert backslashes to slashes)
    const normalizedDir = path.normalize(decodeURIComponent(dir));

    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

    if (!fs.existsSync(normalizedDir)) {
      fs.mkdirSync(normalizedDir, { recursive: true });
    }

    const files = await fs.promises.readdir(normalizedDir);

    const imageFiles = files
      .filter((file) =>
        validExtensions.includes(path.extname(file).toLowerCase())
      )
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
      );

    const pagedFiles = imageFiles.slice(offset, offset + limit);
    const encodedDir = encodeURIComponent(normalizedDir);

    return pagedFiles.map((name) => ({
      name,
      src: `http://localhost:4000/thumbnail/${name}?dir=${encodedDir}`,
    }));
  } catch (err) {
    console.error("Failed to list image files:", err);
    return [];
  }
});

ipcMain.handle("search-images", async (event, query, dirName) => {
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

  const scoreMatch = (filename, query) => {
    const name = path.parse(filename).name.toLowerCase();
    query = query.toLowerCase();
    let score = 0;

    if (name === query) return 999;

    // Add basic fuzzy scoring
    for (let char of query) {
      if (name.includes(char)) score++;
    }

    if (name.includes(query)) score += 5;

    return score;
  };

  try {
    if (!fs.existsSync(dirName)) {
      throw new Error(`Directory does not exist: ${dirName}`);
    }

    const files = fs.readdirSync(dirName);

    const imageFiles = files
      .filter((file) =>
        validExtensions.includes(path.extname(file).toLowerCase())
      )
      .map((file) => ({
        name: file,
        score: scoreMatch(file, query),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.name);

    return imageFiles;
  } catch (err) {
    console.error("Error in search-images:", err.message);
    return { error: err.message };
  }
});

ipcMain.handle("get-done-image-list", async () => {
  const dir = path.join(os.homedir(), "Documents", "images", "done");
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  const files = fs.readdirSync(dir);
  const imageFiles = files.filter((file) =>
    validExtensions.includes(path.extname(file).toLowerCase())
  );
  return imageFiles; // just names
});

ipcMain.handle("select-folder", async () => {
  return await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
});
const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

function getSortedImageListFromDir(dir) {
  const normalizedDir = path.normalize(decodeURIComponent(dir));
  const files = fs.readdirSync(normalizedDir);
  return files
    .filter((file) =>
      validExtensions.includes(path.extname(file).toLowerCase())
    )
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );
}

ipcMain.handle("get-prev-image", (event, currentImage, dirName) => {
  if (!dirName || !currentImage) return null;
  const imageList = getSortedImageListFromDir(dirName);
  const index = imageList.indexOf(currentImage);
  if (index > 0) {
    return imageList[index - 1];
  }
  return null;
});

ipcMain.handle("get-next-image", (event, currentImage, dirName) => {
  if (!dirName || !currentImage) return null;
  const imageList = getSortedImageListFromDir(dirName);
  const index = imageList.indexOf(currentImage);
  if (index >= 0 && index < imageList.length - 1) {
    return imageList[index + 1];
  }
  return null;
});
