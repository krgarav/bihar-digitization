import { useEffect, useState, useRef, useCallback } from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

const ImageViewer = ({ selectedImages, setSelectedImages, trigger }) => {
  const batchSize = 50;
  const [allImages, setAllImages] = useState([]); // full list of image metadata
  const [displayedImages, setDisplayedImages] = useState([]); // what’s currently rendered
  const [loadedCount, setLoadedCount] = useState(0);
  const [error, setError] = useState(null);
  const loaderRef = useRef(null);

  // Fetch all image metadata on mount or trigger change
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const allFiles = await window.api.getImageList();
        setAllImages(allFiles);
        setDisplayedImages(allFiles.slice(0, batchSize));
        setLoadedCount(batchSize);
      } catch (err) {
        setError("Failed to load images");
      }
    };

    fetchImages();
  }, [trigger]);
console.log(allImages);
  // Load more when user scrolls near the bottom
  const loadMoreImages = useCallback(() => {
    const nextBatch = allImages.slice(loadedCount, loadedCount + batchSize);
    setDisplayedImages((prev) => [...prev, ...nextBatch]);
    setLoadedCount((prev) => prev + batchSize);
  }, [allImages, loadedCount]);

  // Use Intersection Observer to trigger loading more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && loadedCount < allImages.length) {
          loadMoreImages();
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loadMoreImages]);

  const handleImageClick = (imgName) => {
    setSelectedImages((prev) => {
      const updated = new Set(prev);
      updated.has(imgName) ? updated.delete(imgName) : updated.add(imgName);
      return updated;
    });
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 h-screen  grid grid-cols-4 gap-4">
      {displayedImages.map((img, index) => {
        const isSelected = selectedImages.has(img.name);
        return (
          <div
            key={index}
            className="flex flex-col items-center border p-2 rounded shadow hover:shadow-lg"
            onClick={() => handleImageClick(img.name)}
          >
            <div className="relative">
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-40 object-cover rounded"
              />
              <div className="absolute top-2 right-2">
                {isSelected ? (
                  <FaCheckCircle className="text-green-500 text-xl" />
                ) : (
                  <FaRegCircle className="text-gray-500 text-xl" />
                )}
              </div>
            </div>
            <div
              className="mt-2 text-sm text-center truncate w-full"
              title={img.name}
            >
              {img.name}
            </div>
          </div>
        );
      })}
      <div
        ref={loaderRef}
        className="h-10 col-span-4 flex justify-center items-center"
      >
        {loadedCount < allImages.length && <span>Loading more images...</span>}
      </div>
    </div>
  );
};

export default ImageViewer;
