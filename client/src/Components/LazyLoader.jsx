import { useState, useEffect } from "react";
import { ImageViewer } from "react-iv-viewer";

const LazyImageViewer = ({ currentIndex, imageArray, dir }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState(null);

  const src = `http://localhost:4000/view-image/${imageArray[currentIndex]}?dir=${dir["image_Path"]}`;
  
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.loading = "lazy";
    img.onload = () => {
      setLoadedSrc(src);
      setIsImageLoaded(true);
    };
  }, [src]);

  return isImageLoaded ? (
    <ImageViewer
      img={loadedSrc}
      width="640px"
      height="100%"
      showNavigator={false}
      zoomValue={1}
    />
  ) : (
    <div
      style={{
        width: "640px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span>Loading image...</span>
    </div>
  );
};

export default LazyImageViewer;
