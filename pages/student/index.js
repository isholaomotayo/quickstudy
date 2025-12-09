import { useEffect } from "react";
import { useRouter } from "next/router";
// Redirect component to move users to the new app router
function StudentHomepage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new app router location
    router.replace("/students");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
}

export default StudentHomepage;
