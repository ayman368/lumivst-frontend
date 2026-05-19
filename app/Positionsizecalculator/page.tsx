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

  // Win rate (p) and loss rate (q)
  const p = winningTrades / totalTrades;
  const q = 1 - p;

  // Reward/Risk ratio (b) = avg win / avg loss
  const b = avgWinPercent / avgLossPercent;

  // Kelly Criterion: f* = (p * b - q) / b
  const kelly = (p * b - q) / b;

  // Expectancy per trade
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

export default function PositionSizeCalculator() {
  const [totalTrades, setTotalTrades] = useState<string>("100");
  const [winningTrades, setWinningTrades] = useState<string>("50");
  const [avgWin, setAvgWin] = useState<string>("20");
  const [avgLoss, setAvgLoss] = useState<string>("7");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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

  const getKellyRating = (kelly: number) => {
    if (kelly <= 0) return { label: "غير مناسب للتداول", color: "#ef4444", emoji: "🔴" };
    if (kelly < 10) return { label: "محافظ جداً", color: "#f59e0b", emoji: "🟡" };
    if (kelly < 25) return { label: "معتدل ومناسب", color: "#22c55e", emoji: "🟢" };
    if (kelly < 50) return { label: "عدواني - استخدم نصف كيلي", color: "#f97316", emoji: "🟠" };
    return { label: "خطر عالٍ - استخدم ربع كيلي", color: "#ef4444", emoji: "🔴" };
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        padding: "2rem 1rem",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          backdrop-filter: blur(12px);
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 1rem;
          font-family: 'Cairo', sans-serif;
          text-align: right;
          transition: border-color 0.2s, background 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.08);
        }
        .input-field::placeholder { color: rgba(255,255,255,0.3); }

        .calc-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 20px rgba(59,130,246,0.4);
        }
        .calc-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(59,130,246,0.5);
        }
        .calc-btn:active:not(:disabled) { transform: translateY(0); }
        .calc-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .result-card {
          animation: slideUp 0.4s ease forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stat-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px;
          text-align: center;
        }

        .kelly-bar-bg {
          width: 100%;
          height: 10px;
          background: rgba(255,255,255,0.1);
          border-radius: 99px;
          overflow: hidden;
        }
        .kelly-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.8s ease;
        }

        label {
          display: block;
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 6px;
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1
            style={{
              color: "#f1f5f9",
              fontSize: "1.6rem",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            حاسبة حجم المركز المثالي
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: 6 }}>
            بناءً على معيار كيلي (Kelly Criterion)
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Total Trades */}
            <div>
              <label>
                <span style={{ marginLeft: 6 }}>🔢</span>
                عدد الصفقات الكلية:
              </label>
              <input
                className="input-field"
                type="number"
                min="1"
                value={totalTrades}
                onChange={(e) => setTotalTrades(e.target.value)}
                placeholder="مثال: 100"
              />
            </div>

            {/* Winning Trades */}
            <div>
              <label>
                <span style={{ marginLeft: 6 }}>✅</span>
                عدد الصفقات الرابحة:
              </label>
              <input
                className="input-field"
                type="number"
                min="0"
                value={winningTrades}
                onChange={(e) => setWinningTrades(e.target.value)}
                placeholder="مثال: 50"
              />
            </div>

            {/* Avg Win */}
            <div>
              <label>
                <span style={{ marginLeft: 6 }}>📈</span>
                متوسط الربح (%):
              </label>
              <input
                className="input-field"
                type="number"
                min="0.01"
                step="0.1"
                value={avgWin}
                onChange={(e) => setAvgWin(e.target.value)}
                placeholder="مثال: 20"
              />
            </div>

            {/* Avg Loss */}
            <div>
              <label>
                <span style={{ marginLeft: 6 }}>📉</span>
                متوسط الخسارة (%):
              </label>
              <input
                className="input-field"
                type="number"
                min="0.01"
                step="0.1"
                value={avgLoss}
                onChange={(e) => setAvgLoss(e.target.value)}
                placeholder="مثال: 7"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "#fca5a5",
                  fontSize: "0.88rem",
                  textAlign: "center",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Button */}
            <button
              className="calc-btn"
              onClick={handleCalculate}
              disabled={isLoading}
            >
              {isLoading ? "⏳ جاري الحساب..." : "⚡ احسب حجم المركز المثالي"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="result-card card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
            {/* Main Kelly Result */}
            <div
              style={{
                background: result.kellyPercent > 0
                  ? "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(59,130,246,0.12))"
                  : "rgba(239,68,68,0.1)",
                border: `1.5px solid ${result.kellyPercent > 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                borderRadius: 14,
                padding: "1.2rem",
                textAlign: "center",
                marginBottom: "1.2rem",
              }}
            >
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: 6 }}>
                حجم المركز المثالي (كيلي الكامل)
              </div>
              <div
                style={{
                  fontSize: "2.8rem",
                  fontWeight: 800,
                  color: result.kellyPercent > 0 ? "#4ade80" : "#f87171",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {result.kellyPercent.toFixed(2)}%
              </div>

              {/* Kelly bar */}
              <div className="kelly-bar-bg" style={{ marginBottom: 10 }}>
                <div
                  className="kelly-bar-fill"
                  style={{
                    width: `${Math.min(result.kellyPercent, 100)}%`,
                    background: result.kellyPercent > 0
                      ? "linear-gradient(90deg, #22c55e, #3b82f6)"
                      : "#ef4444",
                  }}
                />
              </div>

              <div style={{ fontSize: "0.85rem" }}>
                {(() => {
                  const r = getKellyRating(result.kellyPercent);
                  return (
                    <span style={{ color: r.color, fontWeight: 700 }}>
                      {r.emoji} {r.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Conservative variants */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1.2rem" }}>
              <div className="stat-box">
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginBottom: 4 }}>
                  نصف كيلي (موصى به)
                </div>
                <div style={{ color: "#60a5fa", fontSize: "1.5rem", fontWeight: 700 }}>
                  {result.halfKelly.toFixed(2)}%
                </div>
              </div>
              <div className="stat-box">
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginBottom: 4 }}>
                  ربع كيلي (محافظ)
                </div>
                <div style={{ color: "#a78bfa", fontSize: "1.5rem", fontWeight: 700 }}>
                  {result.quarterKelly.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1.2rem" }}>
              <div className="stat-box">
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginBottom: 4 }}>نسبة الربح</div>
                <div style={{ color: "#4ade80", fontSize: "1.3rem", fontWeight: 700 }}>
                  {result.winRate.toFixed(1)}%
                </div>
              </div>
              <div className="stat-box">
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginBottom: 4 }}>نسبة الخسارة</div>
                <div style={{ color: "#f87171", fontSize: "1.3rem", fontWeight: 700 }}>
                  {result.lossRate.toFixed(1)}%
                </div>
              </div>
              <div className="stat-box">
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginBottom: 4 }}>نسبة R:R</div>
                <div style={{ color: "#fbbf24", fontSize: "1.3rem", fontWeight: 700 }}>
                  1 : {result.rewardRiskRatio.toFixed(2)}
                </div>
              </div>
              <div className="stat-box">
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginBottom: 4 }}>التوقع لكل صفقة</div>
                <div
                  style={{
                    color: result.expectancy >= 0 ? "#4ade80" : "#f87171",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                  }}
                >
                  {result.expectancy >= 0 ? "+" : ""}{result.expectancy.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Formula explanation */}
            <div
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: "#93c5fd", fontWeight: 700, marginBottom: 6 }}>
                ℹ️ كيف تم الحساب؟
              </div>
              <div>
                <strong style={{ color: "rgba(255,255,255,0.7)" }}>معادلة كيلي:</strong>{" "}
                f* = (p × b − q) / b
              </div>
              <div>
                حيث p = نسبة الربح، q = نسبة الخسارة، b = معدل الربح/الخسارة
              </div>
              <div style={{ marginTop: 6 }}>
                <strong style={{ color: "rgba(255,255,255,0.7)" }}>التطبيق:</strong>{" "}
                f* = ({result.winRate.toFixed(1)}% × {result.rewardRiskRatio.toFixed(2)} − {result.lossRate.toFixed(1)}%) / {result.rewardRiskRatio.toFixed(2)}{" "}
                ={" "}
                <strong style={{ color: "#4ade80" }}>{result.kellyPercent.toFixed(2)}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <div
          className="card"
          style={{
            padding: "1rem 1.2rem",
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7,
          }}
        >
          <span style={{ color: "#60a5fa", fontWeight: 700 }}>📌 ملاحظة: </span>
          حجم المركز المثالي هو النسبة المئوية من رأس المال التي يُنصح بها للمخاطرة في كل صفقة لتقليل المخاطر وتعظيم النمو. يعتمد على طريقة اختيارك للأسهم وحالة السوق وعادة التداول.
        </div>
      </div>
    </div>
  );
}