import "./global.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { AppProvider } from "@/contexts/AppContext";
import SWRProvider from "@/components/providers/SWRProvider";

export const metadata: Metadata = {
  title: "iLearn - Student Portal",
  description: "Student Dashboard and Learning Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://js.paystack.co/v2/inline.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
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
      </body>
    </html>
  );
}
