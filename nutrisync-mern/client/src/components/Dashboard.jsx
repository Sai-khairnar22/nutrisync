import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

function getPercentage(current, target) {
  if (!target || target === 0) return 0;
  return Math.round((current / target) * 100);
}

const MACRO_COLORS = {
  protein: "#00e0ff",
  carbs: "#22c55e",
  fats: "#f59e0b",
};

export default function Dashboard({ bioData, mealHistory, userProfile, setUserProfile, setToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(null);

  const energyPct = getPercentage(bioData.energy, bioData.energyMax);
  const circumference = 2 * Math.PI * 80;

  const chartData = [
    { time: "08:00", energy: 400, protein: 20, carbs: 50 },
    { time: "10:00", energy: 600, protein: 35, carbs: 80 },
    { time: "12:00", energy: 1200, protein: 65, carbs: 150 },
    { time: "14:00", energy: 1400, protein: 80, carbs: 180 },
    { time: "16:00", energy: 1600, protein: 95, carbs: 210 },
    { time: "18:00", energy: 1800, protein: 110, carbs: 240 },
    {
      time: "Now",
      energy: bioData.energy,
      protein: bioData.macros.protein.current,
      carbs: bioData.macros.carbs.current,
    },
  ];

  const stats = [
    { label: "Heart Rate", val: bioData.hr, unit: "BPM", icon: "bi-heart-pulse-fill", color: "#f43f5e" },
    { label: "Blood Pressure", val: bioData.bp, unit: "", icon: "bi-activity", color: "#60a5fa" },
    { label: "SpO2", val: bioData.spo2, unit: "%", icon: "bi-droplet-fill", color: "#00e0ff" },
    { label: "Protein", val: bioData.macros.protein.current, unit: "g", icon: "bi-egg-fried", color: "#a78bfa", trend: `${getPercentage(bioData.macros.protein.current, bioData.macros.protein.target)}%` },
    { label: "Carbs", val: bioData.macros.carbs.current, unit: "g", icon: "bi-fire", color: "#22c55e", trend: `${getPercentage(bioData.macros.carbs.current, bioData.macros.carbs.target)}%` },
    { label: "Fats", val: bioData.macros.fats.current, unit: "g", icon: "bi-lightning-fill", color: "#f59e0b", trend: `${getPercentage(bioData.macros.fats.current, bioData.macros.fats.target)}%` },
  ];

  const saveProfile = async () => {
    if (!tempProfile) return;
    const newBmi = tempProfile.height > 0
      ? parseFloat((tempProfile.weight / Math.pow(tempProfile.height / 100, 2)).toFixed(1))
      : 0;
    const updated = { ...tempProfile, bmi: newBmi };
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setUserProfile(updated);
        setIsEditing(false);
        setToast({ message: "Neural Profile Updated", type: "success" });
      } else {
        setToast({ message: "Sync Failed", type: "error" });
      }
    } catch {
      setToast({ message: "Connection Error", type: "error" });
    }
  };

  return (
    <div>
      {/* Row 1: Profile + Stats */}
      <div className="row g-3 mb-4">
        {/* Profile Card */}
        <div className="col-lg-3">
          <div className="glass-card p-4 h-100 position-relative overflow-hidden">
            <i
              className="bi bi-person position-absolute"
              style={{ top: 12, right: 16, fontSize: "5rem", opacity: 0.04, color: "#fff" }}
            ></i>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="label-xs" style={{ color: "var(--cyan)" }}>Subject Profile</span>
              {!isEditing ? (
                <button
                  className="btn btn-sm p-1 rounded-2"
                  style={{ background: "rgba(0,224,255,0.1)", border: "none" }}
                  onClick={() => { setIsEditing(true); setTempProfile(userProfile); }}
                >
                  <i className="bi bi-pencil" style={{ color: "var(--cyan)", fontSize: "0.7rem" }}></i>
                </button>
              ) : (
                <div className="d-flex gap-1">
                  <button className="btn btn-sm p-1 rounded-2" style={{ background: "rgba(34,197,94,0.1)", border: "none" }} onClick={saveProfile}>
                    <i className="bi bi-check2" style={{ color: "#22c55e", fontSize: "0.75rem" }}></i>
                  </button>
                  <button className="btn btn-sm p-1 rounded-2" style={{ background: "rgba(239,68,68,0.1)", border: "none" }} onClick={() => setIsEditing(false)}>
                    <i className="bi bi-x" style={{ color: "#ef4444", fontSize: "0.75rem" }}></i>
                  </button>
                </div>
              )}
            </div>

            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center justify-content-center rounded-circle fw-black text-white"
                style={{ width: 44, height: 44, background: "rgba(0,224,255,0.1)", border: "1px solid rgba(0,224,255,0.2)", fontSize: "1.1rem", fontStyle: "italic", color: "var(--cyan)" }}>
                {userProfile?.name?.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                {isEditing ? (
                  <input className="custom-input" style={{ padding: "0.3rem 0.6rem !important", fontSize: "0.75rem" }}
                    value={tempProfile?.name || ""} onChange={(e) => setTempProfile(p => ({ ...p, name: e.target.value }))} />
                ) : (
                  <p className="mb-0 text-white fw-black text-uppercase text-truncate" style={{ fontSize: "0.9rem" }}>{userProfile?.name}</p>
                )}
                <p className="mb-0 label-xs" style={{ marginTop: 2 }}>Status: Optimized</p>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              {[
                { label: "BMI Index", field: "bmi", val: userProfile?.bmi, readOnly: true },
                { label: "Age", field: "age", val: userProfile?.age, type: "number" },
                { label: "Weight (kg)", field: "weight", val: userProfile?.weight, type: "number" },
                { label: "Height (cm)", field: "height", val: userProfile?.height, type: "number" },
              ].map(({ label, field, val, type, readOnly }) => (
                <div key={field} className="d-flex justify-content-between align-items-center">
                  <span className="label-xs">{label}</span>
                  {isEditing && !readOnly ? (
                    <input className="custom-input text-end" type={type || "text"}
                      style={{ width: 70, padding: "0.2rem 0.4rem", fontSize: "0.7rem" }}
                      value={tempProfile?.[field] || ""} onChange={(e) => setTempProfile(p => ({ ...p, [field]: type === "number" ? parseFloat(e.target.value) : e.target.value }))} />
                  ) : (
                    <span className="text-white fw-black" style={{ fontSize: "0.75rem", fontStyle: "italic" }}>{val}</span>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="d-flex justify-content-between align-items-center">
                  <span className="label-xs">Gender</span>
                  <select className="custom-input text-end" style={{ width: 80, padding: "0.2rem 0.4rem", fontSize: "0.7rem" }}
                    value={tempProfile?.gender || "Male"} onChange={(e) => setTempProfile(p => ({ ...p, gender: e.target.value }))}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="pulse-dot" style={{ background: "#22c55e" }}></div>
              <span className="label-xs" style={{ color: "#22c55e" }}>Neural Link Active</span>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="col-lg-9">
          <div className="row g-3">
            {stats.map((s, i) => (
              <div key={i} className="col-6 col-md-4">
                <div className="stat-card h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="label-xs">{s.label}</span>
                    <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: "0.85rem" }}></i>
                  </div>
                  <p className="text-white fw-black mb-0" style={{ fontSize: "1.3rem", fontStyle: "italic" }}>
                    {s.val} <span className="label-xs" style={{ fontStyle: "normal" }}>{s.unit}</span>
                  </p>
                  {s.trend && (
                    <span className="label-xs" style={{ color: "var(--cyan)", opacity: 0.7 }}>
                      <i className="bi bi-graph-up me-1"></i>{s.trend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Energy ring + Chart */}
      <div className="row g-3 mb-4">
        {/* Energy Ring */}
        <div className="col-lg-4">
          <div className="glass-card p-4 text-center h-100">
            <p className="label-xs mb-4">Energy Saturation</p>
            <div className="energy-ring-wrap mb-4">
              <svg viewBox="0 0 192 192" width="180" height="180">
                <defs>
                  <linearGradient id="eg" x1="0%" y1="0%" x2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#00e0ff" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle cx="96" cy="96" r="80" fill="none" stroke="#0f172a" strokeWidth="12" />
                <circle cx="96" cy="96" r="80" fill="none" stroke="url(#eg)" strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - energyPct / 100)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1.5s ease" }}
                />
              </svg>
              <div className="energy-ring-center">
                <p className="text-white fw-black mb-0" style={{ fontSize: "2rem", fontStyle: "italic" }}>{energyPct}%</p>
                <p className="label-xs mb-0" style={{ color: "var(--cyan)" }}>Satiety</p>
              </div>
            </div>
            <div className="row g-2">
              <div className="col-6 text-center">
                <p className="label-xs mb-1">Consumed</p>
                <p className="text-white fw-black mb-0" style={{ fontSize: "1.2rem", fontStyle: "italic" }}>{bioData.energy}</p>
              </div>
              <div className="col-6 text-center" style={{ borderLeft: "1px solid #1e293b" }}>
                <p className="label-xs mb-1">Target</p>
                <p className="text-white fw-black mb-0" style={{ fontSize: "1.2rem", fontStyle: "italic" }}>{bioData.energyMax}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="col-lg-8">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="label-xs mb-0">Metabolic Flux Trend</p>
              <div className="d-flex gap-3">
                {[["#00e0ff","Energy"],["#22c55e","Carbs"],["#8b5cf6","Protein"]].map(([c,l]) => (
                  <div key={l} className="d-flex align-items-center gap-1">
                    <div className="pulse-dot" style={{ background: c, width: 6, height: 6, animation: "none" }}></div>
                    <span className="label-xs">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e0ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00e0ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} tick={{ fontWeight: 900 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "#0a101f", border: "1px solid #1e293b", borderRadius: "0.75rem", fontSize: "0.7rem", fontWeight: 900 }} />
                <Area type="monotone" dataKey="energy" stroke="#00e0ff" strokeWidth={2} fill="url(#ge)" />
                <Area type="monotone" dataKey="carbs" stroke="#22c55e" strokeWidth={2} fill="url(#gc)" />
                <Area type="monotone" dataKey="protein" stroke="#8b5cf6" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Macros + Recent Meals */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="glass-card p-4">
            <p className="label-xs mb-4">Macro Precision Engine</p>
            {Object.entries(bioData.macros).map(([key, data]) => (
              <div key={key} className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white fw-black text-uppercase" style={{ fontSize: "0.7rem", fontStyle: "italic" }}>{key} Breakdown</span>
                  <span className="label-xs">{data.current}g / {data.target}g</span>
                </div>
                <div className="macro-bar">
                  <div className="macro-bar-fill" style={{ width: `${Math.min(100, getPercentage(data.current, data.target))}%`, background: MACRO_COLORS[key] }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-card p-4">
            <p className="label-xs mb-4">Bio-Activity Log</p>
            {mealHistory.length === 0 ? (
              <div className="text-center py-5" style={{ opacity: 0.15 }}>
                <i className="bi bi-lightning-charge" style={{ fontSize: "2.5rem" }}></i>
                <p className="label-xs mt-2">No Recent Activity</p>
              </div>
            ) : (
              mealHistory.slice(0, 4).map((meal) => (
                <div key={meal.id} className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-2"
                  style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-3"
                      style={{ width: 38, height: 38, background: "#0f172a" }}>
                      <i className="bi bi-cup-hot" style={{ color: "var(--cyan)", fontSize: "0.85rem" }}></i>
                    </div>
                    <div>
                      <p className="mb-0 text-white fw-black text-uppercase" style={{ fontSize: "0.72rem" }}>{meal.food_name}</p>
                      <p className="mb-0 label-xs">{new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="mb-0 text-white fw-black" style={{ fontSize: "0.85rem", fontStyle: "italic" }}>+{meal.calories}</p>
                    <p className="mb-0 label-xs" style={{ color: "var(--cyan)" }}>KCAL</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
