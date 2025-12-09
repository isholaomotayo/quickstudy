"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  Users,
  BookOpen,
  DollarSign,
  GraduationCap,
  PieChart,
  LineChart,
  FileText,
  Activity,
  Target,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useInstitutionId } from "@/hooks/useInstitutionId";

// Helper functions for CSV export
const convertToCSV = (data: any) => {
  if (!data || typeof data !== "object") return "";

  const flattenObject = (obj: any, prefix = ""): any => {
    let flattened: any = {};
    for (const key in obj) {
      if (
        obj[key] !== null &&
        typeof obj[key] === "object" &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}_`));
      } else {
        flattened[`${prefix}${key}`] = obj[key];
      }
    }
    return flattened;
  };

  const flattened = flattenObject(data);
  const headers = Object.keys(flattened);
  const values = Object.values(flattened);

  return [headers.join(","), values.join(",")].join("\n");
};

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default function ReportsAnalytics() {
  const [reportType, setReportType] = useState<string>("academic");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const institutionId = useInstitutionId();

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/analytics?institutionId=${institutionId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch report data
  const fetchReportData = async (type: string, format: string = "json") => {
    try {
      const response = await fetch(
        `/api/reports?institutionId=${institutionId}&type=${type}&format=${format}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      if (format === "csv") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const csv = convertToCSV(data);
        downloadCSV(csv, `${type}-report.csv`);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type} report:`, err);
      alert(`Failed to generate ${type} report`);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [institutionId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-gray-600">
            Comprehensive reports and data insights for institutional management
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchAnalyticsData}
            disabled={isLoading}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button onClick={() => fetchReportData("academic")}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <Target className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : analyticsData?.summary?.totalApplications?.toLocaleString() ||
                  "0"}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {isLoading
                ? "..."
                : `${
                    analyticsData?.summary?.conversionRate || 0
                  }% conversion rate`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Admitted Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : analyticsData?.summary?.admittedStudents?.toLocaleString() ||
                  "0"}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {isLoading
                ? "..."
                : `${
                    analyticsData?.summary?.acceptanceRate || 0
                  }% acceptance rate`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : `₦${(
                    (analyticsData?.financial?.totalRevenue || 0) / 1000000
                  ).toFixed(1)}M`}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {isLoading
                ? "..."
                : `${
                    analyticsData?.financial?.paymentCount || 0
                  } payments processed`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : `${analyticsData?.summary?.completionRate || 0}%`}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {isLoading
                ? "..."
                : `${
                    analyticsData?.summary?.completedApplications || 0
                  } completed applications`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Academic Reports
            </CardTitle>
            <CardDescription>
              Student performance and academic metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Grade Distribution</p>
                  <p className="text-sm text-gray-500">
                    Student performance analysis
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReportData("academic")}
              >
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Performance Report</p>
                  <p className="text-sm text-gray-500">
                    Academic performance metrics
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReportData("performance")}
              >
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Enrollment Report</p>
                  <p className="text-sm text-gray-500">
                    Student enrollment trends
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReportData("enrollment")}
              >
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Reports
            </CardTitle>
            <CardDescription>
              Revenue, expenses, and financial metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Revenue Report</p>
                  <p className="text-sm text-gray-500">
                    Income and revenue analysis
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReportData("financial")}
              >
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Payment Analysis</p>
                  <p className="text-sm text-gray-500">
                    Payment processing metrics
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReportData("financial")}
              >
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Fee Breakdown</p>
                  <p className="text-sm text-gray-500">
                    Fee structure analysis
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReportData("financial")}
              >
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Operational Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Operational Reports
            </CardTitle>
            <CardDescription>
              System usage and operational metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">User Activity</p>
                  <p className="text-sm text-gray-500">System usage patterns</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReportData("academic")}
              >
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Application Trends</p>
                  <p className="text-sm text-gray-500">Application patterns</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReportData("enrollment")}
              >
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <LineChart className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Analytics Summary</p>
                  <p className="text-sm text-gray-500">
                    Comprehensive analytics
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReportData("academic")}
              >
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            Key performance indicators and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Application Status */}
            <div className="space-y-4">
              <h3 className="font-medium">Application Status</h3>
              <div className="space-y-2">
                {isLoading ? (
                  <div>Loading...</div>
                ) : analyticsData?.summary ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Ongoing</span>
                        <span className="font-medium">
                          {analyticsData.summary.ongoingApplications}
                        </span>
                      </div>
                      <Progress
                        value={
                          analyticsData.summary.totalApplications > 0
                            ? (analyticsData.summary.ongoingApplications /
                                analyticsData.summary.totalApplications) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completed</span>
                        <span className="font-medium">
                          {analyticsData.summary.completedApplications}
                        </span>
                      </div>
                      <Progress
                        value={
                          analyticsData.summary.totalApplications > 0
                            ? (analyticsData.summary.completedApplications /
                                analyticsData.summary.totalApplications) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Admitted</span>
                        <span className="font-medium">
                          {analyticsData.summary.admittedStudents}
                        </span>
                      </div>
                      <Progress
                        value={
                          analyticsData.summary.totalApplications > 0
                            ? (analyticsData.summary.admittedStudents /
                                analyticsData.summary.totalApplications) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    No application data available
                  </div>
                )}
              </div>
            </div>

            {/* Programme Distribution */}
            <div className="space-y-4">
              <h3 className="font-medium">Programme Distribution</h3>
              <div className="space-y-2">
                {isLoading ? (
                  <div>Loading...</div>
                ) : analyticsData?.distributions?.programmes ? (
                  Object.entries(analyticsData.distributions.programmes)
                    .slice(0, 3)
                    .map(([programme, count]) => (
                      <div key={programme}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm truncate">{programme}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                        <Progress
                          value={
                            analyticsData.summary.totalApplications > 0
                              ? ((count as number) /
                                  analyticsData.summary.totalApplications) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    ))
                ) : (
                  <div className="text-sm text-gray-500">
                    No programme data available
                  </div>
                )}
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="space-y-4">
              <h3 className="font-medium">Gender Distribution</h3>
              <div className="space-y-2">
                {isLoading ? (
                  <div>Loading...</div>
                ) : analyticsData?.demographics?.gender ? (
                  Object.entries(analyticsData.demographics.gender).map(
                    ([gender, count]) => (
                      <div key={gender}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{gender}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                        <Progress
                          value={
                            analyticsData.summary.totalApplications > 0
                              ? ((count as number) /
                                  analyticsData.summary.totalApplications) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    )
                  )
                ) : (
                  <div className="text-sm text-gray-500">
                    No gender data available
                  </div>
                )}
              </div>
            </div>

            {/* Age Distribution */}
            <div className="space-y-4">
              <h3 className="font-medium">Age Distribution</h3>
              <div className="space-y-2">
                {isLoading ? (
                  <div>Loading...</div>
                ) : analyticsData?.demographics?.ageGroups ? (
                  Object.entries(analyticsData.demographics.ageGroups).map(
                    ([ageGroup, count]) => (
                      <div key={ageGroup}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{ageGroup}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                        <Progress
                          value={
                            analyticsData.summary.totalApplications > 0
                              ? ((count as number) /
                                  analyticsData.summary.totalApplications) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    )
                  )
                ) : (
                  <div className="text-sm text-gray-500">
                    No age data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Generate and export reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2"
              onClick={() => fetchReportData("academic")}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Academic Report</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2"
              onClick={() => fetchReportData("performance")}
            >
              <Award className="h-6 w-6" />
              <span className="text-sm">Performance Report</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2"
              onClick={() => fetchReportData("enrollment")}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Enrollment Report</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2"
              onClick={() => fetchReportData("financial")}
            >
              <DollarSign className="h-6 w-6" />
              <span className="text-sm">Financial Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
