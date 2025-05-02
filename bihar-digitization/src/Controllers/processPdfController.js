const path = require("path");
const fs = require("fs");
const os = require("os");
const compressAndConvertImagesToPdf = require("../Services/imagetoPdf");

exports.processPdf = async (req, res) => {
  try {
    const { images } = req.body;

    if (!Array.isArray(images)) {
      return res.status(400).json({ error: "Images must be an array" });
    }

    const sourceDir = path.join(os.homedir(), "Documents", "images");
    const destDir = path.join(sourceDir, "done");

    // Ensure 'done' directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const imagePaths = images.map((imageName) =>
      path.join(sourceDir, imageName)
    );
    const pdfPath = path.join(destDir, "output.pdf");
    await compressAndConvertImagesToPdf(imagePaths, pdfPath);
    images.forEach((imageName) => {
      const sourcePath = path.join(sourceDir, imageName);
      const destPath = path.join(destDir, imageName);

      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, destPath);
      }
    });

    res.json({ message: "Selected images moved successfully." });
  } catch (err) {
    console.error("Error processing PDF:", err);
    res.status(500).json({ error: err.message });
  }
};
