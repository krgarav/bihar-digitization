const express = require("express");
const { processPdf } = require("../Controllers/processPdfController");
const router = express.Router();

router.post("/process-pdf", processPdf);
// router.post("/process-pdf", processPdf);
module.exports = router;
