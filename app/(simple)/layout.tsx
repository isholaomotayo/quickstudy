"use client";

import { ReactNode } from "react";
import { useEffect } from "react";
import AppHeader from "@/components/ui/app-header";
import { UserProfile } from "@/components/ui/user-profile";
import { NotificationBell } from "@/components/ui/notification-bell";
import { TopMenu, NavigationItem } from "@/components/ui/top-menu";
import { useApp } from "@/contexts/AppContext";
import {
  BookOpen,
  Calendar,
  CreditCard,
  TrendingUp,
  BarChart3,
  Users,
  NotebookTabs,
  LogOut,
  Bell,
  Award,
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
