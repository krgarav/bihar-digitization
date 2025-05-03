const path = require("path");
const fs = require("fs");
const os = require("os");
const compressAndConvertImagesToPdf = require("../Services/imagetoPdf");
const PdfModel = require("../Models/pdfModel");
const PdfFileModel = require("../Models/pdfFileModel");

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

    // Ensure 'done' folder exists
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

    // Convert selected images to PDF
    const imagePaths = images.map((img) => path.join(sourceDir, img));
    await compressAndConvertImagesToPdf(imagePaths, pdfPath);

    // Move original images to "done" folder
    images.forEach((imageName) => {
      const sourcePath = path.join(sourceDir, imageName);
      const destPath = path.join(destDir, imageName);
      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, destPath);
      }
    });

    // Save image records to DB
    const pdfFileRecords = images.map((fileName) => ({
      file_name: fileName,
      pdfId: pdfRecord.id,
    }));
    await PdfFileModel.bulkCreate(pdfFileRecords);

    return res.json({
      message: "PDF created, images moved, and DB updated successfully.",
    });
  } catch (err) {
    console.error("Error processing PDF:", err);
    return res.status(500).json({ error: err.message });
  }
};
