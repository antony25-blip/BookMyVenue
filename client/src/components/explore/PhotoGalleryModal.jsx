import React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const imgSrc = (img) =>
  img?.startsWith("/uploads")
    ? `http://localhost:5001${img}`
    : img || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800";

export default function PhotoGalleryModal({
  galleryPhotos,
  galleryVenueName,
  largePhotoIndex,
  setLargePhotoIndex,
  onClose
}) {
  if (!galleryPhotos) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-content glass-panel" style={{ maxWidth: "680px", width: "100%" }}>
        <div className="modal-header">
          <h3 className="modal-title">{galleryVenueName} — Photos</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {largePhotoIndex !== null ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                background: "rgba(0,0,0,0.03)",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                position: "relative"
              }}
            >
              {/* Slider Control Layout */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: "16px"
                }}
              >
                {/* Previous Button */}
                <button
                  className="btn btn-secondary"
                  style={{
                    padding: "8px",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                  onClick={() =>
                    setLargePhotoIndex((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1))
                  }
                  title="Previous Photo"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Image Viewer */}
                <div
                  style={{
                    flexGrow: 1,
                    maxHeight: "380px",
                    display: "flex",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "8px"
                  }}
                >
                  <img
                    src={imgSrc(galleryPhotos[largePhotoIndex])}
                    alt={`Magnified preview index ${largePhotoIndex}`}
                    style={{ maxWidth: "100%", maxHeight: "380px", objectFit: "contain", borderRadius: "6px" }}
                  />
                </div>

                {/* Next Button */}
                <button
                  className="btn btn-secondary"
                  style={{
                    padding: "8px",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                  onClick={() =>
                    setLargePhotoIndex((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1))
                  }
                  title="Next Photo"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Photo Index Indicator */}
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                Photo {largePhotoIndex + 1} of {galleryPhotos.length}
              </div>

              {/* Back Action */}
              <button
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                onClick={() => setLargePhotoIndex(null)}
              >
                Back to Gallery
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "16px" }}>
              {galleryPhotos.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLargePhotoIndex(idx)}
                  style={{
                    height: "100px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    cursor: "pointer",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <img src={imgSrc(img)} alt={`Thumb ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
