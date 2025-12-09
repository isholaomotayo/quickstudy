"use client";

import { Suspense } from "react";
import NotificationsClient from "./notifications-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Notifications
        </h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with the latest announcements and important information from your institution.
        </p>
      </div>

      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsClient />
      </Suspense>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-6 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}