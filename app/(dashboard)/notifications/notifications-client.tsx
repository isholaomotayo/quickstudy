"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/AppContext";
import { NotificationCard } from "./notification-card";
import { NotificationFilters } from "./notification-filters";
import { CreateAnnouncementDialog } from "./create-announcement-dialog";
import { EditAnnouncementDialog } from "./edit-announcement-dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Bell,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
  };
  read?: boolean;
}

interface NotificationStats {
  total: number;
  unread: number;
  thisWeek: number;
}

interface PaginationData {
  page: number;
  pageSize: number;
  pageCount: number;
  rowCount: number;
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [totalStats, setTotalStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    thisWeek: 0,
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<{
    id: number;
    title: string;
    body: string;
  } | null>(null);
  const { userData } = useUser();

  const fetchNotifications = async (page = currentPage, resetData = false) => {
    if (!userData) {
      setError("Please log in to view notifications");
      setLoading(false);
      return;
    }

    if (resetData) {
      setLoading(true);
      setCurrentPage(1);
      page = 1;
    }

    setError(null);

    try {
      let response;

      if (searchQuery.trim()) {
        // Use search endpoint for search queries
        const searchParams = new URLSearchParams({
          query: searchQuery.trim(),
          pgsize: pageSize.toString(),
          pg: page.toString(),
        });

        response = await fetch(
          `/api/schoolAnnouncement/search?${searchParams}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Cookie: document.cookie,
            },
          }
        );
      } else {
        // Use main endpoint for regular listing with pagination
        const params = new URLSearchParams({
          pgsize: pageSize.toString(),
          pg: page.toString(),
        });

        response = await fetch(`/api/schoolAnnouncement?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: document.cookie,
          },
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();

      // Get pagination info from headers (if provided by backend)
      const totalCount = response.headers.get("x-pagination-rowcount");
      const pageCount = response.headers.get("x-pagination-pagecount");

      // Handle response - data should be an array of announcements directly
      const notificationsWithReadStatus = Array.isArray(data) 
        ? data 
        : []; // Fallback to empty array if not an array

      console.log("Announcements response:", { data, notificationsWithReadStatus });

      setNotifications(notificationsWithReadStatus);
      setCurrentPage(page);

      // Set pagination data
      if (totalCount && pageCount) {
        setPagination({
          page,
          pageSize,
          pageCount: parseInt(pageCount),
          rowCount: parseInt(totalCount),
        });
      } else {
        // Fallback pagination calculation
        setPagination({
          page,
          pageSize,
          pageCount: Math.ceil(notificationsWithReadStatus.length / pageSize),
          rowCount: notificationsWithReadStatus.length,
        });
      }
    } catch (err: unknown) {
      console.error("Error fetching notifications:", err);
      setError(
        (err as Error)?.message ||
          "Failed to load notifications. Please try again."
      );
      toast.error("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalStats = async () => {
    if (!userData) return;

    try {
      // Fetch all notifications without pagination to get accurate stats
      const response = await fetch(`/api/schoolAnnouncement/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: document.cookie,
        },
      });

      if (!response.ok) {
        // Fallback: fetch first page with high page size to estimate stats
        const fallbackResponse = await fetch(
          `/api/schoolAnnouncement?pgsize=1000&pg=1`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Cookie: document.cookie,
            },
          }
        );

        if (!fallbackResponse.ok) {
          throw new Error("Failed to fetch stats");
        }

        const allNotifications = await fallbackResponse.json();
        const notificationsArray = Array.isArray(allNotifications)
          ? allNotifications
          : [];

        // Calculate stats from all notifications
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        setTotalStats({
          total: notificationsArray.length,
          unread: notificationsArray.filter((n: Notification) => !n.read)
            .length,
          thisWeek: notificationsArray.filter((n: Notification) => {
            const notificationDate = new Date(n.created_at);
            return notificationDate > weekAgo;
          }).length,
        });
        return;
      }

      const statsData = await response.json();
      setTotalStats(statsData);
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      // Keep existing stats on error
    }
  };

  useEffect(() => {
    if (userData) {
      fetchNotifications(1, true);
      fetchTotalStats();
    }
  }, [userData]);

  useEffect(() => {
    if (userData && searchQuery !== "") {
      const timeoutId = setTimeout(() => {
        fetchNotifications(1, true);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  const handleRefresh = () => {
    fetchNotifications(currentPage);
    fetchTotalStats();
    toast.success("Notifications refreshed");
  };

  const handleAnnouncementCreated = () => {
    fetchNotifications(1, true);
    fetchTotalStats();
  };

  const handleAnnouncementUpdated = () => {
    fetchNotifications(currentPage);
    fetchTotalStats();
  };

  const handleEditAnnouncement = (id: number, title: string, body: string) => {
    setEditingAnnouncement({ id, title, body });
    setShowEditDialog(true);
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      fetchNotifications(page);
    }
  };

  const markAsRead = async (id: number) => {
    if (!userData) return;

    try {
      const response = await fetch(`/api/schoolAnnouncement/${id}/read`, {
        method: "POST",
        headers: {
          Cookie: document.cookie,
        },
        body: "",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to mark as read: ${response.status} - ${errorText}`
        );
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update total stats locally
      setTotalStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));

      toast.success("Marked as read");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    if (!userData) return;

    try {
      const response = await fetch(`/api/schoolAnnouncement/mark-all-read`, {
        method: "POST",
        headers: {
          Cookie: document.cookie,
        },
        body: "",
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }

      const result = await response.json();

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );

      // Update total stats - set unread to 0
      setTotalStats((prev) => ({
        ...prev,
        unread: 0,
      }));

      toast.success(
        `All notifications marked as read (${result.markedCount} updated)`
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!userData) return;

    try {
      const response = await fetch(`/api/schoolAnnouncement/${id}`, {
        method: "DELETE",
        headers: {
          Cookie: document.cookie,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete announcement: ${response.status}`);
      }

      // Remove from local state
      const deletedNotification = notifications.find((n) => n.id === id);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );

      // Update total stats locally
      setTotalStats((prev) => ({
        total: Math.max(0, prev.total - 1),
        unread:
          deletedNotification && !deletedNotification.read
            ? Math.max(0, prev.unread - 1)
            : prev.unread,
        thisWeek: prev.thisWeek, // Will be updated on next refresh
      }));

      toast.success("Announcement deleted successfully");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };

  // Filter and search notifications
  const filteredNotifications = notifications
    .filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.body.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "read" && notification.read) ||
        (filterStatus === "unread" && !notification.read);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  // Use total stats from API instead of current page stats
  const stats: NotificationStats = totalStats;

  if (error) {
    return (
      <GlassCard className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Error Loading Notifications
        </h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRefresh} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard variant="gradient-blue">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="gradient-amber">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 text-amber-600 dark:text-amber-300 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold text-foreground">{stats.unread}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="gradient-emerald">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold text-foreground">{stats.thisWeek}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Controls */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center gap-2">
            <CreateAnnouncementDialog
              onAnnouncementCreated={handleAnnouncementCreated}
            />

            <Separator orientation="vertical" className="h-8" />

            <NotificationFilters
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <Separator orientation="vertical" className="h-8" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            {stats.unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {filteredNotifications.length} of {notifications.length}{" "}
            notifications
          </p>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              <Search className="w-3 h-3" />"{searchQuery}"
            </Badge>
          )}
          {filterStatus !== "all" && (
            <Badge variant="secondary" className="gap-1">
              <Filter className="w-3 h-3" />
              {filterStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No notifications found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "You're all caught up! New notifications will appear here."}
            </p>
          </GlassCard>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteAnnouncement}
              onEdit={handleEditAnnouncement}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pageCount > 1 && (
        <GlassCard className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, pagination.rowCount)} of{" "}
              {pagination.rowCount} results
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(pagination.pageCount, 7))].map(
                  (_, index) => {
                    let pageNum;
                    if (pagination.pageCount <= 7) {
                      pageNum = index + 1;
                    } else if (currentPage <= 4) {
                      pageNum = index + 1;
                    } else if (currentPage > pagination.pageCount - 4) {
                      pageNum = pagination.pageCount - 6 + index;
                    } else {
                      pageNum = currentPage - 3 + index;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="w-10 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.pageCount || loading}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Edit Announcement Dialog */}
      {editingAnnouncement && (
        <EditAnnouncementDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          announcementId={editingAnnouncement.id}
          initialTitle={editingAnnouncement.title}
          initialBody={editingAnnouncement.body}
          onAnnouncementUpdated={handleAnnouncementUpdated}
        />
      )}
    </div>
  );
}
