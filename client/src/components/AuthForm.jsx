import React from "react";

export default function AuthForm({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  handleAuth,
  handleAuthChange
}) {
  return (
    <div style={{ maxWidth: "460px", margin: "60px auto 80px", padding: "0 20px" }}>
      <div className="glass-panel" style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <img
            src="/logo.svg"
            alt="BookMyVenue Logo"
            style={{ height: "120px", width: "120px", borderRadius: "24px", boxShadow: "var(--shadow-md)" }}
          />
        </div>
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>
          {authMode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", marginBottom: "28px", fontSize: "0.9rem" }}>
          {authMode === "login" ? "Sign in to book premium spaces instantly" : "Register as a User or Venue Owner"}
        </p>

        <form key={authMode} onSubmit={handleAuth}>
          {authMode === "register" && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  className="form-input"
                  required
                  onChange={handleAuthChange}
                  value={authForm.name}
                  placeholder="e.g. Rahul Kumar"
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  className="form-input"
                  required
                  onChange={handleAuthChange}
                  value={authForm.phone}
                  placeholder="e.g. +91 9876543210"
                  autoComplete="tel"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  name="address"
                  type="text"
                  className="form-input"
                  required
                  onChange={handleAuthChange}
                  value={authForm.address}
                  placeholder="e.g. Kochi, Kerala"
                  autoComplete="street-address"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select name="role" className="form-select" onChange={handleAuthChange} value={authForm.role}>
                  <option value="user">User — Book Venues</option>
                  <option value="venue_owner">Venue Owner — List Spaces</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-input"
              required
              onChange={handleAuthChange}
              value={authForm.email}
              placeholder="you@example.com"
              autoComplete={authMode === "register" ? "email" : "username"}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-input"
              required
              onChange={handleAuthChange}
              value={authForm.password}
              placeholder="••••••••"
              autoComplete={authMode === "register" ? "new-password" : "current-password"}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
            {authMode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          {authMode === "login" ? "Don't have an account?" : "Already registered?"}{" "}
          <span
            style={{ color: "var(--secondary)", cursor: "pointer", fontWeight: 600 }}
            onClick={() => {
              setAuthMode((m) => (m === "login" ? "register" : "login"));
              setAuthForm({ name: "", email: "", password: "", role: "user", phone: "", address: "" });
            }}
          >
            {authMode === "login" ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}
