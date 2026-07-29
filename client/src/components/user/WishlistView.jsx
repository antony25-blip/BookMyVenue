import React from "react";
import { MapPin, Trash } from "lucide-react";

const imgSrc = (img) =>
  img?.startsWith("/uploads")
    ? `http://localhost:5001${img}`
    : img || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800";

export default function WishlistView({
  venues,
  wishlist,
  toggleWishlist,
  setGalleryPhotos,
  setGalleryVenueName,
  setLargePhotoIndex,
  openVenueDetail
}) {
  const savedVenues = venues.filter((v) => wishlist.includes(v._id));

  return (
    <main className="main-content" style={{ maxWidth: "1600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem" }}>Saved Venues</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>Spaces you've bookmarked for quick access.</p>

      {savedVenues.length === 0 ? (
        <div className="glass-panel" style={{ padding: "50px", textAlign: "center", color: "var(--text-secondary)" }}>
          Your wishlist is empty.
        </div>
      ) : (
        <div className="grid-cards">
          {savedVenues.map((v) => (
            <div key={v._id} className="glass-panel venue-card">
              <img
                src={imgSrc(v.images?.[0])}
                alt={v.name}
                className="venue-card-img"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setGalleryPhotos(v.images || []);
                  setGalleryVenueName(v.name);
                  setLargePhotoIndex(0);
                }}
              />
              <div className="venue-card-body">
                <div className="venue-card-title">
                  <span className="venue-title-text">{v.name}</span>
                  <span className="venue-price">
                    ₹{v.pricePerHour}
                    <span>/hr</span>
                  </span>
                </div>
                <div className="venue-meta">
                  <span>
                    <MapPin size={13} />
                    {v.location}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "12px" }}>
                  <button className="btn btn-primary" style={{ flexGrow: 1 }} onClick={() => openVenueDetail(v)}>
                    Book Now
                  </button>
                  <button className="btn btn-danger" onClick={() => toggleWishlist(v._id)}>
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
