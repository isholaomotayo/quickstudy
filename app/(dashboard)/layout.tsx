"use client";

import {
  BarChart3,
  BookOpen,
  Bell,
  Calendar,
  CreditCard,
  Eye,
  FileText,
  HelpCircle,
  LogOut,
  NotebookTabs,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";
import AppHeader from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/ui/user-profile";
import { NotificationBell } from "@/components/ui/notification-bell";
import { TopMenu, NavigationItem } from "@/components/ui/top-menu";
import { useApp } from "@/contexts/AppContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { userData, isLoading, refreshUserData } = useApp();

  // Refresh user data when dashboard loads if no user data is available
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <AppHeader showBackButton={false} />
            <div className="flex items-center gap-3">
              <NotificationBell />

              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <TopMenu />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
