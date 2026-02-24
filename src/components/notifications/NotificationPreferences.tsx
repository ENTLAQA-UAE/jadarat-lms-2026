"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings2, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { NOTIFICATION_TYPE_LABELS, type NotificationType } from "@/types/notifications";

interface Preferences {
  in_app_enabled: boolean;
  email_enabled: boolean;
  enrollment_notify: boolean;
  completion_notify: boolean;
  deadline_notify: boolean;
  achievement_notify: boolean;
  announcement_notify: boolean;
}

const DEFAULT_PREFS: Preferences = {
  in_app_enabled: true,
  email_enabled: true,
  enrollment_notify: true,
  completion_notify: true,
  deadline_notify: true,
  achievement_notify: true,
  announcement_notify: true,
};

const PREF_KEYS: { key: keyof Preferences; type: NotificationType }[] = [
  { key: "enrollment_notify", type: "enrollment" },
  { key: "completion_notify", type: "completion" },
  { key: "deadline_notify", type: "deadline" },
  { key: "achievement_notify", type: "achievement" },
  { key: "announcement_notify", type: "announcement" },
];

export default function NotificationPreferences() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPrefs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.rpc("get_notification_preferences");
      if (data && (Array.isArray(data) ? data[0] : data)) {
        const row = Array.isArray(data) ? data[0] : data;
        setPrefs({
          in_app_enabled: row.in_app_enabled ?? true,
          email_enabled: row.email_enabled ?? true,
          enrollment_notify: row.enrollment_notify ?? true,
          completion_notify: row.completion_notify ?? true,
          deadline_notify: row.deadline_notify ?? true,
          achievement_notify: row.achievement_notify ?? true,
          announcement_notify: row.announcement_notify ?? true,
        });
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (open) loadPrefs();
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.rpc("update_notification_preferences", {
        p_in_app_enabled: prefs.in_app_enabled,
        p_email_enabled: prefs.email_enabled,
        p_enrollment_notify: prefs.enrollment_notify,
        p_completion_notify: prefs.completion_notify,
        p_deadline_notify: prefs.deadline_notify,
        p_achievement_notify: prefs.achievement_notify,
        p_announcement_notify: prefs.announcement_notify,
      });

      if (error) throw error;
      toast.success("Preferences saved");
      setOpen(false);
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            Choose which notifications you want to receive.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Global toggles */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">In-App Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Show notifications in the bell icon
                </p>
              </div>
              <Switch
                checked={prefs.in_app_enabled}
                onCheckedChange={(v) =>
                  setPrefs((p) => ({ ...p, in_app_enabled: v }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={prefs.email_enabled}
                onCheckedChange={(v) =>
                  setPrefs((p) => ({ ...p, email_enabled: v }))
                }
              />
            </div>

            <Separator />

            {/* Per-type toggles */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Notification Types
            </p>
            {PREF_KEYS.map(({ key, type }) => {
              const labels = NOTIFICATION_TYPE_LABELS[type];
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{labels.en}</span>
                  <Switch
                    checked={prefs[key] as boolean}
                    onCheckedChange={(v) =>
                      setPrefs((p) => ({ ...p, [key]: v }))
                    }
                  />
                </div>
              );
            })}

            <Separator />

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <Save className="h-4 w-4 me-2" />
              )}
              Save Preferences
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
