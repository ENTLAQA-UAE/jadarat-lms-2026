'use client';

import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

/**
 * Renders HTML content after sanitizing it with DOMPurify to prevent XSS attacks.
 * Use this instead of dangerouslySetInnerHTML throughout the player renderers.
 */
export function SafeHTML({ html, className }: SafeHTMLProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
