import { Suspense } from "react";
import { ResultsClient } from "@/app/(dashboard)/results/results-client";
import ResultsSkeleton from "@/app/(dashboard)/results/loading";
import { CgpaClient } from "./cgpa-client";
import CgpaLoading from "./cgpa-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, TrendingUp } from "lucide-react";

interface ResultsPageProps {
  searchParams: { tab?: string };
}

export default function ResultsPage({ searchParams }: ResultsPageProps) {
  const defaultTab = searchParams.tab === "cgpa" ? "cgpa" : "results";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Results & CGPA
          </h1>
          <p className="text-muted-foreground">
            View your course results, learning assessments, and GPA records
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Results</span>
          </TabsTrigger>
          <TabsTrigger value="cgpa" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>CGPA</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <Suspense fallback={<ResultsSkeleton />}>
            <ResultsClient />
          </Suspense>
        </TabsContent>

        <TabsContent value="cgpa" className="space-y-4">
          <Suspense fallback={<CgpaLoading />}>
            <CgpaClient />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
