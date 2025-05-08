const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;
const os = require("os");
const compressAndConvertImagesToPdf = require("../Services/imageToPdf.js");
const PdfModel = require("../Models/pdfModel");
const PdfFileModel = require("../Models/pdfFileModel.js");
const sharp = require("sharp");
const Jimp = require("jimp");
const DataPathModel = require("../Models/dataPathModel.js");
// exports.processPdf = async (req, res) => {
//   try {
//     const { images, name } = req.body;
//     if (!name) {
//       return res.status(400).json({ error: "Name is required" });
//     }
//     if (!Array.isArray(images)) {
//       return res.status(400).json({ error: "Images must be an array" });
//     }

//     const sourceDir = path.join(os.homedir(), "Documents", "images");
//     const destDir = path.join(sourceDir, "done");

//     // Ensure 'done' directory exists
//     if (!fs.existsSync(destDir)) {
//       fs.mkdirSync(destDir, { recursive: true });
//     }
//     const imagePaths = images.map((imageName) =>
//       path.join(sourceDir, imageName)
//     );
//     const pdfPath = path.join(destDir, `${name}.pdf`);
//     await compressAndConvertImagesToPdf(imagePaths, pdfPath);
//     images.forEach((imageName) => {
//       const sourcePath = path.join(sourceDir, imageName);
//       const destPath = path.join(destDir, imageName);

//       if (fs.existsSync(sourcePath)) {
//         fs.renameSync(sourcePath, destPath);
//       }
//     });

//     res.json({ message: "Selected images moved successfully." });
//   } catch (err) {
//     console.error("Error processing PDF:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.processPdf = async (req, res) => {
  try {
    const { images, name, pathId } = req.body;
    if (!pathId) {
      return res.status(400).json({ error: "PathId is required" });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!Array.isArray(images)) {
      return res.status(400).json({ error: "Images must be an array" });
    }
    const srcFile = await DataPathModel.findByPk(pathId);
    const sourceDir = srcFile.image_Path;
    const enteredPdfPath = srcFile.pdf_Path;
    const destDir = path.join(sourceDir, "done");

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const imagePaths = images.map((imageName) =>
      path.join(sourceDir, imageName)
    );
    const pdfPath = path.join(enteredPdfPath, `${name}.pdf`);

    // Convert to PDF
    await compressAndConvertImagesToPdf(imagePaths, pdfPath);

    // Move original images
    images.forEach((imageName) => {
      const sourcePath = path.join(sourceDir, imageName);
      const destPath = path.join(destDir, imageName);

      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, destPath);
      }
    });

    // Save PDF and image info to DB
    const pdfRecord = await PdfModel.create({ pdf_Name: name, pathId: pathId });

    const pdfFileRecords = images.map((fileName) => ({
      file_name: fileName,
      pdfId: pdfRecord.id,
    }));

    await PdfFileModel.bulkCreate(pdfFileRecords);

    res.json({
      message: "PDF created, images moved, and data saved to DB successfully.",
      pdf: pdfRecord,
    });
  } catch (err) {
    console.error("Error processing PDF:", err);
    res.status(500).json({ error: err.message });
  }
};

// exports.getAllPdf = async (req, res) => {
//   try {
//     const { pathId } = req.query;

//     if (!pathId) {
//       return res
//         .status(400)
//         .json({ error: "Missing required parameter: pathId" });
//     }

//     const pdfs = await PdfModel.findAll({
//       where: { pathId },
//     });

//     return res.status(200).json(pdfs);
//   } catch (error) {
//     console.error("Error fetching PDFs:", error);
//     return res
//       .status(500)
//       .json({ error: "Internal server error. Could not retrieve PDFs." });
//   }
// };

exports.getAllPdf = async (req, res) => {
  try {
    const { pathId, page = 1 } = req.query;

    if (!pathId) {
      return res
        .status(400)
        .json({ error: "Missing required parameter: pathId" });
    }

    const limit = 50;
    const offset = (parseInt(page) - 1) * limit;

    const pdfs = await PdfModel.findAndCountAll({
      where: { pathId },
      limit,
      offset,
    });

    return res.status(200).json({
      total: pdfs.count,
      page: parseInt(page),
      totalPages: Math.ceil(pdfs.count / limit),
      data: pdfs.rows,
    });
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    return res
      .status(500)
      .json({ error: "Internal server error. Could not retrieve PDFs." });
  }
};

exports.getSinglePdf = async (req, res) => {
  try {
    const { imgName, pdfPath } = req.query;

    if (!imgName) {
      return res.status(400).json({ error: "PDF name is required" });
    }

    const pdfMainPath = path.join(pdfPath, `${imgName}.pdf`);
    // Check if the file exists
    if (!fs.existsSync(pdfMainPath)) {
      return res.status(404).json({ error: "PDF not found" });
    }

    // Set appropriate headers for PDF display
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${imgName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(pdfMainPath);
    fileStream.pipe(res);
  } catch (err) {
    console.error("Error fetching PDF:", err);
    res.status(500).json({ error: "Failed to retrieve the PDF" });
  }
};

// exports.editAddImgProcessedPdf = async (req, res) => {
//   try {
//     const { images, pdfId } = req.body;

//     if (!Array.isArray(images) || images.length === 0) {
//       return res
//         .status(400)
//         .json({ error: "Images must be a non-empty array" });
//     }

//     const sourceDir = path.join(os.homedir(), "Documents", "images");
//     const destDir = path.join(sourceDir, "done");

//     // Ensure 'done' folder exists
//     if (!fs.existsSync(destDir)) {
//       fs.mkdirSync(destDir, { recursive: true });
//     }

//     // Get PDF record
//     const pdfRecord = await PdfModel.findByPk(pdfId);
//     if (!pdfRecord) {
//       return res.status(404).json({ error: "PDF record not found" });
//     }

//     const pdfName = pdfRecord.pdf_Name || `output-${Date.now()}`;
//     const pdfPath = path.join(destDir, `${pdfName}.pdf`);
//     const prevPdfFileRecords = await PdfFileModel.findAll({
//       where: { pdfId },
//       attributes: ["file_name"],
//     });
//     const prevImageNames = prevPdfFileRecords.map((record) =>
//       path.join(sourceDir, destDir, record)
//     );
//     // Convert selected images to PDF
//     const imagePaths = images.map((img) => path.join(sourceDir, img));
//     const allImagePaths = [...prevImageNames, ...imagePaths];
//     await compressAndConvertImagesToPdf(allImagePaths, pdfPath);

//     // Move original images to "done" folder
//     images.forEach((imageName) => {
//       const sourcePath = path.join(sourceDir, imageName);
//       const destPath = path.join(destDir, imageName);
//       if (fs.existsSync(sourcePath)) {
//         fs.renameSync(sourcePath, destPath);
//       }
//     });

//     // Save image records to DB
//     const pdfFileRecords = images.map((fileName) => ({
//       file_name: fileName,
//       pdfId: pdfRecord.id,
//     }));
//     await PdfFileModel.bulkCreate(pdfFileRecords);

//     return res.json({
//       message: "PDF created, images moved, and DB updated successfully.",
//     });
//   } catch (err) {
//     console.error("Error processing PDF:", err);
//     return res.status(500).json({ error: err.message });
//   }
// };

// exports.editAddImgProcessedPdf = async (req, res) => {
//   try {
//     const { images, pdfId } = req.body;

//     if (!Array.isArray(images) || images.length === 0) {
//       return res
//         .status(400)
//         .json({ error: "Images must be a non-empty array" });
//     }

//     // Get PDF record
//     const pdfRecord = await PdfModel.findByPk(pdfId);

//     if (!pdfRecord) {
//       return res.status(404).json({ error: "PDF record not found" });
//     }
//     const pathId = pdfRecord.pathId;
//     const pathRecord = await DataPathModel.findByPk(pathId);
//     const sourcePdfDir = pathRecord.image_path;
//     const sourceDir = pathRecord.image_path;
//     const destDir = path.join(sourceDir, "done");
//     // Ensure "done" folder exists
//     if (!fs.existsSync(destDir)) {
//       fs.mkdirSync(destDir, { recursive: true });
//     }

//     const pdfName = pdfRecord.pdf_Name || `output-${Date.now()}`;
//     const pdfPath = path.join(sourcePdfDir, `${pdfName}.pdf`);

//     // Get previously added images (if any)
//     const prevRecords = await PdfFileModel.findAll({
//       where: { pdfId },
//       attributes: ["file_name"],
//     });

//     const prevImagePaths = prevRecords.map((r) =>
//       path.join(destDir, r.file_name)
//     );
//     const newImagePaths = images.map((img) => path.join(sourceDir, img));
//     const allImagePaths = [...prevImagePaths, ...newImagePaths];

//     // Create PDF
//     await compressAndConvertImagesToPdf(allImagePaths, pdfPath);

//     // Move new images to "done"
//     await Promise.all(
//       images.map(async (img) => {
//         const from = path.join(sourceDir, img);
//         const to = path.join(destDir, img);
//         if (fs.existsSync(from)) {
//           await fsPromises.rename(from, to);
//         }
//       })
//     );

//     // Insert new image records
//     const newFileRecords = images.map((name) => ({
//       file_name: name,
//       pdfId: pdfRecord.id,
//     }));
//     await PdfFileModel.bulkCreate(newFileRecords);

//     return res.json({
//       message: "PDF updated and database synced successfully.",
//     });
//   } catch (err) {
//     console.error("Error processing PDF:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.editAddImgProcessedPdf = async (req, res) => {
  try {
    const { images, pdfId } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res
        .status(400)
        .json({ error: "Images must be a non-empty array" });
    }

    // Fetch PDF record
    const pdfRecord = await PdfModel.findByPk(pdfId);
    if (!pdfRecord) {
      return res.status(404).json({ error: "PDF record not found" });
    }

    const pathRecord = await DataPathModel.findByPk(pdfRecord.pathId);
    if (!pathRecord) {
      return res.status(404).json({ error: "Path record not found" });
    }

    const sourceDir = pathRecord.image_Path;
    const pdfDir = pathRecord.pdf_Path;
    const destDir = path.join(sourceDir, "done");

    // Ensure 'done' directory exists
    await fsPromises.mkdir(destDir, { recursive: true });

    const pdfName = pdfRecord.pdf_Name || `output-${Date.now()}`;
    const pdfPath = path.join(pdfDir, `${pdfName}.pdf`);

    // Move new images to 'done' directory first
    await Promise.all(
      images.map(async (img) => {
        const from = path.join(sourceDir, img);
        const to = path.join(destDir, img);
        try {
          await fsPromises.access(from); // Check file exists
          await fsPromises.rename(from, to);
        } catch (err) {
          console.warn(`Skipping missing or inaccessible file: ${img}`);
        }
      })
    );

    // Get all image file paths: previous + new (now moved)
    const prevRecords = await PdfFileModel.findAll({
      where: { pdfId },
      attributes: ["file_name"],
    });

    const prevImagePaths = prevRecords.map((r) =>
      path.join(destDir, r.file_name)
    );
    const newImagePaths = images.map((img) => path.join(destDir, img));
    const allImagePaths = [...prevImagePaths, ...newImagePaths];

    // Generate the updated PDF
    await compressAndConvertImagesToPdf(allImagePaths, pdfPath);

    // Save new file records to database
    const newFileRecords = images.map((file_name) => ({
      file_name,
      pdfId: pdfRecord.id,
    }));
    await PdfFileModel.bulkCreate(newFileRecords);

    return res.json({
      message: "PDF updated and database synced successfully.",
    });
  } catch (err) {
    console.error("Error processing PDF:", err.stack || err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.getAllPdfImages = async (req, res) => {
  try {
    const { images, pdfId } = req.query;
    const pdf = await PdfFileModel.findAll({
      where: { pdfId: pdfId },
      attributes: ["file_name"],
    });
  } catch (error) {}
};

exports.convertImg = (req, res) => {
  const imageName = req.params.imageName;
  const dir = req.query.dir;

  if (!dir) {
    return res.status(400).send("Directory path is required in query string");
  }

  // Sanitize and resolve full image path
  const imagePath = path.resolve(dir, imageName);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send("Image not found");
  }

  sharp(imagePath)
    .resize(150)
    .toBuffer()
    .then((buffer) => {
      res.set("Content-Type", "image/jpeg");
      res.send(buffer);
    })
    .catch((err) => {
      console.error("Thumbnail error:", err);
      res.status(500).send("Failed to create thumbnail");
    });
};
exports.viewImg = (req, res) => {
  const imageName = req.params.imageName;
  const dir = req.query.dir;

  if (!dir) {
    return res.status(400).send("Directory path is required in query string");
  }

  const imagePath = path.resolve(dir, imageName);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send("Image not found");
  }

  const ext = path.extname(imageName).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".webp": "image/webp",
  };

  const mimeType = mimeTypes[ext] || "application/octet-stream";
  res.setHeader("Content-Type", mimeType);

  const stream = fs.createReadStream(imagePath);
  stream.pipe(res).on("error", (err) => {
    console.error("Stream error:", err);
    res.status(500).send("Failed to stream image");
  });
};
// exports.convertImg = async (req, res) => {
//   const imageName = req.params.imageName;
//   const imagePath = path.join(os.homedir(), "Documents", "images", imageName);
//   if (!fs.existsSync(imagePath)) {
//     return res.status(404).send("Image not found");
//   }

//   try {
//     const image = await Jimp.read(imagePath);
//     image.resize(150, Jimp.AUTO); // Resize width to 150, auto height
//     const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

//     res.set("Content-Type", "image/jpeg");
//     res.send(buffer);
//   } catch (err) {
//     console.error("Thumbnail error:", err);
//     res.status(500).send("Failed to create thumbnail");
//   }
// };
exports.editRemoveImgProcessedPdf = async (req, res) => {
  try {
    const { pdfId } = req.query;

    // Get PDF record
    const pdfRecord = await PdfModel.findByPk(pdfId);
    if (!pdfRecord) {
      return res.status(404).json({ error: "PDF record not found" });
    }

    // Get previously added images (if any)
    const prevRecords = await PdfFileModel.findAll({
      where: { pdfId },
      attributes: ["file_name", "id"],
    });

    return res.json({
      message: "PDF updated and database synced successfully.",
      pdfNames: prevRecords,
    });
  } catch (err) {
    console.error("Error processing PDF:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.RemoveImagesFromPdf = async (req, res) => {
  try {
    const { pdfId, images } = req.body;

    // 1. Validate PDF record
    const pdfRecord = await PdfModel.findByPk(pdfId);
    if (!pdfRecord) {
      return res.status(404).json({ error: "PDF record not found" });
    }
    const pathRecord = await DataPathModel.findByPk(pdfRecord.pathId);
    if (!pathRecord) {
      return res.status(404).json({ error: "Path record not found" });
    }

    const sourceDir = path.join(pathRecord.image_Path, "done");
    const pdfDir = pathRecord.pdf_Path;
    const destDir = pathRecord.image_Path;
    // 2. Fetch image records to be removed
    const recordsToRemove = [];
    for (const imageId of images) {
      const record = await PdfFileModel.findByPk(imageId, {
        attributes: ["id", "file_name"],
      });
      if (record) recordsToRemove.push(record);
    }

    // 3. Move files back and delete DB records
    const movedFiles = [];
    for (const record of recordsToRemove) {
      const srcPath = path.join(sourceDir, record.file_name);
      const destPath = path.join(destDir, record.file_name);

      try {
        await fs.promises.rename(srcPath, destPath);
        await record.destroy();
        movedFiles.push(record.file_name);
      } catch (err) {
        console.error(`Failed to move/delete ${record.file_name}:`, err);
      }
    }

    // 4. Regenerate PDF with remaining images
    const remainingImages = await PdfFileModel.findAll({
      where: { pdfId },
      attributes: ["file_name"],
    });

    const imagePaths = remainingImages.map((r) =>
      path.join(sourceDir, r.file_name)
    );

    const pdfName = pdfRecord.pdf_Name || `output-${Date.now()}`;
    const pdfPath = path.join(pdfDir, `${pdfName}.pdf`); // overwrite original

    await compressAndConvertImagesToPdf(imagePaths, pdfPath);

    // 5. Respond
    return res.json({
      message: "PDF updated, images moved back, and records deleted.",
      movedFiles,
      updatedPdf: pdfPath,
    });
  } catch (err) {
    console.error("Error processing PDF:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.savePaths = async (req, res) => {
  try {
    const { pdf_Path, image_Path } = req.body;

    if (!pdf_Path || !image_Path) {
      return res.status(400).json({ message: "Both paths are required." });
    }

    // Check for existing entry with the same paths
    const existing = await DataPathModel.findOne({
      where: { pdf_Path, image_Path },
    });

    if (existing) {
      return res.status(409).json({ message: "Path already exists." });
    }

    // Create new entry
    const newPath = await DataPathModel.create({
      pdf_Path,
      image_Path,
    });

    res
      .status(201)
      .json({ message: "Paths saved successfully.", data: newPath });
  } catch (error) {
    console.error("Error saving paths:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getAllPaths = async (req, res) => {
  try {
    const allPaths = await DataPathModel.findAll();

    res.status(200).json({
      message: "All paths retrieved successfully.",
      data: allPaths,
    });
  } catch (error) {
    console.error("Error fetching paths:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
exports.getCurrentPaths = async (req, res) => {
  try {
    const { pathId } = req.query;
    const allPaths = await DataPathModel.findByPk(pathId);

    res.status(200).json({
      message: "All paths retrieved successfully.",
      data: allPaths,
    });
  } catch (error) {
    console.error("Error fetching paths:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
