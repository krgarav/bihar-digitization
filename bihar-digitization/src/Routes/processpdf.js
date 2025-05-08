const express = require("express");
const {
  processPdf,
  getAllPdf,
  getSinglePdf,
  editAddImgProcessedPdf,
  convertImg,
  editRemoveImgProcessedPdf,
  RemoveImagesFromPdf,
  savePaths,
  getAllPaths,
  viewImg,
} = require("../Controllers/processPdfController");
const router = express.Router();

router.post("/process-pdf", processPdf);
router.get("/get-all-pdfs", getAllPdf);
router.get("/get-single-pdf", getSinglePdf);
router.put("/edit-addimages-to-pdf", editAddImgProcessedPdf);
router.get("/edit-remove-images-to-pdf", editRemoveImgProcessedPdf);
router.post("/remove-pdf-images", RemoveImagesFromPdf);
router.get("/view-image/:imageName",viewImg)
router.get("/thumbnail/:imageName", convertImg);

router.post("/save-paths", savePaths);
router.get("/get-current-paths", getAllPaths);  
router.get("/get-save-paths", getAllPaths);

module.exports = router;
