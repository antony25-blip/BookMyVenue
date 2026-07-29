import React from "react";
import { Clock } from "lucide-react";

export default function MyBookingsView({
  myBookings,
  setActiveTab,
  handleCancelBooking
}) {
  return (
    <main className="main-content" style={{ maxWidth: "1600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem" }}>My Reservations</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>Track all your upcoming and past venue bookings.</p>

      {myBookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: "50px", textAlign: "center", color: "var(--text-secondary)" }}>
          No bookings yet.{" "}
          <span style={{ color: "var(--secondary)", cursor: "pointer" }} onClick={() => setActiveTab("explore")}>
            Explore venues →
          </span>
        </div>
      ) : (
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>Type</th>
                <th>Date / Duration</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myBookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.venue?.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{b.venue?.location}</div>
                  </td>
                  <td>
                    <span
                      className="badge badge-pending"
                      style={{
                        background: "rgba(0,242,254,0.1)",
                        color: "var(--secondary)",
                        borderColor: "rgba(0,242,254,0.3)"
                      }}
                    >
                      {b.bookingType || "hourly"}
                    </span>
                  </td>
                  <td>
                    {b.bookingType === "daily" ? (
                      <>
                        <div>{new Date(b.bookingDate).toLocaleDateString()} →</div>
                        <div>{new Date(b.endDate).toLocaleDateString()}</div>
                      </>
                    ) : (
                      <>
                        <div>{new Date(b.bookingDate).toLocaleDateString()}</div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <Clock size={12} />
                          {b.startTime} – {b.endTime}
                        </div>
                      </>
                    )}
                  </td>
                  <td>{b.guests}</td>
                  <td style={{ fontWeight: 700 }}>₹{b.totalAmount}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        onClick={() => handleCancelBooking(b._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
