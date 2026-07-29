import React from "react";
import { Check, AlertCircle, X } from "lucide-react";

export default function ToastAlert({ alert, onClose }) {
  if (!alert) return null;

  return (
    <div style={{ position: "fixed", top: "85px", right: "20px", zIndex: 1100, minWidth: "320px" }}>
      <div className={`custom-alert custom-alert-${alert.type} glass-panel`} style={{ animation: "modalFadeIn 0.3s ease-out" }}>
        {alert.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
        <span>{alert.message}</span>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
