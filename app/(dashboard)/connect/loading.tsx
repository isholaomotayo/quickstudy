import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

export default function ForumLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Navigation Skeleton */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          {/* Tabs Skeleton */}
          <div className="flex space-x-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>
          
          {/* Description Skeleton */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Search and Filters Skeleton */}
      <GlassCard className="p-4">
        <div className="space-y-4">
          {/* Search Bar Skeleton */}
          <Skeleton className="h-12 w-full" />
          
          {/* Filter Buttons Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          </div>

          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/30">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Sort Controls Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Forum Posts Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <GlassCard key={i} className="p-6">
            <div className="space-y-4">
              {/* Post Header Skeleton */}
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    {Math.random() > 0.7 && <Skeleton className="h-5 w-20 rounded-full" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="w-1 h-1 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8" />
              </div>

              {/* Post Title and Content Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>

              {/* Time-bound Discussion Skeleton (random) */}
              {Math.random() > 0.6 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Skeleton (random) */}
              {Math.random() > 0.5 && (
                <div className="flex flex-wrap gap-2">
                  {[...Array(Math.floor(Math.random() * 4) + 1)].map((_, tagIndex) => (
                    <Skeleton key={tagIndex} className="h-5 w-16 rounded-full" />
                  ))}
                </div>
              )}

              {/* Post Actions Skeleton */}
              <div className="flex items-center justify-between pt-2 border-t border-white/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-6" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[...Array(3)].map((_, actionIndex) => (
                    <Skeleton key={actionIndex} className="w-8 h-8" />
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Load More Button Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}