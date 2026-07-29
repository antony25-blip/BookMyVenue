import React from "react";
import { LogIn, LogOut } from "lucide-react";

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  fetchVenues,
  fetchMyBookings,
  handleLogout,
  setAuthMode,
  setAuthForm
}) {
  return (
    <header className="navbar">
      <span
        className="nav-logo"
        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px" }}
        onClick={() => {
          setActiveTab("explore");
          fetchVenues();
        }}
      >
        <img
          src="/logo_icon.svg"
          alt="BookMyVenue Logo"
          style={{ height: "30px", width: "30px", filter: "drop-shadow(0 0 4px var(--primary-glow))" }}
        />
        <span>
          <span style={{ color: "var(--text-primary)" }}>Book</span>
          <span style={{ color: "var(--primary)" }}>My</span>
          <span style={{ color: "var(--text-primary)" }}>Venue</span>
        </span>
      </span>

      <ul className="nav-links">
        {user?.role === "user" && (
          <>
            <li>
              <span
                className={`nav-link ${activeTab === "my-bookings" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("my-bookings");
                  fetchMyBookings();
                }}
              >
                My Bookings
              </span>
            </li>
            <li>
              <span
                className={`nav-link ${activeTab === "wishlist" ? "active" : ""}`}
                onClick={() => setActiveTab("wishlist")}
              >
                Wishlist
              </span>
            </li>
          </>
        )}
        {user?.role === "venue_owner" && (
          <li>
            <span
              className={`nav-link ${
                activeTab.startsWith("my-") ||
                activeTab === "add-venue" ||
                activeTab === "owner-bookings" ||
                activeTab === "owner-analytics"
                  ? "active"
                  : ""
              }`}
              onClick={() => setActiveTab("my-venues")}
            >
              Owner Panel
            </span>
          </li>
        )}
        {user?.role === "admin" && (
          <li>
            <span
              className={`nav-link ${activeTab.startsWith("admin-") ? "active" : ""}`}
              onClick={() => setActiveTab("admin-venues")}
            >
              Admin Panel
            </span>
          </li>
        )}

        {user ? (
          <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="user-badge">
              <span style={{ fontSize: "0.85rem" }}>{user.name}</span>
              <span className={`role-tag role-${user.role}`}>{user.role.replace("_", " ")}</span>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: "6px 12px", fontSize: "0.85rem" }}
              onClick={handleLogout}
            >
              <LogOut size={14} /> Out
            </button>
          </li>
        ) : (
          <li>
            <button
              className="btn btn-primary"
              onClick={() => {
                setAuthMode("login");
                setAuthForm({
                  name: "",
                  email: "",
                  password: "",
                  role: "user",
                  phone: "",
                  address: ""
                });
                setActiveTab("auth");
              }}
            >
              <LogIn size={16} /> Sign In
            </button>
          </li>
        )}
      </ul>
    </header>
  );
}
