import React from "react";
import { X, MapPin, Users, Clock, Star, Calendar } from "lucide-react";

const imgSrc = (img) =>
  img?.startsWith("/uploads")
    ? `http://localhost:5001${img}`
    : img || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800";

// Generate 1-hour slots between openTime and closeTime
const generateSlots = (openTime = "08:00", closeTime = "22:00", gapHours = 4, setupHours = 2, bookedSlots = []) => {
  const slots = [];
  const [openH] = openTime.split(":").map(Number);
  const [closeH] = closeTime.split(":").map(Number);
  const gapMins = gapHours * 60;
  const setupMins = setupHours * 60;

  for (let h = openH; h < closeH; h++) {
    const start = `${String(h).padStart(2, "0")}:00`;
    const end = `${String(h + 1).padStart(2, "0")}:00`;
    const startMins = h * 60;
    const endMins = (h + 1) * 60;

    const isBlocked = bookedSlots.some((s) => {
      const existStart = s.startTime.split(":").map(Number);
      const existEnd = s.endTime.split(":").map(Number);
      const existStartMins = existStart[0] * 60 + existStart[1];
      const existEndMins = existEnd[0] * 60 + existEnd[1];
      // Conflict if within setup/cleanup gap zone of existing booking
      return startMins < (existEndMins + gapMins) && endMins > (existStartMins - setupMins);
    });

    slots.push({ label: `${start} – ${end}`, start, end, isBlocked });
  }
  return slots;
};

export default function VenueDetailModal({
  selectedVenue,
  setSelectedVenue,
  user,
  reviews,
  avgRating,
  bookingType,
  setBookingType,
  bookingDate,
  setBookingDate,
  bookingEndDate,
  setBookingEndDate,
  bookingGuests,
  setBookingGuests,
  bookedSlots,
  isDayAvailable,
  selectedSlotRange,
  reviewForm,
  setReviewForm,
  handleAddReview,
  handleCreateBooking,
  fetchAvailability,
  handleSlotClick,
  setGalleryPhotos,
  setGalleryVenueName,
  setLargePhotoIndex
}) {
  if (!selectedVenue) return null;

  const getBookingHours = () => {
    if (!selectedSlotRange.start || !selectedSlotRange.end) return 0;
    const [sh] = selectedSlotRange.start.split(":").map(Number);
    const [eh] = selectedSlotRange.end.split(":").map(Number);
    return eh - sh;
  };

  const isSlotInRange = (slot) => {
    if (!selectedSlotRange.start) return false;
    return (
      slot.start >= selectedSlotRange.start &&
      slot.end <= (selectedSlotRange.end || selectedSlotRange.start)
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: "720px" }}>
        <div className="modal-header">
          <h3 className="modal-title">{selectedVenue.name}</h3>
          <button className="modal-close" onClick={() => setSelectedVenue(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {/* Image Gallery */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "20px", paddingBottom: "4px" }}>
            {(selectedVenue.images || []).map((img, i) => (
              <img
                key={i}
                src={imgSrc(img)}
                alt={`${selectedVenue.name} ${i + 1}`}
                style={{ height: "180px", width: "260px", objectFit: "cover", borderRadius: "10px", flexShrink: 0, cursor: "pointer" }}
                onClick={() => {
                  setGalleryPhotos(selectedVenue.images || []);
                  setGalleryVenueName(selectedVenue.name);
                  setLargePhotoIndex(i);
                }}
              />
            ))}
          </div>

          {/* Info Row */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                <MapPin size={15} /> {selectedVenue.address}, {selectedVenue.location}
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <Users size={14} /> {selectedVenue.capacity} guests max
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <Clock size={14} /> Open: {selectedVenue.openTime || "08:00"} – {selectedVenue.closeTime || "22:00"}
                </span>
                {avgRating && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#fbbf24", fontWeight: 600, fontSize: "0.85rem" }}>
                    <Star size={14} fill="#fbbf24" /> {avgRating}/5
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--secondary)" }}>
                ₹{selectedVenue.pricePerHour}
                <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--text-secondary)" }}>/hr</span>
              </div>
              {selectedVenue.pricePerDay > 0 && (
                <div style={{ fontSize: "1rem", color: "var(--primary)", fontWeight: 600 }}>
                  ₹{selectedVenue.pricePerDay}
                  <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--text-secondary)" }}>/day</span>
                </div>
              )}
            </div>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
            {selectedVenue.description}
          </p>

          {selectedVenue.amenities?.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontWeight: 600, marginBottom: "8px", fontFamily: "var(--font-heading)" }}>Amenities</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selectedVenue.amenities.map((a, i) => (
                  <span key={i} className="amenity-tag" style={{ padding: "4px 12px" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* BOOKING MODULE */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: "16px" }}>Book This Space</h4>

            {/* Booking Type Toggle */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                className={`btn ${bookingType === "hourly" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setBookingType("hourly")}
              >
                <Clock size={16} /> Hourly
              </button>
              {selectedVenue.pricePerDay > 0 && (
                <button
                  className={`btn ${bookingType === "daily" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setBookingType("daily")}
                >
                  <Calendar size={16} /> Daily
                </button>
              )}
            </div>

            {/* Date + Guests Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: bookingType === "daily" ? "1fr 1fr 120px" : "1fr 120px",
                gap: "12px",
                marginBottom: "20px"
              }}
            >
              <div>
                <label className="form-label">
                  {bookingType === "daily"
                    ? selectedVenue.category === "Resort" || selectedVenue.category === "Hotel"
                      ? "Check-In Date"
                      : "Start Date"
                    : "Select Date"}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    if (bookingType === "hourly") fetchAvailability(e.target.value);
                  }}
                />
              </div>
              {bookingType === "daily" && (
                <div>
                  <label className="form-label">
                    {selectedVenue.category === "Resort" || selectedVenue.category === "Hotel"
                      ? "Check-Out Date"
                      : "End Date"}
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingEndDate}
                    min={bookingDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookingEndDate(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="form-label">Guests</label>
                <input
                  type="number"
                  className="form-input"
                  value={bookingGuests}
                  min="1"
                  max={selectedVenue.capacity}
                  onChange={(e) => setBookingGuests(e.target.value)}
                />
              </div>
            </div>

            {/* Hourly Slot Grid */}
            {bookingType === "hourly" && bookingDate && (
              <>
                {!isDayAvailable ? (
                  <div className="custom-alert custom-alert-danger">Venue is unavailable for this date.</div>
                ) : (
                  <>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px" }}>
                      Click a slot to start, click another to extend your reservation range.{" "}
                      {selectedVenue.category === "Auditorium" && (
                        <span style={{ color: "var(--secondary)", fontWeight: "bold" }}>
                          ⚠ Maximum 6 hours limit for Auditorium.{" "}
                        </span>
                      )}
                      {selectedVenue.setupHours > 0 && (
                        <span style={{ color: "var(--secondary)", marginRight: "12px" }}>
                          ⚠ {selectedVenue.setupHours}hr setup buffer before bookings.
                        </span>
                      )}
                      {selectedVenue.gapHours > 0 && (
                        <span style={{ color: "var(--warning)" }}>
                          ⚠ {selectedVenue.gapHours}hr cleanup gap after bookings.
                        </span>
                      )}
                    </div>
                    <div className="time-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
                      {generateSlots(
                        selectedVenue.openTime,
                        selectedVenue.closeTime,
                        selectedVenue.gapHours || 4,
                        selectedVenue.setupHours || 2,
                        bookedSlots
                      ).map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`time-slot-btn ${slot.isBlocked ? "booked" : ""} ${
                            isSlotInRange(slot) ? "selected" : ""
                          }`}
                          disabled={slot.isBlocked}
                          onClick={() => handleSlotClick(slot)}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Booking Summary + CTA */}
            {((bookingType === "hourly" && selectedSlotRange.start && selectedSlotRange.end) ||
              (bookingType === "daily" && bookingDate && bookingEndDate)) && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  {bookingType === "hourly" ? (
                    <>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {selectedSlotRange.start} – {selectedSlotRange.end} ({getBookingHours()} hr
                        {getBookingHours() !== 1 ? "s" : ""})
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "1.3rem" }}>
                        ₹{getBookingHours() * selectedVenue.pricePerHour}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {Math.round((new Date(bookingEndDate) - new Date(bookingDate)) / 86400000) + 1}{" "}
                        {selectedVenue.category === "Auditorium" ? "day(s) booking" : "day(s) stay"}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "1.3rem" }}>
                        ₹
                        {(Math.round((new Date(bookingEndDate) - new Date(bookingDate)) / 86400000) + 1) *
                          selectedVenue.pricePerDay}
                      </div>
                    </>
                  )}
                </div>
                <button className="btn btn-primary" onClick={handleCreateBooking}>
                  Book Instantly
                </button>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px", marginTop: "24px" }}>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: "16px" }}>
              Reviews {avgRating && <span style={{ color: "#fbbf24", fontWeight: 600 }}>({avgRating}/5)</span>}
            </h4>
            {user?.role === "user" && (
              <form
                onSubmit={handleAddReview}
                style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "flex-start", flexWrap: "wrap" }}
              >
                <select
                  className="form-select"
                  style={{ width: "100px" }}
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, minWidth: "200px" }}
                  placeholder="Share your experience..."
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
                <button type="submit" className="btn btn-secondary">
                  Post
                </button>
              </form>
            )}
            {reviews.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No reviews yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reviews.map((r) => (
                  <div key={r._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{r.user?.name}</span>
                      <span
                        style={{
                          color: "#fbbf24",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "2px",
                          fontSize: "0.85rem"
                        }}
                      >
                        <Star size={12} fill="#fbbf24" /> {r.rating}
                      </span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
