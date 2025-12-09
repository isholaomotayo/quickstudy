"use client";

import {
  AlertCircle,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Eye,
  GraduationCap,
  Info,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarEvent {
  name: string;
  start_date: string;
  end_date: string;
  semester: number;
  holiday: boolean;
}

interface Semester {
  name: string;
  events: CalendarEvent[];
}

interface ParsedCalendarData {
  academic_year?: string;
  semesters?: Semester[];
  raw_text?: string;
  parsed_at?: string;
  fallback_used?: boolean;
}

interface ParsedCalendarViewProps {
  calendarData: ParsedCalendarData;
  institutionName: string;
}

export function ParsedCalendarView({
  calendarData,
  institutionName,
}: ParsedCalendarViewProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const getEventIcon = (event: CalendarEvent) => {
    if (event.holiday) return <Sun className="h-4 w-4" />;
    if (event.name.toLowerCase().includes("exam"))
      return <GraduationCap className="h-4 w-4" />;
    if (event.name.toLowerCase().includes("registration"))
      return <BookOpen className="h-4 w-4" />;
    if (event.name.toLowerCase().includes("resumption"))
      return <Calendar className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.holiday) return "bg-green-100 text-green-700 border-green-200";
    if (event.name.toLowerCase().includes("exam"))
      return "bg-red-100 text-red-700 border-red-200";
    if (event.name.toLowerCase().includes("registration"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (event.name.toLowerCase().includes("resumption"))
      return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  // Export Calendar Function
  const exportCalendar = () => {
    if (!calendarData.semesters || calendarData.semesters.length === 0) {
      alert("No calendar data to export");
      return;
    }

    // Create CSV content
    let csvContent = "Event Name,Start Date,End Date,Semester,Type\n";

    calendarData.semesters.forEach((semester) => {
      semester.events.forEach((event) => {
        const eventType = event.holiday ? "Holiday" : "Academic";
        csvContent += `"${event.name}","${event.start_date}","${event.end_date}","${semester.name}","${eventType}"\n`;
      });
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${institutionName}_Calendar_${
        calendarData.academic_year || "Academic_Year"
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add to Calendar Function
  const addToCalendar = () => {
    if (!calendarData.semesters || calendarData.semesters.length === 0) {
      alert("No calendar data to add");
      return;
    }

    // Create iCal content
    const icalContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//iLearn//Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${institutionName} Academic Calendar ${
        calendarData.academic_year || ""
      }`,
      `X-WR-CALDESC:Academic calendar for ${institutionName}`,
    ];

    calendarData.semesters.forEach((semester) => {
      semester.events.forEach((event, index) => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        // Format dates for iCal (YYYYMMDDTHHMMSSZ)
        const formatDateForIcal = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        };

        icalContent.push(
          "BEGIN:VEVENT",
          `UID:${institutionName.replace(/\s+/g, "")}_${semester.name.replace(
            /\s+/g,
            ""
          )}_${index}_${Date.now()}@ilearn.com`,
          `DTSTART:${formatDateForIcal(startDate)}`,
          `DTEND:${formatDateForIcal(endDate)}`,
          `SUMMARY:${event.name}`,
          `DESCRIPTION:${event.name} - ${semester.name}${
            event.holiday ? " (Holiday)" : ""
          }`,
          `CATEGORIES:${event.holiday ? "Holiday" : "Academic"}`,
          "END:VEVENT"
        );
      });
    });

    icalContent.push("END:VCALENDAR");

    // Create and download file
    const blob = new Blob([icalContent.join("\r\n")], {
      type: "text/calendar;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${institutionName}_Calendar_${
        calendarData.academic_year || "Academic_Year"
      }.ics`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allEvents =
    calendarData.semesters?.flatMap((semester) => semester.events) || [];
  const totalEvents = allEvents.length;
  const totalHolidays = allEvents.filter((event) => event.holiday).length;
  const totalExams = allEvents.filter((event) =>
    event.name.toLowerCase().includes("exam")
  ).length;
  const totalRegistration = allEvents.filter((event) =>
    event.name.toLowerCase().includes("registration")
  ).length;

  return (
    <div className="space-y-6">
      {/* Statistics and Quick Actions - Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Statistics Cards */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Calendar Statistics Academic Year: {calendarData.academic_year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {totalEvents}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Events
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {totalHolidays}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Holidays
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {totalExams}
                </div>
                <div className="text-sm text-gray-600 font-medium">Exams</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {totalRegistration}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Registration
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-12"
                onClick={exportCalendar}
                disabled={
                  !calendarData.semesters || calendarData.semesters.length === 0
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Export Calendar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12"
                onClick={addToCalendar}
                disabled={
                  !calendarData.semesters || calendarData.semesters.length === 0
                }
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semesters Display - Side by Side */}
      {calendarData.semesters && calendarData.semesters.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {calendarData.semesters.map((semester, semesterIndex) => (
            <Card
              key={`semester-${semester.name}-${semesterIndex}`}
              className="h-fit"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  {semester.name}
                  <Badge variant="secondary">
                    {semester.events.length} Events
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {semester.events.length > 0 ? (
                    semester.events.map((event, eventIndex) => {
                      const eventId = `${semesterIndex}-${eventIndex}`;
                      const isExpanded = expandedEvents.has(eventId);

                      return (
                        <div
                          key={`event-${event.name}-${event.start_date}-${eventIndex}`}
                          className="border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                        >
                          <button
                            type="button"
                            className="flex items-start gap-3 p-3 w-full text-left cursor-pointer"
                            onClick={() => toggleEventExpansion(eventId)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleEventExpansion(eventId);
                              }
                            }}
                          >
                            <div
                              className={`p-2 rounded-full ${getEventColor(
                                event
                              )}`}
                            >
                              {getEventIcon(event)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {event.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(event.start_date)}
                                      {event.start_date !== event.end_date && (
                                        <> - {formatDate(event.end_date)}</>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <Badge
                                    variant="outline"
                                    className={`${getEventColor(
                                      event
                                    )} text-xs`}
                                  >
                                    {event.holiday ? "Holiday" : "Academic"}
                                  </Badge>
                                  <div className="mt-1 p-1">
                                    {isExpanded ? (
                                      <ChevronUp className="h-3 w-3" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-3 pb-3 border-t bg-gray-50">
                              <div className="pt-3 space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="font-medium text-gray-700">
                                      Start:
                                    </span>
                                    <p className="text-gray-600">
                                      {formatDate(event.start_date)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">
                                      End:
                                    </span>
                                    <p className="text-gray-600">
                                      {formatDate(event.end_date)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Semester {event.semester}
                                  </Badge>
                                  {event.holiday && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-100 text-green-700 border-green-200 text-xs"
                                    >
                                      Holiday/Break
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No events in this semester</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Events Found
            </h3>
            <p className="text-gray-600">
              The calendar was parsed but no specific events could be extracted.
              You can still view the original PDF document.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
