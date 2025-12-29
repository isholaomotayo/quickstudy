import { ChevronLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "./button";
import { Badge } from "./badge";
import { ThemeToggle } from "./theme-toggle";

export default function AppHeader({
  title,
  showBackButton = true,
}: {
  title?: React.ReactNode;
  showBackButton?: boolean;
}) {
  const { userData } = useUserData();
  const router = useRouter();

  const getHomeLink = () => {
    if (!userData) return "/";

    const role = userData.role;

    if (role === "STUDENT") return "/students";
    if (role === "STAFF" || role === "LECTURER") return "/staff";
    if (role === "ADMIN" || role === "SUPERADMIN") return "/admin";
    if (role === "APPLICANT") return "/applicant";
    if (role === "AFFILIATE") return "/affiliate";
    if (role === "HOD") return "/admin"; // HOD redirects to admin dashboard

    return "/"; // Default fallback
  };

  const homeLink = getHomeLink();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          )}

          <Link href={homeLink} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">QuickStudy</p>
              <p className="text-xs text-muted-foreground">
                Focused learning, simplified.
              </p>
            </div>
          </Link>

          {title && (
            <div className="flex items-center gap-2 border-l border-border/70 pl-3 text-sm font-medium text-foreground">
              {title}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {userData?.role && (
            <Badge variant="outline" className="border-border text-foreground">
              {userData.role}
            </Badge>
          )}
 
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
