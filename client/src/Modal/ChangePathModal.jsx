import axios from "axios";
import React, { useEffect, useState } from "react";
import { ImageViewer } from "react-iv-viewer";
import "react-iv-viewer/dist/react-iv-viewer.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";

const ChangePathModal = ({ show, onClose, event }) => {
  const [imagePath, setImagePath] = useState("");
  const [thumbPath, setThumbPath] = useState("");
  const [changePath, setChangePath] = useState(false);
  const [path, setPath] = useState(null);
  const [switchImage, setSwitchImage] = useState(false);
  const [allPaths, setAllPaths] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    setChangePath(false);
    setSwitchImage(false);
    setAllPaths([]);
  }, [show]);

  useEffect(() => {
    const fetchCurrentPath = async (dir) => {
      try {
        const res = await axios.get(
          `http://localhost:4000/get-current-paths?pathId=${dir.id} `
        );
        console.log(res);
        if (res?.data?.data) {
          setPath(res?.data?.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    const dir = JSON.parse(localStorage.getItem("pathId"));
    fetchCurrentPath(dir);
    if (dir) {
      fetchCurrentPath(dir);
    }
  }, [show]);

  const handleBrowse = async (setPath) => {
    const result = await window.api.selectFolder();
    if (result && !result.canceled && result.filePaths.length > 0) {
      setPath(result.filePaths[0]);
    }
  };

  const savePathHandler = async () => {
    if (!thumbPath) {
      alert("Please select Pdf Folder");
      return;
    }
    if (!imagePath) {
      alert("Please select Image Folder");
      return;
    }

    try {
      const obj = {
        pdf_Path: thumbPath,
        image_Path: imagePath,
      };
      const res = await axios.post("http://localhost:4000/save-paths", obj);
      if (res.data) {
        localStorage.setItem("pathId", JSON.stringify(res.data.data));
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong");
      }
    }
  };
  const getImagePathHandler = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/get-save-paths`);

      if (res?.data?.data) {
        setAllPaths(res?.data?.data);
        setSwitchImage(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const RenDerAllPAths = allPaths.map((item, index) => {
    const isSelected = currentImage?.id === item.id;

    return (
      <li
        key={index}
        style={{
          padding: "1rem 1.5rem",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.2s",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          wordBreak: "break-word",
          borderRadius: "0.5rem",
          backgroundColor: isSelected ? "#1d4ed8" : "transparent",
          outline: isSelected ? "2px solid #60a5fa" : "none",
        }}
        onClick={() => setCurrentImage(item)}
      >
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}
        >
          <label style={{ fontWeight: "600", color: "#d1d5db" }}>
            Image Path:
          </label>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#60a5fa",
              wordBreak: "break-word",
            }}
          >
            {item.image_Path}
          </p>
        </div>
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}
        >
          <label style={{ fontWeight: "600", color: "#d1d5db" }}>
            PDF Path:
          </label>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#34d399",
              wordBreak: "break-word",
            }}
          >
            {item.pdf_Path}
          </p>
        </div>
      </li>
    );
  });
  const selectPathHandler = () => {
    localStorage.setItem("pathId", JSON.stringify(currentImage));
    window.location.reload();
  };
  return (
    // <div
    //   id="default-modal"
    //   tabIndex="-1"
    //   aria-hidden={!show}
    //   className={`fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full overflow-y-auto overflow-x-hidden backdrop-blur-sm bg-black/30 ${
    //     show ? "" : "hidden"
    //   }`}
    // >
    //   <div className="relative p-4 w-full max-w-2xl max-h-full">
    //     <div className="relative bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all">
    //       {/* Header */}
    //       <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 dark:border-gray-600 rounded-t">
    //         <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
    //           {event === "first" ? "Select Your Path" : "Change Your Path"}
    //         </h3>
    //         {event !== "first" && (
    //           <button
    //             type="button"
    //             onClick={onClose}
    //             className="text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full p-2 transition"
    //             aria-label="Close modal"
    //           >
    //             <svg
    //               className="w-4 h-4"
    //               xmlns="http://www.w3.org/2000/svg"
    //               fill="none"
    //               viewBox="0 0 14 14"
    //             >
    //               <path
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
    //               />
    //             </svg>
    //           </button>
    //         )}
    //       </div>
    //       {path && (
    //         <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg space-y-4">
    //           <section className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
    //             <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
    //               Current Image Path :
    //             </label>
    //             <p className="text-gray-600 dark:text-gray-400 break-all">
    //               {path.image_Path}
    //             </p>
    //           </section>
    //           <section className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
    //             <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
    //               Current PDF Path :
    //             </label>
    //             <p className="text-gray-600 dark:text-gray-400 break-all">
    //               {path.pdf_Path}
    //             </p>
    //           </section>
    //         </div>
    //       )}

    //       {!changePath && (
    //         <div className="flex gap-4 w-full my-5">
    //           <label className="w-1/2">
    //             <input
    //               type="radio"
    //               name="pathOption"
    //               value="choose"
    //               onChange={getImagePathHandler}
    //               className="hidden peer"
    //             />
    //             <div className="cursor-pointer bg-indigo-600 peer-checked:bg-indigo-700 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-300 text-center">
    //               📂 Choose Path
    //             </div>
    //           </label>

    //           <label className="w-1/2">
    //             <input
    //               type="radio"
    //               name="pathOption"
    //               value="change"
    //               onChange={() => {
    //                 setChangePath(true);
    //                 setSwitchImage(false);
    //                 setCurrentImage(null);
    //               }}
    //               className="hidden peer"
    //             />
    //             <div className="cursor-pointer bg-emerald-600 peer-checked:bg-emerald-700 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-300 text-center">
    //               ➕ Add Path
    //             </div>
    //           </label>
    //         </div>
    //       )}

    //       {/* Body */}

    //       {changePath && (
    //         <div className="p-4 md:p-5 space-y-4">
    //           <div>
    //             <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
    //               Image Folder
    //             </label>
    //             <div className="flex gap-2">
    //               <input
    //                 type="text"
    //                 readOnly
    //                 value={imagePath}
    //                 className="flex-1 px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
    //               />
    //               <button
    //                 type="button"
    //                 onClick={() => handleBrowse(setImagePath)}
    //                 className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    //               >
    //                 Browse
    //               </button>
    //             </div>
    //           </div>

    //           <div>
    //             <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
    //               Pdfs Folder
    //             </label>
    //             <div className="flex gap-2">
    //               <input
    //                 type="text"
    //                 readOnly
    //                 value={thumbPath}
    //                 className="flex-1 px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
    //               />
    //               <button
    //                 type="button"
    //                 onClick={() => handleBrowse(setThumbPath)}
    //                 className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    //               >
    //                 Browse
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       )}

    //       {switchImage && (
    //         <div className="w-full  h-96 overflow-y-auto bg-gray-800 rounded-xl shadow-md">
    //           <ul className="divide-y divide-gray-700">
    //             {RenDerAllPAths.length > 0 ? (
    //               RenDerAllPAths
    //             ) : (
    //               <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
    //                 No path saved
    //               </div>
    //             )}
    //           </ul>
    //         </div>
    //       )}

    //       {/* Footer */}
    //       <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-200 dark:border-gray-600">
    //         {changePath && (
    //           <button
    //             type="button"
    //             onClick={savePathHandler}
    //             className="ml-4 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
    //           >
    //             Save Path
    //           </button>
    //         )}
    //         {!currentImage && changePath && (
    //           <button
    //             type="button"
    //             onClick={() => {
    //               setChangePath(false);
    //               setSwitchImage(true);
    //               setCurrentImage(null);
    //             }}
    //             className="ml-4 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
    //           >
    //             Return to path selection
    //           </button>
    //         )}
    //         {currentImage && (
    //           <button
    //             type="button"
    //             onClick={selectPathHandler}
    //             className="ml-4 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
    //           >
    //             Select Path
    //           </button>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div
      id="default-modal"
      tabIndex="-1"
      aria-hidden={!show}
      style={{
        display: show ? "flex" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "calc(100% - 1rem)",
        overflowY: "auto",
        overflowX: "hidden",
        backdropFilter: "blur(4px)",
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
            backgroundColor: "rgb(20, 52, 104)",
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
              borderBottom: "1px solid #e5e7eb",
              borderTopLeftRadius: "0.75rem",
              borderTopRightRadius: "0.75rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              {event === "first" ? "Select Your Path" : "Change Your Path"}
            </h3>
            {event !== "first" && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  color: "#9ca3af",
                  borderRadius: "9999px",
                  padding: "0.5rem",
                  transition: "all 0.2s",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#6b7280")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                <svg
                  className="w-4 h-4"
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
            )}
          </div>

          {path && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#ffffff",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                marginTop: "1rem",
              }}
            >
              {[
                { label: "Current Image Path", value: path.image_Path },
                { label: "Current PDF Path", value: path.pdf_Path },
              ].map((item, i) => (
                <section
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    borderBottom: "1px solid #e5e7eb",
                    paddingBottom: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    {item.label}:
                  </label>
                  <p style={{ color: "#4b5563", wordBreak: "break-word" }}>
                    {item.value}
                  </p>
                </section>
              ))}
            </div>
          )}

          {!changePath && (
            <div style={{ display: "flex", gap: "1rem", margin: "1.25rem 0" }}>
              {[
                {
                  value: "choose",
                  label: "📂 Choose Path",
                  bg: "#4f46e5",
                  hoverBg: "#6366f1",
                },
                {
                  value: "change",
                  label: "➕ Add Path",
                  bg: "#059669",
                  hoverBg: "#10b981",
                  action: () => {
                    setChangePath(true);
                    setSwitchImage(false);
                    setCurrentImage(null);
                  },
                },
              ].map((opt, i) => (
                <label key={i} style={{ flex: 1 }}>
                  <input
                    type="radio"
                    name="pathOption"
                    value={opt.value}
                    onChange={opt.action || getImagePathHandler}
                    style={{ display: "none" }}
                  />
                  <div
                    style={{
                      cursor: "pointer",
                      backgroundColor: opt.bg,
                      color: "#ffffff",
                      fontWeight: "600",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.75rem",
                      textAlign: "center",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = opt.hoverBg)
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = opt.bg)
                    }
                  >
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Change Path Section */}
          {changePath && (
            <div
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {[
                {
                  label: "Image Folder",
                  value: imagePath,
                  setter: setImagePath,
                },
                {
                  label: "PDFs Folder",
                  value: thumbPath,
                  setter: setThumbPath,
                },
              ].map((field, i) => (
                <div key={i}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.25rem",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#ffffff",
                    }}
                  >
                    {field.label}
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      readOnly
                      value={field.value}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        backgroundColor: "#f3f4f6",
                        color:"black"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleBrowse(field.setter)}
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        borderRadius: "0.5rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1d4ed8")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "#2563eb")
                      }
                    >
                      Browse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Switch Image View */}
          {switchImage && (
            <div
              style={{
                width: "100%",
                height: "24rem",
                overflowY: "auto",
                backgroundColor: "#1f2937",
                borderRadius: "0.75rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "0.5rem",
              }}
            >
              <ul style={{ borderTop: "1px solid #374151" }}>
                {RenDerAllPAths.length > 0 ? (
                  RenDerAllPAths
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      fontStyle: "italic",
                    }}
                  >
                    No path saved
                  </div>
                )}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.25rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {changePath && (
              <button
                type="button"
                onClick={savePathHandler}
                style={{
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  backgroundColor: "#1d4ed8",
                  color: "#ffffff",
                  borderRadius: "0.5rem",
                  transition: "background-color 0.2s",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Path
              </button>
            )}
            {!currentImage && changePath && (
              <button
                type="button"
                onClick={() => {
                  setChangePath(false);
                  setSwitchImage(true);
                  setCurrentImage(null);
                }}
                style={{
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  backgroundColor: "#059669",
                  color: "#ffffff",
                  borderRadius: "0.5rem",
                  transition: "background-color 0.2s",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Return to path selection
              </button>
            )}
            {currentImage && (
              <button
                type="button"
                onClick={selectPathHandler}
                style={{
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  backgroundColor: "#1d4ed8",
                  color: "#ffffff",
                  borderRadius: "0.5rem",
                  transition: "background-color 0.2s",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Select Path
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePathModal;
