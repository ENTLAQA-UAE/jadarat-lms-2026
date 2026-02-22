"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Bot,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Search,
  MessageSquare,
  Sparkles,
  Shield,
  Settings2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AI_PROVIDERS, type AIProvider, type OrgAIConfig } from "@/types/ai";
import { createClient } from "@/utils/supabase/client";

interface AIConfigFormProps {
  lang?: string;
}

export function AIConfigForm({ lang = "en" }: AIConfigFormProps) {
  const isRTL = lang === "ar";
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [model, setModel] = useState("claude-sonnet-4-5-20250929");
  const [apiKey, setApiKey] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [rateLimitRpm, setRateLimitRpm] = useState(30);
  const [rateLimitRpd, setRateLimitRpd] = useState(500);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [recommendationsEnabled, setRecommendationsEnabled] = useState(true);

  // Load existing config
  useEffect(() => {
    async function loadConfig() {
      try {
        const { data } = await supabase.rpc("get_org_ai_config");
        const config: OrgAIConfig | null = Array.isArray(data) ? data[0] : data;

        if (config) {
          setProvider(config.provider as AIProvider);
          setModel(config.model);
          setSystemPrompt(config.system_prompt);
          setTemperature(config.temperature);
          setMaxTokens(config.max_tokens);
          setRateLimitRpm(config.rate_limit_rpm);
          setRateLimitRpd(config.rate_limit_rpd);
          setChatEnabled(config.chat_enabled);
          setSearchEnabled(config.search_enabled);
          setRecommendationsEnabled(config.recommendations_enabled);
        }
      } catch (error) {
        console.error("Failed to load AI config:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // POST to server-side API route — encrypts API key before storing
      const res = await fetch("/api/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          apiKey: apiKey || null,
          systemPrompt,
          temperature,
          maxTokens,
          rateLimitRpm,
          rateLimitRpd,
          chatEnabled,
          searchEnabled,
          recommendationsEnabled,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      setSaveStatus("success");
      setApiKey(""); // Clear API key field after save
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save AI config:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    const providerModels = AI_PROVIDERS[newProvider]?.models;
    if (providerModels && providerModels.length > 0) {
      setModel(providerModels[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const t = (en: string, ar: string) => (isRTL ? ar : en);

  return (
    <div className="mx-auto max-w-3xl space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {t("AI Configuration", "إعدادات الذكاء الاصطناعي")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(
              "Configure AI features for your organization",
              "تكوين ميزات الذكاء الاصطناعي لمنظمتك"
            )}
          </p>
        </div>
      </div>

      {/* Provider & Model */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">
            {t("AI Provider", "مزود الذكاء الاصطناعي")}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Provider */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("Provider", "المزود")}
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {Object.entries(AI_PROVIDERS).map(([key, prov]) => (
                <option key={key} value={key}>
                  {isRTL ? prov.labelAr : prov.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("Model", "النموذج")}
            </label>
            {AI_PROVIDERS[provider]?.models.length > 0 ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {AI_PROVIDERS[provider].models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={t("Enter model name", "أدخل اسم النموذج")}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            )}
          </div>
        </div>

        {/* API Key */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {t("API Key", "مفتاح API")}
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t(
                "Enter API key (leave blank to keep current)",
                "أدخل مفتاح API (اتركه فارغاً للحفاظ على الحالي)"
              )}
              className={cn(
                "w-full rounded-lg border border-border py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                isRTL ? "pl-10 pr-3" : "pl-3 pr-10"
              )}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              style={{ [isRTL ? "left" : "right"]: "0.75rem" }}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            {t(
              "API keys are encrypted at rest",
              "يتم تشفير مفاتيح API عند التخزين"
            )}
          </p>
        </div>
      </section>

      {/* Features Toggle */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">
            {t("AI Features", "ميزات الذكاء الاصطناعي")}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Chat */}
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-muted p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("AI Chat Assistant", "مساعد الدردشة الذكي")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "Learners can chat with AI about courses",
                    "يمكن للمتعلمين الدردشة مع الذكاء الاصطناعي حول الدورات"
                  )}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={chatEnabled}
              onChange={(e) => setChatEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
            />
          </label>

          {/* Search */}
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-muted p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("AI-Powered Search", "البحث المدعوم بالذكاء الاصطناعي")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "Semantic search with Arabic & English support",
                    "البحث الدلالي مع دعم العربية والإنجليزية"
                  )}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={searchEnabled}
              onChange={(e) => setSearchEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
            />
          </label>

          {/* Recommendations */}
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-muted p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t(
                    "AI Course Recommendations",
                    "توصيات الدورات بالذكاء الاصطناعي"
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "Personalized course suggestions for learners",
                    "اقتراحات دورات مخصصة للمتعلمين"
                  )}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={recommendationsEnabled}
              onChange={(e) => setRecommendationsEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
            />
          </label>
        </div>
      </section>

      {/* System Prompt */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">
            {t("System Prompt", "تعليمات النظام")}
          </h2>
        </div>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          placeholder={t(
            "Instructions for the AI assistant...",
            "تعليمات للمساعد الذكي..."
          )}
          className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {t(
            "Customize how the AI responds to learners in your organization",
            "خصص كيفية استجابة الذكاء الاصطناعي للمتعلمين في منظمتك"
          )}
        </p>
      </section>

      {/* Advanced Settings */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">
            {t("Advanced Settings", "الإعدادات المتقدمة")}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Temperature */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
              <span>{t("Temperature", "درجة الإبداعية")}</span>
              <span className="text-xs font-normal text-muted-foreground">{temperature}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-tiny text-muted-foreground">
              <span>{t("Precise", "دقيق")}</span>
              <span>{t("Creative", "إبداعي")}</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("Max Tokens", "الحد الأقصى للرموز")}
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              min={256}
              max={16384}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Rate Limits */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("Rate Limit (per minute)", "حد المعدل (في الدقيقة)")}
            </label>
            <input
              type="number"
              value={rateLimitRpm}
              onChange={(e) => setRateLimitRpm(parseInt(e.target.value, 10))}
              min={1}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("Rate Limit (per day)", "حد المعدل (في اليوم)")}
            </label>
            <input
              type="number"
              value={rateLimitRpd}
              onChange={(e) => setRateLimitRpd(parseInt(e.target.value, 10))}
              min={1}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pb-8">
        {saveStatus === "success" && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            {t("Saved successfully", "تم الحفظ بنجاح")}
          </span>
        )}
        {saveStatus === "error" && (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {t("Failed to save", "فشل في الحفظ")}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t("Save Configuration", "حفظ الإعدادات")}
        </button>
      </div>
    </div>
  );
}
