import { useEffect, useState } from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { AiFillFilePdf } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import EditPdfModal from "../Modal/EditPdfModal";
import axios from "axios";
const PdfViewer = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [trigger, setTrigger] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedPdf, setsSelectedPdfs] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const dir = JSON.parse(localStorage.getItem("pathId"));
        const response = await axios.get(
          `http://localhost:4000/get-all-pdfs?pathId=${dir.id}`
        );
        const result = response.data;

        if (Array.isArray(result)) {
          setImages(result);
        } else {
          setError("Unexpected data format.");
        }
      } catch (err) {
        setError(err.message || "Failed to load PDFs.");
      }
    };

    fetchImages();
  }, [trigger]);

  const handleImageClick = async (imgName) => {
    try {
      const dir = JSON.parse(localStorage.getItem("pathId"));
      console.log(dir);
      const response = await axios.get(
        `http://localhost:4000/get-single-pdf?imgName=${encodeURIComponent(
          imgName
        )}&pdfPath=${dir["pdf_Path"]}`,
        {
          responseType: "blob",
        }
      );

      // Create a File object with the desired filename
      const file = new File([response.data], `${imgName}.pdf`, {
        type: "application/pdf",
      });

      // Generate a blob URL from the File object
      const pdfUrl = URL.createObjectURL(file);

      // Open the PDF in a new tab
      window.open(pdfUrl, "_blank");

      // Optionally, revoke the object URL after some time to free up memory
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
    } catch (error) {
      console.error("Error fetching PDF:", error);
      alert("Failed to open PDF.");
    }
  };

  if (error) {
    return (
      <div className="text-red-500 p-4 font-semibold">
        ❌ Error loading PDFs: {error}
      </div>
    );
  }

  const handleEditClick = (img) => {
    // Define this function to handle edit logic
    setsSelectedPdfs(img);
    setShow(true);
    console.log("Edit clicked for:", img.name);
  };

  return (
    <>
      <div className="p-6 bg-gray-900 min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          📚 Available PDFs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="cursor-pointer border-2 rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-lg relative bg-gray-800 border-gray-200"
              onClick={() => handleImageClick(img.pdf_Name)}
            >
              {/* Edit Icon */}
              <div
                className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(img);
                }} // Define this function to handle edit logic
              >
                <FaEdit className="text-lg" />
              </div>

              {/* PDF Icon */}
              <div className="flex justify-center mb-4 text-red-600 text-5xl">
                <AiFillFilePdf color="#FF6666" />
              </div>

              {/* PDF Info */}
              <div className="text-center">
                <p
                  className="text-sm font-medium text-gray-200 truncate"
                  title={img.pdf_Name}
                >
                  {img.pdf_Name}.pdf
                </p>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-4 text-center text-gray-500 dark:text-gray-400">
              No PDFs available.
            </div>
          )}
        </div>
      </div>
      <EditPdfModal
        show={show}
        selectedPdf={selectedPdf}
        onClose={() => setShow(false)}
        setTrigger={setTrigger}
        trigger={trigger}
      />
    </>
  );
};

export default PdfViewer;
