"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useUser } from "@/contexts/AppContext";
import { sanitizeHTML } from "@/lib/sanitize-html";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  EyeOff, 
  Clock, 
  User,
  ChevronDown,
  ChevronUp,
  Shield,
  GraduationCap,
  Trash2,
  AlertTriangle,
  Edit
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NotificationCardProps {
  notification: {
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
  };
  onMarkAsRead: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, title: string, body: string) => void;
}

const roleIcons = {
  ADMIN: Shield,
  SUPERADMIN: Shield,
  HOD: GraduationCap,
  STAFF: User,
  LECTURER: GraduationCap,
};

const roleColors = {
  ADMIN: "bg-destructive/15 text-destructive",
  SUPERADMIN: "bg-purple-500/15 text-purple-600 dark:text-purple-300", 
  HOD: "bg-primary/10 text-primary",
  STAFF: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  LECTURER: "bg-amber-400/15 text-amber-600 dark:text-amber-300",
};

export function NotificationCard({ notification, onMarkAsRead, onDelete, onEdit }: NotificationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { userData } = useUser();

  const handleToggleRead = async () => {
    setIsToggling(true);
    try {
      await onMarkAsRead(notification.id);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(notification.id);
      toast.success('Announcement deleted successfully');
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete announcement');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(notification.id, notification.title, notification.body);
    }
  };

  // Check if current user can delete/edit this announcement
  const canDelete = userData && userData.role &&
    ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"].includes(userData.role) &&
    onDelete;

  const canEdit = userData && userData.role &&
    ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"].includes(userData.role) &&
    onEdit;

  const createdDate = new Date(notification.created_at);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  const fullDate = format(createdDate, "PPP 'at' p");

  const authorName = `${notification.user.first_name} ${notification.user.last_name}`;
  const authorInitials = `${notification.user.first_name[0]}${notification.user.last_name[0]}`;
  
  const RoleIcon = roleIcons[notification.user.role as keyof typeof roleIcons] || User;
  const roleColorClass = roleColors[notification.user.role as keyof typeof roleColors] || "bg-muted/40 text-foreground";

  // Truncate body text for preview
  const previewLength = 150;
  const shouldShowExpand = notification.body.length > previewLength;
  const displayBody = expanded || !shouldShowExpand 
    ? notification.body 
    : `${notification.body.slice(0, previewLength)}...`;

  return (
    <>
    <GlassCard 
      className={`transition-all duration-300 hover:shadow-lg ${
        !notification.read 
          ? "ring-2 ring-primary/25 bg-primary/5" 
          : "hover:bg-muted/40"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Unread indicator */}
          {!notification.read && (
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
          )}
          
          {/* Author avatar */}
          <Avatar className="flex-shrink-0">
            <AvatarFallback className="bg-primary/15 text-primary text-sm font-medium">
              {authorInitials}
            </AvatarFallback>
          </Avatar>

          {/* Author info and title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-foreground truncate">
                {authorName}
              </p>
              <Badge className={`text-xs gap-1 ${roleColorClass}`}>
                <RoleIcon className="w-3 h-3" />
                {notification.user.role.toLowerCase()}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
              {notification.title}
            </h3>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleRead}
            disabled={isToggling || isDeleting}
            className="gap-2"
            title={notification.read ? "Mark as unread" : "Mark as read"}
          >
            {isToggling ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : notification.read ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {notification.read ? "Unread" : "Read"}
            </span>
          </Button>

          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              disabled={isToggling || isDeleting}
              className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
              title="Edit announcement"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isToggling || isDeleting}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Delete announcement"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mb-4">
        <div 
          className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(displayBody) }}
        />
        
        {shouldShowExpand && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 gap-2 text-primary hover:text-primary p-0 h-auto font-medium"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      <Separator className="mb-4" />

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <time dateTime={notification.created_at} title={fullDate}>
            {timeAgo}
          </time>
        </div>

        {notification.updated_at !== notification.created_at && (
          <div className="flex items-center gap-1 text-xs">
            <span>Updated</span>
            <time dateTime={notification.updated_at}>
              {formatDistanceToNow(new Date(notification.updated_at), { addSuffix: true })}
            </time>
          </div>
        )}
      </div>
    </GlassCard>

    {/* Delete Confirmation Modal */}
    {showDeleteModal && (
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Announcement
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this announcement? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted/40 rounded-md">
            <h4 className="font-medium text-sm text-foreground mb-1">{notification.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.body.replace(/<[^>]*>/g, '').slice(0, 100)}...
            </p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    )}
    </>
  );
}
