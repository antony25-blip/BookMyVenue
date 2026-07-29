import React from "react";
import { Search, Building, MapPin } from "lucide-react";
import VenueCard from "./VenueCard";

export default function ExploreView({
  filters,
  setFilters,
  fetchVenues,
  categories,
  locations,
  venues,
  user,
  wishlist,
  toggleWishlist,
  setGalleryPhotos,
  setGalleryVenueName,
  setLargePhotoIndex,
  openVenueDetail
}) {
  return (
    <>
      <section className="landing-hero">
        <h1 className="landing-title">
          Find and Book <span className="gradient-text">Premium Spaces</span> Instantly
        </h1>
        <p className="landing-subtitle">
          Real-time, conflict-free venue reservations for events, meetups, birthdays, and retreats across Kerala.
        </p>

        <div className="search-bar-container">
          <div className="search-input-wrap">
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Search venues, locations..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && fetchVenues()}
            />
          </div>
          <div className="search-divider" />
          <div className="search-select-wrap">
            <Building size={16} style={{ color: "var(--text-secondary)" }} />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Types</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="search-divider" />
          <div className="search-select-wrap">
            <MapPin size={16} style={{ color: "var(--text-secondary)" }} />
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => fetchVenues()}>
            Search
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
          <input
            type="number"
            className="form-input"
            style={{ width: "150px", padding: "8px 12px" }}
            placeholder="Min ₹/hr"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <input
            type="number"
            className="form-input"
            style={{ width: "150px", padding: "8px 12px" }}
            placeholder="Max ₹/hr"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
          <input
            type="number"
            className="form-input"
            style={{ width: "130px", padding: "8px 12px" }}
            placeholder="Min Guests"
            value={filters.capacity}
            onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
          />
          {Object.values(filters).some(Boolean) && (
            <button
              className="btn btn-secondary"
              style={{ padding: "8px 14px", fontSize: "0.85rem" }}
              onClick={() => {
                const f = { search: "", category: "", location: "", minPrice: "", maxPrice: "", capacity: "" };
                setFilters(f);
                fetchVenues(f);
              }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      <main className="main-content" style={{ maxWidth: "1600px", margin: "0 auto", paddingBottom: "80px" }}>
        {venues.length === 0 ? (
          <div className="glass-panel" style={{ padding: "60px", textAlign: "center", color: "var(--text-secondary)" }}>
            <Building size={40} style={{ opacity: 0.3, marginBottom: "16px" }} />
            <p>No venues found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {venues.map((v) => (
              <VenueCard
                key={v._id}
                venue={v}
                user={user}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                setGalleryPhotos={setGalleryPhotos}
                setGalleryVenueName={setGalleryVenueName}
                setLargePhotoIndex={setLargePhotoIndex}
                openVenueDetail={openVenueDetail}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
