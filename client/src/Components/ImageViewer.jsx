import { useEffect, useState } from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
const ImageViewer = ({ selectedImages, setSelectedImages, trigger }) => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  //   const [selectedImages, setSelectedImages] = useState(new Set());

  useEffect(() => {
    const fetchImages = async () => {
      const result = await window.api.getImages();

      if (Array.isArray(result)) {
        setImages(result);
      } else {
        setError(result.error);
      }
    };

    fetchImages();
  }, [trigger]);

  const handleImageClick = (imgName) => {
    setSelectedImages((prevSelectedImages) => {
      const updatedSelectedImages = new Set(prevSelectedImages);
      if (updatedSelectedImages.has(imgName)) {
        updatedSelectedImages.delete(imgName); // Remove if already selected
      } else {
        updatedSelectedImages.add(imgName); // Add to selected
      }
      return updatedSelectedImages;
    });
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4  h-screen grid grid-cols-4 gap-4">
      {images.map((img, index) => {
        const isSelected = selectedImages.has(img.name); // Check if the image is selected
        return (
          <div
            key={index}
            className="flex flex-col items-center border p-2 rounded shadow hover:shadow-lg"
            onClick={() => handleImageClick(img.name)} // Toggle selection on click
          >
            <div className="relative">
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-40 object-cover rounded"
              />
              <div className="absolute top-2 right-2">
                {/* Render tick icon if image is selected */}
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
  );
};

export default ImageViewer;
