import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CgpaClient } from "./cgpa-client";
import { CgpaLoading } from "./loading";
import { CgpaError } from "./error";

export default async function CgpaPage() {
  const cookieStore = await cookies();

  // Get auth data from cookies
  const token = cookieStore.get("token")?.value || "";
  const role = cookieStore.get("role")?.value || "";
  const userId = cookieStore.get("userId")?.value || "0";
  const userDataCookie = cookieStore.get("userData")?.value || "{}";

  let userData = {};
  try {
    userData = JSON.parse(decodeURIComponent(userDataCookie));
  } catch (e) {
    console.error("Error parsing userData cookie:", e);
  }

  // Check authorization - only students can access CGPA
  if (!role || role !== "STUDENT") {
    redirect("/signin?logout=1");
  }

  return (
    <Suspense fallback={<CgpaLoading />}>
      <CgpaClient
        token={token}
        role={role}
        userId={userId}
        userData={userData}
      />
    </Suspense>
  );
}
