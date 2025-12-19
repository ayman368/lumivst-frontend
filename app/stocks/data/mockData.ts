export const MOCK_STOCK_DATA = {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 184.39,
    change: -1.16,
    changePercent: -0.63,
    followers: "907.77K",
    marketTime: "2:44 PM 12/09/25",
    exchange: "NASDAQ",
    currency: "USD",

    ratings: {
        saAnalysts: { score: 3.74, label: "BUY" },
        wallStreet: { score: 4.67, label: "STRONG BUY" },
        quant: { score: 3.49, label: "HOLD" }
    },

    financials: {
        incomeStatement: {
            years: ["TTM", "Jan 2025", "Jan 2024", "Jan 2023", "Jan 2022", "Jan 2021", "Jan 2020", "Jan 2019", "Jan 2018", "Jan 2017", "Jan 2016"],
            rows: [
                { label: "Revenues", values: ["187,142.0", "130,497.0", "60,922.0", "26,974.0", "26,914.0", "16,675.0", "10,918.0", "11,716.0", "9,714.0", "6,910.0", "5,010.0"], isHeader: true, hasSparkline: true },
                { label: "Other Revenues", values: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], isHeader: false },
                { label: "Total Revenues", values: ["187,142.0", "130,497.0", "60,922.0", "26,974.0", "26,914.0", "16,675.0", "10,918.0", "11,716.0", "9,714.0", "6,910.0", "5,010.0"], isHeader: true, hasSparkline: true },
                { label: "Operating Expenses & Income", values: [], isSectionHeader: true },
                { label: "Selling General & Admin Expenses", values: ["4,272.0", "3,491.0", "2,654.0", "2,440.0", "2,166.0", "1,912.0", "1,093.0", "991.0", "815.0", "663.0", "602.0"], isHeader: false, hasSparkline: true },
                { label: "R&D Expenses", values: ["16,699.0", "12,914.0", "8,675.0", "7,339.0", "5,268.0", "3,924.0", "2,829.0", "2,376.0", "1,797.0", "1,463.0", "1,331.0"], isHeader: false, hasSparkline: true },
                { label: "Total Operating Expenses", values: ["20,971.0", "16,405.0", "11,329.0", "9,779.0", "7,434.0", "5,836.0", "3,922.0", "3,367.0", "2,612.0", "2,126.0", "1,933.0"], isHeader: false, hasSparkline: true },
                { label: "Operating Income", values: ["110,122.0", "81,453.0", "32,972.0", "5,577.0", "10,041.0", "4,721.0", "2,846.0", "3,804.0", "3,210.0", "1,937.0", "878.0"], isHeader: true, hasSparkline: true },
                { label: "Earnings from Continuing Operations", values: [], isSectionHeader: true },
                { label: "Interest Expense", values: ["(247.0)", "(247.0)", "(257.0)", "(262.0)", "(236.0)", "(184.0)", "(52.0)", "(58.0)", "(61.0)", "(58.0)", "(47.0)"], isHeader: false, hasSparkline: true },
                { label: "Net Interest Expenses", values: ["1,996.0", "1,539.0", "609.0", "5.0", "(207.0)", "(127.0)", "126.0", "78.0", "8.0", "(4.0)", "(8.0)"], isHeader: true, hasSparkline: true },
                { label: "Net Income", values: ["103,212.0", "75,417.0", "31,343.0", "5,045.0", "9,878.0", "3,536.0", "4,988.0", "3,212.0", "2,342.0", "1,030.0", "380.0"], isHeader: true, hasSparkline: true }
            ]
        },
        balanceSheet: {
            years: ["Last Report", "Jan 2025", "Jan 2024", "Jan 2023", "Jan 2022", "Jan 2021", "Jan 2020", "Jan 2019", "Jan 2018", "Jan 2017", "Jan 2016"],
            rows: [
                { label: "Cash & Short Term Investments", values: [], isSectionHeader: true },
                { label: "Cash And Equivalents", values: ["11,486.0", "8,589.0", "7,280.0", "3,389.0", "1,990.0", "847.0", "10,896.0", "782.0", "4,002.0", "1,766.0", "596.0"], isHeader: false, hasSparkline: true },
                { label: "Short Term Investments", values: ["49,122.0", "34,621.0", "18,704.0", "9,907.0", "19,218.0", "10,714.0", "1.0", "6,640.0", "3,106.0", "5,032.0", "4,441.0"], isHeader: false, hasSparkline: true },
                { label: "Total Cash & ST Investments", values: ["60,608.0", "43,210.0", "25,984.0", "13,296.0", "21,208.0", "11,561.0", "10,897.0", "7,422.0", "7,108.0", "6,798.0", "5,037.0"], isHeader: true, hasSparkline: true },
                { label: "Receivables", values: [], isSectionHeader: true },
                { label: "Accounts Receivable", values: ["33,391.0", "23,065.0", "9,999.0", "3,827.0", "4,650.0", "2,429.0", "1,657.0", "1,424.0", "1,265.0", "826.0", "505.0"], isHeader: false, hasSparkline: true },
                { label: "Total Receivables", values: ["33,391.0", "23,065.0", "9,999.0", "3,827.0", "4,650.0", "2,429.0", "1,657.0", "1,424.0", "1,265.0", "826.0", "505.0"], isHeader: true, hasSparkline: true },

            ]
        },
        cashFlow: {
            years: ["TTM", "Jan 2025", "Jan 2024", "Jan 2023", "Jan 2022", "Jan 2021", "Jan 2020", "Jan 2019", "Jan 2018", "Jan 2017", "Jan 2016"],
            rows: [
                { label: "Net Income", values: [], isSectionHeader: true },
                { label: "Net Income", values: ["99,198.0", "72,880.0", "29,760.0", "4,368.0", "9,752.0", "4,332.0", "2,796.0", "4,141.0", "3,047.0", "1,666.0", "614.0"], isHeader: false, hasSparkline: true },
                { label: "Cash Flow From Operating Activities", values: [], isSectionHeader: true },
                { label: "Depreciation & Amortization", values: ["2,081.0", "1,271.0", "894.0", "845.0", "611.0", "486.0", "356.0", "233.0", "144.0", "119.0", "124.0"], isHeader: false, hasSparkline: true },
                { label: "Amort. of Goodwill and Intangibles", values: ["493.0", "593.0", "614.0", "699.0", "563.0", "612.0", "25.0", "29.0", "55.0", "68.0", "73.0"], isHeader: false, hasSparkline: true },
                { label: "Depreciation & Amortization, Total", values: ["2,574.0", "1,864.0", "1,508.0", "1,544.0", "1,174.0", "1,098.0", "381.0", "262.0", "199.0", "187.0", "197.0"], isHeader: true, hasSparkline: true },
                { label: "(Gain) Loss From Sale Of Asset", values: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "(6.0)"], isHeader: false },
                { label: "(Gain) Loss on Sale of Business", values: ["(4,154.0)", "(1,030.0)", "(238.0)", "45.0", "(100.0)", "-", "1.0", "-", "-", "-", "-"], isHeader: false, hasSparkline: true }
            ]
        },
    },

    factorGrades: {
        valuation: "F",
        growth: "A",
        profitability: "A+",
        momentum: "B+",
        revisions: "B"
    },

    quantRanking: {
        sector: "Information Technology",
        industry: "Semiconductors",
        overall: "747 out of 4327",
        sectorRank: "93 out of 539",
        industryRank: "16 out of 67"
    },

    dividendGrades: {
        safety: "A+",
        growth: "A+",
        yield: "F",
        consistency: "C-"
    },

    seasonality: {
        months: [
            { name: "Jan", median: 4.7, mean: 6.3, winRate: 54.5 },
            { name: "Feb", median: 8.3, mean: 8.7, winRate: 72.7 },
            { name: "Mar", median: 5.0, mean: 6.9, winRate: 54.5 },
            { name: "Apr", median: -1.2, mean: -1.4, winRate: 45.5 },
            { name: "May", median: 15.8, mean: 15.0, winRate: 81.8 },
            { name: "Jun", median: 5.4, mean: 4.3, winRate: 72.7 },
            { name: "Jul", median: 7.8, mean: 7.3, winRate: 72.7 },
            { name: "Aug", median: 6.2, mean: 7.0, winRate: 72.7 },
            { name: "Sep", median: 0.2, mean: -0.5, winRate: 72.7 },
            { name: "Oct", median: 5.8, mean: 5.5, winRate: 72.7 },
            { name: "Nov", median: 6.2, mean: 10.3, winRate: 72.7 },
            { name: "Dec", median: -1.7, mean: -1.7, winRate: 40.0 }
        ],
        years: [
            { year: "2025", values: [-10.6, 4.0, -13.2, 0.5, 24.1, 16.9, 12.6, -2.1, 7.1, 8.5, -12.6, null] },
            { year: "2024", values: [24.2, 28.6, 14.2, -4.4, 26.9, 12.7, -5.3, 2.0, 1.7, 9.3, 4.1, -2.9] },
            { year: "2023", values: [33.7, 18.8, 19.6, -0.1, 36.3, 11.8, 10.5, 5.6, -11.9, -6.3, 14.7, 5.9] }
        ]
    },

    revenue: [
        { year: "Jan 2021", value: 16.68, estimate: null },
        { year: "Jan 2022", value: 26.91, estimate: null },
        { year: "Jan 2023", value: 26.97, estimate: null },
        { year: "Jan 2024", value: 60.92, estimate: null },
        { year: "Jan 2025", value: 96.31, estimate: null },
        { year: "Jan 2026 (E)", value: 0, estimate: 130 }, // Using estimate field for dashed/different color
        { year: "Jan 2027 (E)", value: 0, estimate: 160 }
    ],

    ratingVsWallStreet: {
        saAnalysts: {
            rating: "BUY",
            score: 3.74,
            breakdown: {
                strongBuy: 14,
                buy: 21,
                hold: 14,
                sell: 4,
                strongSell: 2
            }
        },
        wallStreet: {
            rating: "STRONG BUY",
            score: 4.67,
            breakdown: {
                strongBuy: 49,
                buy: 11,
                hold: 3,
                sell: 0,
                strongSell: 1
            }
        }
    },

    companyProfile: {
        description: "NVIDIA Corporation, a computing infrastructure company, provides graphics and compute and networking solutions in the United States, Singapore, Taiwan, China, Hong Kong, and internationally. The Compute & Networking segment includes its Data Centre accelerated computing platforms and artificial intelligence solutions and software; networking; automotive platforms and autonomous and electric vehicle solutions; Jetson for robotics and other embedded platforms; and DGX Cloud computing services. The Graphics segment offers GeForce GPUs for gaming and PCs, the GeForce NOW game streaming service and related infrastructure, and solutions for gaming...",
        sector: "Information Technology",
        industry: "Semiconductors",
        employees: "36,000",
        founded: "1993",
        address: "2788 San Tomas Expressway Santa Clara, CA, 95051 United States",
        phone: "408 486 2000",
        website: "www.nvidia.com"
    },

    analysis: [
        {
            id: 1,
            title: "Nvidia: I'm Going All In Again",
            author: "Bohdan Kucheriavyi",
            rating: "BUY",
            date: "Today, 12:00 PM",
            comments: 4
        },
        {
            id: 2,
            title: "Nvidia Stock And The AI Monetization Supercycle No One Is Pricing In",
            author: "Beth Kindig",
            rating: "BUY",
            date: "Today, 9:22 AM",
            comments: 11
        },
        {
            id: 3,
            title: "Wall Street Breakfast Podcast: China Gets Nvidia H200s, Uncle Sam Gets A Cut",
            author: "Wall Street Breakfast",
            date: "Today, 9:16 AM",
            comments: 5
        },
        {
            id: 4,
            title: "Nvidia's AI Empire Just Expanded",
            author: "Pythia Research",
            rating: "STRONG BUY",
            date: "Today, 9:05 AM",
            comments: 2
        },
        {
            id: 5,
            title: "Nvidia: The TPU Risks Look Heavily Overblown",
            author: "Nova Capital",
            rating: "BUY",
            date: "Fri, Dec. 06",
            comments: 19
        },
        {
            id: 6,
            title: "Wall Street Breakfast Podcast: The Nvidia Of China Soars On Debut",
            author: "Wall Street Breakfast",
            date: "Fri, Dec. 06",
            comments: 4
        }
    ],

    news: [
        {
            id: 1,
            title: "Tech Voices: Nvidia China chip sales, Gates on AI bubble, Google AI",
            source: "SA News",
            date: "Today, 2:36 PM"
        },
        {
            id: 2,
            title: "Nvidia, AMD will benefit from China chip sales, but extent is unknown: BNP",
            source: "SA News",
            date: "Today, 9:22 AM",
            comments: 17
        },
        {
            id: 3,
            title: "China could limit access to Nvidia's H200 chips despite Trump's nod: report",
            source: "SA News",
            date: "Today, 6:44 AM",
            comments: 43
        },
        {
            id: 4,
            title: "Nvidia, AMD, Intel rise as Trump approves sale of H200 chips to China, asks for 25% cut",
            source: "SA News",
            date: "Yesterday, 8:14 PM",
            comments: 120
        },
        {
            id: 5,
            title: "Tech Voices: Trump's AI order, Nvidia-China, Apple's chip chief",
            source: "SA News",
            date: "Yesterday, 2:37 PM",
            comments: 24
        },
        {
            id: 6,
            title: "Nvidia jumps amid report Commerce Dept. to open up sales to China",
            source: "SA News",
            date: "Yesterday, 1:13 PM",
            comments: 95
        },
        {
            id: 7,
            title: "Nvidia, SoftBank considering investing in Skild AI: report",
            source: "SA News",
            date: "Yesterday, 11:18 AM",
            comments: 5
        }
    ],
    bearsSay: [
        {
            text: "I show how the bull argument for Nvidia Corporation suddenly pivots into supporting the bear case. Common bull and bear arguments aside, this is not the vehicle you want the bulk of your funds invested in.",
            link: "#"
        },
        {
            text: "Nvidia Corporation remains a Strong Sell on the back of similarities between the current AI bubble and the dot-com bubble of 2000. I believe this will cause a significant drop in Nvidia's stock price.",
            link: "#"
        },
        {
            text: "Nvidia Corporation is facing specific risks such as valuation concerns, the AI bubble, rising competition, and economic slowdown.",
            link: "#"
        }
    ],
    bullsSay: [
        {
            text: "With hyperscalers expecting to spend record sums of money on scaling their AI infrastructure in the following years, we'll likely see further growth of Nvidia Corporation's business in the foreseeable future.",
            link: "#"
        },
        {
            text: "Nvidia Corporation's Q3 results provide a strong message that AI is not in a bubble.",
            link: "#"
        },
        {
            text: "Nvidia Corporation's unmatched AI infrastructure dominance, multi-year demand visibility, and rapidly expanding free cash flow create a rare, durable compounding engine with significant long-term upside.",
            link: "#"
        }
    ],

    // New Data Sections for Summary Cards
    earningsEstimates: [
        { fy: "2026", eps: "4.69", epsYoy: "+56.72%", pe: "37.35", sales: "$213.13B", salesYoy: "+63.32%" },
        { fy: "2027", eps: "7.44", epsYoy: "+58.67%", pe: "23.54", sales: "$315.47B", salesYoy: "+48.02%" },
        { fy: "2028", eps: "9.61", epsYoy: "+29.22%", pe: "18.22", sales: "$403.83B", salesYoy: "+28.01%" }
    ],
    earningsRevisions: {
        grade: "B",
        upRevisions: 39,
        downRevisions: 2,
        percentDown: 4,
        percentUp: 96
    },
    valuationMetrics: [
        { label: "P/E Non-GAAP (FWD)", value: "37.36" },
        { label: "P/E GAAP (TTM)", value: "43.32" },
        { label: "Price/Book (TTM)", value: "35.78" },
        { label: "EV/Sales (TTM)", value: "22.46" },
        { label: "EV/EBITDA (TTM)", value: "37.30" }
    ],
    growthMetrics: [
        { label: "Revenue (YoY)", value: "65.22%" },
        { label: "Revenue 3 Year (CAGR)", value: "87.11%" },
        { label: "EPS Diluted (YoY)", value: "59.73%" },
        { label: "EPS Diluted 3 Year (CAGR)", value: "157.90%" },
        { label: "Levered FCF (YoY)", value: "27.61%" }
    ],
    profitabilityMetrics: [
        { label: "Gross Profit Margin", value: "70.05%" },
        { label: "EBIT Margin", value: "58.84%" },
        { label: "Net Income Margin", value: "53.01%" },
        { label: "Return on Equity", value: "107.36%" },
        { label: "Return on Assets", value: "61.56%" }
    ],
    momentumMetrics: {
        rows: [
            { ticker: "NVDA", m3: "-1.57%", m6: "+20.70%", m9: "+51.22%", y1: "+27.44%" },
            { ticker: "SP500", m3: "+3.69%", m6: "+12.94%", m9: "+21.93%", y1: "+12.83%" }
        ],
        lastPrice: 175.02,
        rangeLow: 88.62,
        rangeHigh: 212.19
    },
    capitalStructure: [
        { label: "Market Cap", value: "$4.25T" },
        { label: "Total Debt", value: "$10.82B" },
        { label: "Cash", value: "$60.61B" },
        { label: "Other", value: "-" },
        { label: "Enterprise Value", value: "$4.20T" }
    ],
    dividendsData: {
        rows: [
            { label: "Dividend Yield (FWD)", value: "0.02%" },
            { label: "Annual Payout (FWD)", value: "$0.04" },
            { label: "Payout Ratio", value: "0.99%" },
            { label: "5 Year Growth Rate (CAGR)", value: "20.11%" },
            { label: "Years of Growth", value: "2 Years" },
            { label: "Latest Announced Dividend", value: "$0.01" },
            { label: "Ex-Dividend Date", value: "12/4/2025" },
            { label: "Payout Date", value: "12/26/2025" },
            { label: "Frequency", value: "Quarterly" }
        ]
    },
    tradingDataValues: [
        { label: "Volume", value: "204.27M" },
        { label: "Average Volume (3 months)", value: "190.25M" },
        { label: "Previous Close", value: "180.93" },
        { label: "Open", value: "181.11" },
        { label: "Shares Outstanding (Ticker)", value: "24.30B" }
    ],
    dividendGrowthHistory: [
        { year: "2014", value: 0.01 }, // Mock approximate values for chart
        { year: "2015", value: 0.012 },
        { year: "2016", value: 0.014 },
        { year: "2017", value: 0.016 },
        { year: "2018", value: 0.018 },
        { year: "2019", value: 0.019 },
        { year: "2020", value: 0.019 },
        { year: "2021", value: 0.019 },
        { year: "2022", value: 0.019 },
        { year: "2023", value: 0.019 },
        { year: "2024", value: 0.04 }
    ],
    financialsSummary: {
        income: [
            { label: "Revenue (TTM)", value: "187.14B" },
            { label: "Revenue Per Share", value: "7.67" },
            { label: "Gross Profit (TTM)", value: "131.09B" },
            { label: "EBITDA (TTM)", value: "112.70B" },
            { label: "Net Income (TTM)", value: "99.20B" },
            { label: "EPS Diluted (TTM)", value: "$4.04" }
        ],
        balanceSheet: [
            { label: "Total Cash (MRQ)", value: "60.61B" },
            { label: "Total Cash Per Share", value: "0.47" },
            { label: "Total Debt (MRQ)", value: "10.82B" },
            { label: "Total Debt to Equity (MRQ)", value: "9.10%" },
            { label: "Current Ratio (MRQ)", value: "4.47" },
            { label: "Quick Ratio (MRQ)", value: "3.60" }
        ],
        cashFlow: [
            { label: "Cash from Operations (TTM)", value: "83.16B" },
            { label: "Cash from Investing (TTM)", value: "-28.57B" },
            { label: "Levered Free Cash Flow (TTM)", value: "53.28B" },
            { label: "Unlevered Free Cash Flow (TTM)", value: "53.44B" },
            { label: "Free Cash Flow / Share (TTM)", value: "$3.17" }
        ],
        solvency: [
            { label: "Total Debt / Equity (MRQ)", value: "9.10%" },
            { label: "Total Debt / Capital (MRQ)", value: "8.34%" },
            { label: "LT Debt / Equity (MRQ)", value: "7.97%" },
            { label: "LT Debt / Total Capital (MRQ)", value: "7.31%" },
            { label: "Total Liabilities / Total Assets (MRQ)", value: "26.22%" }
        ]
    },

    insiderTrading: [
        { date: "Dec. 10, 2025", name: "Debora Shoquist", title: "Executive Vice President of Operations", type: "Sell", shares: "80,000", price: "184.65", value: "14,771,657.04" },
        { date: "Dec. 09, 2025", name: "Mark Stevens", title: "Independent Director", type: "Sell", shares: "350,000", price: "181.73", value: "63,604,065" },
        { date: "Dec. 04, 2025", name: "A. Seawell", title: "Independent Director", type: "Sell", shares: "12,728", price: "183.93", value: "2,341,117.04" },
        { date: "Dec. 02, 2025", name: "A. Seawell", title: "Independent Director", type: "Intent to sell form 144", shares: "12,728", price: "183.93", value: "2,341,117.17" },
        { date: "Nov. 26, 2025", name: "John Dabiri", title: "Independent Director", type: "Sell", shares: "626", price: "179.42", value: "112,316.92" },
        { date: "Nov. 24, 2025", name: "John Dabiri", title: "Independent Director", type: "Intent to sell form 144", shares: "626", price: "179.42", value: "112,317" },
        { date: "Nov. 06, 2025", name: "Colette Kress", title: "Executive VP & CFO", type: "Sell", shares: "47,640", price: "208.33", value: "9,924,868.86" },
        { date: "Oct. 31, 2025", name: "Jen-Hsun Huang", title: "Co-Founder, CEO, President & Director", type: "Sell", shares: "25,000", price: "207.91", value: "5,197,790.22" },
        { date: "Oct. 29, 2025", name: "Jen-Hsun Huang", title: "Co-Founder, CEO, President & Director", type: "Intent to sell form 144", shares: "25,000", price: "207.91", value: "5,197,790" },
        { date: "Oct. 29, 2025", name: "Jen-Hsun Huang", title: "Co-Founder, CEO, President & Director", type: "Sell", shares: "125,000", price: "188.47", value: "23,558,262.11" },
        { date: "Oct. 28, 2025", name: "Jen-Hsun Huang", title: "Co-Founder, CEO, President & Director", type: "Intent to sell form 144", shares: "25,000", price: "195.54", value: "4,888,536" },
        { date: "Oct. 27, 2025", name: "Jen-Hsun Huang", title: "Co-Founder, CEO, President & Director", type: "Intent to sell form 144", shares: "25,000", price: "190.73", value: "4,768,183" },
        { date: "Oct. 24, 2025", name: "Jen-Hsun Huang", title: "Co-Founder, CEO, President & Director", type: "Intent to sell form 144", shares: "75,000", price: "185.35", value: "13,901,542.99" },
        { date: "Oct. 23, 2025", name: "Colette Kress", title: "Executive VP & CFO", type: "Sell", shares: "47,640", price: "181.42", value: "8,642,640.45" },
        { date: "Oct. 23, 2025", name: "Jen-Hsun Huang", title: "Co-Founder, CEO, President & Director", type: "Sell", shares: "225,000", price: "181.04", value: "40,734,400.14" }
    ],
    earnings: {
        lastQuarter: {
            date: "11/19/2025",
            epsNormalized: "$1.30",
            epsBeat: "$0.05",
            epsGaap: "$1.30",
            epsGaapBeat: "$0.10",
            revenue: "$57.01B",
            revenueBeat: "$1.96B"
        },
        upcomingQuarter: {
            date: "2/25/2026 (Post-Market)",
            epsEstimate: "$1.52",
            epsGaapEstimate: "$1.46",
            revenueEstimate: "$65.48B",
            revisions: { up: 31, down: 2 }
        },
        revisionsGrade: {
            grade: "B",
            up: { count: 39, percent: 95.12 },
            down: { count: 2, percent: 4.88 },
            sector: { up: 85.51, down: 13.91 },
            diffSector: { up: 11.24, down: -84.94 },
            fiveYearAvg: { up: 77.17, down: 22.83 },
            diffFiveYear: { up: 23.27, down: -78.64 }
        },
        revisionsData: {
            summary: {
                epsUp: 38, epsDown: 2, revUp: 43, revDown: 3
            },
            epsTrends: [
                { end: "Jan 2026", estimate: "4.69", yoy: "56.72%", trend1m: "0.00%", trend3m: "3.83%", trend6m: "9.82%" },
                { end: "Jan 2027", estimate: "7.44", yoy: "58.67%", trend1m: "0.23%", trend3m: "17.12%", trend6m: "29.97%" },
                { end: "Jan 2028", estimate: "9.81", yoy: "29.22%", trend1m: "0.97%", trend3m: "28.15%", trend6m: "47.57%" },
                { end: "Jan 2029", estimate: "10.88", yoy: "11.16%", trend1m: "0.00%", trend3m: "31.91%", trend6m: "57.88%" },
                { end: "Jan 2030", estimate: "12.21", yoy: "14.28%", trend1m: "0.00%", trend3m: "38.88%", trend6m: "68.96%" },
            ],
            revenueTrends: [
                { end: "Jan 2026", estimate: "$213.13B", yoy: "63.32%", trend1m: "0.00%", trend3m: "3.24%", trend6m: "6.41%" },
                { end: "Jan 2027", estimate: "$315.47B", yoy: "48.02%", trend1m: "0.19%", trend3m: "14.92%", trend6m: "25.64%" },
                { end: "Jan 2028", estimate: "$403.83B", yoy: "28.01%", trend1m: "0.82%", trend3m: "25.18%", trend6m: "38.86%" },
                { end: "Jan 2029", estimate: "$424.74B", yoy: "5.16%", trend1m: "0.00%", trend3m: "20.37%", trend6m: "48.31%" },
                { end: "Jan 2030", estimate: "$480.87B", yoy: "13.22%", trend1m: "0.00%", trend3m: "27.11%", trend6m: "48.98%" },
            ],
            // For the chart, we'll simulate lines. Each series has a label and a set of y-values over a fixed normalized x-range (0-100)
            chartData: {
                eps: [
                    { label: "JAN 2026", value: "4.69", color: "#F97316", data: [0.5, 0.52, 0.6, 0.8, 1.2, 2.0, 3.5, 4.69] },
                    { label: "JAN 2027", value: "7.44", color: "#3B82F6", data: [0.6, 0.65, 0.7, 0.9, 1.4, 2.5, 4.5, 7.44] },
                    { label: "JAN 2028", value: "9.81", color: "#A855F7", data: [0.7, 0.8, 0.9, 1.1, 1.8, 3.0, 5.5, 9.81] },
                    { label: "JAN 2029", value: "10.88", color: "#10B981", data: [0.8, 0.9, 1.0, 1.3, 2.0, 3.5, 6.5, 10.88] },
                    { label: "JAN 2030", value: "12.21", color: "#EF4444", data: [0.9, 1.0, 1.2, 1.5, 2.3, 4.0, 7.5, 12.21] },
                ],
                revenue: [
                    { label: "JAN 2026", value: "213.13B", color: "#F97316", data: [100, 110, 130, 150, 180, 200, 210, 213] },
                    { label: "JAN 2027", value: "315.47B", color: "#3B82F6", data: [120, 140, 160, 200, 250, 290, 310, 315] },
                    { label: "JAN 2028", value: "403.83B", color: "#A855F7", data: [150, 180, 200, 250, 300, 350, 390, 403] },
                    { label: "JAN 2029", value: "424.74B", color: "#10B981", data: [160, 190, 220, 270, 320, 370, 410, 424] },
                    { label: "JAN 2030", value: "480.87B", color: "#EF4444", data: [180, 210, 240, 290, 350, 400, 450, 480] },
                ]
            }
        },
        revisionsDataQuarterly: {
            summary: {
                epsUp: 31, epsDown: 2, revUp: 31, revDown: 3
            },
            epsTrends: [
                { end: "FQ4 2026 (Jan 2026)", estimate: "1.52", yoy: "70.91%", trend1m: "0.00%", trend3m: "8.08%", trend6m: "14.72%" },
                { end: "FQ1 2027 (Apr 2026)", estimate: "1.63", yoy: "101.54%", trend1m: "0.07%", trend3m: "10.25%", trend6m: "20.85%" },
                { end: "FQ2 2027 (Jul 2026)", estimate: "1.79", yoy: "70.20%", trend1m: "0.12%", trend3m: "14.85%", trend6m: "28.52%" },
                { end: "FQ3 2027 (Oct 2026)", estimate: "1.99", yoy: "53.14%", trend1m: "0.21%", trend3m: "21.47%", trend6m: "38.17%" },
            ],
            revenueTrends: [
                { end: "FQ4 2026 (Jan 2026)", estimate: "$65.48B", yoy: "68.48%", trend1m: "0.00%", trend3m: "7.18%", trend6m: "13.49%" },
                { end: "FQ1 2027 (Apr 2026)", estimate: "$70.03B", yoy: "58.94%", trend1m: "0.00%", trend3m: "9.76%", trend6m: "19.64%" },
                { end: "FQ2 2027 (Jul 2026)", estimate: "$76.29B", yoy: "63.20%", trend1m: "0.00%", trend3m: "14.16%", trend6m: "28.02%" },
                { end: "FQ3 2027 (Oct 2026)", estimate: "$84.91B", yoy: "48.95%", trend1m: "0.00%", trend3m: "19.84%", trend6m: "34.43%" },
            ],
            chartData: {
                eps: [
                    { label: "FQ4 2026", value: "1.52", color: "#F97316", data: [1.0, 1.1, 1.2, 1.3, 1.4, 1.45, 1.5, 1.52] },
                    { label: "FQ1 2027", value: "1.63", color: "#3B82F6", data: [1.1, 1.2, 1.3, 1.4, 1.5, 1.55, 1.6, 1.63] },
                    { label: "FQ2 2027", value: "1.79", color: "#A855F7", data: [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.75, 1.79] }
                ],
                revenue: [
                    { label: "FQ4 2026", value: "65.48B", color: "#F97316", data: [40, 45, 50, 55, 60, 63, 65, 65.48] },
                    { label: "FQ1 2027", value: "70.03B", color: "#3B82F6", data: [45, 50, 55, 60, 65, 68, 69, 70.03] },
                    { label: "FQ2 2027", value: "76.29B", color: "#A855F7", data: [50, 55, 60, 65, 70, 73, 75, 76.29] }
                ]
            }
        },
        surpriseData: {
            annual: {
                summary: {
                    eps: { beats: 8, misses: 0, inline: 0 },
                    revenue: { beats: 7, misses: 1, inline: 0 }
                },
                epsData: [
                    { date: "Jan 2025", estimate: 2.95, actual: 2.99, surprise: 0.04, surprisePercent: 1.22 },
                    { date: "Jan 2024", estimate: 1.24, actual: 1.30, surprise: 0.06, surprisePercent: 4.63 },
                    { date: "Jan 2023", estimate: 0.33, actual: 0.33, surprise: 0.01, surprisePercent: 2.23 },
                    { date: "Jan 2022", estimate: 0.43, actual: 0.44, surprise: 0.01, surprisePercent: 2.29 },
                    { date: "Jan 2021", estimate: 0.24, actual: 0.25, surprise: 0.01, surprisePercent: 2.96 },
                    { date: "Jan 2020", estimate: 0.14, actual: 0.14, surprise: 0.01, surprisePercent: 3.91 },
                    { date: "Jan 2019", estimate: 0.17, actual: 0.17, surprise: 0.00, surprisePercent: 0.54 },
                    { date: "Jan 2018", estimate: 0.11, actual: 0.12, surprise: 0.01, surprisePercent: 8.85 },
                ],
                // Simplified revenue for brevity, typically would match structure
                revenueData: [
                    { date: "Jan 2025", estimate: 129.29, actual: 130.50, surprise: 1.21, surprisePercent: 0.94 },
                    { date: "Jan 2024", estimate: 59.25, actual: 60.92, surprise: 1.67, surprisePercent: 2.81 },
                    { date: "Jan 2023", estimate: 26.94, actual: 26.97, surprise: 0.29, surprisePercent: 0.11 },
                    { date: "Jan 2022", estimate: 26.67, actual: 26.91, surprise: 0.24, surprisePercent: 0.90 },
                    { date: "Jan 2021", estimate: 16.47, actual: 16.68, surprise: 0.20, surprisePercent: 1.25 },
                ]
            },
            quarterly: {
                summary: {
                    eps: { beats: 8, misses: 0, inline: 0 },
                    revenue: { beats: 8, misses: 0, inline: 0 }
                },
                epsData: [
                    { date: "FQ3 2026 (Oct 2025)", estimate: 1.25, actual: 1.30, surprise: 0.05, surprisePercent: 3.60 },
                    { date: "FQ2 2026 (Jul 2025)", estimate: 1.01, actual: 1.05, surprise: 0.04, surprisePercent: 4.10 },
                    { date: "FQ1 2026 (Apr 2025)", estimate: 0.75, actual: 0.81, surprise: 0.06, surprisePercent: 8.02 },
                    { date: "FQ4 2025 (Jan 2024)", estimate: 0.85, actual: 0.89, surprise: 0.04, surprisePercent: 5.25 },
                    { date: "FQ3 2025 (Oct 2024)", estimate: 0.75, actual: 0.81, surprise: 0.06, surprisePercent: 8.52 },
                ],
                revenueData: [
                    { date: "FQ3 2026 (Oct 2026)", estimate: 55.04, actual: 57.01, surprise: 1.96, surprisePercent: 3.56 },
                    { date: "FQ2 2026 (Jul 2026)", estimate: 45.06, actual: 46.74, surprise: 1.68, surprisePercent: 1.49 },
                    { date: "FQ1 2026 (Apr 2025)", estimate: 43.25, actual: 44.06, surprise: 0.80, surprisePercent: 1.87 },
                    { date: "FQ4 2025 (Jan 2024)", estimate: 38.14, actual: 39.33, surprise: 1.19, surprisePercent: 3.13 },
                ]
            }
        },
        history: [
            {
                period: "FQ3 2026 (Oct 2025)",
                eps: "1.30",
                beat: "0.05",
                revenue: "57.01B",
                yoy: "62.49%",
                beatRevenue: "1.96B",
                articles: [
                    { title: "12 out of 13 companies deliver EPS wins this week: Earnings Scorecard", source: "SA News", date: "Sat, Nov. 22", comments: 4 },
                    { title: "Nvidia's Q3 results and outlook see largely bullish views from analysts", source: "SA News", date: "Thu, Nov. 20", comments: 33 },
                    { title: "Nvidia's results and guidance are a 'green flag' for Taiwan Semiconductor: Wedbush", source: "SA News", date: "Thu, Nov. 20", comments: 6 },
                    { title: "After-market movers: Nasdaq futures pop nearly 2% as Nvidia 'just crushes it again'", source: "SA News", date: "Wed, Nov. 19", comments: 52 },
                    { title: "Nvidia pops as AI strength buoys Q3 results, guidance; Huang says cloud GPUs 'sold out'", source: "SA News", date: "Wed, Nov. 19", comments: 301 }
                ]
            },
            { period: "FQ2 2026 (Jul 2025)", eps: "1.05", beat: "0.04", revenue: "46.74B", yoy: "55.80%", beatRevenue: "887.48M", articles: [] },
            { period: "FQ1 2026 (Apr 2025)", eps: "0.81", beat: "0.08", revenue: "44.06B", yoy: "69.18%", beatRevenue: "807.34M", articles: [] },
            { period: "FQ4 2025 (Jan 2025)", eps: "0.76", beat: "0.06", revenue: "39.11B", yoy: "72.45%", beatRevenue: "1.23B", articles: [] },
            { period: "FQ3 2025 (Oct 2024)", eps: "0.65", beat: "0.05", revenue: "34.02B", yoy: "85.22%", beatRevenue: "880.12M", articles: [] },
            { period: "FQ2 2024 (Jul 2024)", eps: "0.68", beat: "0.04", revenue: "30.04B", yoy: "122.40%", beatRevenue: "1.29B", articles: [] },
            { period: "FQ1 2024 (Apr 2024)", eps: "0.61", beat: "0.05", revenue: "26.04B", yoy: "262.12%", beatRevenue: "1.48B", articles: [] },
            { period: "FQ4 2024 (Jan 2024)", eps: "0.52", beat: "0.05", revenue: "22.10B", yoy: "265.28%", beatRevenue: "1.58B", articles: [] }
        ],
        estimates: {
            eps: [
                { end: "Jan 2026", estimate: "4.89", forwardPe: "37.35", low: "4.80", high: "4.98", analysts: 43 },
                { end: "Jan 2027", estimate: "7.44", forwardPe: "23.54", low: "4.91", high: "9.58", analysts: 54 },
                { end: "Jan 2028", estimate: "9.61", forwardPe: "18.22", low: "7.20", high: "13.69", analysts: 38 },
                { end: "Jan 2029", estimate: "10.88", forwardPe: "16.39", low: "10.13", high: "11.17", analysts: 3 }
            ],
            epsQuarterly: [
                { end: "Oct 2025", estimate: "1.30", epsYoy: "62.5%", forwardPe: "—", low: "1.25", high: "1.35", analysts: "20" },
                { end: "Jan 2026", estimate: "1.45", epsYoy: "58.2%", forwardPe: "—", low: "1.40", high: "1.55", analysts: "22" },
                { end: "Apr 2026", estimate: "1.60", epsYoy: "45.1%", forwardPe: "—", low: "1.50", high: "1.70", analysts: "18" },
                { end: "Jul 2026", estimate: "1.75", epsYoy: "40.3%", forwardPe: "—", low: "1.65", high: "1.85", analysts: "15" },
            ],
            revenue: [
                { end: "Jan 2026", estimate: "213.13B", forwardPs: "19.95", low: "203.80B", high: "215.98B", analysts: 49 },
                { end: "Jan 2027", estimate: "315.47B", forwardPs: "13.48", low: "228.15B", high: "412.53B", analysts: 61 },
                { end: "Jan 2028", estimate: "403.83B", forwardPs: "10.53", low: "280.30B", high: "614.14B", analysts: 45 },
                { end: "Jan 2029", estimate: "424.74B", forwardPs: "10.01", low: "358.91B", high: "486.31B", analysts: 8 }
            ],
            revenueQuarterly: [
                { end: "Oct 2025", estimate: "57.01B", salesYoy: "62.4%", forwardPs: "—", low: "55.0B", high: "59.0B", analysts: "19" },
                { end: "Jan 2026", estimate: "65.50B", salesYoy: "55.1%", forwardPs: "—", low: "63.0B", high: "68.0B", analysts: "21" },
                { end: "Apr 2026", estimate: "72.00B", salesYoy: "48.2%", forwardPs: "—", low: "70.0B", high: "75.0B", analysts: "16" },
                { end: "Jul 2026", estimate: "80.50B", salesYoy: "42.5%", forwardPs: "—", low: "78.0B", high: "83.0B", analysts: "14" },
            ]
        },
        chartData: {
            surprise: [
                { quarter: "FQ4 2025", estimate: 0.70, actual: 0.76, type: "actual" },
                { quarter: "FQ1 2026", estimate: 0.73, actual: 0.81, type: "actual" },
                { quarter: "FQ2 2026", estimate: 1.01, actual: 1.05, type: "actual" },
                { quarter: "FQ3 2026", estimate: 1.25, actual: 1.30, type: "actual" },
                { quarter: "FQ4 2026", estimate: 1.52, actual: null, type: "estimate" },
                { quarter: "FQ1 2027", estimate: 1.63, actual: null, type: "estimate" },
                { quarter: "FQ2 2027", estimate: 1.70, actual: null, type: "estimate" },
                { quarter: "FQ3 2027", estimate: 1.83, actual: null, type: "estimate" }
            ],
            consensusEps: [
                { year: 2024, value: 1.29 },
                { year: 2025, value: 4.89 },
                { year: 2026, value: 7.44 },
                { year: 2027, value: 9.61 },
                { year: 2028, value: 10.88 },
                { year: 2029, value: 12.21 },
                { year: 2030, value: 14.73 },
                { year: 2034, value: 20.94 }
            ],
            consensusRevenue: [
                { year: 2024, value: 213.13 },
                { year: 2025, value: 315.47 },
                { year: 2026, value: 403.83 },
                { year: 2027, value: 424.74 },
                { year: 2028, value: 480.87 },
                { year: 2029, value: 555.50 },
                { year: 2030, value: 622.25 },
                { year: 2034, value: 896.31 }
            ]
        }
    },
    transcripts: {
        insights: [
            {
                id: 1,
                title: "NVIDIA targets $65B Q4 revenue and $0.5T Blackwell & Rubin sales through 2026 while expanding AI infrastructure partnerships",
                source: "SA Insights",
                date: "Wed, Nov. 19",
                comments: 44,
            },
            {
                id: 2,
                title: "NVIDIA outlines $3T–$4T AI infrastructure opportunity through next five years as Blackwell ramps",
                source: "SA Insights",
                date: "Wed, Aug. 27",
                comments: 26,
            }
        ],
        fullTranscripts: [
            {
                id: 3,
                title: "NVIDIA Corporation (NVDA) Presents at UBS Global Technology and AI Conference 2025 Transcript",
                source: "SA Transcripts",
                date: "Tue, Dec. 02",
                comments: 1,
            },
            {
                id: 4,
                title: "NVIDIA Corporation (NVDA) Discusses Strategic Partnership to Transform Engineering and Design Through AI and Accelerated Computing Transcript",
                source: "SA Transcripts",
                date: "Mon, Dec. 01",
                comments: 1,
            },
            {
                id: 5,
                title: "NVIDIA Corporation (NVDA) Q3 2026 Earnings Call Transcript",
                source: "SA Transcripts",
                date: "Wed, Nov. 19",
                comments: 385,
            }
        ]
    }
};
