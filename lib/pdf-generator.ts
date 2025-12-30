import puppeteer from "puppeteer";

export interface PDFOptions {
  format?: "A4" | "Letter";
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
}

export async function generatePDFFromHTML(
  html: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  const {
    format = "A4",
    margin = {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.5in",
      left: "0.5in",
    },
    printBackground = true,
  } = options;

  let browser;
  try {
    // Launch browser with appropriate args for serverless environments
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set content with HTML
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format,
      margin,
      printBackground,
      preferCSSPageSize: false,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

