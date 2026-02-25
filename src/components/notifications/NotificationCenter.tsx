"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import NotificationItem from "./NotificationItem";
import type { Notification } from "@/types/notifications";

interface NotificationCenterProps {
  notifications: Notification[];
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkAllRead: () => void;
}

export default function NotificationCenter({
  notifications,
  onRead,
  onDelete,
  onMarkAllRead,
}: NotificationCenterProps) {
  const [tab, setTab] = useState<"all" | "unread">("all");

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const displayNotifications =
    tab === "unread" ? unreadNotifications : notifications;

  return (
    <div className="flex flex-col" style={{ width: "380px", maxHeight: "500px" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {unreadNotifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground"
            onClick={onMarkAllRead}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "all" | "unread")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 h-9 rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-9 text-xs"
          >
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-9 text-xs"
          >
            Unread ({unreadNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <ScrollArea className="h-[380px]">
            {displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p className="text-sm">
                  {tab === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 p-1">
                {displayNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={onRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
