"use client";

import { Suspense } from "react";
import { CourseRegistrationClient } from "./course-registration-client";
import { CourseRegistrationSkeleton } from "./loading";

export default function CourseRegisterPage() {
  return (
    <Suspense fallback={<CourseRegistrationSkeleton />}>
      <CourseRegistrationClient />
    </Suspense>
  );
}
