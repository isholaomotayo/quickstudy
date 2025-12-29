"use client";

import { ReactNode } from "react";
import { useEffect } from "react";
import AppHeader from "@/components/ui/app-header";
import { UserProfile } from "@/components/ui/user-profile";
import { NotificationBell } from "@/components/ui/notification-bell";
import { TopMenu } from "@/components/ui/top-menu";
import { useApp } from "@/contexts/AppContext";

export default function SimpleLayout({ children }: { children: ReactNode }) {
  const { userData, isLoading, refreshUserData } = useApp();

  // Refresh user data when layout loads if no user data is available
  useEffect(() => {
    const checkAndRefreshUserData = () => {
      // If we're not loading and don't have user data, try to refresh
      if (!isLoading && !userData) {
        // Check if there are any auth cookies present
        const hasAuthCookies =
          document.cookie.includes("token=") ||
          document.cookie.includes("userData=") ||
          document.cookie.includes("role=");

        if (hasAuthCookies) {
          refreshUserData();
        }
      }
    };

    // Check after a short delay to allow initial loading to complete
    const timer = setTimeout(checkAndRefreshUserData, 1000);

    return () => clearTimeout(timer);
  }, [isLoading, userData, refreshUserData]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-emerald-400/10 dark:from-primary/12 dark:via-background dark:to-primary/12" />
        <div className="absolute -left-24 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
        <div className="absolute -right-32 -bottom-24 h-80 w-80 rounded-full bg-emerald-400/12 blur-[120px] dark:bg-emerald-300/15" />
      </div>

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <AppHeader />
            <div className="flex items-center gap-4">
              <NotificationBell />
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <TopMenu />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
