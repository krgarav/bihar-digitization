import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

const RemoveImageViewer = ({
  selectedImages,
  setSelectedImages,
  trigger,
  pdfId,
}) => {
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
        const firstBatch = await axios.get(
          "http://localhost:4000/edit-remove-images-to-pdf?pdfId=" + pdfId
        );
        console.log(firstBatch);
        const result = firstBatch?.data?.pdfNames;
        console.log(result);
        setAllImages(result); // Consider renaming this to `loadedImages`
        setDisplayedImages(result);
        setLoadedCount(result.length);
      } catch (err) {
        console.error("Failed to load images:", err);
        setError("Failed to load images");
      }
    };

    fetchImages();
  }, [trigger]);

  const handleImageClick = (imgName) => {
    setSelectedImages((prev) => {
      const updated = new Set(prev);
      updated.has(imgName) ? updated.delete(imgName) : updated.add(imgName);
      return updated;
    });
  };
  console.log(suggestions);
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
  console.log(error);
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 h-screen ">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedImages.map((img, index) => {
          const isSelected = selectedImages.has(img);
          const imgName = img["file_name"];

          return (
            <div
              key={index}
              className="flex flex-col items-center border p-2 rounded shadow hover:shadow-lg"
              onClick={() => handleImageClick(img["file_name"])}
            >
              <div className="relative">
                <img
                  src={`http://localhost:4000/pdfImages/${imgName}
                  `}
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
                title={img["file_name"]}
              >
                {img["file_name"]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RemoveImageViewer;
