import React, { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  isFeatured?: boolean;
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, isFeatured, productName }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="product-gallery-container">
      {/* Main Large Image */}
      <div className="product-image-main-wrapper">
        {isFeatured && <span className="badge-featured">Destaque</span>}

        <div 
          className="product-image-main-display"
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={images[activeImageIndex]}
            alt={`${productName} - Imagem Principal`}
            style={{ opacity: isHoveringImage ? 0 : 1 }}
            loading="lazy"
          />
          
          {isHoveringImage && (
            <div 
              className="product-zoom-view"
              style={{
                backgroundImage: `url(${images[activeImageIndex]})`,
                backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}
        </div>
      </div>

      {/* Thumbnails List Below */}
      {images.length > 1 && (
        <div className="product-thumbnails-list">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`thumbnail-item-btn ${activeImageIndex === idx ? 'active' : ''}`}
            >
              <img src={img} alt={`Miniatura ${idx + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
