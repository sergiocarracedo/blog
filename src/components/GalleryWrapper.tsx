'use client';

import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface GalleryWrapperProps {
  images: string[] | string;
  cols?: number;
}

function parseImages(imagesProp: string[] | string): string[] {
  if (typeof imagesProp === 'string') {
    try {
      return JSON.parse(imagesProp);
    } catch {
      return [];
    }
  }
  return imagesProp || [];
}

export default function GalleryWrapper({
  images: imagesProp,
  cols = 3,
}: GalleryWrapperProps): ReactElement | null {
  const images = useMemo(() => parseImages(imagesProp), [imagesProp]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleImageClick = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

  if (!images || images.length === 0) {
    return null;
  }

  const galleryStyle: React.CSSProperties & Record<string, unknown> = {
    '--gallery-cols': cols,
  };

  const isModalOpen = selectedIndex !== null;
  const currentImageSrc = isModalOpen && selectedIndex !== null ? images[selectedIndex] : '';

  return (
    <>
      <div className="gallery-grid" style={galleryStyle}>
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Gallery image ${index + 1}`}
            className="gallery-image"
            onClick={() => {
              handleImageClick(index);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleImageClick(index);
              }
            }}
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="gallery-modal-overlay" onClick={handleClose}>
          <div
            className="gallery-modal-content"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              className="gallery-modal-close"
              onClick={handleClose}
              aria-label="Close gallery"
            >
              ✕
            </button>

            <button
              className="gallery-modal-nav gallery-modal-prev"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              ←
            </button>

            <div className="gallery-modal-image-container">
              <img
                src={currentImageSrc}
                alt={`Gallery image ${(selectedIndex ?? 0) + 1}`}
                className="gallery-modal-image"
              />
            </div>

            <button
              className="gallery-modal-nav gallery-modal-next"
              onClick={handleNext}
              aria-label="Next image"
            >
              →
            </button>

            <div className="gallery-modal-counter">
              {(selectedIndex ?? 0) + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
