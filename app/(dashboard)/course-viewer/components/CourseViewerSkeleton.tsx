import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CourseViewerSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar Skeleton */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          {/* Progress Section */}
          <div className="mb-8">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-2 w-full mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Lessons List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-6 w-8" />
            </div>

            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-8">
              {/* Lesson Header */}
              <div className="mb-8">
                <Skeleton className="h-8 w-96 mb-4" />
                <Skeleton className="h-4 w-48" />
              </div>

              {/* Lesson Content */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Video/Media Placeholder */}
              <div className="my-8">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>

              {/* More Content */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>

          {/* Footer Navigation */}
          <div className="mt-6 flex justify-between items-center">
            <Skeleton className="h-12 w-32" />
            <div className="flex space-x-3">
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
