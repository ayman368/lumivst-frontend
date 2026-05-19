"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/lib/api/config";

interface TasiSettings {
    buySwitch: boolean;
    breathingRule: boolean;
    powerTrend: boolean;
    marketExposure: number;
    disposalDays: number;
}

const defaultSettings: TasiSettings = {
    buySwitch: true,
    breathingRule: false,
    powerTrend: true,
    marketExposure: 100,
    disposalDays: 5,
};

function getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function ToggleSwitch({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            onClick={() => onChange(!value)}
            style={{
                position: "relative",
                width: 52,
                height: 28,
                borderRadius: 99,
                border: "none",
                cursor: "pointer",
                background: value
                    ? "linear-gradient(135deg, #22c55e, #16a34a)"
                    : "rgba(255,255,255,0.12)",
                transition: "background 0.25s",
                flexShrink: 0,
                boxShadow: value ? "0 0 12px rgba(34,197,94,0.4)" : "none",
            }}
            aria-checked={value}
            role="switch"
        >
            <span
                style={{
                    position: "absolute",
                    top: 3,
                    left: value ? 27 : 3,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
            />
        </button>
    );
}

function Row({
    label,
    children,
    accent,
}: {
    label: string;
    children: React.ReactNode;
    accent?: boolean;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: accent ? "rgba(59,130,246,0.04)" : "transparent",
                transition: "background 0.2s",
            }}
        >
            <div
                style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    textAlign: "right",
                }}
            >
                {label}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 90, justifyContent: "center" }}>
                {children}
            </div>
        </div>
    );
}

export default function TasiSettings() {
    const [settings, setSettings] = useState<TasiSettings>(defaultSettings);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch current settings from API on mount
    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/tasi-settings/`, {
            headers: { "X-API-Key": process.env.NEXT_PUBLIC_API_KEY ?? "" },
            credentials: "include",
        })
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data) => {
                setSettings({
                    buySwitch: data.buy_switch,
                    breathingRule: data.breathing_rule,
                    powerTrend: data.power_trend,
                    marketExposure: data.market_exposure,
                    disposalDays: data.disposal_days,
                });
                setLoading(false);
            })
            .catch((e) => {
                console.error("Failed to load settings:", e);
                setError("فشل تحميل الإعدادات من السيرفر");
                setLoading(false);
            });
    }, []);

    const update = <K extends keyof TasiSettings>(key: K, val: TasiSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: val }));
        setSaved(false);
    };

    const handleSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/tasi-settings/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
                },
                credentials: "include",
                body: JSON.stringify({
                    buy_switch: settings.buySwitch,
                    breathing_rule: settings.breathingRule,
                    power_trend: settings.powerTrend,
                    market_exposure: settings.marketExposure,
                    disposal_days: settings.disposalDays,
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            console.error("Failed to save settings:", e);
            setError("فشل حفظ الإعدادات. تأكد من اتصالك بالسيرفر.");
        } finally {
            setSaving(false);
        }
    }, [settings]);

    return (
        <div
            dir="rtl"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(160deg, #0a0f1e 0%, #0d1a2e 60%, #0a0f1e 100%)",
                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                padding: "2rem 1rem",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .settings-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 18px;
          overflow: hidden;
          backdrop-filter: blur(16px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }

        .row-hover:hover {
          background: rgba(255,255,255,0.025) !important;
        }

        .number-input {
          width: 80px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.14);
          border-radius: 8px;
          color: #f1f5f9;
          font-size: 1rem;
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .number-input:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.1);
        }

        .save-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(59,130,246,0.35);
        }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,130,246,0.5); }
        .save-btn:active:not(:disabled) { transform: translateY(0); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.5s ease forwards; }

        .badge-on {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 99px;
          background: rgba(34,197,94,0.15);
          color: #4ade80;
          border: 1px solid rgba(34,197,94,0.25);
        }
        .badge-off {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 99px;
          background: rgba(239,68,68,0.12);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.22);
        }
      `}</style>

            <div className="fade-in" style={{ width: "100%", maxWidth: 520 }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                            background: "rgba(59,130,246,0.12)",
                            border: "1px solid rgba(59,130,246,0.25)",
                            borderRadius: 99,
                            padding: "6px 18px",
                            marginBottom: 14,
                        }}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
                        <span style={{ color: "#93c5fd", fontSize: "0.82rem", fontWeight: 700 }}>
                            تحديث {getToday()}
                        </span>
                    </div>
                    <h1
                        style={{
                            color: "#f1f5f9",
                            fontSize: "1.55rem",
                            fontWeight: 800,
                            margin: 0,
                            letterSpacing: "-0.5px",
                        }}
                    >
                        🇸🇦 إعدادات السوق السعودي (TASI)
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.83rem", marginTop: 6 }}>
                        ضبط معاملات الدخول والخروج بناءً على حالة السوق
                    </p>
                </div>

                {/* Table Header */}
                <div className="settings-card">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 20px",
                            background: "rgba(59,130,246,0.08)",
                            borderBottom: "1px solid rgba(255,255,255,0.09)",
                        }}
                    >
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", fontWeight: 700 }}>
                            الإعداد
                        </div>
                        <div
                            style={{
                                color: "#93c5fd",
                                fontSize: "0.9rem",
                                fontWeight: 800,
                                background: "rgba(59,130,246,0.15)",
                                border: "1px solid rgba(59,130,246,0.3)",
                                borderRadius: 8,
                                padding: "4px 18px",
                                letterSpacing: "1px",
                            }}
                        >
                            TASI
                        </div>
                    </div>

                    {/* مفتاح الشراء */}
                    <div className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <Row label="مفتاح الشراء">
                            <ToggleSwitch
                                value={settings.buySwitch}
                                onChange={(v) => update("buySwitch", v)}
                            />
                            <span className={settings.buySwitch ? "badge-on" : "badge-off"}>
                                {settings.buySwitch ? "ON" : "OFF"}
                            </span>
                        </Row>
                    </div>

                    {/* قاعدة ضبط النفس */}
                    <div className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <Row label="قاعدة ضبط النفس">
                            <ToggleSwitch
                                value={settings.breathingRule}
                                onChange={(v) => update("breathingRule", v)}
                            />
                            <span className={settings.breathingRule ? "badge-on" : "badge-off"}>
                                {settings.breathingRule ? "ON" : "OFF"}
                            </span>
                        </Row>
                    </div>

                    {/* الباور ترند */}
                    <div className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <Row label="الباور ترند">
                            <ToggleSwitch
                                value={settings.powerTrend}
                                onChange={(v) => update("powerTrend", v)}
                            />
                            <span className={settings.powerTrend ? "badge-on" : "badge-off"}>
                                {settings.powerTrend ? "ON" : "OFF"}
                            </span>
                        </Row>
                    </div>

                    {/* الانكشاف على السوق */}
                    <div className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <Row label="الانكشاف على السوق">
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                    className="number-input"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={settings.marketExposure}
                                    onChange={(e) =>
                                        update("marketExposure", Math.min(100, Math.max(0, Number(e.target.value))))
                                    }
                                />
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>%</span>
                            </div>
                        </Row>
                    </div>

                    {/* أيام التصريف */}
                    <div className="row-hover">
                        <Row label="أيام التصريف">
                            <input
                                className="number-input"
                                type="number"
                                min={1}
                                max={30}
                                value={settings.disposalDays}
                                onChange={(e) =>
                                    update("disposalDays", Math.max(1, Number(e.target.value)))
                                }
                            />
                        </Row>
                    </div>
                </div>

                {/* Note */}
                <div
                    style={{
                        background: "rgba(251,191,36,0.07)",
                        border: "1px solid rgba(251,191,36,0.18)",
                        borderRadius: 12,
                        padding: "12px 16px",
                        marginTop: "1rem",
                        fontSize: "0.83rem",
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.75,
                        textAlign: "right",
                    }}
                >
                    <span style={{ color: "#fbbf24", fontWeight: 700 }}>⚠️ ملاحظة: </span>
                    تم تعديل نسبة الارتفاع المطلوبة لسقوط يوم التصريف إلى 5% بناءً على التغيير في موقع وليم اونيل.
                </div>

                {/* Error Toast */}
                {error && (
                    <div
                        style={{
                            background: "rgba(239,68,68,0.12)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: 12,
                            padding: "12px 16px",
                            marginTop: "1rem",
                            fontSize: "0.83rem",
                            color: "#fca5a5",
                            textAlign: "center",
                        }}
                    >
                        ⚠️ {error}
                    </div>
                )}

                {/* Save Button */}
                <div style={{ marginTop: "1.2rem" }}>
                    <button className="save-btn" onClick={handleSave} disabled={saving || loading}>
                        {saving ? "⏳ جاري الحفظ..." : saved ? "✅ تم الحفظ بنجاح!" : loading ? "⏳ جاري التحميل..." : "💾 حفظ الإعدادات"}
                    </button>
                </div>

                {/* Summary */}
                <div
                    style={{
                        marginTop: "1rem",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.7rem",
                    }}
                >
                    {[
                        { label: "مفتاح الشراء", val: settings.buySwitch ? "مفعّل" : "معطّل", ok: settings.buySwitch },
                        { label: "ضبط النفس", val: settings.breathingRule ? "مفعّل" : "معطّل", ok: settings.breathingRule },
                        { label: "الانكشاف", val: `${settings.marketExposure}%`, ok: settings.marketExposure > 0 },
                        { label: "أيام التصريف", val: `${settings.disposalDays} يوم`, ok: true },
                    ].map((item, i) => (
                        <div
                            key={i}
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 10,
                                padding: "10px 14px",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginBottom: 4 }}>
                                {item.label}
                            </div>
                            <div
                                style={{
                                    color: item.ok ? "#4ade80" : "#f87171",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                }}
                            >
                                {item.val}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}