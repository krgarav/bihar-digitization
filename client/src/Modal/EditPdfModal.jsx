import axios from "axios";
import React, { useEffect, useState } from "react";
import ImageViewer from "../Components/ImageViewer";

const EditPdfModal = ({ show, selectedPdf, onClose, setTrigger, trigger }) => {
  const [pdfName, setPdfName] = React.useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  // const [trigger, setTrigger] = useState(false);
  useEffect(() => {
    if (selectedPdf?.pdf_Name) {
      setPdfName(selectedPdf.pdf_Name);
    }
  }, [show]);
  console.log(selectedPdf);
  const handleSave = async () => {
    console.log(pdfName);
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
              Edit Your PDF
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
              PDF Name :{selectedPdf?.pdf_Name}.pdf
            </label>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please select images to be included in the PDF. You can select
              multiple images by clicking on them.
            </p>
          </div>

          <div className="h-[40vh] overflow-y-auto rounded border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-700">
            <ImageViewer
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              trigger={trigger}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 md:p-5 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer transition duration-200"
              onClick={handleSave}
            >
              Update PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditPdfModal);
