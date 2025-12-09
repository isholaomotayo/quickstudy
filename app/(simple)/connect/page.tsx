"use client";

import { Suspense } from "react";
import ForumClient from "./forum-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConnectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Connect & Collaborate
        </h1>
        <p className="text-muted-foreground mt-2">
          Join discussions, ask questions, and collaborate with your peers and faculty.
        </p>
      </div>

      <Suspense fallback={<ForumSkeleton />}>
        <ForumClient />
      </Suspense>
    </div>
  );
}

function ForumSkeleton() {
  return (
    <div className="space-y-6">
      {/* Navigation Tabs Skeleton */}
      <div className="flex space-x-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>
      
      {/* Search Bar Skeleton */}
      <Skeleton className="h-12 w-full" />
      
      {/* Forum Posts Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}