import { useEffect, useState, useRef, useCallback } from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

const ImageViewer = ({ selectedImages, setSelectedImages, trigger }) => {
  const batchSize = 50;
  const [allImages, setAllImages] = useState([]); // full list of image metadata
  const [displayedImages, setDisplayedImages] = useState([]); // what’s currently rendered
  const [loadedCount, setLoadedCount] = useState(0);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
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
        const firstBatch = await window.api.getImageList(0, batchSize);
        console.log(firstBatch);
        setAllImages(firstBatch); // Consider renaming this to `loadedImages`
        setDisplayedImages(firstBatch);
        setLoadedCount(firstBatch.length);
      } catch (err) {
        setError("Failed to load images");
      }
    };

    fetchImages();
  }, [trigger]);

  const loadMoreImages = useCallback(async () => {
    try {
      const newImages = await window.api.getImageList(loadedCount, batchSize);
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

  const handleImageClick = (imgName) => {
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
        setDisplayedImages(allImages); // Reset to full list
        setSearchQuery(null);
        setSuggestions([]);

        return;
      }

      const filenames = await window.api.searchImages(value); // get filenames from backend
      const filteredImages = allImages.filter((img) =>
        filenames.includes(img.name)
      );

      setDisplayedImages(filteredImages);
      setSuggestions(filenames.slice(0, 5)); // just names for suggestions
    }, 300);
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4  h-[65vh] overflow-y-auto">
      <div className="mb-4 max-w-md mx-auto relative">
        <input
          type="text"
          placeholder="Search images by name..."
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          // value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul
            ref={searchRef}
            className="absolute top-full left-0 w-full text-black bg-white border border-t-0 border-gray-300 rounded-b-lg shadow-md z-10"
          >
            {suggestions.map((name, index) => (
              <li
                key={index}
                onClick={() => {
                  handleSearchChange(name);
                  setSuggestions([]);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
      </div>
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
