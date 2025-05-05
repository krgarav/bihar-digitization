const express = require("express");
const {
  processPdf,
  getAllPdf,
  getSinglePdf,
  editAddImgProcessedPdf,
  convertImg,
  editRemoveImgProcessedPdf,
} = require("../Controllers/processPdfController");
const router = express.Router();

router.post("/process-pdf", processPdf);
router.get("/get-all-pdfs", getAllPdf);
router.get("/get-single-pdf", getSinglePdf);
router.put("/edit-addimages-to-pdf", editAddImgProcessedPdf);
router.get("/edit-remove-images-to-pdf", editRemoveImgProcessedPdf);

router.get("/thumbnail/:imageName", convertImg);
// router.post("/process-pdf", processPdf);
module.exports = router;
