// src/lib/ai/document-processor.ts -- Phase 3: PDF/DOCX text extraction

import type { DocumentChunk } from '@/types/authoring';

export class DocumentProcessor {
  /**
   * Extract text from PDF using pdfjs-dist.
   */
  async extractPdf(buffer: ArrayBuffer): Promise<DocumentChunk[]> {
    const pdfjsLib = await import('pdfjs-dist');
    const chunks: DocumentChunk[] = [];

    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let pageText = '';
      let currentHeading = '';

      for (const item of textContent.items) {
        if ('str' in item) {
          const text = item.str;
          const fontSize = item.transform ? Math.abs(item.transform[0]) : 12;

          // Detect headings by font size (>16pt = heading)
          if (fontSize > 16 && text.trim().length > 0) {
            // Save previous chunk
            if (pageText.trim()) {
              chunks.push({
                text: pageText.trim(),
                page_number: pageNum,
                heading: currentHeading || undefined,
                type: 'text',
              });
              pageText = '';
            }
            currentHeading = text.trim();
            chunks.push({
              text: text.trim(),
              page_number: pageNum,
              type: 'heading',
            });
          } else {
            pageText += text + ' ';
          }
        }
      }

      // Push remaining text
      if (pageText.trim()) {
        chunks.push({
          text: pageText.trim(),
          page_number: pageNum,
          heading: currentHeading || undefined,
          type: 'text',
        });
      }
    }

    return chunks;
  }

  /**
   * Extract text from DOCX using mammoth.
   */
  async extractDocx(buffer: ArrayBuffer): Promise<DocumentChunk[]> {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });

    return this.chunkText(result.value, 1500).map((chunk, i) => ({
      ...chunk,
      page_number: i + 1,
    }));
  }

  /**
   * Split text into chunks with overlap for better AI context.
   */
  chunkText(
    text: string,
    maxChars: number = 1500,
    overlap: number = 200
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const para of paragraphs) {
      if ((currentChunk + para).length > maxChars && currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          page_number: chunkIndex + 1,
          type: 'text',
        });
        // Keep overlap from end of previous chunk
        currentChunk = currentChunk.slice(-overlap) + '\n\n' + para;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        page_number: chunkIndex + 1,
        type: 'text',
      });
    }

    return chunks;
  }

  /**
   * Auto-detect file type and extract chunks.
   */
  async extract(
    buffer: ArrayBuffer,
    filename: string
  ): Promise<DocumentChunk[]> {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return this.extractPdf(buffer);
      case 'docx':
      case 'doc':
        return this.extractDocx(buffer);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  /**
   * Combine chunks into a single string for AI prompt context.
   * Truncates to stay within token budgets.
   */
  chunksToContext(chunks: DocumentChunk[], maxChars: number = 15000): string {
    let result = '';
    for (const chunk of chunks) {
      const prefix = chunk.heading ? `[${chunk.heading}] ` : '';
      const line = `${prefix}${chunk.text}\n\n`;
      if ((result + line).length > maxChars) break;
      result += line;
    }
    return result.trim();
  }
}
