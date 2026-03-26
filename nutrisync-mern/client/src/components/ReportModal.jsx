import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function getPercentage(current, target) {
  if (!target || target === 0) return 0;
  return Math.round((current / target) * 100);
}

const MACRO_COLORS = { protein: "#00e0ff", carbs: "#22c55e", fats: "#f59e0b" };

export default function ReportModal({ userProfile, bioData, mealHistory, onClose, setToast }) {
  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#020617",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`NutriSync_Report_${userProfile?.name || "User"}.pdf`);
      setToast({ message: "PDF Exported Successfully", type: "success" });
    } catch {
      setToast({ message: "Export Failed", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  const bmiStatus =
    userProfile.bmi < 18.5 ? "Underweight" : userProfile.bmi < 25 ? "Optimal" : "Overweight";
  const bmiColor =
    userProfile.bmi < 18.5 ? "#f43f5e" : userProfile.bmi < 25 ? "#22c55e" : "#f97316";

  return (
    <div className="report-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="report-modal">
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between p-4"
          style={{ borderBottom: "1px solid #1e293b", background: "rgba(15,23,42,0.6)" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 48, height: 48, background: "var(--cyan)" }}
            >
              <i className="bi bi-activity text-black" style={{ fontSize: "1.3rem" }}></i>
            </div>
            <div>
              <h2 className="text-white fw-black text-uppercase mb-0" style={{ fontSize: "1.2rem", fontStyle: "italic" }}>
                Metabolic Intelligence Report
              </h2>
              <p className="label-xs mb-0">Autonomous Core Diagnostics</p>
            </div>
          </div>
          <button
            className="btn rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40, background: "#0f172a", border: "none", color: "#94a3b8" }}
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4" ref={reportRef} style={{ background: "#020617" }}>
          {/* Profile + Physical + Status */}
          <div className="row g-3 mb-4">
            {[
              {
                title: "Neural Profile",
                rows: [
                  ["Subject", userProfile.name],
                  ["Age", `${userProfile.age} YRS`],
                  ["Gender", userProfile.gender],
                ],
              },
              {
                title: "Physical Metrics",
                rows: [
                  ["Weight", `${userProfile.weight} KG`],
                  ["Height", `${userProfile.height} CM`],
                  ["BMI Index", userProfile.bmi],
                ],
              },
            ].map(({ title, rows }) => (
              <div key={title} className="col-md-4">
                <div
                  className="p-4 rounded-4 h-100"
                  style={{ background: "rgba(15,23,42,0.6)", border: "1px solid #1e293b" }}
                >
                  <p className="label-xs mb-3">{title}</p>
                  <div className="d-flex flex-column gap-2">
                    {rows.map(([k, v]) => (
                      <div key={k} className="d-flex justify-content-between">
                        <span className="label-xs">{k}</span>
                        <span className="text-white fw-black" style={{ fontSize: "0.75rem" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* BMI Status */}
            <div className="col-md-4">
              <div
                className="p-4 rounded-4 h-100 d-flex flex-column align-items-center justify-content-center text-center"
                style={{ background: "rgba(15,23,42,0.6)", border: "1px solid #1e293b" }}
              >
                <p className="label-xs mb-3">Metabolic Status</p>
                <div
                  className="px-3 py-1 rounded-pill fw-black text-uppercase mb-2"
                  style={{ background: `${bmiColor}15`, color: bmiColor, fontSize: "0.7rem" }}
                >
                  {bmiStatus}
                </div>
                <p className="label-xs" style={{ maxWidth: 180 }}>
                  {userProfile.bmi < 25
                    ? "Metabolic core operating within peak efficiency."
                    : "Neural optimization required for lipid management."}
                </p>
              </div>
            </div>
          </div>

          {/* Nutrient Saturation */}
          <div
            className="p-4 rounded-4 mb-4"
            style={{ background: "rgba(15,23,42,0.6)", border: "1px solid #1e293b" }}
          >
            <h3 className="text-white fw-black text-uppercase mb-4" style={{ fontSize: "1rem", fontStyle: "italic" }}>
              Daily Nutrient Saturation
            </h3>
            <div className="row g-4">
              {Object.entries(bioData.macros).map(([key, data]) => (
                <div key={key} className="col-md-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white fw-black text-uppercase" style={{ fontSize: "0.7rem", fontStyle: "italic" }}>{key}</span>
                    <span className="label-xs">{getPercentage(data.current, data.target)}%</span>
                  </div>
                  <div className="macro-bar">
                    <div
                      className="macro-bar-fill"
                      style={{
                        width: `${Math.min(100, getPercentage(data.current, data.target))}%`,
                        background: MACRO_COLORS[key],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neural Insights */}
          <div
            className="p-4 rounded-4"
            style={{ background: "rgba(0,224,255,0.05)", border: "1px solid rgba(0,224,255,0.1)" }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-stars" style={{ color: "var(--cyan)" }}></i>
              <h3 className="text-white fw-black text-uppercase mb-0" style={{ fontSize: "1rem", fontStyle: "italic" }}>
                Neural Core Insights
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.7 }}>
              Based on your current BMI of{" "}
              <span style={{ color: "var(--cyan)", fontWeight: 700 }}>{userProfile.bmi}</span> and
              daily intake of{" "}
              <span className="text-white fw-bold">{bioData.energy} KCAL</span>, the system
              recommends a{" "}
              <span className="text-white fw-bold">
                {userProfile.bmi > 25 ? "caloric deficit" : "maintenance"}
              </span>{" "}
              protocol. Your protein saturation is at{" "}
              <span className="text-white fw-bold">
                {getPercentage(bioData.macros.protein.current, bioData.macros.protein.target)}%
              </span>.{" "}
              {bioData.macros.protein.current < bioData.macros.protein.target
                ? "Increase amino acid intake to support muscular recovery."
                : "Protein levels are optimal for cellular repair."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="d-flex justify-content-end gap-3 p-4"
          style={{ background: "rgba(15,23,42,0.8)", borderTop: "1px solid #1e293b" }}
        >
          <button
            className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-black text-uppercase"
            style={{
              background: "rgba(0,224,255,0.1)",
              border: "1px solid rgba(0,224,255,0.2)",
              color: "var(--cyan)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              cursor: "pointer",
              opacity: exporting ? 0.5 : 1,
            }}
            onClick={exportPDF}
            disabled={exporting}
          >
            {exporting ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className="bi bi-download"></i>
            )}
            {exporting ? "Generating PDF..." : "Save as PDF"}
          </button>
          <button className="btn-cyan px-4" style={{ borderRadius: "2rem" }} onClick={onClose}>
            Acknowledge Report
          </button>
        </div>
      </div>
    </div>
  );
}
