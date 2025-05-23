import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaCheckCircle, FaRegCircle, FaEdit } from "react-icons/fa";
import { AiFillFilePdf } from "react-icons/ai";
import EditPdfModal from "../Modal/EditPdfModal";
import axios from "axios";

const PdfViewer = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [trigger, setTrigger] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const hasFetched = useRef(false);
  const observer = useRef();

  // Infinite scroll ref
  const lastPdfRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("🔄 Fetching more...");
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const firstPdfRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && page > 1) {
          console.log("⬆️ Fetching previous...");
          setPage((prev) => Math.max(prev - 1, 1));
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page]
  );

  // Fetching function
  const fetchImages = useCallback(async (pg) => {
    try {
      setLoading(true);
      const dir = JSON.parse(localStorage.getItem("pathId"));
      const response = await axios.get(
        `http://localhost:4000/get-all-pdfs?pathId=${dir.id}&page=${pg}`
      );
      const result = response.data;

      if (Array.isArray(result.data)) {
        setImages((prev) => {
          const updated = [...prev, ...result.data];
          return updated.length > 1000
            ? updated.slice(updated.length - 1000)
            : updated;
        });
        setHasMore(result.data.length === 50);
      } else {
        setError("Unexpected data format.");
      }
    } catch (err) {
      setError(err.message || "Failed to load PDFs.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and on page change
  useEffect(() => {
    if (!hasFetched.current) {
      fetchImages(1);
      hasFetched.current = true;
    }
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchImages(page);
    }
  }, [page, trigger]);

  const handleImageClick = async (imgName) => {
    try {
      const dir = JSON.parse(localStorage.getItem("pathId"));
      const response = await axios.get(
        `http://localhost:4000/get-single-pdf?imgName=${encodeURIComponent(
          imgName
        )}&pdfPath=${dir.pdf_Path}`,
        { responseType: "blob" }
      );

      const file = new File([response.data], `${imgName}.pdf`, {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(file);
      window.open(pdfUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
    } catch (error) {
      console.error("Error fetching PDF:", error);
      alert("Failed to open PDF.");
    }
  };

  const handleEditClick = (img) => {
    setSelectedPdf(img);
    setShow(true);
  };

  return (
    <>
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "#1f2937", // gray-900
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#ffffff",
          }}
        >
          📚 Available PDFs
        </h2>

        {/* Scrollable grid container */}
        <div
          style={{
            height: "80vh",
            overflowY: "auto",
            paddingRight: "0.5rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
              gap: "1rem",
            }}
          >
            {images.map((img, index) => {
              const isLast = index === images.length - 1;
              return (
                <div
                  ref={isLast ? lastPdfRef : null}
                  key={index}
                  style={{
                    cursor: "pointer",
                    border: "2px solid #e5e7eb", // border-gray-200
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    backgroundColor: "#1f2937", // gray-800
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s",
                    position: "relative",
                  }}
                  onClick={() => handleImageClick(img.pdf_Name)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 10px 15px rgba(0,0,0,0.3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 1px 2px rgba(0,0,0,0.05)")
                  }
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      color: "#3b82f6", // text-blue-500
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(img);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#1d4ed8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#3b82f6")
                    }
                  >
                    <FaEdit style={{ fontSize: "1.125rem" }} />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "1rem",
                      color: "#dc2626", // text-red-600
                      fontSize: "3rem",
                    }}
                  >
                    <AiFillFilePdf />
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#e5e7eb", // text-gray-200
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={img.pdf_Name}
                    >
                      {img.pdf_Name}.pdf
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {loading && (
            <p
              style={{
                textAlign: "center",
                marginTop: "1rem",
                color: "#9ca3af", // text-gray-400
              }}
            >
              Loading more PDFs...
            </p>
          )}

          {!loading && !hasMore && images.length > 0 && (
            <p
              style={{
                textAlign: "center",
                marginTop: "1rem",
                color: "#34d399", // text-green-400
              }}
            >
              🎉 All PDFs loaded!
            </p>
          )}

          {images.length === 0 && !loading && (
            <div
              style={{
                textAlign: "center",
                color: "#9ca3af", // text-gray-400
              }}
            >
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

export default React.memo(PdfViewer);
