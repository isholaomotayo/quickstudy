import "./global.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { AppProvider } from "@/contexts/AppContext";
import SWRProvider from "@/components/providers/SWRProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "QuickStudy Portal",
  description: "Learning dashboard and student services for QuickStudy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://js.paystack.co/v2/inline.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/tinymce/tinymce.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body>
        <ThemeProvider>
          <AppProvider>
            <SWRProvider>
              {children}
              <Toaster
                position="top-right"
                duration={4000}
                richColors
                closeButton
              />
            </SWRProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
