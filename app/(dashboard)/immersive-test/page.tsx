import { Suspense } from "react";
import { notFound } from "next/navigation";
import ImmersiveTestClient from "@/components/immersive-test/ImmersiveTestClient";
import ImmersiveTestSkeleton from "@/components/immersive-test/ImmersiveTestSkeleton";

interface ImmersiveTestPageProps {
  searchParams: Promise<{
    course_test_id?: string;
  }>;
}

export default async function ImmersiveTestPage({
  searchParams,
}: ImmersiveTestPageProps) {
  const params = await searchParams;
  const courseTestId = params.course_test_id;

  if (!courseTestId) {
    notFound();
  }

  return (
    <Suspense fallback={<ImmersiveTestSkeleton />}>
      <ImmersiveTestClient courseTestId={courseTestId} />
    </Suspense>
  );
}

export async function generateMetadata({
  searchParams,
}: ImmersiveTestPageProps) {
  const params = await Promise.resolve(searchParams);
  const courseTestId = params.course_test_id;

  if (!courseTestId) {
    return {
      title: "Immersive Test - quickStudy",
    };
  }

  return {
    title: "Immersive Test - quickStudy",
    description: "Interactive test experience with enhanced UI",
  };
}
