"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Sparkles,
  Loader2,
  BookOpen,
  BarChart3,
  Star,
} from "lucide-react";

interface SearchResult {
  course_id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  category_name: string | null;
  level: string;
  similarity: number;
  source: "semantic" | "text";
}

interface AISearchResultsProps {
  lang?: string;
  onCourseClick?: (courseId: number) => void;
}

export function AISearchResults({
  lang = "en",
  onCourseClick,
}: AISearchResultsProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSemantic, setHasSemantic] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const isRTL = lang === "ar";

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setHasSemantic(data.has_semantic || false);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" style={{ [isRTL ? "right" : "left"]: "0.75rem" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRTL
              ? "ابحث عن الدورات بالذكاء الاصطناعي..."
              : "Search courses with AI..."
          }
          className={cn(
            "w-full rounded-xl border border-border py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10",
            isRTL ? "pr-11 pl-24" : "pl-11 pr-24"
          )}
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={isSearching || !query.trim()}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40",
          )}
          style={{ [isRTL ? "left" : "right"]: "0.375rem" }}
        >
          {isSearching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {isRTL ? "بحث" : "Search"}
        </button>
      </div>

      {/* AI Search Badge */}
      {hasSemantic && results.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {isRTL
            ? "نتائج البحث مدعومة بالذكاء الاصطناعي للبحث الدلالي"
            : "Results enhanced with AI semantic search"}
        </div>
      )}

      {/* Results */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mb-3 h-8 w-8 animate-spin" />
          <p className="text-sm">
            {isRTL ? "جارٍ البحث..." : "Searching..."}
          </p>
        </div>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Search className="mb-3 h-8 w-8 opacity-40" />
          <p className="text-sm">
            {isRTL
              ? "لم يتم العثور على نتائج"
              : "No results found"}
          </p>
          <p className="mt-1 text-xs">
            {isRTL
              ? "جرب كلمات مختلفة أو أوسع نطاقاً"
              : "Try different or broader terms"}
          </p>
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <div
              key={result.course_id}
              onClick={() => onCourseClick?.(result.course_id)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {result.thumbnail ? (
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                {result.source === "semantic" && (
                  <div className="absolute top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-tiny font-medium text-primary-foreground" style={{ [isRTL ? "right" : "left"]: "0.5rem" }}>
                    <Sparkles className="h-2.5 w-2.5" />
                    {isRTL ? "ذكي" : "AI Match"}
                  </div>
                )}
                {result.similarity > 0 && (
                  <div className="absolute top-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-tiny font-medium text-foreground" style={{ [isRTL ? "left" : "right"]: "0.5rem" }}>
                    <Star className="h-2.5 w-2.5 text-warning" />
                    {Math.round(result.similarity * 100)}%
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary">
                  {result.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {result.description}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  {result.category_name && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-tiny font-medium text-muted-foreground">
                      {result.category_name}
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-tiny font-medium",
                      levelColors[result.level] || "bg-muted text-muted-foreground"
                    )}
                  >
                    <BarChart3 className="mr-0.5 inline h-2.5 w-2.5" />
                    {result.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
