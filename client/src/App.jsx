import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ImageViewer from "./Components/ImageViewer";
import axios from "axios";

function App() {
  const [count, setCount] = useState(0);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [trigger, setTrigger] = useState(false);
  const saveHandler = async () => {

    try {
      const imageArray = Array.from(selectedImages); // Convert Set to Array

      const response = await axios.post("http://localhost:4000/process-pdf", {
        images: imageArray,
      });

      setTrigger(!trigger)
      console.log("Response:", response.data);
      alert("Images moved successfully!");
    } catch (error) {
      console.error("Error saving images:", error);
      alert("Failed to move images.");
    }
  };
  return (
    <>
      <div>
        <h1 className="text-xl font-bold m-4">Image Browser</h1>
        <div className="h-[80vh] overflow-auto">
          <ImageViewer
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            trigger={trigger}
          />
        </div>
        <div
          onClick={saveHandler}
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 cursor-pointer transition duration-200"
        >
          Save Selected Image
        </div>
      </div>
    </>
  );
}

export default App;
