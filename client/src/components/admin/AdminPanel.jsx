import React from "react";
import { Building, Users, List, DollarSign, TrendingUp, Image, Shield, Trash, Clock } from "lucide-react";

export default function AdminPanel({
  activeTab,
  setActiveTab,
  adminStats,
  adminVenues,
  adminUsers,
  adminBookings,
  adminPayments,
  handleApproveVenue,
  handleRejectVenue,
  handleAdminDeleteVenue,
  handleDeleteUser,
  fetchAdminDashboard,
  setGalleryPhotos,
  setGalleryVenueName,
  setLargePhotoIndex
}) {
  const handleSidebarClick = (tabId) => {
    setActiveTab(tabId);
    fetchAdminDashboard();
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
          Admin Panel
        </div>
        {[
          { id: "admin-venues", icon: <Building size={17} />, label: "Approve Venues" },
          { id: "admin-users", icon: <Users size={17} />, label: "Manage Users" },
          { id: "admin-bookings", icon: <List size={17} />, label: "All Bookings" },
          { id: "admin-payments", icon: <DollarSign size={17} />, label: "Payments Log" }
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
        {/* Stats Summary Panel */}
        {adminStats && (
          <div className="stats-grid" style={{ marginBottom: "32px" }}>
            {[
              { label: "Total Users", value: adminStats.totalUsers, icon: <Users size={24} />, cls: "stat-icon-purple" },
              { label: "Total Venues", value: adminStats.totalVenues, icon: <Building size={24} />, cls: "stat-icon-cyan" },
              { label: "Revenue", value: `₹${adminStats.totalRevenue}`, icon: <TrendingUp size={24} />, cls: "stat-icon-green" },
              { label: "Bookings", value: adminStats.totalBookings, icon: <List size={24} />, cls: "stat-icon-yellow" }
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
        )}

        {/* Venue Approvals Tab */}
        {activeTab === "admin-venues" && (
          <>
            <h2 style={{ marginBottom: "8px" }}>Venue Approvals</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Review and approve venue owner submissions.
            </p>
            <div className="table-container glass-panel">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Venue</th>
                    <th>Owner Details</th>
                    <th>Category</th>
                    <th>License</th>
                    <th>Pricing</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminVenues.map((v) => (
                    <tr key={v._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{v.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                          {v.location}
                        </div>
                        {v.images && v.images.length > 0 && (
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: "4px 8px",
                              fontSize: "0.75rem",
                              display: "inline-flex",
                              gap: "4px",
                              alignItems: "center"
                            }}
                            onClick={() => {
                              setGalleryPhotos(v.images);
                              setGalleryVenueName(v.name);
                              setLargePhotoIndex(0);
                            }}
                          >
                            <Image size={12} /> Photos ({v.images.length})
                          </button>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{v.owner?.name}</div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px"
                          }}
                        >
                          <span>{v.owner?.email}</span>
                          {v.owner?.phone && <span>Tel: {v.owner.phone}</span>}
                          {v.owner?.address && <span>Addr: {v.owner.address}</span>}
                        </div>
                      </td>
                      <td>{v.category}</td>
                      <td>
                        {v.license ? (
                          <a
                            href={`http://localhost:5001${v.license}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{
                              padding: "4px 8px",
                              fontSize: "0.75rem",
                              display: "inline-flex",
                              gap: "4px",
                              alignItems: "center"
                            }}
                          >
                            <Shield size={12} /> View License
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No License</span>
                        )}
                      </td>
                      <td>
                        <div>₹{v.pricePerHour}/hr</div>
                        {v.pricePerDay > 0 && <div style={{ fontSize: "0.8rem", color: "var(--primary)" }}>₹{v.pricePerDay}/day</div>}
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>
                        {v.openTime}–{v.closeTime}
                      </td>
                      <td>
                        <span className={`badge ${v.isApproved ? "badge-confirmed" : "badge-pending"}`}>
                          {v.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {!v.isApproved ? (
                            <button
                              className="btn btn-primary"
                              style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                              onClick={() => handleApproveVenue(v._id)}
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                              onClick={() => handleRejectVenue(v._id)}
                            >
                              Reject
                            </button>
                          )}
                          <button
                            className="btn btn-danger"
                            style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                            onClick={() => handleAdminDeleteVenue(v._id)}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Manage Users Tab */}
        {activeTab === "admin-users" && (
          <>
            <h2 style={{ marginBottom: "8px" }}>Platform Users</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Manage all registered users and venue owners.
            </p>
            <div className="table-container glass-panel">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span className={`role-tag role-${u.role}`}>{u.role.replace("_", " ")}</span>
                      </td>
                      <td>
                        {u.role !== "admin" && (
                          <button
                            className="btn btn-danger"
                            style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* All System Bookings Tab */}
        {activeTab === "admin-bookings" && (
          <>
            <h2 style={{ marginBottom: "8px" }}>All System Bookings</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Full reservation log across all venues.
            </p>
            <div className="table-container glass-panel">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Venue</th>
                    <th>Type</th>
                    <th>Schedule</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{b.user?.email}</div>
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
                            {b.endDate ? new Date(b.endDate).toLocaleDateString() : "?"}
                          </span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <Clock size={13} style={{ color: "var(--secondary)" }} />
                            {new Date(b.bookingDate).toLocaleDateString()} {b.startTime}–{b.endTime}
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{b.totalAmount}</td>
                      <td>
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Payments Log Tab */}
        {activeTab === "admin-payments" && (
          <>
            <h2 style={{ marginBottom: "8px" }}>Payments Log</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Financial transaction records for all completed payments.
            </p>
            <div className="table-container glass-panel">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>User</th>
                    <th>Venue</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminPayments.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{p.transactionId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.user?.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{p.user?.email}</div>
                      </td>
                      <td>{p.booking?.venue?.name}</td>
                      <td style={{ fontWeight: 700, color: "var(--success)" }}>₹{p.amount}</td>
                      <td style={{ textTransform: "uppercase" }}>{p.paymentMethod}</td>
                      <td style={{ fontSize: "0.8rem" }}>{new Date(p.createdAt).toLocaleString()}</td>
                      <td>
                        <span className="badge badge-confirmed">{p.paymentStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
