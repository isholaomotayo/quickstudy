"use client";

import {
  ChevronDownIcon,
  LogOutIcon,
  UserIcon as ProfileIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  className?: string;
  variant?: "compact" | "detailed";
  size?: "sm" | "md" | "lg";
  showRole?: boolean;
  customRole?: string; // Optional custom role override
  customName?: string; // Optional custom name override
}

export function UserProfile({
  className = "",
  variant = "compact",
  size = "sm",
  showRole = false,
  customRole,
  customName,
}: UserProfileProps) {
  const { userData, isLoading, refreshUserData } = useUser();
  const { clearAuthCookies } = useApp();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAttemptedRefresh = useRef(false);

  // Size classes for avatar and text (declared before usage)
  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Attempt to refresh user data once if not loaded
  useEffect(() => {
    if (!userData && !isLoading && !hasAttemptedRefresh.current) {
      hasAttemptedRefresh.current = true;
      refreshUserData();
    }
  }, [userData, isLoading, refreshUserData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if we should attempt to refresh user data
  useEffect(() => {
    const checkForUserData = () => {
      // If we're not loading, don't have user data, and haven't attempted refresh yet
      if (!isLoading && !userData && !hasAttemptedRefresh.current) {
        // Check if there are any auth cookies present
        const hasAuthCookies =
          document.cookie.includes("token=") ||
          document.cookie.includes("userData=") ||
          document.cookie.includes("role=");

        if (hasAuthCookies) {
          hasAttemptedRefresh.current = true;

          refreshUserData();
        }
      }
    };

    // Check immediately
    checkForUserData();

    // Also check after a short delay to handle race conditions
    const timer = setTimeout(checkForUserData, 500);

    return () => clearTimeout(timer);
  }, [isLoading, userData, refreshUserData]);

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "h-10 w-10 rounded-full bg-muted animate-pulse",
          className
        )}
      />
    );
  }

  // Show fallback if no user data
  if (!userData) {
    // Show loading state if still loading or if we haven't attempted refresh yet
    if (isLoading || !hasAttemptedRefresh.current) {
      return (
        <div
          className={cn(
            "h-10 w-10 rounded-full bg-muted animate-pulse",
            className
          )}
        />
      );
    }

    // Show default avatar if no user data after refresh attempt
    return (
      <Avatar className={cn(avatarSizes[size], className)}>
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
          GU
        </AvatarFallback>
      </Avatar>
    );
  }

  // Generate initials from name
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  // Use custom name/role if provided, otherwise use userData
  const displayName =
    customName || `${userData.first_name} ${userData.last_name}`;
  const displayRole = customRole || userData.role;

  const initials = getInitials(displayName);

  if (variant === "detailed") {
    return (
      <div className={`space-y-3 ${className}`}>
        <Avatar className={cn(avatarSizes[size], "border-4 border-primary/10")}>
          <AvatarImage
            src={userData.avatar}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className={`${textSizes[size]} font-bold text-foreground`}>
            {displayName.toUpperCase()}
          </h2>
          {showRole && displayRole && (
            <p className="text-sm text-muted-foreground font-medium">
              {displayRole}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-1.5 py-1 shadow-sm transition-colors hover:border-primary/50"
      >
        <Avatar className={cn(avatarSizes[size], "bg-muted/60")}>
          <AvatarImage
            src={userData.avatar}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg z-50">
          <div className="px-4 py-2 border-b border-border/60">
            <div className="font-medium text-foreground">{displayName}</div>
            {showRole && displayRole && (
              <div className="text-sm text-muted-foreground">{displayRole}</div>
            )}
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <ProfileIcon className="h-4 w-4" />
            Profile
          </Link>

          <button
            onClick={async () => {
              setIsDropdownOpen(false);
              await clearAuthCookies();
              router.push("/signin?logout=1");
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOutIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
