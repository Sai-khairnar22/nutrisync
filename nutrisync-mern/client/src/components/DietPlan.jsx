import React, { useState } from "react";

export default function DietPlan({ bioData, setToast }) {
  const [hostellerMode, setHostellerMode] = useState(false);
  const [hostelMenu, setHostelMenu] = useState("");
  const [budget, setBudget] = useState("500");
  const [dietaryPref, setDietaryPref] = useState("Veg");
  const [availableFood, setAvailableFood] = useState("");
  const [dietPlan, setDietPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/diet-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bioData,
          hostellerMode,
          hostelMenu,
          budget,
          dietaryPreference: dietaryPref,
          availableFood,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setDietPlan(data);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to generate diet plan. Check your Groq API key.", type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const mealIcon = (meal) => {
    if (meal === "Breakfast") return "bi-sun";
    if (meal === "Lunch") return "bi-cup-hot";
    return "bi-moon-stars";
  };

  return (
    <div className="row g-4">
      {/* Parameters Panel */}
      <div className="col-lg-4">
        <div className="glass-card p-4" style={{ position: "sticky", top: "1rem" }}>
          <p className="label-xs mb-4">Architect Parameters</p>

          {/* Hosteller Mode */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-building" style={{ color: hostellerMode ? "var(--cyan)" : "#475569" }}></i>
              <span className="text-white fw-black text-uppercase" style={{ fontSize: "0.72rem" }}>
                Hosteller Mode
              </span>
            </div>
            <div
              className={`toggle-switch ${hostellerMode ? "on" : ""}`}
              onClick={() => setHostellerMode((v) => !v)}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>
          {hostellerMode && (
            <div className="mb-4">
              <label className="label-xs d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-list-ul" style={{ color: "var(--cyan)" }}></i>
                Hostel Mess Menu
              </label>
              <textarea
                className="custom-input"
                rows={3}
                style={{ resize: "none" }}
                placeholder="e.g. Dal, Rice, Paneer, Roti..."
                value={hostelMenu}
                onChange={(e) => setHostelMenu(e.target.value)}
              />
            </div>
          )}

          {/* Budget */}
          <div className="mb-4">
            <label className="label-xs d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-wallet2" style={{ color: "#22c55e" }}></i>
              Daily Budget (₹)
            </label>
            <div className="d-flex gap-2">
              {["200", "500", "1000"].map((v) => (
                <button
                  key={v}
                  className={`choice-btn ${budget === v ? "selected" : ""}`}
                  style={{ flex: 1 }}
                  onClick={() => setBudget(v)}
                >
                  ₹{v}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Preference */}
          <div className="mb-4">
            <label className="label-xs d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-egg-fried" style={{ color: "var(--cyan)" }}></i>
              Dietary Preference
            </label>
            <div className="d-flex gap-2">
              {["Veg", "Non-Veg"].map((v) => (
                <button
                  key={v}
                  className={`choice-btn ${dietaryPref === v ? "selected" : ""}`}
                  style={{ flex: 1 }}
                  onClick={() => setDietaryPref(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Available Food */}
          <div className="mb-4">
            <label className="label-xs d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-basket" style={{ color: "var(--cyan)" }}></i>
              Available Food
            </label>
            <textarea
              className="custom-input"
              rows={3}
              style={{ resize: "none" }}
              placeholder="e.g. Eggs, Oats, Milk..."
              value={availableFood}
              onChange={(e) => setAvailableFood(e.target.value)}
            />
          </div>

          {/* Bio Sync Preview */}
          <div
            className="p-3 rounded-3 mb-4"
            style={{ background: "rgba(0,224,255,0.05)", border: "1px solid rgba(0,224,255,0.1)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-heart-pulse" style={{ color: "var(--cyan)" }}></i>
                <span className="label-xs" style={{ color: "var(--cyan)" }}>Bio-Sync Active</span>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <span className="label-xs">HR: {bioData.hr}</span>
              <span className="label-xs">BP: {bioData.bp}</span>
              <span className="label-xs">SpO2: {bioData.spo2}%</span>
            </div>
          </div>

          <button
            className="btn-cyan w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={generate}
            disabled={generating}
          >
            {generating ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className="bi bi-stars"></i>
            )}
            {generating ? "Synthesizing..." : "Synthesize Protocol"}
          </button>

          {dietPlan && !showForm && (
            <button
              className="w-100 mt-3 label-xs text-center"
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}
              onClick={() => setShowForm(true)}
            >
              Edit Parameters
            </button>
          )}
        </div>
      </div>

      {/* Diet Plan Results */}
      <div className="col-lg-8">
        <div className="glass-card p-4" style={{ minHeight: 600 }}>
          <div className="d-flex justify-content-end mb-4">
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              style={{ background: "rgba(0,224,255,0.05)", border: "1px solid rgba(0,224,255,0.15)" }}
            >
              <div className="pulse-dot" style={{ background: "var(--cyan)", width: 6, height: 6 }}></div>
              <span className="label-xs" style={{ color: "var(--cyan)" }}>AI Generated Protocol</span>
            </div>
          </div>

          {dietPlan && !showForm ? (
            <div>
              {/* Summary */}
              <div
                className="p-4 rounded-4 mb-4"
                style={{ background: "rgba(0,224,255,0.07)", border: "1px solid rgba(0,224,255,0.15)" }}
              >
                <p className="label-xs mb-1" style={{ color: "var(--cyan)" }}>Metabolic Summary</p>
                <p className="mb-0 text-white fw-bold" style={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                  "{dietPlan.daily_summary}"
                </p>
              </div>

              {/* Meal Cards */}
              <div className="d-flex flex-column gap-3">
                {dietPlan.plan?.map((item, idx) => (
                  <div key={idx} className="diet-meal-card">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3"
                          style={{ width: 48, height: 48, background: "rgba(0,224,255,0.1)" }}
                        >
                          <i className={`bi ${mealIcon(item.meal)}`} style={{ color: "var(--cyan)", fontSize: "1.3rem" }}></i>
                        </div>
                        <div>
                          <p className="label-xs mb-1">{item.meal}</p>
                          <p className="text-white fw-black text-uppercase mb-0" style={{ fontSize: "1rem", fontStyle: "italic" }}>
                            {item.items.join(" + ")}
                          </p>
                        </div>
                      </div>

                      {/* Macros */}
                      <div
                        className="d-flex align-items-center gap-3 px-3 py-2 rounded-3"
                        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="text-center">
                          <p className="text-white fw-black mb-0" style={{ fontSize: "1rem", fontStyle: "italic" }}>{item.calories}</p>
                          <p className="label-xs mb-0">Kcal</p>
                        </div>
                        <div style={{ width: 1, height: 32, background: "#1e293b" }}></div>
                        <div className="text-center">
                          <p className="fw-black mb-0" style={{ color: "#00e0ff", fontSize: "1rem", fontStyle: "italic" }}>{item.macros?.protein}g</p>
                          <p className="label-xs mb-0">P</p>
                        </div>
                        <div className="text-center">
                          <p className="fw-black mb-0" style={{ color: "#22c55e", fontSize: "1rem", fontStyle: "italic" }}>{item.macros?.carbs}g</p>
                          <p className="label-xs mb-0">C</p>
                        </div>
                        <div className="text-center">
                          <p className="fw-black mb-0" style={{ color: "#f59e0b", fontSize: "1rem", fontStyle: "italic" }}>{item.macros?.fats}g</p>
                          <p className="label-xs mb-0">F</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                      <p className="mb-0" style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        <span className="fw-black text-uppercase me-2" style={{ color: "var(--cyan)", fontSize: "0.65rem", letterSpacing: "0.1em" }}>Rationale:</span>
                        {item.rationale}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center" style={{ opacity: 0.12, minHeight: 400 }}>
              <i className="bi bi-clipboard-data" style={{ fontSize: "6rem" }}></i>
              <p className="fw-black text-uppercase mt-3" style={{ letterSpacing: "0.4em", fontSize: "0.8rem" }}>
                {generating ? "Synthesizing Protocol..." : "Awaiting Parameters"}
              </p>
              <p className="label-xs mt-2" style={{ maxWidth: 260 }}>
                {generating
                  ? "Neural core calculating optimal nutrient density."
                  : "Define your preferences to generate your AI-optimized protocol."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
