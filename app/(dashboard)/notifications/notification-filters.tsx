"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Eye, 
  EyeOff, 
  List,
  Calendar,
  ChevronDown
} from "lucide-react";

interface NotificationFiltersProps {
  filterStatus: "all" | "unread" | "read";
  onFilterChange: (status: "all" | "unread" | "read") => void;
  sortBy: "newest" | "oldest";
  onSortChange: (sort: "newest" | "oldest") => void;
}

export function NotificationFilters({
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
}: NotificationFiltersProps) {
  const filterLabels = {
    all: "All",
    unread: "Unread", 
    read: "Read",
  };

  const sortLabels = {
    newest: "Newest first",
    oldest: "Oldest first",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Filter by Status */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Status:</span>
            {filterLabels[filterStatus]}
            {filterStatus !== "all" && (
              <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                1
              </Badge>
            )}
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by Status
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={filterStatus}
            onValueChange={(value) => onFilterChange(value as "all" | "unread" | "read")}
          >
            <DropdownMenuRadioItem value="all" className="gap-2">
              <List className="w-4 h-4" />
              All notifications
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="unread" className="gap-2">
              <Eye className="w-4 h-4" />
              Unread only
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="read" className="gap-2">
              <EyeOff className="w-4 h-4" />
              Read only
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Order */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {sortBy === "newest" ? (
              <SortDesc className="w-4 h-4" />
            ) : (
              <SortAsc className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Sort:</span>
            {sortLabels[sortBy]}
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Sort Order
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={(value) => onSortChange(value as "newest" | "oldest")}
          >
            <DropdownMenuRadioItem value="newest" className="gap-2">
              <SortDesc className="w-4 h-4" />
              Newest first
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest" className="gap-2">
              <SortAsc className="w-4 h-4" />
              Oldest first
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}