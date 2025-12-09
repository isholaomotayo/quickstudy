"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface FutureStudentLandingProps {
  studentName: string;
  admittedSession: {
    name: string;
    start_date: string;
  };
}

export default function FutureStudentLanding({
  studentName,
  admittedSession,
}: FutureStudentLandingProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {studentName}!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Your admission to the <strong>{admittedSession.name}</strong>{" "}
            session is confirmed.
          </p>
          <p className="text-muted-foreground">
            Your academic activities will commence soon. Please check back on or
            after the session start date.
          </p>
          <div className="flex items-center justify-center gap-4 text-lg font-semibold text-primary">
            <Calendar className="h-6 w-6" />
            <span>
              Session Starts:{" "}
              {new Date(admittedSession.start_date).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </span>
          </div>
          <Clock className="h-12 w-12 mx-auto text-gray-400 mt-6" />
        </CardContent>
      </Card>
    </div>
  );
}
