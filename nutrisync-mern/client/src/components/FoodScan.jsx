import React, { useState } from "react";

export default function FoodScan({ onMealLogged, setToast }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setImageMime(file.type || "image/jpeg");
    setScanResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];
      setImageBase64(base64);
      await analyzeFood(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFood = async (base64, mimeType) => {
    setScanning(true);
    try {
      const res = await fetch("/api/ai/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error(err);
      setToast({ message: "Food analysis failed. Try again.", type: "error" });
    } finally {
      setScanning(false);
    }
  };

  const logMeal = () => {
    if (!scanResult) return;
    const meal = {
      id: Math.random().toString(36).substr(2, 9),
      food_name: scanResult.food_name || "Unknown Food",
      calories: scanResult.calories || 0,
      protein: scanResult.protein || 0,
      carbs: scanResult.carbs || 0,
      fats: scanResult.fats || 0,
      metabolic_impact: scanResult.metabolic_impact || "",
      timestamp: Date.now(),
      type:
        new Date().getHours() < 12
          ? "Breakfast"
          : new Date().getHours() < 17
          ? "Lunch"
          : "Dinner",
    };
    onMealLogged(meal);
    setScanResult(null);
    setPreviewUrl(null);
    setImageBase64(null);
    setToast({ message: "Bio-Intake Recorded Successfully", type: "success" });
  };

  const reset = () => {
    setPreviewUrl(null);
    setImageBase64(null);
    setScanResult(null);
  };

  return (
    <div className="row g-4">
      {/* Upload / Preview */}
      <div className="col-lg-6">
        <div className="glass-card p-4 position-relative" style={{ minHeight: 460 }}>
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Food"
                className="w-100 rounded-4 object-fit-cover"
                style={{ height: 400 }}
              />
              <button
                className="btn position-absolute top-0 end-0 m-3 rounded-circle"
                style={{ background: "rgba(0,0,0,0.8)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", width: 44, height: 44 }}
                onClick={reset}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </>
          ) : (
            <label className="scan-upload-area w-100 h-100" style={{ minHeight: 400 }}>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{ width: 100, height: 100, background: "#0f172a" }}
              >
                <i className="bi bi-camera" style={{ fontSize: "2.5rem", color: "#334155" }}></i>
              </div>
              <p className="label-xs" style={{ letterSpacing: "0.3em" }}>
                Capture Bio-Intake
              </p>
              <p className="label-xs mt-1" style={{ opacity: 0.4 }}>
                Click to upload a food image
              </p>
              <input
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleFile}
              />
            </label>
          )}

          {/* Scanning overlay */}
          {scanning && (
            <div className="scanning-overlay">
              <i
                className="bi bi-arrow-repeat spin mb-3"
                style={{ fontSize: "3rem", color: "var(--cyan)" }}
              ></i>
              <p
                className="label-xs"
                style={{ color: "var(--cyan)", letterSpacing: "0.4em" }}
              >
                Scanning Molecular Density...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scan Result */}
      <div className="col-lg-6">
        <div className="glass-card p-4 h-100 d-flex flex-column" style={{ minHeight: 460 }}>
          {scanResult ? (
            <>
              <div className="mb-4">
                <p className="label-xs mb-1" style={{ color: "var(--cyan)" }}>
                  Neural ID Verified
                </p>
                <h2
                  className="text-white fw-black text-uppercase mb-0"
                  style={{ fontSize: "2rem", fontStyle: "italic", letterSpacing: "-0.02em" }}
                >
                  {scanResult.food_name}
                </h2>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div
                    className="p-4 rounded-4 h-100"
                    style={{ background: "#060b18", border: "1px solid #1e293b" }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-fire" style={{ color: "#f59e0b" }}></i>
                      <span className="label-xs">Energy Load</span>
                    </div>
                    <p
                      className="text-white fw-black mb-0"
                      style={{ fontSize: "2rem", fontStyle: "italic" }}
                    >
                      {scanResult.calories}
                      <span className="label-xs ms-1" style={{ fontStyle: "normal" }}>kcal</span>
                    </p>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className="p-4 rounded-4 h-100"
                    style={{ background: "#060b18", border: "1px solid #1e293b" }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-droplet-fill" style={{ color: "#f97316" }}></i>
                      <span className="label-xs">Total Lipid</span>
                    </div>
                    <p
                      className="text-white fw-black mb-0"
                      style={{ fontSize: "2rem", fontStyle: "italic" }}
                    >
                      {scanResult.fats}
                      <span className="label-xs ms-1" style={{ fontStyle: "normal" }}>g</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Macro row */}
              <div className="row g-2 mb-4">
                {[
                  { label: "Protein", val: scanResult.protein, color: "#00e0ff" },
                  { label: "Carbs", val: scanResult.carbs, color: "#22c55e" },
                  { label: "Fats", val: scanResult.fats, color: "#f59e0b" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="col-4 text-center">
                    <div
                      className="p-3 rounded-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p className="fw-black mb-0" style={{ color, fontSize: "1.2rem", fontStyle: "italic" }}>{val}g</p>
                      <p className="label-xs mb-0">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Metabolic impact */}
              <div
                className="p-3 rounded-4 mb-4"
                style={{ background: "rgba(0,224,255,0.05)", border: "1px solid rgba(0,224,255,0.1)" }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-stars" style={{ color: "var(--cyan)" }}></i>
                  <span className="label-xs" style={{ color: "var(--cyan)" }}>Metabolic Report</span>
                </div>
                <p className="mb-0" style={{ fontSize: "0.82rem", color: "#94a3b8", fontStyle: "italic" }}>
                  "{scanResult.metabolic_impact}"
                </p>
              </div>

              <button className="btn-cyan mt-auto d-flex align-items-center justify-content-center gap-2" onClick={logMeal}>
                <i className="bi bi-save"></i> Record to Neural Core
              </button>
            </>
          ) : (
            <div
              className="d-flex flex-column align-items-center justify-content-center h-100 py-5"
              style={{ opacity: 0.1 }}
            >
              <i className="bi bi-scissors" style={{ fontSize: "6rem" }}></i>
              <p
                className="fw-black text-uppercase mt-3 mb-0"
                style={{ letterSpacing: "0.4em", fontSize: "0.85rem" }}
              >
                Awaiting Input
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
