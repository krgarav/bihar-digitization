import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import ImageViewer from "../Components/ImageViewer";
import { FaPlus, FaTrash } from "react-icons/fa";
import RemoveImageViewer from "../Components/RemoveImageViewer";
import { toast } from "react-toastify";

const EditPdfModal = ({ show, selectedPdf, onClose }) => {
  const [pdfName, setPdfName] = React.useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [trigger, setTrigger] = useState(false);
  const [addImage, setAddImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [displayedImages, setDisplayedImages] = useState([]); // what’s currently rendered
  const debounceTimeout = useRef(null);
  const showDark = true;

  useEffect(() => {
    if (selectedPdf?.pdf_Name) {
      setPdfName(selectedPdf.id);
    }
    setTrigger(!trigger);
  }, [show]);

  useEffect(() => {
    setSelectedImages(new Set());
    setAddImage(false);
  }, [onClose]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (addImage === "addImage") {
        const res = await axios.put(
          "http://localhost:4000/edit-addimages-to-pdf",
          {
            pdfId: pdfName,
            images: Array.from(selectedImages),
          }
        );
        setSelectedImages(new Set());
        setPdfName(null);
        onClose();
        toast.success("Images added to PDF successfully!");
      } else {
        const res = await axios.post(
          "http://localhost:4000/remove-pdf-images",
          {
            pdfId: pdfName,
            images: Array.from(selectedImages),
          }
        );
        setSelectedImages(new Set());
        setPdfName(null);
        onClose();
        toast.success("Images removed from PDF successfully!");
      }
    } catch (error) {
      console.error("Error saving images:", error);
      alert("Failed to move images.");
    } finally {
      setLoading(false);
    }
  };
  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      if (value.trim() === "") {
        setSearchQuery(null);
        setSuggestions([]);
        return;
      }
      const filenames = await window.api.searchImages(value); // get filenames from backend
      setSuggestions(filenames.slice(0, 5)); // just names for suggestions
    }, 1000);
  };
  const handleSearchClick = (name) => {
    const dir = JSON.parse(localStorage.getItem("pathId"));
    const encodedUri = encodeURIComponent(dir["image_Path"]);
    const obj = {
      name: name,
      src: `http://localhost:4000/thumbnail/${name}?dir=${encodedUri}`,
    };
    const arr = Array.from(selectedImages).map((item) => {
      return {
        name: item,
        src: `http://localhost:4000/thumbnail/${item}?dir=${encodedUri}`,
      };
    });

    setDisplayedImages([obj, ...arr]);
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
        overflowY: "auto",
        overflowX: "hidden",
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0,0,0,0.3)",
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
            backgroundColor: showDark ? "#1f2937" : "#ffffff",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              borderBottom: showDark
                ? "1px solid #4b5563"
                : "1px solid #e5e7eb",
              borderTopLeftRadius: "0.75rem",
              borderTopRightRadius: "0.75rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: showDark ? "#ffffff" : "#1f2937",
              }}
            >
              Edit Your PDF
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                color: "#9ca3af",
                borderRadius: "9999px",
                padding: "0.5rem",
                transition: "color 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = showDark ? "#ffffff" : "#4b5563")
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              aria-label="Close modal"
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
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: showDark ? "#d1d5db" : "#374151",
              }}
            >
              PDF Name : {selectedPdf?.pdf_Name}.pdf
            </label>
            <p
              style={{
                fontSize: "0.75rem",
                color: showDark ? "#9ca3af" : "#6b7280",
              }}
            >
              Please select images to be included in the PDF. You can select
              multiple images by clicking on them.
            </p>
          </div>

          <div
            style={{
              height: "40vh",
              overflowY: "auto",
              borderRadius: "0.5rem",
              border: showDark ? "1px solid #374151" : "1px solid #e5e7eb",
              padding: "1rem",
              backgroundColor: showDark ? "#374151" : "#f9fafb",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {!addImage && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <button
                  onClick={() => setAddImage("addImage")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    transition: "background-color 0.2s",
                  }}
                >
                  <FaPlus />
                  Add Image
                </button>
                <button
                  onClick={() => setAddImage("removeImage")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    transition: "background-color 0.2s",
                  }}
                >
                  <FaTrash />
                  Remove Image
                </button>
              </div>
            )}

            {addImage === "addImage" && (
              <>
                <div style={{ position: "relative", width: "50%" }}>
                  <input
                    type="text"
                    placeholder="Search images by name..."
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      outline: "none",
                    }}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {suggestions.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        backgroundColor: "white",
                        color: "black",
                        border: "1px solid #d1d5db",
                        borderTop: 0,
                        borderBottomLeftRadius: "0.5rem",
                        borderBottomRightRadius: "0.5rem",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        zIndex: 10,
                      }}
                    >
                      {suggestions.map((name, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            handleSearchClick(name);
                            setSuggestions([]);
                          }}
                          style={{
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f3f4f6")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "white")
                          }
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <ImageViewer
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                  trigger={trigger}
                  setDisplayedImages={setDisplayedImages}
                  displayedImages={displayedImages}
                />
              </>
            )}

            {addImage === "removeImage" && (
              <RemoveImageViewer
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                trigger={trigger}
                pdfId={pdfName}
              />
            )}
          </div>

          {/* Footer */}
          {addImage && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "1rem",
                borderTop: showDark ? "1px solid #4b5563" : "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "white",
                  borderRadius: "0.5rem",
                  backgroundColor: loading
                    ? "#60a5fa"
                    : showDark
                    ? "#2563eb"
                    : "#1d4ed8",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s",
                }}
              >
                {loading
                  ? addImage === "addImage"
                    ? "Adding Images..."
                    : "Removing Images..."
                  : addImage === "addImage"
                  ? "Add Images to Pdf"
                  : "Remove Images from Pdf"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditPdfModal);
