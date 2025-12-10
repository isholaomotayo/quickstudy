"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/AppContext";
import { Button } from "./button";
import { Badge } from "./badge";
import { Avatar, AvatarFallback } from "./avatar";
import { Separator } from "./separator";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Eye,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Notification {
  id: number;
  title: string;
  body: string;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
  };
  read?: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { userData } = useUser();

  const fetchUnreadCount = async () => {
    if (!userData) return;

    try {
      const response = await fetch("/api/schoolAnnouncement/unread-count", {
        method: "GET",
        credentials: "include", // Automatically sends cookies securely
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread || 0);
      } else if (response.status === 401) {
        // Authentication failed, set count to 0 and don't log error
        setUnreadCount(0);
      }
    } catch (err) {
      // Don't log errors for unread count to avoid spam
      setUnreadCount(0);
    }
  };

  // Function to manually refresh unread count (can be called from parent components)
  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  const fetchRecentNotifications = async () => {
    if (!userData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/schoolAnnouncement?pgsize=5&pg=1", {
        method: "GET",
        credentials: "include", // Automatically sends cookies securely
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications`);
      }

      const data = await response.json();

      // Backend now returns notifications with real read status
      const notificationsWithReadStatus = Array.isArray(data) ? data : [];

      setNotifications(notificationsWithReadStatus);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userData) {
      fetchRecentNotifications();
      // Also refresh unread count when bell is opened
      fetchUnreadCount();
    }
  }, [isOpen, userData]);

  // Fetch unread count only when component mounts or user data changes
  useEffect(() => {
    if (userData) {
      fetchUnreadCount();
    }
  }, [userData]);

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const getAuthorInitials = (user: Notification["user"]) => {
    return `${user.first_name[0]}${user.last_name[0]}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 h-10 w-10 rounded-full hover:bg-gray-100/80 hover:shadow-md transition-all duration-200 border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-sm"
        >
          <Bell className="w-5 h-5 text-gray-700 drop-shadow-sm" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 min-w-6 text-xs flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-white shadow-lg drop-shadow-md font-semibold animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
        alignOffset={-5}
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 px-4">
              <div className="text-center">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchRecentNotifications}
                  className="mt-2 text-xs"
                >
                  Try again
                </Button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8 px-4">
              <div className="text-center">
                <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  New announcements will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read
                      ? "bg-blue-50/50 border-l-2 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full notifications page or specific notification
                  }}
                >
                  <div className="flex gap-3">
                    {/* Unread indicator */}
                    <div className="flex-shrink-0 mt-1">
                      {!notification.read ? (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      ) : (
                        <div className="w-2 h-2" />
                      )}
                    </div>

                    {/* Author Avatar */}
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium">
                        {getAuthorInitials(notification.user)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {notification.user.first_name}{" "}
                          {notification.user.last_name}
                        </p>
                        <Badge className="text-xs px-1 py-0 bg-gray-100 text-gray-600 border-0">
                          {notification.user.role.toLowerCase()}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
                        {notification.title}
                      </h4>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {truncateText(
                          notification.body.replace(/<[^>]*>/g, ""),
                          60
                        )}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <time dateTime={notification.created_at}>
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-3">
          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View all notifications
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
