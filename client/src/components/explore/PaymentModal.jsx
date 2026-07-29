import React from "react";
import { X, CreditCard, Sparkles, Building } from "lucide-react";

export default function PaymentModal({
  paymentModalBooking,
  setPaymentModalBooking,
  paymentMethod,
  setPaymentMethod,
  handleProcessPayment
}) {
  if (!paymentModalBooking) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <h3 className="modal-title">Complete Payment</h3>
          <button className="modal-close" onClick={() => setPaymentModalBooking(null)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleProcessPayment} className="modal-body">
          <div
            style={{
              padding: "16px",
              background: "rgba(0,242,254,0.04)",
              border: "1px solid rgba(0,242,254,0.15)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "20px"
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "8px" }}>{paymentModalBooking.venue?.name}</div>
            {paymentModalBooking.bookingType === "daily" ? (
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {new Date(paymentModalBooking.bookingDate).toLocaleDateString()} →{" "}
                {new Date(paymentModalBooking.endDate).toLocaleDateString()}
              </div>
            ) : (
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {new Date(paymentModalBooking.bookingDate).toLocaleDateString()} @ {paymentModalBooking.startTime} –{" "}
                {paymentModalBooking.endTime}
              </div>
            )}
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px dashed var(--border-color)",
                paddingTop: "10px"
              }}
            >
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--secondary)" }}>
                ₹{paymentModalBooking.totalAmount}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {[
              { value: "card", label: "Credit / Debit Card", icon: <CreditCard size={18} /> },
              { value: "upi", label: "UPI (GPay / PhonePe)", icon: <Sparkles size={18} /> },
              { value: "netbanking", label: "Net Banking", icon: <Building size={18} /> }
            ].map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  padding: "12px 16px",
                  background: paymentMethod === opt.value ? "rgba(170,59,255,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${paymentMethod === opt.value ? "var(--primary)" : "var(--border-color)"}`,
                  borderRadius: "var(--radius-sm)"
                }}
              >
                <input
                  type="radio"
                  name="pm"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                {opt.icon} {opt.label}
              </label>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Pay ₹{paymentModalBooking.totalAmount} Now
          </button>
        </form>
      </div>
    </div>
  );
}
