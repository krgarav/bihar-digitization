import axios from "axios";
import React, { useEffect } from "react";
import { ImageViewer } from "react-iv-viewer";
import "react-iv-viewer/dist/react-iv-viewer.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
const NameModal = ({ show, selectedImages, onClose, setTrigger, trigger }) => {
  const [pdfName, setPdfName] = React.useState(null);
  const [imageArray, setImageArray] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const dir = JSON.parse(localStorage.getItem("pathId"));

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
  };
  useEffect(() => {
    if (selectedImages) {
      setImageArray(Array.from(selectedImages));
    }
  }, [selectedImages]);

  const handleSave = async () => {
    if (!pdfName) {
      console.error("PDF name is empty.");
      toast.error("Please enter a valid name for the PDF file.");
      return;
    }

    try {
      setIsLoading(true);
      const imageArray = Array.from(selectedImages);
      if (imageArray.length === 0) {
        toast.error("No images selected.");
        return;
      }
      const pathId = JSON.parse(localStorage.getItem("pathId")).id;

      const response = await axios.post("http://localhost:4000/process-pdf", {
        images: imageArray,
        name: pdfName.trim(),
        pathId: pathId,
      });

      setTrigger((prev) => !prev);
      onClose();
      toast.success("PDF created successfully!");
    } catch (error) {
      console.error("Error saving images:", error);
      toast.error("Failed to create PDF.");
    } finally {
      const btn = document.getElementById("modal-close-btn");
      setIsLoading(false);
      setPdfName(null);
      btn?.click();
      onClose();
    }
  };

  return (
    <div
      id="default-modal"
      tabIndex="-1"
      aria-hidden={!show}
      className={`fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full overflow-y-auto overflow-x-hidden backdrop-blur-sm bg-black/30 ${
        show ? "" : "hidden"
      }`}
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 dark:border-gray-600 rounded-t">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Name Your PDF
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full p-2 transition"
              aria-label="Close modal"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-6 space-y-4">
            <label
              htmlFor="pdf-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              PDF Name
            </label>
            <input
              id="pdf-name"
              placeholder="e.g. Project_Report_2025"
              className="w-full px-4 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-500 dark:focus:ring-blue-600"
              onChange={(e) => setPdfName(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please enter a name for your PDF file. It will be used when saving
              the document.
            </p>
          </div>
          <div className="relative w-[500px]">
            {imageArray.length > 0 && (
              <ImageViewer
                img={`http://localhost:4000/view-image/${imageArray[currentIndex]}?dir=${dir["image_Path"]}`}
                width="640px"
              />
            )}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              {imageArray[currentIndex]}
            </p>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-200 dark:border-gray-600">
            {/* Centered Arrows */}
            <div className="flex justify-center flex-grow gap-4">
              <button
                onClick={handlePrev}
                className="cursor-pointer bg-white bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full shadow text-gray-700"
              >
                <FaArrowLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="cursor-pointer bg-white bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full shadow text-gray-700"
              >
                <FaArrowRight size={20} />
              </button>
            </div>

            {/* Save Button aligned right */}
            <button
              type="button"
              className={`ml-4 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition cursor-pointer duration-200
    ${
      isLoading
        ? "bg-blue-400 cursor-not-allowed"
        : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    }
  `}
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving PDF..." : "Save PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameModal;
