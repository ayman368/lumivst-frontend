'use client';

import { motion } from 'framer-motion';

export default function GoldenRulesPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] pb-24 font-inter selection:bg-yellow-500/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12">
        
        {/* Notice Box - Modernized but simple */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a2e25] border border-emerald-500/20 rounded-xl p-8 mb-12 text-[15px] leading-relaxed text-emerald-100/80 shadow-inner"
        >
          <p className="mb-4">
            <span className="font-bold text-white">Notice:</span> This site and its methodology work best for those people that can act promptly and without hesitation executing the golden rules and general notes listed below. It is also for those that are preferably on real-time quotes. Many stocks are listed in the nightly newsletter and only those that move quickly, on heavy volume, through the trend lines and buy points, should be considered.
          </p>
          <p>
            In addition to these 10 rules, please see notes below: And if you are new to trading or investing please see the paragraphs with the * at the bottom.
          </p>
        </motion.div>

        {/* Title 1 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 font-outfit">
            Dan&apos;s 10 Golden Rules
          </h1>
          <div className="h-1 w-24 bg-yellow-500 mx-auto rounded-full" />
        </div>

        {/* Rules List - Clean vertical flow */}
        <div className="space-y-6 mb-20 text-[16px] md:text-[17px] leading-relaxed text-slate-300 font-medium">
          <p>1. Make sure the stock has a well formed base or pattern such as one described on this web site and can be found on the tab &quot;Understanding Chart Patterns&quot; on the home page, before considering purchase. Dan highlights stocks with these patterns in his newsletter.</p>
          
          <p>2. Buy the stock as it moves over the trend line of that base or pattern and make sure that volume is above recent trend shortly after this &quot;breakout&quot; occurs. Never pay up by more than 5% above the trend line. You should also get to know your stock&apos;s thirty day moving average volume, which you can find on most stock quote pages such as eSignal&apos;s quote page.</p>
          
          <p>3. Be very quick to sell your stock should it return back under the TBA or breakout point by $3 to $5. The more expensive the stock, the more leeway you can give it. Some people employ a 5%-7% stop loss rule. This may mean selling a stock that just tried to breakout and fails in 20 minutes or 3 hours from the time it just broke out above your purchase price.</p>
          
          <p>4. Sell 20 to 30% of your position as the stock moves up 15 to 20% from its breakout point.</p>
          
          <p>5. Hold your strongest stocks the longest and sell stocks that stop moving up or are acting sluggish quickly. Remember stocks are only good when they are moving up.</p>
          
          <p>6. Identify and follow strong groups of stocks and try to keep your selections in these groups.</p>
          
          <p>7. After the market has moved for a substantial period of time, your stocks will become vulnerable to a sell off, which can happen so fast and hard you won&apos;t believe it. Learn to set new higher trend lines and learn reversal patterns to help your exit of stocks. Some of you may benefit from reading a book on Candlesticks or reading Encyclopedia of Chart Patterns, by Bulkowski.</p>
          
          <p>8. Remember it takes volume to move stocks, so start getting to know your stock&apos;s volume behavior and then how it reacts to spikes in volume. You can see these spikes on any chart. Volume is the key to your stock&apos;s movement and success or failure.</p>
          
          <p>9. Many stocks are mentioned in the newsletter with buy points. However just because it&apos;s mentioned with a buy point does not mean it&apos;s an outright buy when a buy point is touched. One must first see the action in the stock and combine it with its volume for the day at the time that buy point is hit and take keen notice of the overall market environment before considering purchases.</p>
          
          <p>10. Never go on margin until you have mastered the market, charts and your emotions. Margin can wipe you out.</p>
        </div>

        {/* Section Break */}
        <div className="h-px bg-white/[0.05] w-full mb-16" />

        {/* Title 2 */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 font-outfit">
            Dan&apos;s Trading Tips
          </h2>
          <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full" />
        </div>

        {/* Trading Tips Body - Clean flow */}
        <div className="space-y-8 text-[16px] md:text-[17px] leading-relaxed text-slate-400 font-medium">
          <p className="text-yellow-500/80 italic text-sm border-l-2 border-yellow-500/30 pl-4">
            Note: If you are new to trading or investing, I suggest reading these rules many times over until they become ingrained so you can act without emotions.
          </p>

          <p>
            Stocks that breakout and move up with tremendous volume and close near the highs of the day seem to work out best. However many stocks that move up 15% or more on breakout day often fail. You&apos;ll just have to watch your stock&apos;s action like a hawk and get to see and understand these things over a long period of time. If trading were easy everyone would be making millions. It&apos;s not; it takes years and years of hard work and long hours.
          </p>

          <p>
            Many traders employ a 30-minute rule, meaning that for the first half hour of the day many traders do not buy any stock that gaps up in price. If the price holds after the first half hour then often many traders will step in a buy the stock. I find this rule works good after the market has moved up for few strong weeks and is not very effective at the start of a new strong move.
          </p>

          <p>
            If its earnings season, then it&apos;s an absolute must that you know the date your company reports its earnings. Many traders prefer to be out of a stock 100% <strong>the day before a company reports earnings</strong> in case the company misses earnings or guides lower in which case the stock could plunge. Others reduce positions substantially <strong>the day before earnings</strong> are released to lower risk as a massive gap lower could be very destructive to your portfolio. The choice is up to you. If you have a nice 50% gain or more, you might consider reducing 50% or so of your position and holding the rest over earnings and you could hedge that position with some puts. You can see an earnings calendar on this web site. Please verify this information by calling the company or visiting the company&apos;s website which you should be able to find in any search engine.
          </p>

          <p>
            *The market moves in waves that can last anywhere from weeks to months. Then a correction or setback starts, which can last anywhere from 5 to 8 weeks or even as long at 4 to 6 months. If you are starting a free trial and are a novice you may be lucky to join just as the market gets underway, in which case you will see the full power of charting. If however you start after the move has been going for sometime then things won&apos;t look as good as traders are paring down positions. Or even worse the market could be selling down hard and working off the prior up move in which case you will be completely discouraged.
          </p>

          <p>
            The power of charts is through waiting for the correction to end whereby the chart patterns will then be fully developed. After weeks of base or pattern building, stocks will begin to lift off and that&apos;s when the big rewards come in. The question is, are you willing to wait and be here for the start of the next big move? The biggest mistake a novice can make is to come back after a move has started.
          </p>

          <p>
            *Please read a few times my interviews in Stocks and Commodities and Traders&apos; Magazine at the top of the home page of this web site. There are many tips and how - to&apos;s that will greatly improve your ability to understand how this works. More good comments can be found in the FAQ section of this web site in the member login area.
          </p>

          <p className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-2xl text-slate-300">
            I give setups of stocks that are ready to potentially move. That&apos;s my job. Your job is to get to know the stock and its movement along with the general market each day. You are the only one that can do this in realtime during market hours. Then if a stock acts well (i.e. volume is very heavy and the stock is moving easily out of the base) then that is the one to buy. I do not buy most stocks that breakout as most do not meet my heavy volume/price action behavior during the day. Also, I buy only the most expensive stocks as the percent loss is least if the stock pattern fails. High priced stocks are the best quality stocks as a general rule in playing the market. Remember to buy as close to the trendline as possible and the volume should come in at least 10 to 20 minutes after you buy (or even earlier) and if not by then, you know no one wants the stock and might as well check out early.
          </p>

          <div className="pt-10 text-right font-black italic tracking-widest text-slate-500 uppercase text-xs">
            Thanks, Dan
          </div>
        </div>
      </div>
    </div>
  );
}
