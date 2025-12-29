import { Suspense } from "react";
import { ResultsClient } from "./results-client";
import ResultsSkeleton from "./loading";

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Academic Results
          </h1>
          <p className="text-muted-foreground">
            View your course results and learning assessments
          </p>
        </div>
      </div>

      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsClient />
      </Suspense>
    </div>
  );
}
