"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationCenter from "./NotificationCenter";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  isCollapsed?: boolean;
  isMobile?: boolean;
}

export default function NotificationBell({
  isCollapsed,
  isMobile,
}: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={isCollapsed && !isMobile ? "icon" : "default"}
          className={cn(
            "relative w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-muted",
            isCollapsed && !isMobile && "justify-center px-2"
          )}
          aria-label="Notifications"
        >
          <div className="relative">
            <Bell className="h-4 w-4 shrink-0" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-sm">Notifications</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={8}
        className="w-auto p-0"
      >
        <NotificationCenter
          notifications={notifications}
          onRead={markAsRead}
          onDelete={deleteNotification}
          onMarkAllRead={markAllAsRead}
        />
      </PopoverContent>
    </Popover>
  );
}
