import React, { useState } from "react";

export default function Onboarding({ onComplete, setToast }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: 25,
    weight: 70,
    height: 175,
    gender: "Male",
  });
  const [isSaving, setIsSaving] = useState(false);

  const bmi =
    formData.height > 0
      ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
      : "0.0";

  const bmiStatus =
    parseFloat(bmi) < 18.5
      ? "Underweight"
      : parseFloat(bmi) < 25
      ? "Optimal"
      : "Overweight";

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      setToast({ message: "Name and Email are required", type: "error" });
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, bmi: parseFloat(bmi) }),
      });
      if (res.ok) {
        localStorage.setItem("user_email", formData.email);
        onComplete({ ...formData, bmi: parseFloat(bmi) });
        setToast({ message: "Neural Profile Synchronized", type: "success" });
      } else {
        setToast({ message: "Sync Failed", type: "error" });
      }
    } catch {
      setToast({ message: "Connection Error", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}
    >
      <div className="glass-card p-5" style={{ width: "100%", maxWidth: 720 }}>
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-5">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: 52,
              height: 52,
              background: "rgba(0,224,255,0.1)",
            }}
          >
            <i className="bi bi-person-fill fs-4" style={{ color: "var(--cyan)" }}></i>
          </div>
          <div>
            <h2
              className="mb-0 text-white fw-black text-uppercase"
              style={{ fontSize: "1.6rem", fontStyle: "italic", letterSpacing: "-0.02em" }}
            >
              Neural Onboarding
            </h2>
            <p className="label-xs mb-0">Metabolic Profile Initialization</p>
          </div>
        </div>

        <div className="row g-4">
          {/* Left column */}
          <div className="col-md-6">
            <div className="mb-4">
              <label className="label-xs d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-person" style={{ color: "var(--cyan)" }}></i>
                Full Name
              </label>
              <input
                className="custom-input"
                type="text"
                placeholder="Enter Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="label-xs d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-envelope" style={{ color: "var(--cyan)" }}></i>
                Email Address
              </label>
              <input
                className="custom-input"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="label-xs d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-people" style={{ color: "var(--cyan)" }}></i>
                Gender
              </label>
              <div className="d-flex gap-2">
                {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    className={`choice-btn ${formData.gender === g ? "selected" : ""}`}
                    onClick={() => handleChange("gender", g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col-md-6">
            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="label-xs d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-clock" style={{ color: "var(--cyan)" }}></i>
                  Age
                </label>
                <input
                  className="custom-input"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange("age", parseInt(e.target.value))}
                />
              </div>
              <div className="col-6">
                <label className="label-xs d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-speedometer2" style={{ color: "var(--cyan)" }}></i>
                  Weight (kg)
                </label>
                <input
                  className="custom-input"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="label-xs d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-arrows-vertical" style={{ color: "var(--cyan)" }}></i>
                Height (cm)
              </label>
              <input
                className="custom-input"
                type="number"
                value={formData.height}
                onChange={(e) => handleChange("height", parseFloat(e.target.value))}
              />
            </div>

            {/* BMI Display */}
            <div
              className="d-flex justify-content-between align-items-center p-3 rounded-3"
              style={{
                background: "rgba(0,224,255,0.05)",
                border: "1px solid rgba(0,224,255,0.1)",
              }}
            >
              <div>
                <p className="label-xs mb-1">Calculated BMI</p>
                <p
                  className="mb-0 text-white fw-black"
                  style={{ fontSize: "2.2rem", fontStyle: "italic" }}
                >
                  {bmi}
                </p>
              </div>
              <div className="text-end">
                <p className="label-xs mb-1" style={{ color: "var(--cyan)" }}>
                  Status
                </p>
                <p
                  className="mb-0 fw-bold text-uppercase"
                  style={{ fontSize: "0.7rem", color: "#94a3b8" }}
                >
                  {bmiStatus}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn-cyan w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <i className="bi bi-arrow-repeat spin"></i>
          ) : (
            <i className="bi bi-save"></i>
          )}
          {isSaving ? "Synchronizing..." : "Initialize Profile"}
        </button>
      </div>
    </div>
  );
}
