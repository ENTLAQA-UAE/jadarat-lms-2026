'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GalleryBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface GalleryRendererProps {
  block: GalleryBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function GalleryRenderer({
  block,
  progress,
  onComplete,
}: GalleryRendererProps) {
  const { images, layout, columns } = block.data;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Auto-complete on mount
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : null
    );
  }, [images.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % images.length : null
    );
  }, [images.length]);

  // Keyboard navigation for lightbox
  const handleLightboxKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          lightboxPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          lightboxNext();
          break;
        case 'Escape':
          e.preventDefault();
          closeLightbox();
          break;
      }
    },
    [lightboxPrev, lightboxNext, closeLightbox]
  );

  if (images.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center text-muted-foreground">
        No images in gallery.
      </div>
    );
  }

  const renderImage = (image: GalleryBlock['data']['images'][number], index: number) => (
    <figure
      key={image.id}
      className="cursor-pointer overflow-hidden rounded-lg"
      onClick={() => openLightbox(index)}
      role="button"
      tabIndex={0}
      aria-label={`View image${image.alt ? `: ${image.alt}` : ''} in lightbox`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        className="h-auto w-full rounded-lg object-cover transition-transform hover:scale-105"
        loading="lazy"
      />
      {image.caption && (
        <figcaption className="mt-1 text-xs text-muted-foreground text-center">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );

  return (
    <div>
      {/* Grid layout */}
      {layout === 'grid' && (
        <div
          className={cn(
            'grid gap-4',
            columns === 2 && 'grid-cols-1 sm:grid-cols-2',
            columns === 3 && 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
            columns === 4 && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
          )}
          role="list"
          aria-label="Image gallery"
        >
          {images.map((image, index) => renderImage(image, index))}
        </div>
      )}

      {/* Carousel layout */}
      {layout === 'carousel' && (
        <div className="space-y-4" role="region" aria-roledescription="carousel" aria-label="Image gallery carousel">
          <div className="relative overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="w-full flex-shrink-0 cursor-pointer"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Image ${index + 1} of ${images.length}`}
                  onClick={() => openLightbox(index)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-auto w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                  {image.caption && (
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      {image.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Prev / Next buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous image"
                  className="absolute start-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={() =>
                    setCarouselIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={carouselIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next image"
                  className="absolute end-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={() =>
                    setCarouselIndex((prev) =>
                      Math.min(images.length - 1, prev + 1)
                    )
                  }
                  disabled={carouselIndex === images.length - 1}
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="flex justify-center gap-1.5" role="tablist" aria-label="Gallery navigation">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  role="tab"
                  aria-selected={index === carouselIndex}
                  aria-label={`Go to image ${index + 1}`}
                  onClick={() => setCarouselIndex(index)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    index === carouselIndex
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Masonry layout */}
      {layout === 'masonry' && (
        <div
          style={{
            columnCount: columns,
            columnGap: '1rem',
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="mb-4 break-inside-avoid"
            >
              {renderImage(image, index)}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Image lightbox: ${images[lightboxIndex].alt || `Image ${lightboxIndex + 1}`}`}
          onClick={closeLightbox}
          onKeyDown={handleLightboxKeyDown}
          tabIndex={0}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Button
              variant="outline"
              size="icon"
              aria-label="Close lightbox"
              className="absolute -right-2 -top-2 z-10 bg-background"
              onClick={closeLightbox}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
            />

            {images[lightboxIndex].caption && (
              <p className="mt-2 text-center text-sm text-white">
                {images[lightboxIndex].caption}
              </p>
            )}

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous image"
                  className="absolute start-2 top-1/2 -translate-y-1/2 bg-background/80"
                  onClick={lightboxPrev}
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next image"
                  className="absolute end-2 top-1/2 -translate-y-1/2 bg-background/80"
                  onClick={lightboxNext}
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
