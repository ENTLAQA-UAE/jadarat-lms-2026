import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "@/types/notifications";

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.loading = false;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    markRead(state, action: PayloadAction<number>) {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.is_read) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      const now = new Date().toISOString();
      state.notifications.forEach((n) => {
        if (!n.is_read) {
          n.is_read = true;
          n.read_at = now;
        }
      });
      state.unreadCount = 0;
    },
    removeNotification(state, action: PayloadAction<number>) {
      const idx = state.notifications.findIndex((n) => n.id === action.payload);
      if (idx !== -1) {
        if (!state.notifications[idx].is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(idx, 1);
      }
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markRead,
  markAllRead,
  removeNotification,
  setUnreadCount,
  setLoading,
} = notificationSlice.actions;

export default notificationSlice.reducer;
