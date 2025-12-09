import { ChevronLeft, GraduationCap } from "lucide-react";
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
  return (
    <div className="flex items-center space-x-4">
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
      {title ? (
        title
      ) : (
        <>
          <Link href={getHomeLink()}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HyperLearn Portal
          </h1>
        </>
      )}
    </div>
  );
}
