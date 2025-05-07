import axios from "axios";
import React, { useEffect, useState } from "react";
import { ImageViewer } from "react-iv-viewer";
import "react-iv-viewer/dist/react-iv-viewer.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";

const PathModal = ({ show, onClose, event, setTrigger }) => {
  const [imagePath, setImagePath] = useState("");
  const [thumbPath, setThumbPath] = useState("");

  const handleBrowse = async (setPath) => {
    const result = await window.api.selectFolder();
    if (result && !result.canceled && result.filePaths.length > 0) {
      setPath(result.filePaths[0]);
    }
  };

  const savePathHandler = async () => {
    if (!thumbPath) {
      alert("Please select Pdf Folder");
      return;
    }
    if (!imagePath) {
      alert("Please select Image Folder");
      return;
    }

    try {
      const obj = {
        pdf_Path: thumbPath,
        image_Path: imagePath,
      };
      const res = await axios.post("http://localhost:4000/save-paths", obj);
      setTrigger((prev) => !prev);
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
    // onClose();
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
              {event === "first" ? "Select Your Path" : "Change Your Path"}
            </h3>
            {event !== "first" && (
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
            )}
          </div>

          {/* Body */}
          <div className="p-4 md:p-5 space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Image Folder
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={imagePath}
                  className="flex-1 px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleBrowse(setImagePath)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Browse
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Pdfs Folder
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={thumbPath}
                  className="flex-1 px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleBrowse(setThumbPath)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Browse
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={savePathHandler}
              className="ml-4 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Save Path
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathModal;
