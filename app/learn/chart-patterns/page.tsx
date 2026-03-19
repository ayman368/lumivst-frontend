'use client';

import { useState } from 'react';
import { ExternalLink, TrendingUp, ImageIcon } from 'lucide-react';

/* ─────────────────────────── Pattern Data ─────────────────────────── */

const chartPatterns = [
  {
    id: 1,
    name: 'Cup & Handle',
    slug: 'cup-and-handle',
    color: '#f0b90b',
    diagramImg: '/images/chart-patterns/cup_handle1.gif',
    sampleImg:  '/images/chart-patterns/cup_handle2.gif',
    bullets: null,
    note: null,
    paragraphs: [
      "The Cup & Handle is the corrective action after a powerful stock advance. Generally a stock will have a powerful move of some 2 to 4 months, then go through a market correction. The stock will sell off into the correction in a downward fashion for maybe 20 to 35 percent off the old high point. The time factor is generally anywhere from 8 to 12 weeks depending on the overall market condition.",
      "As the stock comes up to test the old highs, the stock will incur selling pressure by the people who bought at or near the old high. This selling pressure will make the stock price drift in a sideways fashion with a bias to the downside for about 4 days to 3 weeks.",
      "The handle is generally about 5% below the old high point. A handle that is any lower is generally a defective stock and contains higher risk for failure.",
      "The time to buy the stock is as it emerges into new highs at the top of the handle and not the old high point set some 8 to 12 weeks ago.",
      "I have found some of the biggest stock market winners have this very powerful formation. It is one of the best and most reliable formations to look for. However, it is important to note that the best stocks with this formation are found at the beginning of a market move after a good market correction, and not during, or at the end of a major market advance.",
    ],
    sampleLabel: 'Cup & Handle',
  },
  {
    id: 2,
    name: 'Flat Base',
    slug: 'flat-base',
    color: '#74b9ff',
    diagramImg: '/images/chart-patterns/flat_base1.gif',
    sampleImg:  '/images/chart-patterns/Flat Base2.gif',
    paragraphs: [
      "The Flat Base is a stock pattern that goes horizontal for any length of time. Very powerful advances can be had from this formation. What we look for is volume drying up as the stock stays at or about the same level going horizontally.",
      "Draw a trend line across the top of this formation. As the stock proceeds through the trend line, the stock is bought as it breaks the trend line and volume increases.",
    ],
    bullets: null,
    note: null,
    sampleLabel: 'Flat Base',
  },
  {
    id: 3,
    name: 'Ascending Triangle',
    slug: 'ascending-triangle',
    color: '#a29bfe',
    diagramImg: '/images/chart-patterns/ascending.gif',
    sampleImg:  null,
    paragraphs: [
      "The Ascending Triangle is a variation of the symmetrical triangle. Ascending triangles are generally considered bullish and are most reliable when found in an up-trend. The top part of the triangle appears flat, while the bottom part of the triangle has an upward slant. Here is a Typical Ascending Triangle Pattern",
    ],
    bullets: [
      "In ascending triangles, the stock becomes overbought and prices are turned back.",
      "Buying then re-enters the market and prices soon reach their old highs, where they are once again turned back.",
      "Buying then resurfaces, although at a higher level than before.",
      "Prices eventually break through the old highs and are propelled even higher as new buying comes in.",
    ],
    note: "As in the case of the symmetrical triangle, the breakout is generally accompanied by a marked increase in volume.",
    sampleLabel: 'Ascending Triangle',
  },
  {
    id: 4,
    name: 'Parabolic Curve',
    slug: 'parabolic-curve',
    color: '#fd79a8',
    diagramImg: '/images/chart-patterns/parabolic_curve1.gif',
    sampleImg:  '/images/chart-patterns/parabolic_curve2.gif',
    diagramPosition: 'top',
    paragraphs: [
      "The Parabolic Curve is probably one of the most highly prized and sought after pattern. This pattern can yield you the biggest and quickest return in the shortest possible time. Generally you will find a few of these patterns at or near the end of a major market advance. The pattern is the end result of multiple base formation breaks.",
    ],
    bullets: null,
    note: null,
    sampleLabel: 'Parabolic Curve',
  },
  {
    id: 5,
    name: 'Wedge Formation',
    slug: 'wedge-formation',
    color: '#55efc4',
    diagramImg: '/images/chart-patterns/falling_wedges1.gif',
    // @ts-ignore
    extraImg: '/images/chart-patterns/rising_wedges2.gif',
    sampleImg:  '/images/chart-patterns/falling_wedges3.gif',
    diagramPosition: 'wedge_custom',
    paragraphs: [
      "The Wedge Formation is also similar to a symmetrical triangle in appearance, in that they have converging trend lines that come together at an apex. However, wedges are distinguished by a noticeable slant, either to the upside or to the downside. As with triangles, volume should diminish during its formation and increase on its resolve. The Following is a Typical Wedge Formation Trend Pattern",
      "A falling wedge is generally considered bullish and is usually found in up-trends. But it can also be found in downtrends as well. The implication however is still generally bullish. This pattern is marked by a series of lower tops and lower bottoms.",
      "A rising wedge is generally considered bearish and is usually found in downtrends. They can be found in up trends too, but would still generally be regarded as bearish. Rising wedges put in a series of higher tops and higher bottoms.",
    ],
    bullets: null,
    note: null,
    sampleLabel: 'Wedge Formation',
  },
  {
    id: 6,
    name: 'Channel Formation',
    slug: 'channel-formation',
    color: '#fdcb6e',
    diagramImg: '/images/chart-patterns/channels1.gif',
    sampleImg:  '/images/chart-patterns/channels2.gif',
    diagramPosition: 'bottom',
    paragraphs: [
      "Channel Patterns should generally be considered as a continuation patterns. They are indecision areas that are usually resolved in the direction of the trend. Research has shown that this is true far more often than not, of course, the trend lines run parallel in a rectangle. Supply and demand seems evenly balanced at the moment. Buyers and sellers also seem equally matched. The same 'highs' are constantly tested, as are the same 'lows'. The stock vacillates between two clearly set parameters.",
      "While volume doesn't seem to suffer like it does in other patterns, there usually is a lessening of activity within the pattern. But like the others, volume should noticeably increase on the breakout."
    ],
    bullets: null,
    note: null,
    sampleLabel: 'Channel Formation',
  },
  {
    id: 7,
    name: 'Symmetrical Triangle',
    slug: 'symmetrical-triangle',
    color: '#81ecec',
    diagramImg: '/images/chart-patterns/symmetrical1.gif',
    sampleImg:  '/images/chart-patterns/symmetrical2.gif',
    diagramPosition: 'bottom',
    paragraphs: [
      "Symmetrical Triangles can be characterized as areas of indecision. A market pauses and future direction is questioned. Typically, the forces of supply and demand at that moment are considered nearly equal. The Following is a Typical Symmetrical Triangle Pattern"
    ],
    bullets: [
      "Attempts to push higher are quickly met by selling, while dips are seen as bargains.",
      "Each new lower top and higher bottom becomes more shallow than the last, taking on the shape of a sideways triangle. (It's interesting to note that there is a tendency for volume to diminish during this period.)",
      "Eventually, this indecision is met with resolve and usually explodes out of this formation (often on heavy volume.)"
    ],
    note: "Research has shown that symmetrical triangles overwhelmingly resolve themselves in the direction of the trend. With this in mind, symmetrical triangles (in my opinion) are great patterns to use and should be traded as continuation patterns.",
    sampleLabel: 'Symmetrical Triangle',
  },
  {
    id: 8,
    name: 'Descending Triangle',
    slug: 'descending-triangle',
    color: '#e17055',
    diagramImg: '/images/chart-patterns/descending_triangle1.gif',
    sampleImg:  '/images/chart-patterns/descending_triangle2.gif',
    diagramPosition: 'middle',
    paragraphs: [
      "The Descending Triangle, also a variation of the symmetrical triangle, is generally considered to be bearish and is usually found in downtrends.",
      "Unlike the ascending triangle, this time the bottom part of the triangle appears flat. The top part of the triangle has a downward slant. Prices drop to a point where they are oversold. Tentative buying comes in at the lows, and prices perk up. The higher price however attracts more sellers and prices re-test the old lows. Buyers then once again tentatively re-enter the market. The better prices though, once again attract even more selling. Sellers are now in control and push through the old lows of this pattern, while the previous buyer's rush to dump their positions."
    ],
    bullets: null,
    note: "Like the symmetrical triangle and the ascending triangle, volume tends to diminish during the formation of the pattern with an increase in volume on its resolve.",
    sampleLabel: 'Descending Triangle',
  },
  {
    id: 9,
    name: 'Flag & Pennant',
    slug: 'flags-and-pennants',
    color: '#6c5ce7',
    diagramImg: '/images/chart-patterns/pannants1.gif',
    // @ts-ignore
    extraImg: '/images/chart-patterns/pannants2.gif',
    sampleImg:  '/images/chart-patterns/pannants3.gif',
    diagramPosition: 'pennant_custom',
    paragraphs: [
      "Flags and Pennants can be categorized as continuation patterns. They usually represent only brief pauses in a dynamic stock. They are typically seen right after a big, quick move. The stock then usually takes off again in the same direction. Research has shown that these patterns are some of the most reliable continuation patterns. Here is a Typical Flags and Pennants Pattern",
      "Pennants look very much like symmetrical triangles. But pennants are typically smaller in size (volatility) and duration. Volume generally contracts during the pause with an increase on the breakout."
    ],
    bullets: [
      "Bullish flags are characterized by lower tops and lower bottoms, with the pattern slanting against the trend. But unlike wedges, their trend lines run parallel.",
      "Bearish flags are comprised of higher tops and higher bottoms. \"Bear\" flags also have a tendency to slope against the trend. Their trend lines run parallel as well."
    ],
    note: null,
    sampleLabel: 'FLAG AND PENNANT FORMATION',
  },
  {
    id: 10,
    name: 'Head & Shoulders',
    slug: 'head-and-shoulders',
    color: '#f1c40f', // Use an energetic bright color to match the style
    diagramImg: '/images/chart-patterns/head_shoulder1.gif',
    sampleImg:  '/images/chart-patterns/head_shoulder2.gif',
    diagramPosition: 'bottom',
    paragraphs: [
      "The Head and Shoulders Pattern is generally regarded as a reversal pattern and it is most often seen in up-trends. It is also most reliable when found in an up-trend as well. Eventually, the market begins to slow down and the forces of supply and demand are generally considered in balance. The Following is a Typical Trend of a Head and Shoulders Pattern"
    ],
    bullets: [
      "Sellers come in at the highs (left shoulder) and the downside is probed (beginning neckline).",
      "Buyers soon return to the market and ultimately push through to new highs (head).",
      "However, the new highs are quickly turned back and the downside is tested again (continuing neckline)",
      "Tentative buying re-emerges and the market rallies once more, but fails to take out the previous high. (This last top is considered the right shoulder.)",
      "Buying dries up and the market tests the downside yet again. Your trend line for this pattern should be drawn from the beginning neckline to the continuing neckline."
    ],
    note: "Volume has a great importance in the Head and Shoulders Pattern. Volume generally follows the price higher on the left shoulder. However, the head is formed on diminished volume indicating the buyers aren't as aggressive as they once were. And on the last rallying attempt-the right shoulder-volume is even lighter than on the head, signaling that the buyers may have exhausted themselves.",
    // @ts-ignore
    afterNoteParagraph: "New selling comes in and previous buyers get out. The pattern is complete when the market breaks the neckline. (Volume should increase on the breakout.)",
    sampleLabel: 'HEAD AND SHOULDER FORMATION',
  },
  {
    id: 11,
    name: 'Inverted Head & Shoulders',
    slug: 'inverted-head-and-shoulders',
    color: '#f1c40f',
    diagramImg: '/images/chart-patterns/inverted_hs1.gif',
    sampleImg:  '/images/chart-patterns/inverted_hs2.gif',
    diagramPosition: 'bottom',
    paragraphs: [
      "The Head and Shoulders Pattern can sometimes be inverted. The inverted head and shoulders is typically seen in downtrends. What's noteworthy about the inverted head and shoulders is the volume aspect. The Following is a Typical Trend of an Inverted Head and Shoulders Pattern"
    ],
    bullets: [
      "The inverted left shoulder should be accompanied by an increase in volume.",
      "The inverted head should be made on lighter volume.",
      "The rally from the head however, should show greater volume than the rally from the left shoulder.",
      "Ultimately, the inverted right shoulder should register the lightest volume of all.",
      "When the stock then rallies through the neckline, a big increase in volume should be seen."
    ],
    note: "Volume has a great importance in the Head and Shoulders Pattern. Volume generally follows the price higher on the left shoulder. However, the head is formed on diminished volume indicating the buyers aren't as aggressive as they once were. And on the last rallying attempt-the right shoulder-volume is even lighter than on the head, signaling that the buyers may have exhausted themselves.",
    // @ts-ignore
    afterNoteParagraph: "New selling comes in and previous buyers get out. The pattern is complete when the market breaks the neckline. (Volume should increase on the breakout.)",
    sampleLabel: 'INVERTED HEAD AND SHOULDERS FORMATION',
  },
];

/* ─────────────────────────── Image Placeholder ─────────────────────────── */

function ImgPlaceholder({ label, height = 220 }: { label: string; height?: number }) {
  return (
    <div style={{
      width: '100%',
      height: `${height}px`,
      background: 'rgba(20,24,32,0.6)',
      border: '2px dashed rgba(120,123,134,0.25)',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: '#4a4f5e',
    }}>
      <ImageIcon size={28} strokeWidth={1.5} />
      <span style={{ fontSize: '12px', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ─────────────────────────── Page Component ─────────────────────────── */

export default function ChartPatternsPage() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const active = activeId ? chartPatterns.find(p => p.id === activeId) : null;

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(160deg, #0d1117 0%, #131722 60%, #0d1117 100%)',
      padding: '32px 24px 60px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pat-btn { transition: all 0.18s ease; border-left: 3px solid transparent; }
        .pat-btn:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 290px',
        gap: '32px',
        alignItems: 'start',
      }}>

        {/* ══════════════ LEFT ══════════════ */}
        <div>

          {/* ── Intro header (always visible) ── */}
          {!active && (
            <div style={{ animation: 'fadeSlideIn 0.35s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '36px', height: '36px',
                  background: 'linear-gradient(135deg,#f0b90b,#f8d44a)',
                  borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(240,185,11,0.35)',
                }}>
                  <TrendingUp size={19} color="#0d1117" strokeWidth={2.5}/>
                </div>
                <p style={{ margin: 0, color: '#f0b90b', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Charting Programs
                </p>
              </div>

              <h1 style={{
                fontSize: '32px', fontWeight: 800, margin: '0 0 24px 0',
                background: 'linear-gradient(90deg,#e8eaed 0%,#f0b90b 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Understanding Chart Patterns
              </h1>

              <div style={{
                background: 'rgba(30,34,45,0.8)',
                border: '1px solid rgba(240,185,11,0.15)',
                borderRadius: '16px', padding: '28px 32px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                {[
                  "Identifying chart patterns is simply a system for predicting stock market trends and turns! Hundreds of years of price charts have shown that prices tend to move in trends. (I'm sure we've all heard the saying, 'the trend is your friend.') Well, a trend is merely an indicator of an imbalance in the supply and demand. These changes can be seen by market action through changes in price.",
                  "These price changes often form meaningful chart patterns that can act as signals in trying to determine possible future trend developments. Research has proven that some patterns have high forecasting probabilities. These patterns include: The Cup & Handle, Flat Base, Ascending and Descending Triangles, Parabolic/Symmetrical Triangles, Wedges, Flags and Pennants, Channels and the Head and Shoulders Patterns. In my opinion, these are some of the best patterns to trade.",
                  "This section is designed to introduce you to some of these chart patterns, as well as teach you to identify repetitions in the market qualities, to make timely and more accurate decisions when predicting market trends.",
                ].map((p, i) => (
                  <p key={i} style={{ color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85', margin: i < 2 ? '0 0 18px 0' : '0' }}>{p}</p>
                ))}
              </div>

              <div style={{
                marginTop: '20px', padding: '14px 20px',
                background: 'rgba(240,185,11,0.05)',
                border: '1px dashed rgba(240,185,11,0.2)',
                borderRadius: '12px', color: '#6c7080', fontSize: '14px', textAlign: 'center',
              }}>
                👈 Select a pattern from the list to learn more
              </div>
            </div>
          )}

          {/* ── Pattern Detail ── */}
          {active && (
            <div key={active.id} style={{ animation: 'fadeSlideIn 0.35s ease' }}>

              {/* Breadcrumb */}
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#4a4f5e' }}>
                <span style={{ color: '#787b86', cursor: 'pointer' }} onClick={() => setActiveId(null)}>
                  Chart Patterns
                </span>
                {' → '}
                <span style={{ color: active.color }}>{active.name}</span>
              </p>

              {/* Title */}
              <h1 style={{
                fontSize: '34px', fontWeight: 800, margin: '0 0 28px 0',
                background: `linear-gradient(90deg, #e8eaed 20%, ${active.color} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                The {active.name} Pattern
              </h1>

              {/* Pattern Layout Check */}
              {/* @ts-ignore - TS infers optional types for objects */}
              {active.diagramPosition === 'bottom' ? (
                <div style={{ marginBottom: '24px' }}>
                  {/* Paragraphs TOP */}
                  <div style={{ marginBottom: '16px' }}>
                    {active.paragraphs.map((p, i) => (
                      <p key={i} style={{
                        color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85',
                        margin: i < active.paragraphs.length - 1 ? '0 0 16px 0' : '0',
                      }}>
                        {p}
                      </p>
                    ))}
                  </div>
                  {/* Diagram BELOW */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    {active.diagramImg ? (
                      <img
                        src={active.diagramImg}
                        alt={`${active.name} diagram`}
                        style={{ maxWidth: '100%', borderRadius: '10px', display: 'inline-block' }}
                      />
                    ) : (
                      <ImgPlaceholder label={`${active.name} Diagram`} height={250} />
                    )}
                  </div>
                </div>
              ) : active.diagramPosition === 'top' ? (
                <div style={{ marginBottom: '24px' }}>
                  {/* Diagram TOP */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    {active.diagramImg ? (
                      <img
                        src={active.diagramImg}
                        alt={`${active.name} diagram`}
                        style={{ maxWidth: '100%', borderRadius: '10px', display: 'inline-block' }}
                      />
                    ) : (
                      <ImgPlaceholder label={`${active.name} Diagram`} height={250} />
                    )}
                  </div>
                  {/* Paragraphs BELOW */}
                  <div>
                    {active.paragraphs.map((p, i) => (
                      <p key={i} style={{
                        color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85',
                        margin: i < active.paragraphs.length - 1 ? '0 0 16px 0' : '0',
                      }}>
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ) : active.diagramPosition === 'middle' ? (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85', margin: '0 0 16px 0' }}>{active.paragraphs[0]}</p>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    {active.diagramImg && (
                      <img src={active.diagramImg} alt={`${active.name} diagram`} style={{ maxWidth: '100%', borderRadius: '10px', display: 'inline-block' }} />
                    )}
                  </div>
                  {active.paragraphs.slice(1).map((p, i) => (
                    <p key={i} style={{
                      color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85',
                      margin: i < active.paragraphs.length - 2 ? '0 0 16px 0' : '0',
                    }}>
                      {p}
                    </p>
                  ))}
                </div>
              ) : active.diagramPosition === 'pennant_custom' ? (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85', margin: '0 0 16px 0' }}>{active.paragraphs[0]}</p>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    {active.diagramImg && (
                      <img src={active.diagramImg} alt="Pennants" style={{ maxWidth: '100%', borderRadius: '10px', display: 'inline-block' }} />
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, auto) 1fr', gap: '32px', alignItems: 'start', marginBottom: '24px' }}>
                    <div>
                      {/* @ts-ignore */}
                      {active.extraImg && (
                        // @ts-ignore
                        <img src={active.extraImg} alt="Flags" style={{ maxWidth: '100%', borderRadius: '10px', display: 'block' }} />
                      )}
                    </div>
                    <div>
                      {active.bullets && (
                        <ol style={{ margin: '0', paddingLeft: '22px', listStyleType: 'decimal' }}>
                          {active.bullets.map((b: string, i: number) => (
                            <li key={i} style={{ color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85', marginBottom: i < active.bullets!.length - 1 ? '16px' : '0' }}>
                              {b}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                  <p style={{ color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85', margin: '0' }}>{active.paragraphs[1]}</p>
                </div>
              ) : active.diagramPosition === 'wedge_custom' ? (
                <div style={{ marginBottom: '24px' }}>
                  {/* Specific interleaved layout for Wedge Formation */}
                  <p style={{ color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85', margin: '0 0 16px 0' }}>
                    {active.paragraphs[0]}
                  </p>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    {active.diagramImg && (
                      <img src={active.diagramImg} alt="Falling Wedge" style={{ maxWidth: '100%', borderRadius: '10px', display: 'inline-block' }} />
                    )}
                  </div>
                  <p style={{ color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85', margin: '0 0 16px 0' }}>
                    {active.paragraphs[1]}
                  </p>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    {/* @ts-ignore */}
                    {active.extraImg && (
                      // @ts-ignore
                      <img src={active.extraImg} alt="Rising Wedge" style={{ maxWidth: '100%', borderRadius: '10px', display: 'inline-block' }} />
                    )}
                  </div>
                  <p style={{ color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85', margin: '0' }}>
                    {active.paragraphs[2]}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '24px', marginBottom: '24px', alignItems: 'start' }}>
                  <div>
                    {active.paragraphs.map((p, i) => (
                      <p key={i} style={{
                        color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85',
                        margin: i < active.paragraphs.length - 1 ? '0 0 16px 0' : '0',
                      }}>
                        {p}
                      </p>
                    ))}
                  </div>
                  {/* Diagram image — real or placeholder */}
                  <div>
                    {active.diagramImg ? (
                      <img
                        src={active.diagramImg}
                        alt={`${active.name} diagram`}
                        style={{ width: '100%', borderRadius: '10px', display: 'block' }}
                      />
                    ) : (
                      <ImgPlaceholder label={`${active.name} Diagram`} height={180} />
                    )}
                  </div>
                </div>
              )}

              {/* Numbered bullet list — full width below */}
              {/* @ts-ignore */}
              {active.bullets && active.diagramPosition !== 'pennant_custom' && (
                <ol style={{ margin: '0 0 20px 0', paddingLeft: '22px', listStyleType: 'decimal' }}>
                  {active.bullets.map((b: string, i: number) => (
                    <li key={i} style={{
                      color: i === active.bullets!.length - 1 ? '#4caf50' : '#b0b3bc',
                      fontSize: '15px', lineHeight: '1.8',
                      marginBottom: i < active.bullets!.length - 1 ? '10px' : '0',
                      fontWeight: i === active.bullets!.length - 1 ? 600 : 400,
                      paddingLeft: '4px',
                    }}>
                      {b}
                    </li>
                  ))}
                </ol>
              )}

              {/* Note box — full width */}
              {active.note && (
                <div style={{
                  padding: '14px 18px',
                  background: 'rgba(162,155,254,0.08)',
                  border: '1px solid rgba(162,155,254,0.25)',
                  borderRadius: '10px',
                  color: '#9ba0ab',
                  fontSize: '13.5px',
                  lineHeight: '1.7',
                  fontStyle: 'italic',
                  marginBottom: '24px',
                }}>
                  {active.note}
                </div>
              )}

              {/* After-note paragraph — full width */}
              {/* @ts-ignore */}
              {active.afterNoteParagraph && (
                <p style={{
                  color: '#b0b3bc', fontSize: '15px', lineHeight: '1.85', margin: '0 0 24px 0',
                }}>
                  {/* @ts-ignore */}
                  {active.afterNoteParagraph}
                </p>
              )}

              {/* Sample chart section — only shown when a real image exists */}
              {active.sampleImg && (
                <div style={{
                  borderTop: `1px solid ${active.color}25`,
                  paddingTop: '28px',
                }}>
                  <p style={{
                    fontSize: '14px', fontWeight: 700, letterSpacing: '1px',
                    color: '#d1d4dc', textTransform: 'uppercase', textAlign: 'center',
                    margin: '0 0 20px 0',
                  }}>
                    HERE IS A SAMPLE CHART WITH A {active.sampleLabel?.toUpperCase() || `${active.name.toUpperCase()} PATTERN`}
                  </p>
                  <img
                    src={active.sampleImg}
                    alt={`${active.name} sample chart`}
                    style={{ width: '100%', borderRadius: '10px', display: 'block' }}
                  />
                </div>
              )}


              {/* External link */}
              <div style={{ marginTop: '28px', textAlign: 'center' }}>
                <a
                  href="https://www.chartpattern.com/chart-patterns.cfm"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '11px 22px',
                    background: `${active.color}18`,
                    border: `1px solid ${active.color}45`,
                    borderRadius: '10px',
                    color: active.color,
                    textDecoration: 'none',
                    fontSize: '13px', fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${active.color}28`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = `${active.color}18`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <ExternalLink size={14}/> View more on chartpattern.com
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════ RIGHT — Pattern List ══════════════ */}
        <div style={{
          background: 'rgba(28,32,42,0.9)',
          border: '1px solid rgba(240,185,11,0.2)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          position: 'sticky',
          top: '80px',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg,rgba(240,185,11,0.14),rgba(240,185,11,0.04))',
            borderBottom: '1px solid rgba(240,185,11,0.18)',
          }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f0b90b', lineHeight: 1.3 }}>
              11 Most Common Stock
            </p>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#787b86' }}>
              Chart Patterns
            </p>
          </div>

          {/* Items */}
          <div style={{ padding: '8px 0' }}>
            {chartPatterns.map((p) => {
              const isActive = activeId === p.id;
              return (
                <button
                  key={p.id}
                  className="pat-btn"
                  onClick={() => setActiveId(isActive ? null : p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '11px',
                    width: '100%', padding: '10px 16px',
                    background: isActive ? `${p.color}12` : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? `3px solid ${p.color}` : '3px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    background: isActive
                      ? `linear-gradient(135deg,${p.color},${p.color}bb)`
                      : 'rgba(120,123,134,0.13)',
                    color: isActive ? '#0d1117' : '#6c7080',
                    fontSize: '11px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s ease',
                  }}>
                    {p.id}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? p.color : '#8a8f9e',
                    transition: 'color 0.18s ease',
                    lineHeight: 1.35,
                  }}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <a
              href="https://www.chartpattern.com/chart-patterns.cfm"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '9px',
                background: 'rgba(240,185,11,0.08)',
                border: '1px solid rgba(240,185,11,0.2)',
                borderRadius: '8px',
                color: '#f0b90b', textDecoration: 'none',
                fontSize: '12px', fontWeight: 600, transition: 'background 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,185,11,0.16)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,185,11,0.08)'; }}
            >
              <ExternalLink size={13}/> chartpattern.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
