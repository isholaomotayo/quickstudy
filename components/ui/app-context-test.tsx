"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";

export function AppContextTest() {
  const { userData, isLoading, refreshUserData, count, setCount } = useApp();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>AppContext Test</CardTitle>
        <CardDescription>
          Testing the AppContext integration with userData cookies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading State */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Loading State:</span>
          <Badge variant={isLoading ? "default" : "secondary"}>
            {isLoading ? "Loading..." : "Loaded"}
          </Badge>
        </div>

        {/* User Data Display */}
        <div className="space-y-2">
          <span className="text-sm font-medium">User Data:</span>
          {userData ? (
            <div className="text-sm space-y-1 p-3 bg-gray-50 rounded-md">
              <p>
                <strong>ID:</strong> {userData.id}
              </p>
              <p>
                <strong>Name:</strong> {userData.first_name}{" "}
                {userData.last_name}
              </p>
              <p>
                <strong>Email:</strong> {userData.email}
              </p>
              <p>
                <strong>Role:</strong> {userData.role}
              </p>
              <p>
                <strong>Institution ID:</strong> {userData.institution_id}
              </p>
              {userData.student_id && (
                <p>
                  <strong>Student ID:</strong> {userData.student_id}
                </p>
              )}
              {userData.staff_id && (
                <p>
                  <strong>Staff ID:</strong> {userData.staff_id}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No user data available</p>
          )}
        </div>

        {/* Counter Test */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Counter: {count}</span>
          <Button onClick={() => setCount(count + 1)} size="sm">
            Increment
          </Button>
          <Button
            onClick={() => setCount(count - 1)}
            size="sm"
            variant="outline"
          >
            Decrement
          </Button>
        </div>

        {/* Refresh Button */}
        <div>
          <Button onClick={refreshUserData} variant="outline" size="sm">
            Refresh User Data
          </Button>
        </div>

        {/* Raw Cookie Data */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Raw Cookie Data:</span>
          <div className="text-xs p-2 bg-gray-100 rounded font-mono overflow-x-auto">
            {typeof document !== "undefined"
              ? document.cookie
              : "Server side - no cookies"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
