"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Megaphone,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification, NotificationType } from "@/types/notifications";

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: LucideIcon; color: string }
> = {
  enrollment: { icon: BookOpen, color: "text-blue-500" },
  completion: { icon: CheckCircle2, color: "text-green-500" },
  deadline: { icon: Clock, color: "text-orange-500" },
  achievement: { icon: Award, color: "text-yellow-500" },
  announcement: { icon: Megaphone, color: "text-purple-500" },
};

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function NotificationItem({
  notification,
  onRead,
  onDelete,
}: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.announcement;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors cursor-pointer hover:bg-muted/50",
        !notification.is_read && "bg-primary/5"
      )}
      onClick={() => !notification.is_read && onRead(notification.id)}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted",
          config.color
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-tight",
              !notification.is_read ? "font-semibold" : "font-medium"
            )}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        {notification.body && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="mt-1 text-tiny text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
