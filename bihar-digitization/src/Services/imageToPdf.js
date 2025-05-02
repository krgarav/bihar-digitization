const fs = require("fs");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");

async function compressAndConvertImagesToPdf(imagePaths, outputPath) {
  const pdfDoc = await PDFDocument.create();

  for (const path of imagePaths) {
    // Resize and compress image using sharp
    const compressedBuffer = await sharp(path)
      .resize({ width: 1240 }) // Half of 2480 (A4 @ 150 DPI approx)
      .jpeg({
        quality: 60, // Lower quality but still visually fine
        mozjpeg: true, // Enables better compression
        chromaSubsampling: "4:4:4", // Keeps color detail better than default '4:2:0'
      })
      .toBuffer();

    const image = await pdfDoc.embedJpg(compressedBuffer);
    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);

    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

module.exports = compressAndConvertImagesToPdf;
