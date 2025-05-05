import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ImageViewer from "./Components/ImageViewer";
import axios from "axios";
import Tabswitcher from "./Components/Tabswitcher";
import { FaFilePdf, FaTools } from "react-icons/fa";
import AllImageViewer from "./Views/allImageViewer";
import PdfViewer from "./Views/PdfVierwer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  const [count, setCount] = useState(0);
  const [selectedImages, setSelectedImages] = useState(0);
  const [trigger, setTrigger] = useState(false);
  const tabs = [
    { label: "Pdf Maker", icon: FaTools },
    { label: "All Pdfs", icon: FaFilePdf },
  ];
  const handleTabChange = (index) => {
    console.log("Selected tab index:", index);
    setSelectedImages(index);
    // Perform tab-based logic here
  };

  return (
    <>
      <Tabswitcher tabs={tabs} onTabChange={handleTabChange} />
      {selectedImages === 0 && <AllImageViewer />}
      {selectedImages === 1 && <PdfViewer />}
      <ToastContainer
        // position="top-center"
        // autoClose={2000}
        // hideProgressBar={false}
        // newestOnTop
        // closeOnClick={false}
        // rtl={false}
        // pauseOnFocusLoss={false}
        // draggable
        // pauseOnHover
        // theme="dark"
        // transition={Slide}
      />
    </>
  );
}

export default App;
