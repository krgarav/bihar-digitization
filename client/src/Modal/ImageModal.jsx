import React, { useEffect } from "react";
import { ImageViewer as ImgView } from "react-iv-viewer";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { useState } from "react";
const ImageModal = ({ isOpen, onClose, imageName }) => {
  const [currentImage, setCurrentImage] = useState(null);
  useEffect(() => {
    setCurrentImage(imageName);
  }, [imageName]);

  const dir = JSON.parse(localStorage.getItem("pathId"));
  console.log(dir["image_Path"]);
  const onPrevHandler = async () => {
    const prev = await window.api.getPrevImage(currentImage, dir["image_Path"]);
    if (prev) {
      setCurrentImage(prev);
    }
  };

  const onNextHandler = async () => {
    const next = await window.api.getNextImage(currentImage, dir["image_Path"]);
    if (next) {
      setCurrentImage(next);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center ">
      <div className="relative bg-blue-900 rounded-2xl shadow-xl p-4 w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-2xl font-bold focus:outline-none cursor-pointer"
        >
          &times;
        </button>

        {/* Image Viewer with Arrows */}
        <div className="flex-1 flex items-center justify-center relative mt-7 overflow-hidden">
          {/* Left Arrow */}

          {/* Image */}
          <div className="flex flex-col items-center justify-center w-full h-full">
            <ImgView
              img={`http://localhost:4000/view-image/${currentImage}?dir=${dir["image_Path"]}`}
              width="100%"
              height="100%"
            />
            <p className="text-center mt-2 text-white">{currentImage}</p>
          </div>
        </div>

        {/* Footer with PDF Button */}
        <div className="relative w-full">
          {/* Arrows centered */}

          <div className="flex justify-center items-center space-x-8 mt-4">
            <button
              onClick={onPrevHandler}
              className="flex cursor-pointer items-center text-white text-xl font-semibold hover:text-yellow-400 focus:outline-none"
            >
              <FiArrowLeft className="mr-2" />
              Prev
            </button>

            <button
              onClick={onNextHandler}
              className="flex cursor-pointer items-center text-white text-xl font-semibold hover:text-yellow-400 focus:outline-none"
            >
              Next
              <FiArrowRight className="ml-2" />
            </button>
          </div>

          {/* PDF Button aligned to the right */}
          <div className="flex justify-end mt-4">
            <button
              // onClick={onCreatePDF}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded"
            >
              Create PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
