import React, { useRef, useState } from "react";

const ZoomableImageViewer = ({
  imageUrl,
  width = "640px",
  height = "100%",
}) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + zoomIntensity, 5));
    } else {
      setScale((prev) => Math.max(prev - zoomIntensity, 0.5));
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      style={{
        width,
        height,
        overflow: "auto",
        border: "1px solid #ccc",
        position: "relative",
      }}
    >
      <img
        src={imageUrl}
        alt="Zoomable"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          display: "block",
        }}
      />
    </div>
  );
};

export default ZoomableImageViewer;
