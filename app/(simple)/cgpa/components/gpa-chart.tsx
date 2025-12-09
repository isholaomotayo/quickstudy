"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface StudentGpa {
  id: number;
  semester?: {
    id: number;
    name: string;
  };
  level?: {
    id: number;
    name: string;
  };
  current_gpa: number;
  cumulative_gpa: number;
}

interface GpaChartProps {
  studentGpas: StudentGpa[];
}

export function GpaChart({ studentGpas }: GpaChartProps) {
  const chartData = useMemo(() => {
    if (!studentGpas || studentGpas.length === 0) return [];
    
    return studentGpas.map((gpa, index) => ({
      semester: gpa.semester?.name || `Semester ${index + 1}`,
      level: gpa.level?.name || "N/A",
      currentGpa: parseFloat(gpa.current_gpa.toString()) || 0,
      cumulativeGpa: parseFloat(gpa.cumulative_gpa.toString()) || 0,
    }));
  }, [studentGpas]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            GPA Trend Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No GPA data available for chart visualization</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxGpa = Math.max(...chartData.map(d => Math.max(d.currentGpa, d.cumulativeGpa)));
  const minGpa = Math.min(...chartData.map(d => Math.min(d.currentGpa, d.cumulativeGpa)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          GPA Trend Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Current GPA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Cumulative GPA</span>
            </div>
          </div>

          {/* Chart Bars */}
          <div className="space-y-3">
            {chartData.map((data, index) => {
              const currentGpaHeight = (data.currentGpa / maxGpa) * 100;
              const cumulativeGpaHeight = (data.cumulativeGpa / maxGpa) * 100;
              
              return (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1 text-xs text-gray-600 min-w-0">
                    <div className="truncate">{data.semester}</div>
                    <div className="text-xs text-gray-400">{data.level}</div>
                  </div>
                  
                  <div className="flex items-end gap-1 h-20">
                    {/* Current GPA Bar */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-4 bg-blue-500 rounded-t transition-all duration-300"
                        style={{ height: `${currentGpaHeight}%` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-1">
                        {data.currentGpa.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Cumulative GPA Bar */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-4 bg-green-500 rounded-t transition-all duration-300"
                        style={{ height: `${cumulativeGpaHeight}%` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-1">
                        {data.cumulativeGpa.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GPA Scale */}
          <div className="flex justify-between text-xs text-gray-500 mt-4">
            <span>0.0</span>
            <span>{(maxGpa / 2).toFixed(1)}</span>
            <span>{maxGpa.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
