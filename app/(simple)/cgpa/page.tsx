import { redirect } from "next/navigation";

export default async function CgpaPage() {
  // Redirect to merged Results & CGPA page with CGPA tab active
  redirect("/results?tab=cgpa");
}
