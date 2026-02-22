"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface AIChatDrawerProps {
  enabled?: boolean;
  lang?: string;
}

export function AIChatDrawer({ enabled = true, lang = "en" }: AIChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isRTL = lang === "ar";

  const {
    messages,
    sendMessage,
    setMessages,
    status,
  } = useChat({
    api: "/api/chat",
  });

  const isLoading = status === "submitted" || status === "streaming";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleNewChat = () => {
    setMessages([]);
    setInputValue("");
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue("");
    await sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Extract text content from message parts
  const getMessageText = (msg: (typeof messages)[number]) => {
    if (msg.parts && msg.parts.length > 0) {
      return msg.parts
        .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
        .map((p) => p.text)
        .join("");
    }
    return "";
  };

  if (!enabled) return null;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ [isRTL ? "left" : "right"]: "1.5rem" }}
          aria-label={isRTL ? "مساعد الذكاء الاصطناعي" : "AI Assistant"}
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Chat Drawer */}
      <div
        className={cn(
          "fixed top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[420px]",
          isRTL ? "left-0" : "right-0",
          isOpen
            ? "translate-x-0"
            : isRTL
              ? "-translate-x-full"
              : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="text-sm font-semibold">
              {isRTL ? "مساعد التعلم الذكي" : "AI Learning Assistant"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/20"
              title={isRTL ? "محادثة جديدة" : "New chat"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3" dir={isRTL ? "rtl" : "ltr"}>
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <MessageSquare className="mb-3 h-12 w-12 opacity-40" />
              <p className="text-sm font-medium">
                {isRTL
                  ? "مرحباً! كيف يمكنني مساعدتك اليوم؟"
                  : "Hello! How can I help you today?"}
              </p>
              <p className="mt-1 text-xs text-gray-300">
                {isRTL
                  ? "اسألني عن الدورات أو تقدمك في التعلم"
                  : "Ask me about courses or your learning progress"}
              </p>

              {/* Quick prompts */}
              <div className="mt-6 flex flex-col gap-2">
                {(isRTL
                  ? [
                      "ما هي الدورات المتاحة لي؟",
                      "ما هو تقدمي في التعلم؟",
                      "أقترح لي دورة مناسبة",
                    ]
                  : [
                      "What courses are available?",
                      "What is my learning progress?",
                      "Suggest a course for me",
                    ]
                ).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage({ text: prompt })}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("mb-3 flex gap-2", msg.role === "user" ? "flex-row-reverse" : "")}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  msg.role === "user"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700"
                )}
              >
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                <div className="whitespace-pre-wrap">{getMessageText(msg)}</div>
              </div>
            </div>
          ))}

          {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
            <div className="mb-3 flex gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-2xl bg-gray-100 px-3.5 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom indicator */}
        {messages.length > 4 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-white p-1.5 shadow-md transition-colors hover:bg-gray-50"
          >
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        )}

        {/* Input */}
        <div className="border-t bg-white px-4 py-3" dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRTL ? "اكتب رسالتك..." : "Type your message..."}
              className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className={cn("h-4 w-4", isRTL && "rotate-180")} />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-tiny text-gray-300">
            {isRTL
              ? "مدعوم بالذكاء الاصطناعي · قد تحتوي الإجابات على أخطاء"
              : "Powered by AI · Responses may contain errors"}
          </p>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
