"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Clock, TrendingUp } from "lucide-react";

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDuration: number;
  averageDuration: number;
  slowRequests: any[];
  duplicateRequests: number;
  totalRequestSize: number;
  totalResponseSize: number;
}

interface RequestLog {
  method: string;
  endpoint: string;
  timestamp: number;
  duration?: number;
  status?: number;
  statusText?: string;
  error?: string;
  requestSize?: number;
  responseSize?: number;
  cached?: boolean;
}

export function ApiMetricsPanel() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<RequestLog[]>([]);
  const [slowRequests, setSlowRequests] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/metrics");
      if (!response.ok) throw new Error("Failed to fetch metrics");
      
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data.metrics);
        setRecentLogs(data.data.recentLogs);
        setSlowRequests(data.data.slowRequests);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !metrics) {
    return <div>Loading metrics...</div>;
  }

  if (!metrics) {
    return <div>No metrics available</div>;
  }

  const successRate = metrics.totalRequests > 0
    ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)
    : "0";

  const duplicateRate = metrics.totalRequests > 0
    ? ((metrics.duplicateRequests / metrics.totalRequests) * 100).toFixed(1)
    : "0";

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API Performance Metrics</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.successfulRequests} successful, {metrics.failedRequests} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.successfulRequests} / {metrics.totalRequests}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.averageDuration)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.slowRequests.length} slow requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Duplicates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duplicateRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.duplicateRequests} duplicate requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Transfer */}
      <Card>
        <CardHeader>
          <CardTitle>Data Transfer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Request Size</p>
              <p className="text-lg font-semibold">{formatBytes(metrics.totalRequestSize)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Response Size</p>
              <p className="text-lg font-semibold">{formatBytes(metrics.totalResponseSize)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slow Requests */}
      {slowRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Slow Requests ({slowRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {slowRequests.slice(-10).map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded"
                >
                  <div className="flex-1">
                    <p className="font-mono text-sm">
                      {log.method} {log.endpoint}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()} - {formatDuration(log.duration || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                      {log.status || "ERROR"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests (Last 20)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {recentLogs.slice(0, 20).map((log, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  log.error || (log.status && log.status >= 400)
                    ? "bg-red-50 dark:bg-red-900/20"
                    : log.cached
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-gray-50 dark:bg-gray-900/20"
                }`}
              >
                <div className="flex-1 font-mono">
                  <span className="font-semibold">{log.method}</span> {log.endpoint}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  {log.duration && (
                    <span className={log.duration > 1000 ? "text-yellow-600 font-semibold" : ""}>
                      {formatDuration(log.duration)}
                    </span>
                  )}
                  {log.status && (
                    <span
                      className={
                        log.status >= 400
                          ? "text-red-600 font-semibold"
                          : log.status >= 300
                          ? "text-yellow-600"
                          : "text-green-600"
                      }
                    >
                      {log.status}
                    </span>
                  )}
                  {log.cached && (
                    <span className="text-blue-600 text-xs">CACHED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

