"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { createClient } from "@/utils/supabase/client";
import { useAppSelector } from "@/hooks/redux.hook";
import {
  setNotifications,
  addNotification,
  markRead,
  markAllRead as markAllReadAction,
  removeNotification,
  setUnreadCount,
  setLoading,
} from "@/redux/notification.slice";
import type { Notification } from "@/types/notifications";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useNotifications() {
  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { notifications, unreadCount, loading } = useAppSelector(
    (state) => state.notification
  );
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    dispatch(setLoading(true));
    try {
      const { data, error } = await supabase.rpc("get_notifications", {
        p_limit: 50,
        p_offset: 0,
      });

      if (!error && data) {
        dispatch(setNotifications(data as Notification[]));
      }

      const { data: countData } = await supabase.rpc(
        "get_unread_notification_count"
      );
      if (countData !== null) {
        dispatch(setUnreadCount(countData));
      }
    } catch {
      dispatch(setLoading(false));
    }
  }, [user?.id, dispatch, supabase]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          dispatch(addNotification(newNotification));
          toast(newNotification.title, {
            description: newNotification.body || undefined,
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  // Actions
  const markAsRead = useCallback(
    async (id: number) => {
      dispatch(markRead(id));
      await supabase.rpc("mark_notification_read", { p_id: id });
    },
    [dispatch, supabase]
  );

  const markAllAsRead = useCallback(async () => {
    dispatch(markAllReadAction());
    await supabase.rpc("mark_all_notifications_read");
  }, [dispatch, supabase]);

  const deleteNotification = useCallback(
    async (id: number) => {
      dispatch(removeNotification(id));
      await supabase.rpc("delete_notification", { p_id: id });
    },
    [dispatch, supabase]
  );

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}
