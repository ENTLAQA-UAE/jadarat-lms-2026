"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Confetti Particle
// ============================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  delay: number;
}

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA",
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 40,
    y: -10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    velocityX: (Math.random() - 0.5) * 15,
    velocityY: Math.random() * -8 - 3,
    delay: Math.random() * 500,
  }));
}

// ============================================================
// CelebrationOverlay
// ============================================================

interface CelebrationOverlayProps {
  type: "level_up" | "challenge_complete" | "streak_milestone" | "badge_earned";
  title: string;
  subtitle?: string;
  onClose?: () => void;
  autoCloseMs?: number;
}

export function CelebrationOverlay({
  type,
  title,
  subtitle,
  onClose,
  autoCloseMs = 4000,
}: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(true);
  const [particles] = useState(() => generateParticles(40));

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose?.(), 300);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, autoCloseMs);
    return () => clearTimeout(timer);
  }, [autoCloseMs, handleClose]);

  const iconMap = {
    level_up: (
      <div className="relative">
        <div className="animate-bounce">
          <svg className="h-16 w-16 text-warning drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.5L5.7 21l2.3-7-6-4.6h7.6z" />
          </svg>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 animate-ping">
          <div className="h-3 w-3 rounded-full bg-warning" />
        </div>
      </div>
    ),
    challenge_complete: (
      <div className="animate-bounce">
        <svg className="h-16 w-16 text-success drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>
    ),
    streak_milestone: (
      <div className="animate-bounce">
        <svg className="h-16 w-16 text-warning drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.037 2.346-6.44 4.95-8.85a.75.75 0 0 1 1.1.05c.83 1.06 1.66 1.98 2.3 2.6.2.19.5.19.7 0 .94-.9 1.83-2.1 2.3-3.3a.75.75 0 0 1 1.35-.1C19.36 9.39 21 12.65 21 16c0 3.866-3.134 7-7 7z" />
        </svg>
      </div>
    ),
    badge_earned: (
      <div className="animate-bounce">
        <svg className="h-16 w-16 text-accent drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>
    ),
  };

  const bgGradient = {
    level_up: "from-warning/20 via-transparent to-warning/20",
    challenge_complete: "from-success/20 via-transparent to-success/20",
    streak_milestone: "from-warning/20 via-transparent to-destructive/20",
    badge_earned: "from-accent/20 via-transparent to-primary/20",
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-confetti-fall"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              transform: `rotate(${p.rotation}deg)`,
              animationDelay: `${p.delay}ms`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center gap-4 rounded-2xl border bg-background/95 p-8 shadow-2xl backdrop-blur-md",
          "animate-in zoom-in-50 duration-500",
          `bg-gradient-to-b ${bgGradient[type]}`
        )}
      >
        {iconMap[type]}
        <h2 className="text-2xl font-bold text-center">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {subtitle}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">Click to dismiss</p>
      </div>
    </div>
  );
}

// ============================================================
// useCelebration Hook
// ============================================================

interface CelebrationState {
  isShowing: boolean;
  type: CelebrationOverlayProps["type"];
  title: string;
  subtitle?: string;
}

export function useCelebration() {
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);

  const celebrate = useCallback(
    (type: CelebrationOverlayProps["type"], title: string, subtitle?: string) => {
      setCelebration({ isShowing: true, type, title, subtitle });
    },
    []
  );

  const dismiss = useCallback(() => {
    setCelebration(null);
  }, []);

  return { celebration, celebrate, dismiss };
}
