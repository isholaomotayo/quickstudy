import { BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "./button";

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
    <div className="flex items-center gap-3">
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      <Link href={homeLink} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30 border-2 border-primary/30 dark:border-primary/40">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div className="leading-tight">
          <p className="text-2xl font-bold text-foreground">QuickStudy</p>
          <p className="text-sm text-muted-foreground font-medium">
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
  );
}
