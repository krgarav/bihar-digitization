const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;
const os = require("os");
const compressAndConvertImagesToPdf = require("../Services/imagetoPdf");
const PdfModel = require("../Models/pdfModel");
const PdfFileModel = require("../Models/pdfFileModel");
const sharp = require('sharp');

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
    const { images, name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!Array.isArray(images)) {
      return res.status(400).json({ error: "Images must be an array" });
    }

    const sourceDir = path.join(os.homedir(), "Documents", "images");
    const destDir = path.join(sourceDir, "done");

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const imagePaths = images.map((imageName) =>
      path.join(sourceDir, imageName)
    );
    const pdfPath = path.join(destDir, `${name}.pdf`);

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
    const pdfRecord = await PdfModel.create({ pdf_Name: name });

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

exports.getAllPdf = async (req, res) => {
  try {
    const pdfs = await PdfModel.findAll();

    res.status(200).json(pdfs);
  } catch (err) {
    console.error("Error fetching PDFs:", err);
    res.status(500).json({ error: "Failed to retrieve PDFs" });
  }
};

exports.getSinglePdf = async (req, res) => {
  try {
    const { imgName } = req.query;
    console.log("imgName", imgName);
    if (!imgName) {
      return res.status(400).json({ error: "PDF name is required" });
    }

    const sourceDir = path.join(os.homedir(), "Documents", "images", "done");
    const pdfPath = path.join(sourceDir, `${imgName}.pdf`);

    console.log("pdfPath", pdfPath);
    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: "PDF not found" });
    }

    // Set appropriate headers for PDF display
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${imgName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(pdfPath);
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

exports.editAddImgProcessedPdf = async (req, res) => {
  try {
    const { images, pdfId } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res
        .status(400)
        .json({ error: "Images must be a non-empty array" });
    }

    const sourceDir = path.join(os.homedir(), "Documents", "images");
    const destDir = path.join(sourceDir, "done");

    // Ensure "done" folder exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Get PDF record
    const pdfRecord = await PdfModel.findByPk(pdfId);
    if (!pdfRecord) {
      return res.status(404).json({ error: "PDF record not found" });
    }

    const pdfName = pdfRecord.pdf_Name || `output-${Date.now()}`;
    const pdfPath = path.join(destDir, `${pdfName}.pdf`);

    // Get previously added images (if any)
    const prevRecords = await PdfFileModel.findAll({
      where: { pdfId },
      attributes: ["file_name"],
    });

    const prevImagePaths = prevRecords.map((r) =>
      path.join(destDir, r.file_name)
    );
    const newImagePaths = images.map((img) => path.join(sourceDir, img));
    const allImagePaths = [...prevImagePaths, ...newImagePaths];

    // Create PDF
    await compressAndConvertImagesToPdf(allImagePaths, pdfPath);

    // Move new images to "done"
    await Promise.all(
      images.map(async (img) => {
        const from = path.join(sourceDir, img);
        const to = path.join(destDir, img);
        if (fs.existsSync(from)) {
          await fsPromises.rename(from, to);
        }
      })
    );

    // Insert new image records
    const newFileRecords = images.map((name) => ({
      file_name: name,
      pdfId: pdfRecord.id,
    }));
    await PdfFileModel.bulkCreate(newFileRecords);

    return res.json({
      message: "PDF updated and database synced successfully.",
    });
  } catch (err) {
    console.error("Error processing PDF:", err);
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


exports.convertImg = (req,res)=>{
  const imageName = req.params.imageName;
  const imagePath = path.join(os.homedir(), "Documents", "images", imageName);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send("Image not found");
  }

  sharp(imagePath)
    .resize(150) // Resize to thumbnail width
    .toBuffer()
    .then(buffer => {
      res.set("Content-Type", "image/jpeg");
      res.send(buffer);
    })
    .catch(err => {
      console.error("Thumbnail error:", err);
      res.status(500).send("Failed to create thumbnail");
    });
}