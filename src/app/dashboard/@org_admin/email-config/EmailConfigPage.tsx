"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Save,
  CheckCircle2,
  Loader2,
  Send,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/context/language.context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  EMAIL_PROVIDER_LABELS,
  type EmailProvider,
  type OrganizationEmailConfig,
} from "@/types/notifications";

export default function EmailConfigPage() {
  const { isRTL } = useLanguage();
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [config, setConfig] = useState<OrganizationEmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Form state
  const [provider, setProvider] = useState<EmailProvider>("resend");
  const [fromEmail, setFromEmail] = useState("noreply@example.com");
  const [fromName, setFromName] = useState("LMS Notifications");
  const [isActive, setIsActive] = useState(false);

  // Provider-specific fields
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpEncryption, setSmtpEncryption] = useState<"tls" | "ssl" | "none">("tls");
  const [resendApiKey, setResendApiKey] = useState("");
  const [mailgunApiKey, setMailgunApiKey] = useState("");
  const [mailgunDomain, setMailgunDomain] = useState("");
  const [mailgunRegion, setMailgunRegion] = useState<"us" | "eu">("us");

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/email-config");
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setProvider(data.config.provider);
        setFromEmail(data.config.from_email);
        setFromName(data.config.from_name);
        setIsActive(data.config.is_active);
      }
    } catch {
      toast.error(t("Failed to load config", "فشل في تحميل الإعدادات"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, []);

  const buildProviderConfig = () => {
    switch (provider) {
      case "smtp":
        if (!smtpHost || !smtpUsername || !smtpPassword) return null;
        return {
          host: smtpHost,
          port: parseInt(smtpPort, 10) || 587,
          username: smtpUsername,
          password: smtpPassword,
          encryption: smtpEncryption,
        };
      case "resend":
        if (!resendApiKey) return null;
        return { api_key: resendApiKey };
      case "mailgun":
        if (!mailgunApiKey || !mailgunDomain) return null;
        return {
          api_key: mailgunApiKey,
          domain: mailgunDomain,
          region: mailgunRegion,
        };
      default:
        return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const providerConfig = buildProviderConfig();

      const res = await fetch("/api/email-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          from_email: fromEmail,
          from_name: fromName,
          config: providerConfig,
          is_active: isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSaveStatus("success");
      toast.success(t("Configuration saved", "تم حفظ الإعدادات"));
      // Clear sensitive fields after save
      setSmtpPassword("");
      setResendApiKey("");
      setMailgunApiKey("");
      loadConfig();
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      toast.error(t("Failed to save", "فشل في الحفظ"));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/email-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(
        t(
          "Test email sent! Check your inbox.",
          "تم إرسال بريد تجريبي! تحقق من بريدك."
        )
      );
      loadConfig();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("Test failed", "فشل الاختبار")
      );
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {t("Email Configuration", "إعدادات البريد الإلكتروني")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(
                "Configure your organization's email delivery provider",
                "إعداد مزود خدمة البريد الإلكتروني لمنظمتك"
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
            {t("Save", "حفظ")}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {config && (
        <div className="flex items-center gap-3 rounded-lg border p-4">
          {config.is_verified ? (
            <>
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">
                  {t("Email verified", "البريد محقق")}
                </p>
                {config.last_tested_at && (
                  <p className="text-xs text-muted-foreground">
                    {t("Last tested:", "آخر اختبار:")}{" "}
                    {new Date(config.last_tested_at).toLocaleString()}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="text-green-600 border-green-300">
                {t("Verified", "محقق")}
              </Badge>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700">
                  {t(
                    "Not verified - send a test email to verify",
                    "غير محقق - أرسل بريد تجريبي للتحقق"
                  )}
                </p>
              </div>
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                {t("Unverified", "غير محقق")}
              </Badge>
            </>
          )}
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              {t("Email Delivery", "تسليم البريد الإلكتروني")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "Enable or disable email notifications for your organization",
                "تمكين أو تعطيل إشعارات البريد الإلكتروني لمنظمتك"
              )}
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </section>

      {/* Provider Selection */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold">
          {t("Email Provider", "مزود البريد الإلكتروني")}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("Provider", "المزود")}
            </label>
            <Select
              value={provider}
              onValueChange={(v) => setProvider(v as EmailProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EMAIL_PROVIDER_LABELS) as EmailProvider[]).map(
                  (p) => (
                    <SelectItem key={p} value={p}>
                      {isRTL
                        ? EMAIL_PROVIDER_LABELS[p].ar
                        : EMAIL_PROVIDER_LABELS[p].en}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("From Email", "بريد المرسل")}
            </label>
            <Input
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="noreply@yourdomain.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("From Name", "اسم المرسل")}
            </label>
            <Input
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="LMS Notifications"
            />
          </div>
        </div>

        <Separator />

        {/* SMTP Fields */}
        {provider === "smtp" && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              {t("SMTP Settings", "إعدادات SMTP")}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("Host", "المضيف")}
                </label>
                <Input
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("Port", "المنفذ")}
                </label>
                <Input
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("Username", "اسم المستخدم")}
                </label>
                <Input
                  value={smtpUsername}
                  onChange={(e) => setSmtpUsername(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("Password", "كلمة المرور")}
                </label>
                <Input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder={
                    config ? t("••• (saved)", "••• (محفوظة)") : ""
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("Encryption", "التشفير")}
              </label>
              <Select
                value={smtpEncryption}
                onValueChange={(v) =>
                  setSmtpEncryption(v as "tls" | "ssl" | "none")
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">{t("None", "بدون")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Resend Fields */}
        {provider === "resend" && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              {t("Resend Settings", "إعدادات Resend")}
            </h4>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("API Key", "مفتاح API")}
              </label>
              <Input
                type="password"
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                placeholder={
                  config
                    ? t("••• (saved)", "••• (محفوظة)")
                    : "re_..."
                }
              />
            </div>
          </div>
        )}

        {/* Mailgun Fields */}
        {provider === "mailgun" && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              {t("Mailgun Settings", "إعدادات Mailgun")}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("API Key", "مفتاح API")}
                </label>
                <Input
                  type="password"
                  value={mailgunApiKey}
                  onChange={(e) => setMailgunApiKey(e.target.value)}
                  placeholder={
                    config
                      ? t("••• (saved)", "••• (محفوظة)")
                      : "key-..."
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("Domain", "النطاق")}
                </label>
                <Input
                  value={mailgunDomain}
                  onChange={(e) => setMailgunDomain(e.target.value)}
                  placeholder="mg.yourdomain.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("Region", "المنطقة")}
              </label>
              <Select
                value={mailgunRegion}
                onValueChange={(v) => setMailgunRegion(v as "us" | "eu")}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">US</SelectItem>
                  <SelectItem value="eu">EU</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </section>

      {/* Test Email */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              {t("Test Connection", "اختبار الاتصال")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "Send a test email to your address to verify the configuration",
                "إرسال بريد تجريبي إلى عنوانك للتحقق من الإعدادات"
              )}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testing || !config}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Send className="h-4 w-4 me-2" />
            )}
            {t("Send Test Email", "إرسال بريد تجريبي")}
          </Button>
        </div>
      </section>
    </div>
  );
}
