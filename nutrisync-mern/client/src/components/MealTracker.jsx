import React from "react";

export default function MealTracker({ mealHistory }) {
  const mealIcon = (type) => {
    if (type === "Breakfast") return "bi-sun";
    if (type === "Lunch") return "bi-cup-hot";
    return "bi-moon-stars";
  };

  const mealColor = (type) => {
    if (type === "Breakfast") return "#f59e0b";
    if (type === "Lunch") return "#00e0ff";
    return "#8b5cf6";
  };

  return (
    <div>
      <div className="glass-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white fw-black text-uppercase mb-0 d-flex align-items-center gap-2"
            style={{ fontSize: "1.2rem", fontStyle: "italic" }}>
            <i className="bi bi-clock" style={{ color: "var(--cyan)" }}></i>
            Chronological Sync
          </h2>
          <div
            className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          >
            <span className="label-xs">Records:</span>
            <span className="fw-black" style={{ color: "var(--cyan)", fontSize: "1rem", fontStyle: "italic" }}>
              {mealHistory.length}
            </span>
          </div>
        </div>

        {mealHistory.length === 0 ? (
          <div className="text-center py-5" style={{ opacity: 0.1 }}>
            <i className="bi bi-clock-history" style={{ fontSize: "5rem" }}></i>
            <p className="fw-black text-uppercase mt-3" style={{ letterSpacing: "0.4em", fontSize: "0.8rem" }}>
              Historical Log Clear
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {mealHistory.map((meal) => (
              <div key={meal.id} className="meal-card">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  {/* Left: icon + name */}
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-4"
                      style={{
                        width: 56,
                        height: 56,
                        background: `${mealColor(meal.type)}15`,
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className={`bi ${mealIcon(meal.type)}`}
                        style={{ fontSize: "1.5rem", color: mealColor(meal.type) }}
                      ></i>
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="label-xs">{meal.type}</span>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#1e293b", display: "inline-block" }}></span>
                        <span className="label-xs">
                          {new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <h3
                        className="text-white fw-black text-uppercase mb-0"
                        style={{ fontSize: "1.1rem", fontStyle: "italic", letterSpacing: "-0.01em" }}
                      >
                        {meal.food_name}
                      </h3>
                    </div>
                  </div>

                  {/* Right: macros */}
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    {[
                      { label: "Energy", val: meal.calories, unit: "KCAL", color: "#fff" },
                      { label: "Protein", val: meal.protein, unit: "G", color: "#00e0ff" },
                      { label: "Carbs", val: meal.carbs, unit: "G", color: "#22c55e" },
                      { label: "Lipids", val: meal.fats, unit: "G", color: "#f97316" },
                    ].map(({ label, val, unit, color }, i) => (
                      <div
                        key={i}
                        className="text-end"
                        style={i > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "1rem" } : {}}
                      >
                        <p
                          className="fw-black mb-0"
                          style={{ color, fontSize: "1.2rem", fontStyle: "italic" }}
                        >
                          {val}
                          <span
                            className="label-xs ms-1"
                            style={{ fontStyle: "normal", color: "#475569" }}
                          >
                            {unit}
                          </span>
                        </p>
                        <p className="label-xs mb-0">{label}</p>
                      </div>
                    ))}
                    <i className="bi bi-chevron-right" style={{ color: "#1e293b", fontSize: "1rem" }}></i>
                  </div>
                </div>

                {meal.metabolic_impact && (
                  <div
                    className="mt-3 pt-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <p className="mb-0" style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>
                      <i className="bi bi-stars me-1" style={{ color: "var(--cyan)" }}></i>
                      {meal.metabolic_impact}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
