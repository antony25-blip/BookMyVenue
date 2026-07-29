import React from "react";
import { Heart, MapPin, Users, Clock } from "lucide-react";

const imgSrc = (img) =>
  img?.startsWith("/uploads")
    ? `http://localhost:5001${img}`
    : img || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800";

export default function VenueCard({
  venue,
  user,
  wishlist,
  toggleWishlist,
  setGalleryPhotos,
  setGalleryVenueName,
  setLargePhotoIndex,
  openVenueDetail
}) {
  const isWishlisted = wishlist.includes(venue._id);

  return (
    <div className="glass-panel venue-card">
      <div style={{ position: "relative" }}>
        <img
          src={imgSrc(venue.images?.[0])}
          alt={venue.name}
          className="venue-card-img"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setGalleryPhotos(venue.images || []);
            setGalleryVenueName(venue.name);
            setLargePhotoIndex(0);
          }}
        />
        <span
          className="role-tag role-owner"
          style={{ position: "absolute", top: "12px", left: "12px", borderRadius: "6px", padding: "4px 10px" }}
        >
          {venue.category}
        </span>
        {(!user || user.role === "user") && (
          <button
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={() => toggleWishlist(venue._id)}
          >
            <Heart
              size={16}
              fill={isWishlisted ? "#ef4444" : "none"}
              style={{ color: isWishlisted ? "#ef4444" : "#fff" }}
            />
          </button>
        )}
      </div>
      <div className="venue-card-body">
        <div className="venue-card-title">
          <span className="venue-title-text">{venue.name}</span>
          <span className="venue-price">
            ₹{venue.pricePerHour}
            <span>/hr</span>
          </span>
        </div>
        {venue.pricePerDay > 0 && (
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
            Also ₹{venue.pricePerDay}/day
          </div>
        )}
        <div className="venue-meta">
          <span>
            <MapPin size={13} />
            {venue.location}
          </span>
          <span>
            <Users size={13} />
            Max {venue.capacity}
          </span>
          <span>
            <Clock size={13} />
            {venue.openTime || "08:00"}–{venue.closeTime || "22:00"}
          </span>
        </div>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
          {(venue.description || "").substring(0, 90)}
          {(venue.description || "").length > 90 ? "..." : ""}
        </p>
        <div className="venue-amenity-tags">
          {venue.amenities.slice(0, 3).map((a, i) => (
            <span key={i} className="amenity-tag">
              {a}
            </span>
          ))}
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "auto" }}
          onClick={() => openVenueDetail(venue)}
        >
          View Details & Book
        </button>
      </div>
    </div>
  );
}
