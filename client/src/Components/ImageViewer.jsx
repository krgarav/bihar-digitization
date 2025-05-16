import { useEffect, useState, useRef, useCallback } from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import Spinner from "./Spinner";
import { ImageViewer as ImgView } from "react-iv-viewer";
import ImageModal from "../Modal/ImageModal";
const ImageViewer = ({
  selectedImages,
  setSelectedImages,
  setDisplayedImages,
  displayedImages,
  trigger,
}) => {
  const batchSize = 50;
  const [allImages, setAllImages] = useState([]); // full list of image metadata
  // const [displayedImages, setDisplayedImages] = useState([]); // what’s currently rendered
  const [loadedCount, setLoadedCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showImageViewerName, setShowImageViewerName] = useState(null);
  const debounceTimeout = useRef(null);
  const loaderRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const searchRef = useRef(null);
  const hasMounted = useRef(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]); // Close suggestions
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch all image metadata on mount or trigger change
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const dir = JSON.parse(localStorage.getItem("pathId"));
        const firstBatch = await window.api.getImageList(
          0,
          batchSize,
          dir["image_Path"]
        );
        setAllImages(firstBatch); // Consider renaming this to `loadedImages`
        setDisplayedImages(firstBatch);
        setLoadedCount(firstBatch.length);
      } catch (err) {
        setError("Failed to load images");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [trigger]);

  const loadMoreImages = useCallback(async () => {
    try {
      const dir = JSON.parse(localStorage.getItem("pathId"));
      const newImages = await window.api.getImageList(
        loadedCount,
        batchSize,
        dir["image_Path"]
      );
      setDisplayedImages((prev) => [...prev, ...newImages]);
      setLoadedCount((prev) => prev + newImages.length);

      if (newImages.length < batchSize) {
        setHasMore(false); // Stop loading if fewer than batchSize returned
      }
    } catch (err) {
      console.error("Failed to load more images:", err);
    }
  }, [loadedCount, batchSize]);

  // Use Intersection Observer to trigger loading more
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          if (hasMounted.current) {
            console.log("Loading more images...");
            loadMoreImages();
          } else {
            hasMounted.current = true; // skip first time
          }
        }
      },
      { threshold: 1 }
    );

    const target = loaderRef.current;
    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadMoreImages, hasMore]);

  const handleImageClick = (event, imgName) => {
    event.stopPropagation(); // Prevents event bubbli
    setSelectedImages((prev) => {
      const updated = new Set(prev);
      updated.has(imgName) ? updated.delete(imgName) : updated.add(imgName);
      return updated;
    });
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
    const obj = {
      name: name,
      src: `http://localhost:4000/thumbnail/${name}`,
    };
    const arr = Array.from(selectedImages).map((item) => {
      return { name: item, src: `http://localhost:4000/thumbnail/${item}` };
    });
    setSearchQuery(name);
    setDisplayedImages([obj, ...arr]);
  };
  const handleImageViewer = (imgName) => {
    setShowImageViewerName(imgName);
    setShowImageViewer(true);
    console.log(imgName);
  };
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="p-4  h-[65vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center border p-2 rounded shadow animate-pulse"
                >
                  <div className="relative w-full h-40 bg-gray-300 rounded"></div>
                  <div className="mt-2 w-3/4 h-4 bg-gray-300 rounded"></div>
                </div>
              ))
            : displayedImages.map((img, index) => {
                const isSelected = selectedImages.has(img.name);
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center border p-2 rounded shadow hover:shadow-lg cursor-pointer"
                    onClick={() => handleImageViewer(img.name)}
                  >
                    <div className="relative">
                      <img
                        src={img.src}
                        alt={img.name}
                        className="w-full h-40 object-cover rounded"
                      />
                      <div
                        className="absolute top-2 right-2 cursor-pointer"
                        onClick={(event) => handleImageClick(event, img.name)}
                      >
                        {isSelected ? (
                          <FaCheckCircle
                            color="green"
                            className="text-green-500 text-xl"
                          />
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
        </div>

        <div
          ref={loaderRef}
          className="h-10 col-span-4 flex justify-center items-center"
        >
          {loadedCount < allImages.length && (
            <span>Loading more images...</span>
          )}
        </div>
      </div>
      <ImageModal
        isOpen={showImageViewer}
        onClose={() => {
          setShowImageViewer(false);
        }}
        imageName={showImageViewerName}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
      />
    </>
  );
};

export default ImageViewer;
