import React, { useState } from "react";
import ImageViewer from "../Components/ImageViewer";
import NameModal from "../Modal/NameModal";

const AllImageViewer = () => {
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [trigger, setTrigger] = useState(false);
  const [show, setShow] = useState(false);
  const saveHandler = async () => {
    setShow(true);
  };

  return (
    <div className="h-[94vh] bg-gray-100 dark:bg-gray-900 p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        🖼️ Image Browser
      </h1>

      {/* Main Content Container */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 space-y-6">
        {/* Image Viewer Scrollable Area */}
        <div className="h-[70vh] overflow-y-auto rounded border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-700">
          <ImageViewer
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            trigger={trigger}
          />
        </div>

        {/* Action Button */}
        {selectedImages.size > 0 && (
          <div className="flex justify-end">
            <button
              onClick={saveHandler}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition duration-200"
            >
              📄 Create PDF of Selected Images
            </button>
          </div>
        )}
      </div>

      {/* Modal Component */}
      <NameModal
        show={show}
        selectedImages={selectedImages}
        onClose={() => setShow(false)}
        setTrigger={setTrigger}
        trigger={trigger}
      />
    </div>
  );
};

export default AllImageViewer;
