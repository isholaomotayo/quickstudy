"use client";

import {
  ChevronDownIcon,
  LogOutIcon,
  UserIcon as ProfileIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/AppContext";

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
  showRole = true,
  customRole,
  customName,
}: UserProfileProps) {
  const { userData, isLoading, refreshUserData } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAttemptedRefresh = useRef(false);

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
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="text-sm text-gray-600">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          {showRole && (
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
          )}
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  // Show fallback if no user data
  if (!userData) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="text-sm text-gray-600">
          <span className="font-medium">GUEST USER</span>
          {showRole && (
            <div className="text-xs text-gray-500">Not logged in</div>
          )}
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-500 text-white font-medium text-sm">
            GU
          </AvatarFallback>
        </Avatar>
      </div>
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

  // Size classes for avatar
  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  // Text sizes
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "detailed") {
    return (
      <div className={`space-y-3 ${className}`}>
        <Avatar className={`${avatarSizes[size]} border-4 border-blue-100`}>
          <AvatarImage
            src={userData.avatar}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className={`${textSizes[size]} font-bold text-gray-900`}>
            {displayName.toUpperCase()}
          </h2>
          {showRole && displayRole && (
            <p className="text-sm text-gray-600 font-medium">{displayRole}</p>
          )}
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
      >
        <div className="text-sm text-gray-600">
          <span className="font-medium">{displayName.toUpperCase()}</span>
          {showRole && displayRole && (
            <div className="text-xs text-gray-500">{displayRole}</div>
          )}
        </div>
        <Avatar className={avatarSizes[size]}>
          <AvatarImage
            src={userData.avatar}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-medium text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="font-medium text-gray-900">{displayName}</div>
            {showRole && displayRole && (
              <div className="text-sm text-gray-500">{displayRole}</div>
            )}
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <ProfileIcon className="h-4 w-4" />
            Profile
          </Link>

          <Link
            href="/signin?logout=1"
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <LogOutIcon className="h-4 w-4" />
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}
