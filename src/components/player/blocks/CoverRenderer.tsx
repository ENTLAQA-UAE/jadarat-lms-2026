'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CoverBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface CoverRendererProps {
  block: CoverBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

const HEIGHT_MAP = {
  small: 'min-h-[240px]',
  medium: 'min-h-[400px]',
  large: 'min-h-[560px]',
};

export function CoverRenderer({
  block,
  progress,
  onComplete,
  theme,
}: CoverRendererProps) {
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const layout = block.data.layout || 'centered';
  const hasImage = !!block.data.background_image;

  const alignClass =
    block.data.text_alignment === 'center'
      ? 'items-center text-center'
      : block.data.text_alignment === 'end'
        ? 'items-end text-end'
        : 'items-start text-start';

  // Split layout: image on one side, text on the other
  if (layout === 'split') {
    return (
      <div
        className={cn('relative rounded-xl overflow-hidden flex', HEIGHT_MAP[block.data.height])}
        style={{ borderRadius: 'var(--player-radius)' }}
      >
        {/* Image half */}
        <div
          className="w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: hasImage ? `url(${block.data.background_image})` : undefined,
            backgroundColor: hasImage ? undefined : 'color-mix(in srgb, var(--player-primary) 15%, transparent)',
          }}
        />
        {/* Text half */}
        <div className="w-1/2 flex flex-col justify-center p-8 md:p-12 bg-card">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-2xl md:text-3xl font-bold leading-tight tracking-tight"
              style={{ color: 'var(--player-text)', fontFamily: 'var(--player-font)' }}
            >
              {block.data.title}
            </h2>
            {block.data.subtitle && (
              <p className="text-base text-muted-foreground mt-3 leading-relaxed">
                {block.data.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Minimal layout: simple text on clean background
  if (layout === 'minimal') {
    return (
      <div
        className={cn('relative rounded-xl overflow-hidden flex flex-col justify-center p-8 md:p-16', HEIGHT_MAP[block.data.height], alignClass)}
        style={{ borderRadius: 'var(--player-radius)', backgroundColor: 'var(--player-bg, #fff)' }}
      >
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-1 w-16 rounded-full mb-6" style={{ backgroundColor: 'var(--player-primary)' }} />
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight tracking-tight"
            style={{ color: 'var(--player-text)', fontFamily: 'var(--player-font)' }}
          >
            {block.data.title}
          </h2>
          {block.data.subtitle && (
            <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
              {block.data.subtitle}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Left-aligned layout
  if (layout === 'left_aligned') {
    return (
      <div
        className={cn('relative rounded-xl overflow-hidden flex flex-col justify-end p-8 md:p-12', HEIGHT_MAP[block.data.height], 'items-start text-start')}
        style={{
          backgroundImage: hasImage ? `url(${block.data.background_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 'var(--player-radius)',
        }}
      >
        {hasImage ? (
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${block.data.overlay_color} 0%, ${block.data.overlay_color}80 50%, transparent 100%)` }} />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--player-primary), color-mix(in srgb, var(--player-primary) 60%, var(--player-secondary)))` }} />
        )}
        <motion.div className="relative z-10 max-w-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--player-font)' }}>{block.data.title}</h2>
          {block.data.subtitle && <p className="text-base text-white/75 mt-3 leading-relaxed">{block.data.subtitle}</p>}
        </motion.div>
      </div>
    );
  }

  // Full bleed layout
  if (layout === 'full_bleed') {
    return (
      <div
        className="relative rounded-xl overflow-hidden flex flex-col justify-center items-center text-center min-h-[500px] md:min-h-[600px]"
        style={{
          backgroundImage: hasImage ? `url(${block.data.background_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 'var(--player-radius)',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: hasImage ? `${block.data.overlay_color}CC` : 'var(--player-primary)' }} />
        <motion.div className="relative z-10 max-w-3xl px-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--player-font)' }}>{block.data.title}</h2>
          {block.data.subtitle && <p className="text-lg md:text-xl text-white/80 mt-4 leading-relaxed">{block.data.subtitle}</p>}
        </motion.div>
      </div>
    );
  }

  // Gradient overlay layout
  if (layout === 'gradient_overlay') {
    return (
      <div
        className={cn('relative rounded-xl overflow-hidden flex flex-col justify-end p-8 md:p-12', HEIGHT_MAP[block.data.height], alignClass)}
        style={{
          backgroundImage: hasImage ? `url(${block.data.background_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 'var(--player-radius)',
        }}
      >
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--player-primary) 0%, var(--player-secondary) 100%)`, opacity: hasImage ? 0.85 : 1 }} />
        {theme.logo_url && (
          <motion.div className="absolute top-6 start-6 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <img src={theme.logo_url} alt="Logo" className="h-10 md:h-12 w-auto object-contain drop-shadow-lg" />
          </motion.div>
        )}
        <motion.div className="relative z-10 max-w-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--player-font)' }}>{block.data.title}</h2>
          {block.data.subtitle && <p className="text-base md:text-lg text-white/75 mt-3">{block.data.subtitle}</p>}
        </motion.div>
      </div>
    );
  }

  // Pattern layout
  if (layout === 'pattern') {
    return (
      <div
        className={cn('relative rounded-xl overflow-hidden flex flex-col justify-center p-8 md:p-12', HEIGHT_MAP[block.data.height], alignClass)}
        style={{ borderRadius: 'var(--player-radius)' }}
      >
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--player-primary), color-mix(in srgb, var(--player-primary) 70%, var(--player-secondary)))` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <motion.div className="relative z-10 max-w-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--player-font)' }}>{block.data.title}</h2>
          {block.data.subtitle && <p className="text-base md:text-lg text-white/75 mt-3">{block.data.subtitle}</p>}
        </motion.div>
      </div>
    );
  }

  // Default centered layout (original)
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden flex flex-col justify-end p-8 md:p-12',
        HEIGHT_MAP[block.data.height],
        alignClass,
      )}
      style={{
        backgroundImage: hasImage ? `url(${block.data.background_image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 'var(--player-radius)',
      }}
    >
      {hasImage ? (
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${block.data.overlay_color} 0%, ${block.data.overlay_color}99 40%, transparent 100%)` }} />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--player-primary), color-mix(in srgb, var(--player-primary) 60%, var(--player-secondary)))` }} />
      )}
      {!hasImage && (
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
      )}
      {theme.logo_url && (
        <motion.div className="absolute top-6 start-6 z-10" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <img src={theme.logo_url} alt="Course logo" className="h-10 md:h-12 w-auto object-contain drop-shadow-lg" />
        </motion.div>
      )}
      <motion.div className="relative z-10 max-w-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight" style={{ fontFamily: 'var(--player-font)' }}>{block.data.title}</h2>
        {block.data.subtitle && (
          <motion.p className="text-base md:text-lg text-white/75 mt-3 leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
            {block.data.subtitle}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
