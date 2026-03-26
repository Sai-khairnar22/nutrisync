import React, { useState, useEffect, useRef } from "react";
import Onboarding from "./components/Onboarding.jsx";
import Dashboard from "./components/Dashboard.jsx";
import FoodScan from "./components/FoodScan.jsx";
import DietPlan from "./components/DietPlan.jsx";
import MealTracker from "./components/MealTracker.jsx";
import ReportModal from "./components/ReportModal.jsx";

const INITIAL_BIO = {
  hr: 77,
  bp: "120/80",
  spo2: 98,
  energy: 0,
  energyMax: 2100,
  macros: {
    protein: { current: 0, target: 120 },
    carbs: { current: 0, target: 200 },
    fats: { current: 0, target: 60 },
  },
};

const TABS = [
  { key: "Dashboard", icon: "bi-grid" },
  { key: "Food Scan", icon: "bi-camera" },
  { key: "Diet Plan", icon: "bi-clipboard-data" },
  { key: "Meal Tracker", icon: "bi-clock-history" },
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [bioData, setBioData] = useState(INITIAL_BIO);
  const [mealHistory, setMealHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [btDevice, setBtDevice] = useState(null);
  const [btConnecting, setBtConnecting] = useState(false);
  const btRef = useRef(null);

  // Load persisted data
  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (email) {
      fetch(`/api/user/profile?email=${email}`)
        .then((r) => r.json())
        .then((data) => {
          if (data) { setUserProfile(data); setOnboarded(true); }
        })
        .catch(console.error);
    }
    const savedBio = localStorage.getItem("ns_bio");
    const savedMeals = localStorage.getItem("ns_meals");
    if (savedBio) setBioData(JSON.parse(savedBio));
    if (savedMeals) setMealHistory(JSON.parse(savedMeals));

    return () => { if (btRef.current) clearInterval(btRef.current); };
  }, []);

  useEffect(() => { localStorage.setItem("ns_bio", JSON.stringify(bioData)); }, [bioData]);
  useEffect(() => { localStorage.setItem("ns_meals", JSON.stringify(mealHistory)); }, [mealHistory]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleMealLogged = (meal) => {
    setBioData((prev) => ({
      ...prev,
      energy: prev.energy + meal.calories,
      macros: {
        protein: { ...prev.macros.protein, current: prev.macros.protein.current + meal.protein },
        carbs: { ...prev.macros.carbs, current: prev.macros.carbs.current + meal.carbs },
        fats: { ...prev.macros.fats, current: prev.macros.fats.current + meal.fats },
      },
    }));
    setMealHistory((prev) => [meal, ...prev]);
    setActiveTab("Meal Tracker");
  };

  const resetDaily = () => {
    setBioData(INITIAL_BIO);
    setMealHistory([]);
    localStorage.removeItem("ns_bio");
    localStorage.removeItem("ns_meals");
    setToast({ message: "Vitals Reset", type: "success" });
  };

  const connectWatch = async () => {
    setBtConnecting(true);
    const simulate = () => {
      if (btRef.current) clearInterval(btRef.current);
      btRef.current = setInterval(() => {
        setBioData((prev) => ({
          ...prev,
          hr: 68 + Math.floor(Math.random() * 22),
          spo2: 96 + Math.floor(Math.random() * 4),
          bp: `${115 + Math.floor(Math.random() * 15)}/${75 + Math.floor(Math.random() * 10)}`,
        }));
      }, 3000);
    };
    try {
      const nav = navigator;
      if (!nav.bluetooth) throw new Error("No BT");
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["heart_rate"],
      });
      setBtDevice(device.name || "Unknown Device");
      simulate();
    } catch {
      setTimeout(() => {
        setBtDevice("Watch Simulator");
        simulate();
      }, 1200);
    } finally {
      setBtConnecting(false);
    }
  };

  // ── Splash ──────────────────────────────────────────────
  if (!started) {
    return (
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div className="atmosphere"></div>
        <div className="neural-grid"></div>
        <div className="splash-screen">
          <div className="position-relative mb-4">
            <div className="splash-glow" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}></div>
            <i className="bi bi-activity" style={{ fontSize: "5rem", color: "var(--cyan)", position: "relative", zIndex: 1 }}></i>
          </div>
          <h1
            className="text-white fw-black text-uppercase mb-2"
            style={{ fontSize: "clamp(3rem,10vw,6rem)", fontStyle: "italic", letterSpacing: "-0.03em", lineHeight: 1 }}
          >
            NUTRI<span style={{ color: "var(--cyan)" }}>SYNC</span>
          </h1>
          <p className="label-xs mb-5" style={{ letterSpacing: "0.4em", opacity: 0.6 }}>
            Autonomous Metabolic Intelligence
          </p>
          <button
            className="btn-cyan d-flex align-items-center gap-3"
            onClick={() => setStarted(true)}
          >
            Initialize Interface <i className="bi bi-lightning-fill"></i>
          </button>
        </div>
      </div>
    );
  }

  // ── Onboarding ──────────────────────────────────────────
  if (!onboarded) {
    return (
      <div style={{ position: "relative", overflow: "auto", minHeight: "100vh" }}>
        <div className="atmosphere"></div>
        <div className="neural-grid"></div>
        <Onboarding
          onComplete={(profile) => {
            setUserProfile(profile);
            setOnboarded(true);
          }}
          setToast={setToast}
        />
        {toast && (
          <div className="toast-custom">
            <i className="bi bi-check2-circle"></i>
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  // ── Main App ─────────────────────────────────────────────
  return (
    <div className="d-flex" style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
      <div className="atmosphere"></div>
      <div className="neural-grid"></div>

      {/* Sidebar */}
      <aside className="sidebar" style={{ position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div className="d-flex align-items-center gap-2 mb-5">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 38, height: 38, background: "var(--cyan)", flexShrink: 0 }}
          >
            <i className="bi bi-activity text-black" style={{ fontSize: "1.1rem" }}></i>
          </div>
          <span className="text-white fw-black text-uppercase" style={{ fontSize: "1.1rem", fontStyle: "italic", letterSpacing: "-0.02em" }}>
            SYNC
          </span>
        </div>

        {/* Nav */}
        <nav className="d-flex flex-column gap-1 flex-grow-1">
          {TABS.map(({ key, icon }) => (
            <button
              key={key}
              className={`nav-btn ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <i className={`bi ${icon}`} style={{ fontSize: "1rem" }}></i>
              {key}
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto">
          {/* BT Status */}
          <div
            className="p-3 rounded-3 mb-3"
            style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)" }}
          >
            <p className="label-xs mb-2">Neural Link Status</p>
            <div className="d-flex align-items-center gap-2">
              <div
                className="pulse-dot"
                style={{ background: btDevice ? "var(--cyan)" : "#22c55e", width: 8, height: 8 }}
              ></div>
              <span className="bt-status" style={{ color: btDevice ? "var(--cyan)" : "#22c55e", fontSize: "0.62rem" }}>
                {btDevice ? `Linked: ${btDevice}` : "Active Protocol"}
              </span>
            </div>
          </div>

          <button
            className={`nav-btn mb-2 justify-content-center ${btDevice ? "active" : ""}`}
            style={{ background: btDevice ? "rgba(0,224,255,0.05)" : "#fff", color: btDevice ? "var(--cyan)" : "#000", fontWeight: 900 }}
            onClick={connectWatch}
            disabled={btConnecting || !!btDevice}
          >
            {btConnecting ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className="bi bi-bluetooth"></i>
            )}
            {btDevice ? "Hardware Linked" : "Connect Watch"}
          </button>

          <button
            className="nav-btn justify-content-center"
            style={{ color: "#475569", fontSize: "0.62rem" }}
            onClick={resetDaily}
          >
            <i className="bi bi-exclamation-circle"></i>
            Reset Vitals
          </button>

          {/* Profile + Report */}
          {userProfile && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button
                className="d-flex align-items-center justify-content-between w-100 p-3 rounded-3 mb-3"
                style={{
                  background: "rgba(0,224,255,0.04)",
                  border: "1px solid rgba(0,224,255,0.08)",
                  cursor: "pointer",
                }}
                onClick={() => setShowReport(true)}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-clipboard-check" style={{ color: "var(--cyan)", fontSize: "0.85rem" }}></i>
                  <span className="label-xs text-white" style={{ fontSize: "0.62rem" }}>Overall Report</span>
                </div>
                <i className="bi bi-chevron-right" style={{ color: "#475569", fontSize: "0.7rem" }}></i>
              </button>

              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle fw-black"
                  style={{ width: 36, height: 36, background: "rgba(0,224,255,0.1)", color: "var(--cyan)", fontSize: "0.9rem", flexShrink: 0 }}
                >
                  {userProfile.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="mb-0 text-white fw-black text-uppercase text-truncate" style={{ fontSize: "0.72rem" }}>{userProfile.name}</p>
                  <p className="mb-0 label-xs">BMI: {userProfile.bmi}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <p className="label-xs mb-1" style={{ color: "var(--cyan)", letterSpacing: "0.4em", fontStyle: "italic" }}>
              Neural Interface
            </p>
            <h1 className="page-title">{activeTab}</h1>
          </div>
          <div className="d-flex gap-2 opacity-25">
            {["bi-fingerprint", "bi-shield-check", "bi-braces", "bi-cpu"].map((ic) => (
              <i key={ic} className={`bi ${ic}`} style={{ color: "var(--cyan)", fontSize: "0.9rem" }}></i>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "Dashboard" && (
          <Dashboard
            bioData={bioData}
            mealHistory={mealHistory}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setToast={setToast}
          />
        )}
        {activeTab === "Food Scan" && (
          <FoodScan onMealLogged={handleMealLogged} setToast={setToast} />
        )}
        {activeTab === "Diet Plan" && (
          <DietPlan bioData={bioData} setToast={setToast} />
        )}
        {activeTab === "Meal Tracker" && (
          <MealTracker mealHistory={mealHistory} />
        )}
      </main>

      {/* Report Modal */}
      {showReport && userProfile && (
        <ReportModal
          userProfile={userProfile}
          bioData={bioData}
          mealHistory={mealHistory}
          onClose={() => setShowReport(false)}
          setToast={setToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-custom">
          <i className="bi bi-check2-circle"></i>
          {toast.message}
        </div>
      )}
    </div>
  );
}
