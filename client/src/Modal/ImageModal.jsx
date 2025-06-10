import React, { useEffect, useRef } from "react";
import { ImageViewer as ImgView } from "react-iv-viewer";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { useState } from "react";
const ImageModal = ({
  isOpen,
  onClose,
  imageName,
  setSelectedImages,
  selectedImages,
}) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const viewerRef = useRef(null);
  useEffect(() => {
    if (viewerRef.current) {
      // Use the internal API if exposed
      viewerRef.current.zoom(0.5); // May differ by version
    }
  }, [currentImage]);
  useEffect(() => {
    setIsSelected(selectedImages.has(currentImage));
  }, [currentImage, selectedImages]);
  useEffect(() => {
    setCurrentImage(imageName);
  }, [imageName]);
  const dir = JSON.parse(localStorage.getItem("pathId"));
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
  const handleImageClick = (event, imgName) => {
    event.stopPropagation(); // Prevents event bubbli
    setSelectedImages((prev) => {
      const updated = new Set(prev);
      updated.has(imgName) ? updated.delete(imgName) : updated.add(imgName);
      return updated;
    });
  };
  const onCreatePDFHandler = async () => {
    const btn = document.getElementById("pdfButton");
    btn.click();
  };
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: "#1e3a8a",
          borderRadius: "1rem",
          boxShadow: "0 10px 15px rgba(0,0,0,0.2)",
          padding: "1rem",
          width: "100%",
          maxWidth: "80rem",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
        id="modal-close-btn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            color: "#d1d5db",
            fontSize: "1.5rem",
            fontWeight: "bold",
            cursor: "pointer",
            background: "none",
            border: "none",
          }}
        >
          &times;
        </button>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginTop: "1.75rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <ImgView
              ref={viewerRef}
              img={`http://localhost:4000/view-image/${currentImage}?dir=${dir["image_Path"]}`}
              width="100%"
              height="100%"
              snapView={false}
            />
            <div
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                cursor: "pointer",
              }}
              onClick={(event) => handleImageClick(event, currentImage)}
            >
              {isSelected ? (
                <FaCheckCircle color="green" style={{ fontSize: "1.25rem" }} />
              ) : (
                <FaRegCircle
                  style={{ color: "#6b7280", fontSize: "1.25rem" }}
                />
              )}
            </div>
            <p
              style={{
                textAlign: "center",
                marginTop: "0.5rem",
                color: "white",
              }}
            >
              {currentImage}
            </p>
          </div>
        </div>

        <div style={{ width: "100%", position: "relative" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={onPrevHandler}
              style={{
                display: "flex",
                alignItems: "center",
                color: "white",
                fontSize: "1.25rem",
                fontWeight: "600",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              <FiArrowLeft style={{ marginRight: "0.5rem" }} />
              Prev
            </button>

            <button
              onClick={onNextHandler}
              style={{
                display: "flex",
                alignItems: "center",
                color: "white",
                fontSize: "1.25rem",
                fontWeight: "600",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              Next
              <FiArrowRight style={{ marginLeft: "0.5rem" }} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={onCreatePDFHandler}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                fontWeight: "600",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: "pointer",
              }}
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
