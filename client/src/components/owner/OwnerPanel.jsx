import React from "react";
import {
  Building,
  Plus,
  List,
  BarChart3,
  Clock,
  Users,
  Edit,
  Trash,
  Image,
  Shield,
  TrendingUp,
  Check
} from "lucide-react";

const imgSrc = (img) =>
  img?.startsWith("/uploads")
    ? `http://localhost:5001${img}`
    : img || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800";

export default function OwnerPanel({
  activeTab,
  setActiveTab,
  myVenues,
  ownerBookings,
  editingVenueId,
  setEditingVenueId,
  venueForm,
  setVenueForm,
  setVenueImages,
  imagePreview,
  setImagePreview,
  venueLicense,
  setVenueLicense,
  licensePreview,
  setLicensePreview,
  handleVenueFormChange,
  handleImageChange,
  handleLicenseChange,
  handleSaveVenue,
  handleEditVenue,
  handleDeleteVenue,
  handleOwnerConfirm,
  fetchMyVenues,
  categories,
  locations,
  timeHours,
  setGalleryPhotos,
  setGalleryVenueName,
  setLargePhotoIndex
}) {
  const handleSidebarClick = (tabId) => {
    if (tabId === "add-venue" && activeTab !== "add-venue") {
      setEditingVenueId(null);
      setVenueForm({
        name: "",
        location: "",
        address: "",
        description: "",
        capacity: "",
        category: "Meetup Space",
        pricePerHour: "",
        pricePerDay: "",
        openTime: "08:00",
        closeTime: "22:00",
        gapHours: "4",
        setupHours: "2",
        amenities: ""
      });
      setImagePreview([]);
      setVenueImages([]);
      setVenueLicense(null);
      setLicensePreview("");
    }
    if (tabId !== "add-venue") {
      fetchMyVenues();
    }
    setActiveTab(tabId);
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            padding: "0 16px",
            marginBottom: "12px"
          }}
        >
          Owner Portal
        </div>
        {[
          { id: "my-venues", icon: <Building size={17} />, label: "My Spaces" },
          { id: "add-venue", icon: <Plus size={17} />, label: "List New Space" },
          { id: "owner-bookings", icon: <List size={17} />, label: "Booking Requests" },
          { id: "owner-analytics", icon: <BarChart3 size={17} />, label: "Analytics" }
        ].map((item) => (
          <button
            key={item.id}
            className={`sidebar-btn ${activeTab === item.id ? "active" : ""}`}
            onClick={() => handleSidebarClick(item.id)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </aside>

      <main className="main-content">
        {/* Listed Spaces Tab */}
        {activeTab === "my-venues" && (
          <>
            <h2 style={{ marginBottom: "8px" }}>Listed Spaces</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "28px" }}>Manage your registered venues.</p>
            {myVenues.length === 0 ? (
              <div className="glass-panel" style={{ padding: "50px", textAlign: "center", color: "var(--text-secondary)" }}>
                No venues yet.{" "}
                <span style={{ color: "var(--secondary)", cursor: "pointer" }} onClick={() => setActiveTab("add-venue")}>
                  List your first space →
                </span>
              </div>
            ) : (
              <div className="grid-cards">
                {myVenues.map((v) => (
                  <div key={v._id} className="glass-panel venue-card">
                    <div style={{ position: "relative" }}>
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
                      <span
                        className={`badge ${v.isApproved ? "badge-confirmed" : "badge-pending"}`}
                        style={{ position: "absolute", top: "12px", right: "12px" }}
                      >
                        {v.isApproved ? "Live" : "Pending"}
                      </span>
                    </div>
                    <div className="venue-card-body">
                      <div className="venue-card-title">
                        <span className="venue-title-text">{v.name}</span>
                        <span className="venue-price">
                          ₹{v.pricePerHour}
                          <span>/hr</span>
                        </span>
                      </div>
                      {v.pricePerDay > 0 && <div style={{ fontSize: "0.8rem", color: "var(--primary)" }}>₹{v.pricePerDay}/day</div>}
                      <div className="venue-meta">
                        <span>
                          <Clock size={13} />
                          {v.openTime}–{v.closeTime}
                        </span>
                        <span>
                          <Users size={13} />
                          Max {v.capacity}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "12px" }}>
                        <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => handleEditVenue(v)}>
                          <Edit size={15} /> Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDeleteVenue(v._id)}>
                          <Trash size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add/Edit Space Form Tab */}
        {activeTab === "add-venue" && (
          <div className="glass-panel" style={{ maxWidth: "720px", padding: "32px" }}>
            <h2 style={{ marginBottom: "6px" }}>{editingVenueId ? "Edit Venue Details" : "Register a New Space"}</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "0.9rem" }}>
              New venues require admin approval before going live.
            </p>

            <form onSubmit={handleSaveVenue} encType="multipart/form-data">
              <div className="form-group">
                <label className="form-label">Venue / Space Name *</label>
                <input
                  name="name"
                  type="text"
                  className="form-input"
                  required
                  onChange={handleVenueFormChange}
                  value={venueForm.name}
                  placeholder="e.g. Skyline Banquet Hall"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-select"
                    onChange={handleVenueFormChange}
                    value={venueForm.category}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City / Location *</label>
                  <select
                    name="location"
                    className="form-select"
                    required
                    onChange={handleVenueFormChange}
                    value={venueForm.location}
                  >
                    <option value="">Select city</option>
                    {locations.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <input
                  name="address"
                  type="text"
                  className="form-input"
                  required
                  onChange={handleVenueFormChange}
                  value={venueForm.address}
                  placeholder="e.g. 3rd Floor, MG Road, Kochi"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-input"
                  required
                  style={{ minHeight: "90px", resize: "vertical" }}
                  onChange={handleVenueFormChange}
                  value={venueForm.description}
                  placeholder="What makes your space special..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Hourly Rate (₹) *</label>
                  <input
                    name="pricePerHour"
                    type="number"
                    className="form-input"
                    required
                    onChange={handleVenueFormChange}
                    value={venueForm.pricePerHour}
                    placeholder="e.g. 1500"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Daily Rate (₹) <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>optional</span>
                  </label>
                  <input
                    name="pricePerDay"
                    type="number"
                    className="form-input"
                    onChange={handleVenueFormChange}
                    value={venueForm.pricePerDay}
                    placeholder="e.g. 10000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Guests *</label>
                  <input
                    name="capacity"
                    type="number"
                    className="form-input"
                    required
                    onChange={handleVenueFormChange}
                    value={venueForm.capacity}
                    placeholder="e.g. 150"
                  />
                </div>
              </div>

              {/* Working Hours */}
              <div
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "20px"
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "var(--font-heading)"
                  }}
                >
                  <Clock size={16} style={{ color: "var(--secondary)" }} /> Working Hours & Booking Gap
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Opens At</label>
                    <select name="openTime" className="form-select" onChange={handleVenueFormChange} value={venueForm.openTime}>
                      {timeHours.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Closes At</label>
                    <select
                      name="closeTime"
                      className="form-select"
                      onChange={handleVenueFormChange}
                      value={venueForm.closeTime}
                    >
                      {timeHours.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Setup Buffer (hrs)</label>
                    <select
                      name="setupHours"
                      className="form-select"
                      onChange={handleVenueFormChange}
                      value={venueForm.setupHours || "2"}
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} hr{n !== 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cleanup Gap (hrs)</label>
                    <select
                      name="gapHours"
                      className="form-select"
                      onChange={handleVenueFormChange}
                      value={venueForm.gapHours}
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} hr{n !== 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amenities (comma separated)</label>
                <input
                  name="amenities"
                  type="text"
                  className="form-input"
                  onChange={handleVenueFormChange}
                  value={venueForm.amenities}
                  placeholder="WiFi, AC, Projector, Parking, Catering"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Image size={16} /> Venue Photos (up to 10, max 8MB each)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input"
                  style={{ padding: "8px" }}
                />
                {imagePreview.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                    {imagePreview.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="preview"
                        style={{
                          width: "80px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Shield size={16} /> License Document * (PDF, PNG, JPG, JPEG)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleLicenseChange}
                  className="form-input"
                  style={{ padding: "8px" }}
                  required={!editingVenueId}
                />
                {licensePreview && (
                  <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Selected: <span style={{ fontWeight: 600 }}>{licensePreview}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  {editingVenueId ? "Save Changes" : "Submit for Approval"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("my-venues")}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Booking Requests Tab */}
        {activeTab === "owner-bookings" && (
          <>
            <h2 style={{ marginBottom: "8px" }}>Booking Requests</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "28px" }}>
              Review and confirm incoming reservation requests.
            </p>
            {ownerBookings.length === 0 ? (
              <div className="glass-panel" style={{ padding: "50px", textAlign: "center", color: "var(--text-secondary)" }}>
                No booking requests yet.
              </div>
            ) : (
              <div className="table-container glass-panel">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Guest</th>
                      <th>Space</th>
                      <th>Type</th>
                      <th>Schedule</th>
                      <th>Guests</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerBookings.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{b.user?.phone}</div>
                          {b.user?.address && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              {b.user.address}
                            </div>
                          )}
                        </td>
                        <td>{b.venue?.name}</td>
                        <td>
                          <span
                            className="badge badge-pending"
                            style={{
                              background: "rgba(0,242,254,0.1)",
                              color: "var(--secondary)",
                              borderColor: "rgba(0,242,254,0.2)"
                            }}
                          >
                            {b.bookingType || "hourly"}
                          </span>
                        </td>
                        <td>
                          {b.bookingType === "daily" ? (
                            <span>
                              {new Date(b.bookingDate).toLocaleDateString()} →{" "}
                              {new Date(b.endDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <Clock size={13} style={{ color: "var(--secondary)" }} />
                              {new Date(b.bookingDate).toLocaleDateString()} {b.startTime}–{b.endTime}
                            </span>
                          )}
                        </td>
                        <td>{b.guests}</td>
                        <td style={{ fontWeight: 700 }}>₹{b.totalAmount}</td>
                        <td>
                          <span className={`badge badge-${b.status}`}>{b.status}</span>
                        </td>
                        <td>
                          {b.status === "pending" && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                              onClick={() => handleOwnerConfirm(b._id)}
                            >
                              Confirm
                            </button>
                          )}
                          {b.status === "confirmed" && (
                            <span style={{ color: "var(--success)", fontSize: "0.8rem" }}>✓ Locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === "owner-analytics" && (
          <>
            <h2 style={{ marginBottom: "28px" }}>Earnings Overview</h2>
            <div className="stats-grid">
              {[
                {
                  label: "Total Confirmed Earnings",
                  value: `₹${ownerBookings
                    .filter((b) => b.status === "confirmed")
                    .reduce((a, c) => a + c.totalAmount, 0)}`,
                  icon: <TrendingUp size={24} />,
                  cls: "stat-icon-green"
                },
                {
                  label: "Confirmed Bookings",
                  value: ownerBookings.filter((b) => b.status === "confirmed").length,
                  icon: <Check size={24} />,
                  cls: "stat-icon-purple"
                },
                {
                  label: "Pending Requests",
                  value: ownerBookings.filter((b) => b.status === "pending").length,
                  icon: <Clock size={24} />,
                  cls: "stat-icon-yellow"
                },
                {
                  label: "Listed Spaces",
                  value: myVenues.length,
                  icon: <Building size={24} />,
                  cls: "stat-icon-cyan"
                }
              ].map((s, i) => (
                <div key={i} className="glass-panel stat-card">
                  <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                  <div>
                    <div className="stat-num">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-panel" style={{ padding: "28px" }}>
              <h4 style={{ fontFamily: "var(--font-heading)", marginBottom: "20px" }}>Revenue per Venue</h4>
              {myVenues.map((v) => {
                const earned = ownerBookings
                  .filter((b) => b.status === "confirmed" && b.venue?._id === v._id)
                  .reduce((a, c) => a + c.totalAmount, 0);
                const max = Math.max(
                  ...myVenues.map((mv) =>
                    ownerBookings
                      .filter((b) => b.status === "confirmed" && b.venue?._id === mv._id)
                      .reduce((a, c) => a + c.totalAmount, 0)
                  ),
                  1
                );
                return (
                  <div key={v._id} style={{ marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                      <span>{v.name}</span>
                      <span style={{ fontWeight: 700 }}>₹{earned}</span>
                    </div>
                    <div
                      style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}
                    >
                      <div
                        style={{
                          width: `${(earned / max) * 100}%`,
                          height: "100%",
                          background: "var(--accent-gradient)",
                          borderRadius: "4px"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
