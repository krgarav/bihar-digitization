import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaCheckCircle, FaRegCircle, FaEdit } from "react-icons/fa";
import { AiFillFilePdf } from "react-icons/ai";
import EditPdfModal from "../Modal/EditPdfModal";
import axios from "axios";

const PdfViewer = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
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
  }, [page]);

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
    <div className="p-6 bg-gray-900 ">
      <h2 className="text-2xl font-bold mb-4 text-white">📚 Available PDFs</h2>

      {/* Scrollable grid container */}
      <div className="h-[80vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((img, index) => {
            // const isFirst = index === 0;
            const isLast = index === images.length - 1;
            return (
              <div
                ref={ isLast ? lastPdfRef : null}
                key={index}
                className="cursor-pointer border-2 rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-lg relative bg-gray-800 border-gray-200"
                onClick={() => handleImageClick(img.pdf_Name)}
              >
                <div
                  className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(img);
                  }}
                >
                  <FaEdit className="text-lg" />
                </div>

                <div className="flex justify-center mb-4 text-red-600 text-5xl">
                  <AiFillFilePdf />
                </div>

                <div className="text-center">
                  <p
                    className="text-sm font-medium text-gray-200 truncate"
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
          <p className="text-center mt-4 text-gray-400">Loading more PDFs...</p>
        )}

        {!loading && !hasMore && images.length > 0 && (
          <p className="text-center mt-4 text-green-400">🎉 All PDFs loaded!</p>
        )}

        {images.length === 0 && !loading && (
          <div className="text-center text-gray-400">No PDFs available.</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PdfViewer);
