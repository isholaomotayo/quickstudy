"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  Calendar,
  CreditCard,
  LogOut,
  NotebookTabs,
  Users,
  Bell,
  LucideIcon,
  TrendingUp,
  MessageSquare,
  Globe,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface TopMenuProps {
  navigation?: NavigationItem[];
}
const defaultNavigation: NavigationItem[] = [
  {
    href: "/courses",
    label: "Courses",
    icon: BookOpen,
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/results",
    label: "Results",
    icon: Award,
  },
  {
    href: "/cgpa",
    label: "CGPA",
    icon: TrendingUp,
  },
  {
    href: "/payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
  },
  {
    href: "/course-register",
    label: "Course Registration",
    icon: NotebookTabs,
  },
  {
    href: "/connect",
    label: "Connect",
    icon: MessageSquare,
  },
  {
    href: "/oer",
    label: "OER",
    icon: Globe,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: Users,
  },
  {
    href: "/signin?logout=1",
    label: "Logout",
    icon: LogOut,
  },
];
export function TopMenu(
  { navigation = defaultNavigation }: TopMenuProps = {
    navigation: defaultNavigation,
  }
) {
  const pathname = usePathname();

  // Find the best matching navigation item
  const findBestMatch = (): string | null => {
    if (!pathname) return null;

    // First, look for exact matches
    const exactMatch = navigation.find((item) => pathname === item.href);
    if (exactMatch) return exactMatch.href;

    // Then look for the most specific partial match
    let bestMatch: string | null = null;
    let bestScore = 0;

    navigation.forEach((item) => {
      if (item.href === "/") return; // Skip home

      const hrefKey = item.href.replace("/", "");
      const pathnameKey = pathname.replace("/", "");

      // Check if pathname contains href key
      if (pathname.includes(hrefKey)) {
        const score = hrefKey.length; // Longer href = more specific
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item.href;
        }
      }

      // Check if href contains pathname key (for singular/plural cases)
      if (hrefKey.includes(pathnameKey)) {
        const score = pathnameKey.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item.href;
        }
      }

      // Handle hyphenated pathnames
      if (pathnameKey.includes("-")) {
        const pathnameFirstPart = pathnameKey.split("-")[0];
        if (
          hrefKey === pathnameFirstPart ||
          hrefKey.includes(pathnameFirstPart)
        ) {
          const score = pathnameFirstPart.length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = item.href;
          }
        }
      }
    });

    return bestMatch;
  };

  const activeHref = findBestMatch();

  const isActive = (href: string) => {
    return activeHref === href;
  };

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-6 overflow-x-auto">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
