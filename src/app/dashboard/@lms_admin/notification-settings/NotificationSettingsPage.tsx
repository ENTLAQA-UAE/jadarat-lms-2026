"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Save,
  CheckCircle2,
  Loader2,
  Mail,
  Smartphone,
  Eye,
  SendHorizonal,
  Megaphone,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/context/language.context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  NOTIFICATION_TYPE_LABELS,
  TEMPLATE_VARIABLES,
  type NotificationType,
  type NotificationTriggerSetting,
  type NotificationEmailTemplate,
} from "@/types/notifications";
import { previewTemplate } from "@/lib/email/template";

export default function NotificationSettingsPage() {
  const { isRTL } = useLanguage();
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const supabase = createClient();

  const [triggers, setTriggers] = useState<NotificationTriggerSetting[]>([]);
  const [templates, setTemplates] = useState<NotificationEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [activeTemplate, setActiveTemplate] = useState<NotificationType | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  // Announcement form
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [triggerRes, templateRes] = await Promise.all([
        supabase.rpc("get_notification_trigger_settings"),
        supabase.rpc("get_notification_email_templates"),
      ]);

      if (triggerRes.data) setTriggers(triggerRes.data);
      if (templateRes.data) setTemplates(templateRes.data);
    } catch {
      toast.error(t("Failed to load settings", "فشل في تحميل الإعدادات"));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, []);

  const updateTrigger = (
    type: NotificationType,
    field: "is_active" | "in_app_enabled" | "email_enabled",
    value: boolean
  ) => {
    setTriggers((prev) =>
      prev.map((tr) =>
        tr.notification_type === type ? { ...tr, [field]: value } : tr
      )
    );
  };

  const updateTemplate = (
    type: NotificationType,
    field: "subject" | "body_html",
    value: string
  ) => {
    setTemplates((prev) =>
      prev.map((tpl) =>
        tpl.notification_type === type ? { ...tpl, [field]: value } : tpl
      )
    );
  };

  const insertVariable = (type: NotificationType, varKey: string) => {
    const tpl = templates.find((t) => t.notification_type === type);
    if (!tpl) return;
    updateTemplate(type, "body_html", tpl.body_html + `{{${varKey}}}`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save trigger settings
      for (const trigger of triggers) {
        await supabase.rpc("update_notification_trigger_setting", {
          p_notification_type: trigger.notification_type,
          p_is_active: trigger.is_active,
          p_in_app_enabled: trigger.in_app_enabled,
          p_email_enabled: trigger.email_enabled,
        });
      }

      // Save email templates
      for (const tpl of templates) {
        await supabase.rpc("update_notification_email_template", {
          p_notification_type: tpl.notification_type,
          p_subject: tpl.subject,
          p_body_html: tpl.body_html,
        });
      }

      setSaveStatus("success");
      toast.success(t("Settings saved", "تم حفظ الإعدادات"));
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      toast.error(t("Failed to save", "فشل في الحفظ"));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (type: NotificationType) => {
    const tpl = templates.find((t) => t.notification_type === type);
    if (!tpl) return;
    const vars = TEMPLATE_VARIABLES[type] || [];
    const html = previewTemplate(tpl.body_html, vars);
    setPreviewHtml(html);
    setActiveTemplate(type);
  };

  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim()) {
      toast.error(t("Title is required", "العنوان مطلوب"));
      return;
    }
    setSendingAnnouncement(true);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "announcement",
          title: announcementTitle,
          message: announcementMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(
        t(
          `Announcement sent to ${data.count} users`,
          `تم إرسال الإعلان إلى ${data.count} مستخدم`
        )
      );
      setAnnouncementTitle("");
      setAnnouncementMessage("");
    } catch (err) {
      toast.error(t("Failed to send announcement", "فشل في إرسال الإعلان"));
    } finally {
      setSendingAnnouncement(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const notificationTypes: NotificationType[] = [
    "enrollment",
    "completion",
    "deadline",
    "achievement",
    "announcement",
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {t("Notification Settings", "إعدادات الإشعارات")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(
                "Control notification triggers, delivery channels, and email templates",
                "تحكم في مشغلات الإشعارات وقنوات التوصيل وقوالب البريد الإلكتروني"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {t("Saved", "تم الحفظ")}
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Save className="h-4 w-4 me-2" />
            )}
            {t("Save Changes", "حفظ التغييرات")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="triggers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="triggers">
            {t("Trigger Settings", "إعدادات المشغلات")}
          </TabsTrigger>
          <TabsTrigger value="templates">
            {t("Email Templates", "قوالب البريد الإلكتروني")}
          </TabsTrigger>
          <TabsTrigger value="announcements">
            {t("Send Announcement", "إرسال إعلان")}
          </TabsTrigger>
        </TabsList>

        {/* ─── Trigger Settings Tab ─── */}
        <TabsContent value="triggers">
          <section className="rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-4 border-b px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
              <span>{t("Trigger", "المشغل")}</span>
              <span className="text-center">{t("Active", "نشط")}</span>
              <span className="text-center flex items-center justify-center gap-1">
                <Smartphone className="h-3 w-3" />
                {t("In-App", "داخلي")}
              </span>
              <span className="text-center flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" />
                {t("Email", "بريد")}
              </span>
            </div>
            {notificationTypes.map((type) => {
              const trigger = triggers.find(
                (tr) => tr.notification_type === type
              );
              if (!trigger) return null;
              const labels = NOTIFICATION_TYPE_LABELS[type];

              return (
                <div
                  key={type}
                  className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-4 border-b last:border-0 px-6 py-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {isRTL ? labels.ar : labels.en}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={trigger.is_active}
                      onCheckedChange={(v) =>
                        updateTrigger(type, "is_active", v)
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={trigger.in_app_enabled}
                      onCheckedChange={(v) =>
                        updateTrigger(type, "in_app_enabled", v)
                      }
                      disabled={!trigger.is_active}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={trigger.email_enabled}
                      onCheckedChange={(v) =>
                        updateTrigger(type, "email_enabled", v)
                      }
                      disabled={!trigger.is_active}
                    />
                  </div>
                </div>
              );
            })}
          </section>
        </TabsContent>

        {/* ─── Email Templates Tab ─── */}
        <TabsContent value="templates" className="space-y-4">
          {notificationTypes.map((type) => {
            const tpl = templates.find((t) => t.notification_type === type);
            if (!tpl) return null;
            const labels = NOTIFICATION_TYPE_LABELS[type];
            const vars = TEMPLATE_VARIABLES[type] || [];

            return (
              <section
                key={type}
                className="rounded-xl border border-border bg-card p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {isRTL ? labels.ar : labels.en}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(type)}
                  >
                    <Eye className="h-3.5 w-3.5 me-1.5" />
                    {t("Preview", "معاينة")}
                  </Button>
                </div>

                {/* Available Variables */}
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    {t(
                      "Click to insert variable:",
                      "اضغط لإدراج المتغير:"
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {vars.map((v) => (
                      <Badge
                        key={v.key}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 text-xs"
                        onClick={() => insertVariable(type, v.key)}
                      >
                        {`{{${v.key}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("Subject", "الموضوع")}
                  </label>
                  <Input
                    value={tpl.subject}
                    onChange={(e) =>
                      updateTemplate(type, "subject", e.target.value)
                    }
                    placeholder={t("Email subject...", "موضوع البريد...")}
                  />
                </div>

                {/* Body */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("Body (HTML)", "المحتوى (HTML)")}
                  </label>
                  <textarea
                    value={tpl.body_html}
                    onChange={(e) =>
                      updateTemplate(type, "body_html", e.target.value)
                    }
                    rows={8}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder={t(
                      "HTML email body...",
                      "محتوى البريد الإلكتروني..."
                    )}
                  />
                </div>
              </section>
            );
          })}

          {/* Preview Modal */}
          {activeTemplate && previewHtml && (
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {t("Preview", "معاينة")} -{" "}
                  {isRTL
                    ? NOTIFICATION_TYPE_LABELS[activeTemplate].ar
                    : NOTIFICATION_TYPE_LABELS[activeTemplate].en}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveTemplate(null);
                    setPreviewHtml("");
                  }}
                >
                  {t("Close", "إغلاق")}
                </Button>
              </div>
              <div
                className="rounded-lg border bg-white p-4"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </section>
          )}
        </TabsContent>

        {/* ─── Send Announcement Tab ─── */}
        <TabsContent value="announcements">
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">
                {t("Send Announcement", "إرسال إعلان")}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t(
                "Send an announcement notification to all active learners in your organization.",
                "إرسال إشعار إعلان لجميع المتعلمين النشطين في منظمتك."
              )}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("Title", "العنوان")}
              </label>
              <Input
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder={t("Announcement title...", "عنوان الإعلان...")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("Message", "الرسالة")}
              </label>
              <textarea
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={t(
                  "Announcement message...",
                  "رسالة الإعلان..."
                )}
              />
            </div>

            <Button
              onClick={handleSendAnnouncement}
              disabled={sendingAnnouncement || !announcementTitle.trim()}
            >
              {sendingAnnouncement ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <SendHorizonal className="h-4 w-4 me-2" />
              )}
              {t("Send to All Learners", "إرسال لجميع المتعلمين")}
            </Button>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
