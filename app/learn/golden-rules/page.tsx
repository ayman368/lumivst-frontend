'use client';

import { motion } from 'framer-motion';

export default function GoldenRulesPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8DC', color: '#2C2416', fontFamily: 'system-ui, sans-serif', paddingBottom: '96px' }}>

      {/* Hero Header */}
      <div style={{ padding: '40px 32px 32px', borderBottom: '1px solid #D9D2C3', backgroundColor: '#1C3D2E', boxShadow: '0 2px 8px rgba(28,61,46,0.2)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ padding: '3px 12px', borderRadius: '999px', backgroundColor: 'rgba(212,237,218,0.15)', color: '#A8D5B5', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid rgba(168,213,181,0.3)' }}>
                Trading Strategy • Core Rules
              </span>
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.02em', color: '#F5F0E8', marginBottom: '8px' }}>
              Dan&apos;s <span style={{ color: '#A8D5B5' }}>10 Golden Rules</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(212,237,218,0.7)', maxWidth: '480px', lineHeight: 1.6 }}>
              Essential rules for disciplined trading. Act promptly and without hesitation when executing these principles.
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Notice Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#FDFAF5',
            border: '1px solid #D9D2C3',
            borderRadius: '20px',
            padding: '28px 32px',
            marginBottom: '40px',
            boxShadow: '0 2px 12px rgba(44,36,22,0.08)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ height: '4px', backgroundColor: '#1C3D2E', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#5C4A2A', marginBottom: '12px' }}>
            <span style={{ fontWeight: 700, color: '#2C2416' }}>Notice:</span> This site and its methodology work best for those people that can act promptly and without hesitation executing the golden rules and general notes listed below. It is also for those that are preferably on real-time quotes. Many stocks are listed in the nightly newsletter and only those that move quickly, on heavy volume, through the trend lines and buy points, should be considered.
          </p>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#5C4A2A', margin: 0 }}>
            In addition to these 10 rules, please see notes below: And if you are new to trading or investing please see the paragraphs with the * at the bottom.
          </p>
        </motion.div>

        {/* Rules List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: '#FDFAF5',
            border: '1px solid #D9D2C3',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(44,36,22,0.08)',
            marginBottom: '48px',
          }}
        >
          <div style={{ height: '4px', backgroundColor: '#2962FF' }} />
          <div style={{ padding: '32px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A09880', marginBottom: '24px' }}>
              Fixed Golden Rules (10)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                "Make sure the stock has a well formed base or pattern such as one described on this web site and can be found on the tab \"Understanding Chart Patterns\" on the home page, before considering purchase. Dan highlights stocks with these patterns in his newsletter.",
                "Buy the stock as it moves over the trend line of that base or pattern and make sure that volume is above recent trend shortly after this \"breakout\" occurs. Never pay up by more than 5% above the trend line. You should also get to know your stock's thirty day moving average volume, which you can find on most stock quote pages such as eSignal's quote page.",
                "Be very quick to sell your stock should it return back under the TBA or breakout point by $3 to $5. The more expensive the stock, the more leeway you can give it. Some people employ a 5%-7% stop loss rule. This may mean selling a stock that just tried to breakout and fails in 20 minutes or 3 hours from the time it just broke out above your purchase price.",
                "Sell 20 to 30% of your position as the stock moves up 15 to 20% from its breakout point.",
                "Hold your strongest stocks the longest and sell stocks that stop moving up or are acting sluggish quickly. Remember stocks are only good when they are moving up.",
                "Identify and follow strong groups of stocks and try to keep your selections in these groups.",
                "After the market has moved for a substantial period of time, your stocks will become vulnerable to a sell off, which can happen so fast and hard you won't believe it. Learn to set new higher trend lines and learn reversal patterns to help your exit of stocks. Some of you may benefit from reading a book on Candlesticks or reading Encyclopedia of Chart Patterns, by Bulkowski.",
                "Remember it takes volume to move stocks, so start getting to know your stock's volume behavior and then how it reacts to spikes in volume. You can see these spikes on any chart. Volume is the key to your stock's movement and success or failure.",
                "Many stocks are mentioned in the newsletter with buy points. However just because it's mentioned with a buy point does not mean it's an outright buy when a buy point is touched. One must first see the action in the stock and combine it with its volume for the day at the time that buy point is hit and take keen notice of the overall market environment before considering purchases.",
                "Never go on margin until you have mastered the market, charts and your emotions. Margin can wipe you out.",
              ].map((rule, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                    backgroundColor: '#2962FF18', border: '1px solid #2962FF30',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 900, color: '#2962FF',
                  }}>
                    {idx + 1}
                  </div>
                  <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#5C4A2A', margin: 0, paddingTop: '4px' }}>
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#D9D2C3', marginBottom: '48px' }} />

        {/* Trading Tips */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ padding: '3px 12px', borderRadius: '999px', backgroundColor: '#1C3D2E', color: '#A8D5B5', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid rgba(168,213,181,0.3)' }}>
            Additional Guidance
          </span>
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', color: '#2C2416', marginBottom: '32px' }}>
          Dan&apos;s <span style={{ color: '#1C3D2E' }}>Trading Tips</span>
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            backgroundColor: '#FDFAF5',
            border: '1px solid #D9D2C3',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(44,36,22,0.08)',
          }}
        >
          <div style={{ height: '4px', backgroundColor: '#1C3D2E' }} />
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ padding: '14px 18px', borderRadius: '10px', backgroundColor: '#FFF8E6', border: '1px solid #E8D5A0', borderLeft: '4px solid #C8A020' }}>
              <p style={{ fontSize: '13px', color: '#7A6020', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                Note: If you are new to trading or investing, I suggest reading these rules many times over until they become ingrained so you can act without emotions.
              </p>
            </div>

            {[
              "Stocks that breakout and move up with tremendous volume and close near the highs of the day seem to work out best. However many stocks that move up 15% or more on breakout day often fail. You'll just have to watch your stock's action like a hawk and get to see and understand these things over a long period of time. If trading were easy everyone would be making millions. It's not; it takes years and years of hard work and long hours.",
              "Many traders employ a 30-minute rule, meaning that for the first half hour of the day many traders do not buy any stock that gaps up in price. If the price holds after the first half hour then often many traders will step in a buy the stock. I find this rule works good after the market has moved up for few strong weeks and is not very effective at the start of a new strong move.",
              "If its earnings season, then it's an absolute must that you know the date your company reports its earnings. Many traders prefer to be out of a stock 100% the day before a company reports earnings in case the company misses earnings or guides lower in which case the stock could plunge. Others reduce positions substantially the day before earnings are released to lower risk as a massive gap lower could be very destructive to your portfolio. The choice is up to you. If you have a nice 50% gain or more, you might consider reducing 50% or so of your position and holding the rest over earnings and you could hedge that position with some puts.",
              "*The market moves in waves that can last anywhere from weeks to months. Then a correction or setback starts, which can last anywhere from 5 to 8 weeks or even as long at 4 to 6 months. If you are starting a free trial and are a novice you may be lucky to join just as the market gets underway, in which case you will see the full power of charting.",
              "The power of charts is through waiting for the correction to end whereby the chart patterns will then be fully developed. After weeks of base or pattern building, stocks will begin to lift off and that's when the big rewards come in. The question is, are you willing to wait and be here for the start of the next big move? The biggest mistake a novice can make is to come back after a move has started.",
              "*Please read a few times my interviews in Stocks and Commodities and Traders' Magazine at the top of the home page of this web site. There are many tips and how-to's that will greatly improve your ability to understand how this works.",
            ].map((tip, idx) => (
              <p key={idx} style={{ fontSize: '15px', lineHeight: 1.75, color: '#5C4A2A', margin: 0 }}>
                {tip}
              </p>
            ))}

            <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#F5F0E8', border: '1px solid #E8E2D5' }}>
              <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#2C2416', margin: 0 }}>
                I give setups of stocks that are ready to potentially move. That's my job. Your job is to get to know the stock and its movement along with the general market each day. You are the only one that can do this in realtime during market hours. Then if a stock acts well (i.e. volume is very heavy and the stock is moving easily out of the base) then that is the one to buy. I do not buy most stocks that breakout as most do not meet my heavy volume/price action behavior during the day. Also, I buy only the most expensive stocks as the percent loss is least if the stock pattern fails. High priced stocks are the best quality stocks as a general rule in playing the market. Remember to buy as close to the trendline as possible and the volume should come in at least 10 to 20 minutes after you buy (or even earlier) and if not by then, you know no one wants the stock and might as well check out early.
              </p>
            </div>

            <div style={{ paddingTop: '8px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic', letterSpacing: '0.15em', color: '#A09880', textTransform: 'uppercase', fontSize: '11px' }}>
              Thanks, Dan
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}