import { Suspense } from "react";
import { notFound } from "next/navigation";
import PracticeTestClient from "@/components/practice-test/PracticeTestClient";
import { Card, CardContent } from "@/components/ui/card";

interface PracticeTestPageProps {
  searchParams: Promise<{
    lesson_id?: string;
    lessonId?: string;
    difficulty?: "easy" | "medium" | "hard";
    question_count?: string;
    question_types?: string; // comma-separated
    retake?: string;
  }>;
}

function PracticeTestSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practice test...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function PracticeTestPage({
  searchParams,
}: PracticeTestPageProps) {
  const params = await searchParams;
  const lessonId = params.lesson_id || params.lessonId;

  if (!lessonId) {
    notFound();
  }

  const practiceConfig = {
    lessonId: parseInt(lessonId),
    difficulty: params.difficulty || "medium",
    questionCount: parseInt(params.question_count || "5"),
    questionTypes: params.question_types
      ? (params.question_types.split(",") as (
          | "multiple_choice"
          | "true_false"
        )[])
      : ["multiple_choice" as const],
    retake: params.retake === "true",
  };

  return (
    <Suspense fallback={<PracticeTestSkeleton />}>
      <PracticeTestClient config={practiceConfig} />
    </Suspense>
  );
}

export async function generateMetadata({
  searchParams,
}: PracticeTestPageProps) {
  const params = await Promise.resolve(searchParams);
  const lessonId = params.lesson_id;

  if (!lessonId) {
    return {
      title: "Practice Test - iLearn",
    };
  }

  return {
    title: "AI Practice Test - iLearn",
    description: "AI-generated practice questions to reinforce your learning",
  };
}
