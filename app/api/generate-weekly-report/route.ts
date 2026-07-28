import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(req: Request) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
        });

        // We assume local server is running on localhost:3000
        const baseUrl = req.headers.get('origin') || 'http://localhost:3000';

        // Extract cookies from the incoming request to pass to Puppeteer
        const cookieHeader = req.headers.get('cookie') || '';
        const cookies = cookieHeader.split(';').map(cookie => {
            const [name, ...rest] = cookie.split('=');
            return {
                name: name.trim(),
                value: rest.join('=').trim(),
                url: baseUrl,
            };
        }).filter(c => c.name !== '');

        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const subFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Helper to add a text page
        const addTextPage = (title: string, subtitle?: string) => {
            const page = pdfDoc.addPage([1920, 1080]);
            const { width, height } = page.getSize();

            const titleSize = 70;
            const titleWidth = font.widthOfTextAtSize(title, titleSize);
            page.drawText(title, {
                x: (width - titleWidth) / 2,
                y: height / 2,
                size: titleSize,
                font,
                color: rgb(0.1, 0.1, 0.1),
            });

            if (subtitle) {
                const subSize = 40;
                const subWidth = subFont.widthOfTextAtSize(subtitle, subSize);
                page.drawText(subtitle, {
                    x: (width - subWidth) / 2,
                    y: height / 2 - 60,
                    size: subSize,
                    font: subFont,
                    color: rgb(0.4, 0.4, 0.4),
                });
            }
        };

        // Helper to capture a screenshot
        const capturePage = async (path: string, extraWaitTimeMs = 3000, selector?: string) => {
            const page = await browser!.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            if (cookies.length > 0) {
                await page.setCookie(...cookies);
            }

            // Using networkidle2 to wait until all network requests (e.g. API calls) finish, allowing up to 2 active requests
            await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle2', timeout: 120000 });

            // Wait for canvas-based charts (Lightweight Charts / TradingView) to
            // actually paint. We poll every 500ms up to 15s, checking that every
            // visible <canvas> has at least some non-transparent pixels drawn.
            // Falls back to a fixed wait if no canvases are found.
            await page.waitForFunction(() => {
                // For Matrix Chart (HTML-based), wait until its loading text disappears
                if (window.location.href.includes('Matrix')) {
                    return !document.body.innerText.includes('Loading Matrix Chart');
                }

                // For Alrayan & Alhussain page: wait until no loading spinner is visible
                // The spinner is an SVG with the spin animation inside a chart overlay div
                if (window.location.href.includes('Alrayan')) {
                    const spinners = document.querySelectorAll('svg[style*="spin"]');
                    if (spinners.length > 0) return false; // still loading
                    // Also confirm we have canvases with data
                    const canvases = Array.from(document.querySelectorAll('canvas'));
                    if (canvases.length === 0) return false;
                    return canvases.some(c => {
                        try {
                            const ctx = c.getContext('2d');
                            if (!ctx || c.width === 0 || c.height === 0) return false;
                            const strip = ctx.getImageData(0, Math.floor(c.height / 2), c.width, 1).data;
                            for (let i = 3; i < strip.length; i += 4) {
                                if (strip[i] > 0) return true;
                            }
                            return false;
                        } catch { return true; }
                    });
                }

                const canvases = Array.from(document.querySelectorAll('canvas'));
                // If no canvases are in the DOM yet, the chart component is still loading
                if (canvases.length === 0) return false;

                // Check that every canvas has actually painted some non-transparent pixels
                return canvases.every(c => {
                    try {
                        const ctx = c.getContext('2d');
                        if (!ctx || c.width === 0 || c.height === 0) return false;
                        // Sample a horizontal strip from the middle
                        const strip = ctx.getImageData(0, Math.floor(c.height / 2), c.width, 1).data;
                        for (let i = 3; i < strip.length; i += 4) {
                            if (strip[i] > 0) return true; // Found a painted pixel!
                        }
                        return false;
                    } catch { return true; } // cross-origin canvas → assume painted
                });
            }, { timeout: 30000 }).catch(() => { });

            // Extra safety buffer for any remaining async renders
            await new Promise(resolve => setTimeout(resolve, extraWaitTimeMs));

            // Hide UI elements we don't want in the report:
            // - nav/footer: site-wide chrome
            // - nextjs-portal / #next-build-indicator: Next.js dev overlay
            // - .z-50: BreadthTabs bar (pages 3-5)
            // - .z-\[60\]: Watchlist tabs bar (Matrix Chart page)
            // - header: Matrix Chart page header
            await page.addStyleTag({
                content: `
                    nav, footer, nextjs-portal, #next-build-indicator,
                    .z-50.flex-shrink-0,
                    .z-\\[60\\] { display: none !important; }
                    ${path.includes('Matrix') ? 'header { display: none !important; }' : ''}
                `
            });

            let imgBuffer;
            if (selector) {
                const el = await page.$(selector);
                if (el) {
                    imgBuffer = await el.screenshot();
                } else {
                    imgBuffer = await page.screenshot({ fullPage: true });
                }
            } else {
                imgBuffer = await page.screenshot({ fullPage: true });
            }

            await page.close();
            return imgBuffer;
        };

        // Helper to append image to PDF
        const appendImagePage = async (buffer: Uint8Array) => {
            const image = await pdfDoc.embedPng(buffer);
            const { width, height } = image.scale(1);
            const page = pdfDoc.addPage([width, height]);
            page.drawImage(image, { x: 0, y: 0, width, height });
        };

        // Helper to append image with a title drawn above the chart on the SAME page
        const appendTitledImagePage = async (title: string, buffer: Uint8Array) => {
            const image = await pdfDoc.embedPng(buffer);
            const imgW = image.width;
            const imgH = image.height;

            const titleSize = 50;
            const titleMarginTop = 30;
            const titleMarginBottom = 20;
            const headerSpace = titleMarginTop + titleSize + titleMarginBottom;

            // Page width matches the image; height = header + image
            const pageW = imgW;
            const pageH = imgH + headerSpace;
            const page = pdfDoc.addPage([pageW, pageH]);

            // Draw title centered at the top (pdf-lib Y=0 is bottom)
            const titleWidth = font.widthOfTextAtSize(title, titleSize);
            page.drawText(title, {
                x: (pageW - titleWidth) / 2,
                y: pageH - titleMarginTop - titleSize,
                size: titleSize,
                font,
                color: rgb(0.1, 0.1, 0.1),
            });

            // Draw the chart image below the title
            page.drawImage(image, { x: 0, y: 0, width: imgW, height: imgH });
        };

        // 1. Weekly Routine + Date
        addTextPage('Weekly Routine', new Date().toLocaleDateString());

        // 2. Market Breadth
        addTextPage('Market Breadth');

        // 3. Percent of Stocks Above MA
        await appendTitledImagePage('1) Percent Of Stocks Above MA', await capturePage('/Percent_of_Stocks_Above_MA', 3000, 'main'));

        // 4. minervini-trend
        await appendTitledImagePage('2) Minervini Trend', await capturePage('/minervini-trend', 3000, 'main'));

        // 5. Alrayan & Alhussain
        await appendTitledImagePage('3) Alhussain & Alrayan & A/D Rating', await capturePage('/screeners/Alrayan&Alhussain', 6000, 'main'));

        // 6. Industry Groups (Title is drawn directly on the first page of the table)
        // Helper to capture the generated jsPDF from the industry groups page
        const capturePdfDataUri = async (path: string) => {
            const page = await browser!.newPage();

            // Forward page console output/errors to the server terminal - cheap to
            // keep in place and useful if this step ever needs debugging again.
            page.on('console', (msg: { type: () => string; text: () => any; }) => {
                if (msg.type() === 'error') console.error(`[industry-groups page] ${msg.text()}`);
            });
            page.on('pageerror', (err: any) => {
                console.error('[industry-groups page] pageerror:', err);
            });

            await page.setViewport({ width: 1920, height: 1080 });
            if (cookies.length > 0) {
                await page.setCookie(...cookies);
            }
            await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle2', timeout: 120000 });

            // Wait for window.__REPORT_PDF_BASE64__ to be populated by the page.
            // 90s covers fetching/expanding all ~22 industry groups' stock lists
            // sequentially, with headroom.
            await page.waitForFunction(() => (window as any).__REPORT_PDF_BASE64__ !== undefined, { timeout: 90000 });
            const dataUri = await page.evaluate(() => (window as any).__REPORT_PDF_BASE64__ as string);
            await page.close();
            if (dataUri === 'ERROR') {
                throw new Error('jsPDF failed to generate in the browser context');
            }
            return dataUri;
        };

        // 7. Industry Groups Filter (Automated Preset) - Generate PDF via jsPDF in Puppeteer
        const indPdfDataUri = await capturePdfDataUri('/industry-groups?autoReport=true');
        const base64Data = indPdfDataUri.split(',')[1];
        const indPdfBuffer = Buffer.from(base64Data, 'base64');
        const indPdfDoc = await PDFDocument.load(indPdfBuffer);
        const embeddedIndPages = await pdfDoc.embedPages(indPdfDoc.getPages());

        for (let i = 0; i < embeddedIndPages.length; i++) {
            const embeddedPage = embeddedIndPages[i];
            // Scale to fill the full page width (1920) edge-to-edge, sizing the
            // page's own height to match the scaled content so there are no
            // white bars on the sides and nothing gets stretched or cropped.
            const scale = 1920 / embeddedPage.width;
            const scaledHeight = embeddedPage.height * scale;

            if (i === 0) {
                const title = 'Industry Groups';
                const titleSize = 50;
                const titleMarginTop = 30;
                const titleMarginBottom = 20;
                const headerSpace = titleMarginTop + titleSize + titleMarginBottom;

                const page = pdfDoc.addPage([1920, scaledHeight + headerSpace]);
                const titleWidth = font.widthOfTextAtSize(title, titleSize);
                page.drawText(title, {
                    x: (1920 - titleWidth) / 2,
                    y: scaledHeight + headerSpace - titleMarginTop - titleSize,
                    size: titleSize,
                    font,
                    color: rgb(0.1, 0.1, 0.1),
                });
                page.drawPage(embeddedPage, {
                    x: 0,
                    y: 0,
                    xScale: scale,
                    yScale: scale,
                });
            } else {
                const page = pdfDoc.addPage([1920, scaledHeight]);
                page.drawPage(embeddedPage, {
                    x: 0,
                    y: 0,
                    xScale: scale,
                    yScale: scale,
                });
            }
        }

        // 8. Matrix Chart (Assuming it's on /watchlist page)
        await appendTitledImagePage('Relative Strength', await capturePage('/watchlist/?tab=Matrix%20Chart&reportMode=true', 3000, '#matrix-chart-main'));

        await browser.close();

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Weekly_Routine.pdf"',
            },
        });
    } catch (error: any) {
        if (browser) await browser.close();
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}