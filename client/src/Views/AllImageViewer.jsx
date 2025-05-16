import React, { useRef, useState } from "react";
import ImageViewer from "../Components/ImageViewer";
import NameModal from "../Modal/NameModal";

const AllImageViewer = () => {
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [trigger, setTrigger] = useState(false);
  const [show, setShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [displayedImages, setDisplayedImages] = useState([]); // what’s currently rendered
  const debounceTimeout = useRef(null);
  const saveHandler = async () => {
    setShow(true);
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
      const dirName = JSON.parse(localStorage.getItem("pathId"));
      const filenames = await window.api.searchImages(
        value,
        dirName?.image_Path
      ); // get filenames from backend
      console.log(filenames);
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
    <div className="h-[94vh] bg-gray-900 p-6">
      {/* Header */}
      <section className="relative flex justify-between items-start">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          🖼️ Image Browser
        </h1>
        <div className="relative w-[50%]">
          <input
            type="text"
            placeholder="Search images by name..."
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-white text-black border border-t-0 border-gray-300 rounded-b-lg shadow-md z-10">
              {suggestions.map((name, index) => (
                <li
                  key={index}
                  onClick={() => {
                    handleSearchClick(name);
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
      </section>

      {/* Main Content Container */}
      <div className="bg-gray-800 shadow-md rounded-lg p-4 space-y-6">
        {/* Image Viewer Scrollable Area */}
        <div className="h-[70vh] overflow-y-auto rounded border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-700">
          <ImageViewer
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            trigger={trigger}
            setDisplayedImages={setDisplayedImages}
            displayedImages={displayedImages}
          />
        </div>
        {/* Action Button */}
        {selectedImages.size > 0 && (
          <div className="flex justify-end">
            <button
              id="pdfButton"
              onClick={saveHandler}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition duration-200"
            >
              📄 Create PDF of Selected Images
            </button>
          </div>
        )}
      </div>
      {/* Modal Component */}
      <NameModal
        show={show}
        selectedImages={selectedImages}
        onClose={() => {
          setShow(false);
          setSelectedImages(new Set());
        }}
        setTrigger={setTrigger}
        trigger={trigger}
      />
    </div>
  );
};

export default AllImageViewer;
