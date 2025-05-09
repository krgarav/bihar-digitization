const fs = require("fs");
// const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const Jimp = require("jimp");
// async function compressAndConvertImagesToPdf(imagePaths, outputPath) {
//   const pdfDoc = await PDFDocument.create();

//   for (const path of imagePaths) {
//     // Resize and compress image using sharp
//     const compressedBuffer = await sharp(path)
//       .rotate()
//       .resize({ width: 1754 }) // Half of 2480 (A4 @ 150 DPI approx)
//       .jpeg({
//         quality: 80, // Lower quality but still visually fine
//         mozjpeg: true, // Enables better compression
//         chromaSubsampling: "4:4:4", // Keeps color detail better than default '4:2:0'
//       })
//       .toBuffer();

//     const image = await pdfDoc.embedJpg(compressedBuffer);
//     const { width, height } = image.scale(1);
//     const page = pdfDoc.addPage([width, height]);

//     page.drawImage(image, { x: 0, y: 0, width, height });
//   }

//   const pdfBytes = await pdfDoc.save();
//   fs.writeFileSync(outputPath, pdfBytes);
// }
async function compressAndConvertImagesToPdf(imagePaths, outputPath) {
  const pdfDoc = await PDFDocument.create();

  for (const imgPath of imagePaths) {
    // Read image
    const image = await Jimp.read(imgPath);

    // Manually rotate if needed (Jimp doesn't auto-rotate based on EXIF)
    // Optional: Handle based on EXIF manually if necessary

    // Resize to A4 width at 150 DPI
    image.resize(1754, Jimp.AUTO);

    // Set JPEG quality (80 for better quality)
    image.quality(80);

    // Convert to JPEG buffer
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Embed into PDF
    const pdfImage = await pdfDoc.embedJpg(buffer);
    const { width, height } = pdfImage.scale(1);
    const page = pdfDoc.addPage([width, height]);

    page.drawImage(pdfImage, { x: 0, y: 0, width, height });
  }

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

module.exports = compressAndConvertImagesToPdf;
