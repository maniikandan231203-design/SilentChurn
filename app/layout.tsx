import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { ToastContainer } from "@/components/ui/ToastContainer";

export const metadata: Metadata = {
  title: "SilentChurn | Automated WhatsApp Win-Back & Customer Retention SaaS",
  description:
    "Turn one-time visitors into repeat regulars by identifying silent churn and automating personalized WhatsApp win-back workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-emerald-500/20 selection:text-emerald-900 font-sans">
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
