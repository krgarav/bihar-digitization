import React from "react";
import { ImageViewer as ImgView } from "react-iv-viewer";
const ImageModal = ({ isOpen, onClose, imageName }) => {
  const dir = JSON.parse(localStorage.getItem("pathId"));
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center ">
      <div className="relative bg-blue-900 rounded-2xl shadow-xl p-4 w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl font-bold focus:outline-none cursor-pointer"
        >
          &times;
        </button>

        {/* Image Viewer */}
        <div className=" flex-1 flex-col flex items-center justify-center overflow-hidden mt-7">
          <ImgView
            img={`http://localhost:4000/view-image/${imageName}?dir=${dir["image_Path"]}`}
            width="100%"
            height="100%"
          />
          <p className="text-center mt-2">{imageName}</p>{" "}
          {/* Optional image name */}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
