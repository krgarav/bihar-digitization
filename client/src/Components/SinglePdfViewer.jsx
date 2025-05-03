import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Offline-compatible worker
pdfjs.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.min.js");

export default function SinglePdfViewer({ file }) {
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div>
      <Document
        file={file} // accepts File object or base64 string
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page key={i} pageNumber={i + 1} />
        ))}
      </Document>
    </div>
  );
}
