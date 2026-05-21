"use client";

import { useState } from "react";

interface CalculationResult {
  kellyPercent: number;
  halfKelly: number;
  quarterKelly: number;
  winRate: number;
  lossRate: number;
  rewardRiskRatio: number;
  expectancy: number;
}

function calculateIdealPositionSize(
  totalTrades: number,
  winningTrades: number,
  avgWinPercent: number,
  avgLossPercent: number
): CalculationResult {
  if (totalTrades <= 0 || winningTrades < 0 || winningTrades > totalTrades) {
    throw new Error("بيانات غير صحيحة");
  }

  const p = winningTrades / totalTrades;
  const q = 1 - p;
  const b = avgWinPercent / avgLossPercent;
  const kelly = (p * b - q) / b;
  const expectancy = p * avgWinPercent - q * avgLossPercent;

  return {
    kellyPercent: Math.max(0, kelly * 100),
    halfKelly: Math.max(0, kelly * 50),
    quarterKelly: Math.max(0, kelly * 25),
    winRate: p * 100,
    lossRate: q * 100,
    rewardRiskRatio: b,
    expectancy,
  };
}

function getKellyRating(kelly: number) {
  if (kelly <= 0)
    return { label: "غير مناسب للتداول", bg: "#fce8e8", color: "#a32d2d" };
  if (kelly < 10)
    return { label: "محافظ جداً", bg: "#faeeda", color: "#633806" };
  if (kelly < 25)
    return { label: "معتدل ومناسب", bg: "#eaf3de", color: "#3b6d11" };
  if (kelly < 50)
    return {
      label: "عدواني — استخدم نصف كيلي",
      bg: "#faeeda",
      color: "#854f0b",
    };
  return {
    label: "خطر عالٍ — استخدم ربع كيلي",
    bg: "#fce8e8",
    color: "#a32d2d",
  };
}

export default function PositionSizeCalculator() {
  const [totalTrades, setTotalTrades] = useState<string>("100");
  const [winningTrades, setWinningTrades] = useState<string>("50");
  const [avgWin, setAvgWin] = useState<string>("20");
  const [avgLoss, setAvgLoss] = useState<string>("7");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string>("");

  const handleCalculate = () => {
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      try {
        const total = parseFloat(totalTrades);
        const winning = parseFloat(winningTrades);
        const win = parseFloat(avgWin);
        const loss = parseFloat(avgLoss);

        if (isNaN(total) || isNaN(winning) || isNaN(win) || isNaN(loss)) {
          throw new Error("يرجى إدخال أرقام صحيحة في جميع الحقول");
        }
        if (total <= 0) throw new Error("عدد الصفقات يجب أن يكون أكبر من صفر");
        if (winning < 0 || winning > total)
          throw new Error("عدد الصفقات الرابحة غير صحيح");
        if (win <= 0) throw new Error("متوسط الربح يجب أن يكون أكبر من صفر");
        if (loss <= 0)
          throw new Error("متوسط الخسارة يجب أن يكون أكبر من صفر");

        const calc = calculateIdealPositionSize(total, winning, win, loss);
        setResult(calc);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "حدث خطأ في الحساب");
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const fields = [
    {
      id: "total",
      label: "عدد الصفقات الكلية",
      value: totalTrades,
      setter: setTotalTrades,
      placeholder: "مثال: 100",
      min: "1",
      step: "1",
    },
    {
      id: "winning",
      label: "عدد الصفقات الرابحة",
      value: winningTrades,
      setter: setWinningTrades,
      placeholder: "مثال: 50",
      min: "0",
      step: "1",
    },
    {
      id: "win",
      label: "متوسط الربح (%)",
      value: avgWin,
      setter: setAvgWin,
      placeholder: "مثال: 20",
      min: "0.01",
      step: "0.1",
    },
    {
      id: "loss",
      label: "متوسط الخسارة (%)",
      value: avgLoss,
      setter: setAvgLoss,
      placeholder: "مثال: 7",
      min: "0.01",
      step: "0.1",
    },
  ];

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#f8f6f1",
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        padding: "2rem 1rem",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .kc-input {
          width: 100%;
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #e2ddd5;
          border-radius: 8px;
          color: #1a1a2e;
          font-size: 14px;
          font-family: 'Cairo', sans-serif;
          text-align: right;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .kc-input:focus {
          border-color: #b8a060;
          box-shadow: 0 0 0 3px rgba(184,160,96,0.12);
        }
        .kc-input::placeholder { color: #b0a89a; }
        .kc-input::-webkit-outer-spin-button,
        .kc-input::-webkit-inner-spin-button { -webkit-appearance: none; }

        .kc-btn {
          width: 100%;
          padding: 12px;
          background: #1a1a2e;
          border: none;
          border-radius: 8px;
          color: #d4a843;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          letter-spacing: 0.02em;
        }
        .kc-btn:hover:not(:disabled) {
          background: #12122a;
          box-shadow: 0 4px 16px rgba(26,26,46,0.25);
        }
        .kc-btn:active:not(:disabled) { transform: scale(0.98); }
        .kc-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .result-animate {
          animation: fadeSlide 0.35s ease forwards;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e8e3da;
          border-radius: 10px;
          padding: 12px 14px;
        }

        .divider {
          border: none;
          border-top: 1px solid #e8e3da;
          margin: 0;
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              background: "#1a1a2e",
              borderRadius: "50%",
              marginBottom: "0.75rem",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <h1
            style={{
              color: "#1a1a2e",
              fontSize: "1.5rem",
              fontWeight: 800,
              margin: "0 0 4px",
              letterSpacing: "-0.3px",
            }}
          >
            حاسبة حجم المركز المثالي
          </h1>
          <p style={{ color: "#8a8070", fontSize: "0.85rem", margin: 0 }}>
            بناءً على معيار كيلي — Kelly Criterion
          </p>
        </div>

        {/* ── Side-by-side layout ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {/* ── LEFT: Form ── */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e8e3da",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                background: "#1a1a2e",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="11" y2="18"/>
              </svg>
              <span style={{ color: "#d4a843", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em" }}>
                بيانات التداول
              </span>
            </div>

            <div style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {fields.map((f) => (
                  <div key={f.id}>
                    <label
                      htmlFor={f.id}
                      style={{
                        display: "block",
                        color: "#5a5248",
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: 5,
                      }}
                    >
                      {f.label}
                    </label>
                    <input
                      id={f.id}
                      className="kc-input"
                      type="number"
                      min={f.min}
                      step={f.step}
                      value={f.value}
                      placeholder={f.placeholder}
                      onChange={(e) => f.setter(e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div
                  style={{
                    marginTop: "0.9rem",
                    background: "#fce8e8",
                    border: "1px solid #f7c1c1",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#a32d2d",
                    fontSize: "13px",
                  }}
                >
                  ⚠ {error}
                </div>
              )}

              <div style={{ marginTop: "1.1rem" }}>
                <button
                  className="kc-btn"
                  onClick={handleCalculate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "⏳ جاري الحساب..."
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>
                      </svg>
                      احسب حجم المركز المثالي
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Note */}
            <div
              style={{
                borderTop: "1px solid #e8e3da",
                padding: "12px 20px",
                background: "#faf8f4",
                fontSize: "12px",
                color: "#8a8070",
                lineHeight: 1.7,
              }}
            >
              <span style={{ color: "#b8a060", fontWeight: 700 }}>ملاحظة: </span>
              حجم المركز هو نسبة رأس المال المخاطر بها في كل صفقة. يعتمد على استراتيجيتك وحالة السوق.
            </div>
          </div>

          {/* ── RIGHT: Results ── */}
          <div>
            {!result ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8e3da",
                  borderRadius: 14,
                  minHeight: 380,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  color: "#b0a89a",
                  fontSize: "13px",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4d0c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>أدخل بياناتك واضغط احسب</span>
              </div>
            ) : (
              <div
                className="result-animate"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8e3da",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {/* Result panel header */}
                <div
                  style={{
                    background: "#1a1a2e",
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                  </svg>
                  <span style={{ color: "#d4a843", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em" }}>
                    نتائج التحليل
                  </span>
                </div>

                <div style={{ padding: "1.25rem" }}>
                  {/* Main Kelly */}
                  <div
                    style={{
                      background: "#1a1a2e",
                      borderRadius: 12,
                      padding: "1.25rem",
                      textAlign: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginBottom: 6 }}>
                      حجم المركز المثالي — كيلي الكامل
                    </div>
                    <div
                      style={{
                        fontSize: "2.6rem",
                        fontWeight: 800,
                        color: result.kellyPercent > 0 ? "#d4a843" : "#f87171",
                        lineHeight: 1,
                        marginBottom: 10,
                      }}
                    >
                      {result.kellyPercent.toFixed(2)}%
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        height: 6,
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: 99,
                        overflow: "hidden",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(result.kellyPercent, 100)}%`,
                          background: "linear-gradient(90deg, #b8860b, #d4a843)",
                          borderRadius: 99,
                          transition: "width 0.7s ease",
                        }}
                      />
                    </div>

                    {(() => {
                      const r = getKellyRating(result.kellyPercent);
                      return (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 12px",
                            borderRadius: 99,
                            background: r.bg,
                            color: r.color,
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {r.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Half & Quarter Kelly */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginBottom: "1rem",
                    }}
                  >
                    <div className="stat-card" style={{ textAlign: "center" }}>
                      <div style={{ color: "#8a8070", fontSize: "11px", marginBottom: 3 }}>
                        نصف كيلي (موصى به)
                      </div>
                      <div style={{ color: "#185fa5", fontSize: "1.4rem", fontWeight: 700 }}>
                        {result.halfKelly.toFixed(2)}%
                      </div>
                    </div>
                    <div className="stat-card" style={{ textAlign: "center" }}>
                      <div style={{ color: "#8a8070", fontSize: "11px", marginBottom: 3 }}>
                        ربع كيلي (محافظ)
                      </div>
                      <div style={{ color: "#534ab7", fontSize: "1.4rem", fontWeight: 700 }}>
                        {result.quarterKelly.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginBottom: "1rem",
                    }}
                  >
                    <div className="stat-card">
                      <div style={{ color: "#8a8070", fontSize: "11px", marginBottom: 2 }}>نسبة الربح</div>
                      <div style={{ color: "#3b6d11", fontSize: "1.2rem", fontWeight: 700 }}>
                        {result.winRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="stat-card">
                      <div style={{ color: "#8a8070", fontSize: "11px", marginBottom: 2 }}>نسبة الخسارة</div>
                      <div style={{ color: "#a32d2d", fontSize: "1.2rem", fontWeight: 700 }}>
                        {result.lossRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="stat-card">
                      <div style={{ color: "#8a8070", fontSize: "11px", marginBottom: 2 }}>نسبة R:R</div>
                      <div style={{ color: "#854f0b", fontSize: "1.2rem", fontWeight: 700 }}>
                        1 : {result.rewardRiskRatio.toFixed(2)}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div style={{ color: "#8a8070", fontSize: "11px", marginBottom: 2 }}>التوقع لكل صفقة</div>
                      <div
                        style={{
                          color: result.expectancy >= 0 ? "#3b6d11" : "#a32d2d",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                        }}
                      >
                        {result.expectancy >= 0 ? "+" : ""}
                        {result.expectancy.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Formula box */}
                  <div
                    style={{
                      background: "#faf8f4",
                      border: "1px solid #e8e3da",
                      borderRadius: 10,
                      padding: "12px 14px",
                      fontSize: "12px",
                      color: "#8a8070",
                      lineHeight: 1.8,
                    }}
                  >
                    <div style={{ color: "#5a5248", fontWeight: 700, marginBottom: 4, fontSize: "12px" }}>
                      ℹ كيف تم الحساب؟
                    </div>
                    <div>
                      <strong style={{ color: "#3a3228" }}>معادلة كيلي:</strong> f* = (p × b − q) / b
                    </div>
                    <div>حيث p = نسبة الربح، q = نسبة الخسارة، b = معدل الربح/الخسارة</div>
                    <div style={{ marginTop: 6 }}>
                      <strong style={{ color: "#3a3228" }}>التطبيق:</strong>{" "}
                      f* = ({result.winRate.toFixed(1)}% × {result.rewardRiskRatio.toFixed(2)} − {result.lossRate.toFixed(1)}%) / {result.rewardRiskRatio.toFixed(2)}{" "}
                      ={" "}
                      <strong style={{ color: "#b8860b" }}>{result.kellyPercent.toFixed(2)}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}