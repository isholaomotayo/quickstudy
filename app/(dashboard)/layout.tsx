"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import AppHeader from "@/components/ui/app-header";
import { NotificationBell } from "@/components/ui/notification-bell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useApp } from "@/contexts/AppContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Globe, NotebookTabs, LogOut, User, Award, TrendingUp, CreditCard, MessageSquare, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/useUserData";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { userData, isLoading, refreshUserData, clearAuthCookies } = useApp();
  const { userData: user } = useUserData();
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user initials
  const getInitials = () => {
    if (!user) return "ST";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "ST";
  };

  const initials = getInitials();

  // Navigation items for the top bar - ordered by importance
  const navItems = [
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/course-register", label: "Registration", icon: NotebookTabs },
    { href: "/results", label: "Results & CGPA", icon: Award },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/connect", label: "Connect", icon: MessageSquare },
    { href: "/oer", label: "OER", icon: Globe },
  ];

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await clearAuthCookies();
    router.push("/signin?logout=1");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-400/5 dark:from-primary/10 dark:via-background dark:to-primary/10" />
        <div className="absolute -left-24 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
        <div className="absolute -right-32 -bottom-24 h-80 w-80 rounded-full bg-emerald-400/12 blur-[120px] dark:bg-emerald-300/15" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <AppHeader showBackButton={false} />
            
            {/* Right side navigation container */}
            <div className="flex items-center gap-1 p-1.5 bg-muted/50 dark:bg-muted/30 rounded-full border border-border/50">
              {/* Navigation items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/") || 
                  (item.href === "/results" && (pathname === "/cgpa" || pathname?.startsWith("/cgpa/")));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted/70 dark:hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Separator */}
              <div className="w-[1px] h-6 bg-border/50 mx-1" />
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notification Bell */}
              <NotificationBell />
              
              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 ml-1 bg-background dark:bg-card rounded-full border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs font-semibold px-2 text-foreground">{initials}</span>
                  <div className="relative w-8 h-8">
                    <img
                      src={user?.avatar || "/images/avatar.png"}
                      alt={user?.first_name || "User"}
                      className="w-8 h-8 rounded-full border border-border/50 object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          target.style.display = "none";
                          fallback.style.display = "flex";
                        }
                      }}
                    />
                    <div
                      className="w-8 h-8 rounded-full border border-border/50 bg-primary/10 text-primary font-semibold text-xs items-center justify-center hidden"
                    >
                      {initials}
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg z-50">
                    <div className="px-4 py-2 border-b border-border/60">
                      <div className="font-medium text-foreground">
                        {user?.first_name} {user?.last_name}
                      </div>
                      {user?.role && (
                        <div className="text-sm text-muted-foreground">{user.role}</div>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    <Link
                      href="/help"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Support
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </main>
    </div>
  );
}
