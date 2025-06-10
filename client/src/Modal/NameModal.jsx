import axios from "axios";
import React, { useEffect } from "react";
import { ImageViewer } from "react-iv-viewer";
import "react-iv-viewer/dist/react-iv-viewer.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import LazyImageViewer from "../Components/LazyLoader";
import { useState } from "react";
import { useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
const NameModal = ({ show, selectedImages, onClose, setTrigger, trigger }) => {
  const dir = JSON.parse(localStorage.getItem("pathId"));
  const showDarkMode = true;

  const [pdfName, setPdfName] = React.useState(null);
  const [imageArray, setImageArray] = React.useState(selectedImages || []);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  // Inside your component
  const [showImageViewerUrl, setShowImageViewerUrl] = useState(false);
  useEffect(() => {}, []);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        // Your logic here
        const btn = document.getElementById("pdf-save-btn");
        if (btn) {
          btn.click(); // Simulate a click on the save button
        }

        // You can trigger a function or state update here
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // cleanup
    };
  }, []);
  useEffect(() => {
    if (selectedImages) {
      setImageArray(Array.from(selectedImages));
    }
  }, [selectedImages]);
  useEffect(() => {
    if (currentIndex >= 0) {
      setShowImageViewerUrl(
        `http://localhost:4000/view-image/${imageArray[currentIndex]}?dir=${dir["image_Path"]}`
      );
    }
  }, [imageArray, currentIndex]); // run when inputs change

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
  };

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
      setIsLoading(false);
      if(error?.response?.data?.error){
        toast.error(error.response.data.error);
        return
      }
      toast.error("Failed to create PDF.");
    } finally {
      // const btn = document.getElementById("modal-close-btn");
      setIsLoading(false);
      // setPdfName(null);
      // btn?.click();
      // onClose();
    }
  };

  return (
    <div
      id="default-modal"
      tabIndex="-1"
      aria-hidden={!show}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 50,
        display: show ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "calc(100% - 1rem)",
        maxHeight: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "1rem",
          width: "100%",
          maxWidth: "42rem",
          maxHeight: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            backgroundColor: showDarkMode ? "#1f2937" : "white",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.25rem",
              borderBottom: "1px solid",
              borderColor: showDarkMode ? "#4b5563" : "#e5e7eb",
              borderTopLeftRadius: "0.75rem",
              borderTopRightRadius: "0.75rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: showDarkMode ? "#fff" : "#1f2937",
              }}
            >
              Name Your PDF
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              style={{
                color: "#9ca3af",
                borderRadius: "9999px",
                padding: "0.5rem",
                transition: "color 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const path = e.currentTarget.querySelector("path");
                if (path) path.style.stroke = "red";
              }}
              onMouseLeave={(e) => {
                const path = e.currentTarget.querySelector("path");
                if (path) path.style.stroke = "#9ca3af";
              }}
            >
              <svg
                style={{ width: "1rem", height: "1rem" }}
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
          <div
            style={{
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <label
              htmlFor="pdf-name"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: showDarkMode ? "#d1d5db" : "#374151",
              }}
            >
              PDF Name
            </label>
            <input
              id="pdf-name"
              placeholder="e.g. Project_Report_2025"
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                color: showDarkMode ? "#fff" : "#1f2937",
                backgroundColor: showDarkMode ? "#374151" : "#f9fafb",
                border: "1px solid",
                borderColor: showDarkMode ? "#4b5563" : "#d1d5db",
                borderRadius: "0.375rem",
                outline: "none",
                transition: "box-shadow 0.2s",
              }}
              onChange={(e) => setPdfName(e.target.value)}
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: showDarkMode ? "#9ca3af" : "#6b7280",
              }}
            >
              Please enter a name for your PDF file. It will be used when saving
              the document.
            </p>
          </div>

          {/* Image Preview */}
          <div style={{ position: "relative", width: "100%", margin: "0" }}>
            <TransformWrapper initialScale={1}>
              <TransformComponent>
                <img
                  src={`http://localhost:4000/view-image/${imageArray[currentIndex]}?dir=${dir["image_Path"]}`}
                  alt="Zoomable"
                  width="640px"
                  style={{
                    height: "40vh",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </TransformComponent>
            </TransformWrapper>

            <p
              style={{
                fontSize: "0.75rem",
                textAlign: "center",
                color: showDarkMode ? "#9ca3af" : "#6b7280",
                marginTop: "0.5rem",
              }}
            >
              {imageArray[currentIndex]}
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.25rem",
              borderTop: "1px solid",
              borderColor: showDarkMode ? "#4b5563" : "#e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexGrow: 1,
                color: showDarkMode ? "#d1d5db" : "#374151",
              }}
            >
              <button
                onClick={handlePrev}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.88)",
                  padding: "0.5rem",
                  borderRadius: "9999px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  color: "#374151",
                }}
              >
                <FaArrowLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.87)",
                  padding: "0.5rem",
                  borderRadius: "9999px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  color: "#374151",
                }}
              >
                <FaArrowRight size={20} />
              </button>
            </div>

            <button
              id="pdf-save-btn"
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              style={{
                marginLeft: "1rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#fff",
                borderRadius: "0.5rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                backgroundColor: isLoading
                  ? "#60a5fa"
                  : showDarkMode
                  ? "#2563eb"
                  : "#1d4ed8",
                transition: "background-color 0.2s",
              }}
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
