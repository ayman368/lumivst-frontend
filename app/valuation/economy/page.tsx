"use client";

import { useEconomyAssessment } from "@/hooks/useValuation";
import { ValuationZone } from "@/types/valuation";

export default function EconomyAssessmentPage() {
  const { data, isLoading, error } = useEconomyAssessment();

  if (isLoading)
    return <div className="p-8 text-black text-center">Loading economy assessment...</div>;
  if (error || !data)
    return <div className="p-8 text-red-500 text-center">Failed to load data.</div>;

  const { indicators, sp500_zones, current_price, ey_a_ratio } = data;

  // We map the indicators from backend to the exact structure in Excel
  const getInd = (nameSubstring: string) => {
    return indicators.find(i => i.name.toLowerCase().includes(nameSubstring.toLowerCase()));
  };

  const unrate = getInd("unemployment");
  const payems = getInd("nonfarm");
  const claims = getInd("initial claims");
  const spread = getInd("10y-2y");
  const a_oas = getInd("a-rated");
  const bbb_oas = getInd("bbb-rated");
  const ey_a = getInd("ey/a");

  return (
    <div className="min-h-screen bg-white text-black p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-5xl border-2 border-blue-700 p-1 mb-4 shadow-sm bg-white">
        <h1 className="text-center font-bold text-red-600 text-xl mb-2">Economy</h1>

        <table className="w-full text-sm border-collapse border border-black text-center font-bold" dir="rtl">
          <thead>
            <tr className="border-b border-black border-dashed">
              <th className="border-l border-black border-dashed px-2 py-1 w-1/3 text-left" dir="ltr">المؤشر</th>
              <th className="border-l border-black border-dashed px-2 py-1 w-1/6"> </th>
              <th className="border-l border-black border-dashed px-2 py-1 w-1/6">التقييم</th>
              <th className="px-2 py-1 w-1/3">السبب (ملاحظات)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr">Unemployment Rate</td>
              <td className="border-l border-black border-dashed px-2 py-1">البطالة</td>
              <td className="border-l border-black border-dashed px-2 py-1">{unrate?.verdict === "Positive" ? "إيجابي" : "سلبي"}</td>
              <td className="px-2 py-1">{unrate?.value}% - {unrate?.verdict === "Positive" ? "منخفض" : "مرتفع"}</td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr">Monthly US Nonfarm Payrolls</td>
              <td className="border-l border-black border-dashed px-2 py-1">التوظيف</td>
              <td className="border-l border-black border-dashed px-2 py-1">{payems?.verdict === "Positive" ? "إيجابي" : "سلبي"}</td>
              <td className="px-2 py-1">{payems?.value} ألف - فوق مستوى الصفر والـ 60 ألف</td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr">US 4-Week Moving Average of initial claims</td>
              <td className="border-l border-black border-dashed px-2 py-1">إعانة البطالة</td>
              <td className="border-l border-black border-dashed px-2 py-1">{claims?.verdict === "Positive" ? "إيجابي" : "سلبي"}</td>
              <td className="px-2 py-1">{claims?.value ? Math.round(claims.value) : "—"} - أقل من 260 ألف</td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td colSpan={4} className="bg-gray-100 h-2"></td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr">US Treasury Yield Curve</td>
              <td className="border-l border-black border-dashed px-2 py-1">شكل المنحنى</td>
              <td className="border-l border-black border-dashed px-2 py-1">{spread?.verdict === "Positive" ? "إيجابي" : "سلبي"}</td>
              <td className="px-2 py-1">Shift up إيجابي على المدى الطويل</td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr">Historical Treasury Yield Spread (10Y-2Y)</td>
              <td className="border-l border-black border-dashed px-2 py-1">فرق 10 سنين عن سنتين</td>
              <td className="border-l border-black border-dashed px-2 py-1">{spread?.verdict === "Positive" ? "إيجابي" : "سلبي"}</td>
              <td className="px-2 py-1">{spread?.value}% - {spread?.value && spread.value > 0 ? "أكبر من الصفر" : "أقل من الصفر"}</td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr">US Corporate Index Option-Adjusted Spread</td>
              <td className="border-l border-black border-dashed px-2 py-1">سبريد سندات الشركات</td>
              <td className="border-l border-black border-dashed px-2 py-1">{a_oas?.verdict === "Positive" && bbb_oas?.verdict === "Positive" ? "إيجابي" : "سلبي"}</td>
              <td className="px-2 py-1">منخفض في أدنى مستوياته (A:{a_oas?.value} , BBB:{bbb_oas?.value})</td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr">Interest Rate</td>
              <td className="border-l border-black border-dashed px-2 py-1">الفائدة</td>
              <td className="border-l border-black border-dashed px-2 py-1">إيجابي</td>
              <td className="px-2 py-1">إيجابي للاقتصاد، سلبي للأسواق والأرباح الشركات (متوقع تثبيت لعام 2026)</td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td colSpan={4} className="bg-gray-100 h-2"></td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr"></td>
              <td className="border-l border-black border-dashed px-2 py-1 text-center font-bold" colSpan={2}>نظرة عن وضع السوق</td>
              <td className="px-2 py-1 text-red-600"></td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr"></td>
              <td className="border-l border-black border-dashed px-2 py-1 text-center" colSpan={2}>عوائد المؤشرات الحالية على عوائد سندات الشركات: يارديني</td>
              <td className="px-2 py-1 text-red-600">حاليا {ey_a?.value} غير مغري <span className="text-black">من 1.5</span></td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr"></td>
              <td className="border-l border-black border-dashed px-2 py-1 text-center" colSpan={2}>مكرر الأرباح التاريخي</td>
              <td className="px-2 py-1">المكرر الحالي {data.current_pe?.toFixed(2)} وهو تقريبا الـ Median لآخر 7 سنوات ({data.median_pe?.toFixed(2)})</td>
            </tr>
            <tr className="border-b border-black border-dashed">
              <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr"></td>
              <td className="border-l border-black border-dashed px-2 py-1 text-center" colSpan={2}>السوق الأمريكي</td>
              <td className="px-2 py-1 text-red-600">حاليا السعر مرتفع لأنه يحقق عائد ({data.current_ey?.toFixed(2)}%)</td>
            </tr>

            {sp500_zones.map((zone: ValuationZone) => (
              <tr key={zone.id} className="border-b border-black border-dashed">
                <td className="border-l border-black border-dashed px-2 py-1 text-left" dir="ltr"></td>
                <td className="border-l border-black border-dashed px-2 py-1"></td>
                <td className="border-l border-black border-dashed px-2 py-1"></td>
                <td className="px-2 py-1 font-bold text-center">
                  {zone.label_ar}
                  {zone.return_pct_low && zone.return_pct_high && ` - عائد من ${zone.return_pct_low}% لـ ${zone.return_pct_high}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
