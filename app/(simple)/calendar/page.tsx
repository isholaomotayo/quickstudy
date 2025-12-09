"use client";

import { Suspense } from "react";
import { CalendarClient } from "./calendar-client";
import { CalendarSkeleton } from "./loading";

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarClient />
    </Suspense>
  );
}
