import React, { useRef, useState } from "react";
import ImageViewer from "../Components/ImageViewer";
import NameModal from "../Modal/NameModal";
const styles = {
  container: {
    height: "94vh",
    backgroundColor: "#1f2937", // Tailwind's bg-gray-900
    padding: "1.5rem",
    fontFamily: "sans-serif",
  },
  headerSection: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#ffffff", // dark:text-white
    marginBottom: "1.5rem",
  },
  searchContainer: {
    position: "relative",
    width: "50%",
  },
  searchInput: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.25rem",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    outline: "none",
  },
  searchInputFocus: {
    boxShadow: "0 0 0 3px rgba(96,165,250,0.5)", // Tailwind's ring-2 ring-blue-400
  },
  suggestionsList: {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    color: "#000000",
    border: "1px solid #d1d5db",
    borderTop: "none",
    borderRadius: "0 0 0.5rem 0.5rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  suggestionItem: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  suggestionItemHover: {
    backgroundColor: "#f3f4f6",
  },
  contentContainer: {
    backgroundColor: "#1f2937", // Tailwind's bg-gray-800
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    borderRadius: "0.5rem",
    padding: "1rem",
    marginTop: "1.5rem",
  },
  viewerArea: {
    height: "70vh",
    overflowY: "auto",
    borderRadius: "0.25rem",
    border: "1px solid #374151", // Tailwind's dark:border-gray-700
    padding: "0.5rem",
    backgroundColor: "#374151",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "1rem",
  },
  button: {
    backgroundColor: "#2563eb", // Tailwind's bg-blue-600
    color: "#ffffff",
    fontWeight: "500",
    padding: "0.5rem 1.5rem",
    borderRadius: "0.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "background-color 0.2s ease-in-out",
    cursor: "pointer",
  },
};
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
    // <div className="h-[94vh] bg-gray-900 p-6">
    //   {/* Header */}
    //   <section className="relative flex justify-between items-start">
    //     <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
    //       🖼️ Image Browser
    //     </h1>
    //     <div className="relative w-[50%]">
    //       <input
    //         type="text"
    //         placeholder="Search images by name..."
    //         className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    //         value={searchQuery}
    //         onChange={(e) => handleSearchChange(e.target.value)}
    //       />
    //       {suggestions.length > 0 && (
    //         <ul className="absolute top-full left-0 w-full bg-white text-black border border-t-0 border-gray-300 rounded-b-lg shadow-md z-10">
    //           {suggestions.map((name, index) => (
    //             <li
    //               key={index}
    //               onClick={() => {
    //                 handleSearchClick(name);
    //                 setSuggestions([]);
    //               }}
    //               className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
    //             >
    //               {name}
    //             </li>
    //           ))}
    //         </ul>
    //       )}
    //     </div>
    //   </section>

    //   {/* Main Content Container */}
    //   <div className="bg-gray-800 shadow-md rounded-lg p-4 space-y-6">
    //     {/* Image Viewer Scrollable Area */}
    //     <div className="h-[70vh] overflow-y-auto rounded border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-700">
    //       <ImageViewer
    //         selectedImages={selectedImages}
    //         setSelectedImages={setSelectedImages}
    //         trigger={trigger}
    //         setDisplayedImages={setDisplayedImages}
    //         displayedImages={displayedImages}
    //       />
    //     </div>
    //     {/* Action Button */}
    //     {selectedImages.size > 0 && (
    //       <div className="flex justify-end">
    //         <button
    //           id="pdfButton"
    //           onClick={saveHandler}
    //           className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition duration-200"
    //         >
    //           📄 Create PDF of Selected Images
    //         </button>
    //       </div>
    //     )}
    //   </div>
    //   {/* Modal Component */}
    //   <NameModal
    //     show={show}
    //     selectedImages={selectedImages}
    //     onClose={() => {
    //       setShow(false);
    //       setSelectedImages(new Set());
    //     }}
    //     setTrigger={setTrigger}
    //     trigger={trigger}
    //   />
    // </div>
    <div style={styles.container}>
      {/* Header */}
      <section style={styles.headerSection}>
        <h1 style={styles.headerTitle}>🖼️ Image Browser</h1>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search images by name..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul style={styles.suggestionsList}>
              {suggestions.map((name, index) => (
                <li
                  key={index}
                  onClick={() => {
                    handleSearchClick(name);
                    setSuggestions([]);
                  }}
                  style={styles.suggestionItem}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Main Content Container */}
      <div style={styles.contentContainer}>
        {/* Image Viewer Scrollable Area */}
        <div style={styles.viewerArea}>
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
          <div style={styles.buttonContainer}>
            <button id="pdfButton" onClick={saveHandler} style={styles.button}>
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
