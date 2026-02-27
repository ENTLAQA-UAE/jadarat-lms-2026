// src/lib/bunny/stream.ts -- COMPLETE IMPLEMENTATION

import crypto from 'crypto';

const BUNNY_STREAM_BASE = 'https://video.bunnycdn.com';

interface CreateVideoResponse {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  status: number;
}

interface BunnyVideoFull {
  videoLibraryId: number;
  guid: string;
  title: string;
  length: number;
  status: number;
  width: number;
  height: number;
  availableResolutions: string;
  thumbnailCount: number;
  encodeProgress: number;
  storageSize: number;
  captions: { srclang: string; label: string }[];
  thumbnailFileName: string;
}

export class BunnyStream {
  private apiKey: string;
  private libraryId: string;

  constructor() {
    this.apiKey = process.env.BUNNY_STREAM_API_KEY!;
    this.libraryId = process.env.BUNNY_STREAM_LIBRARY_ID!;

    if (!this.apiKey || !this.libraryId) {
      throw new Error('Missing BUNNY_STREAM_API_KEY or BUNNY_STREAM_LIBRARY_ID env vars');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${BUNNY_STREAM_BASE}/library/${this.libraryId}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'AccessKey': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bunny Stream API error ${res.status}: ${text}`);
    }

    // Some endpoints return empty body (204)
    if (res.status === 204) return {} as T;
    return res.json();
  }

  /**
   * Step 1: Create a video placeholder in the library.
   * Returns the video GUID needed for upload.
   */
  async createVideo(title: string): Promise<{ guid: string; libraryId: string }> {
    const data = await this.request<CreateVideoResponse>('/videos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    return { guid: data.guid, libraryId: this.libraryId };
  }

  /**
   * Step 2: Upload video file to the created placeholder.
   * For large files, use TUS upload instead (see generateTusCredentials).
   */
  async uploadVideo(videoId: string, buffer: Buffer): Promise<void> {
    const url = `${BUNNY_STREAM_BASE}/library/${this.libraryId}/videos/${videoId}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': this.apiKey,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    if (!res.ok) {
      throw new Error(`Bunny upload failed: ${res.status}`);
    }
  }

  /**
   * Generate TUS upload credentials for client-side resumable upload.
   * Client uses tus-js-client to upload directly to Bunny.
   */
  generateTusCredentials(videoId: string, expirationTimeSeconds: number = 3600): {
    uploadUrl: string;
    authorizationSignature: string;
    authorizationExpire: number;
    videoId: string;
    libraryId: string;
  } {
    const expiration = Math.floor(Date.now() / 1000) + expirationTimeSeconds;
    const signaturePayload = `${this.libraryId}${this.apiKey}${expiration}${videoId}`;
    const signature = crypto.createHash('sha256').update(signaturePayload).digest('hex');

    return {
      uploadUrl: `https://video.bunnycdn.com/tusupload`,
      authorizationSignature: signature,
      authorizationExpire: expiration,
      videoId,
      libraryId: this.libraryId,
    };
  }

  /**
   * Get video details (status, duration, resolutions, etc.)
   */
  async getVideo(videoId: string): Promise<BunnyVideoFull> {
    return this.request<BunnyVideoFull>(`/videos/${videoId}`);
  }

  /**
   * List all videos in the library (paginated).
   */
  async listVideos(page: number = 1, perPage: number = 100): Promise<{
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    items: BunnyVideoFull[];
  }> {
    return this.request(`/videos?page=${page}&itemsPerPage=${perPage}`);
  }

  /**
   * Delete a video from the library.
   */
  async deleteVideo(videoId: string): Promise<void> {
    await this.request(`/videos/${videoId}`, { method: 'DELETE' });
  }

  /**
   * Request AI-generated captions for a video.
   */
  async generateAiCaptions(videoId: string, language: string = 'ar'): Promise<void> {
    await this.request(`/videos/${videoId}/captions/${language}`, {
      method: 'POST',
      body: JSON.stringify({ srclang: language, label: language === 'ar' ? 'Arabic' : 'English' }),
    });
  }

  /**
   * Get embed URL for iframe player.
   */
  getEmbedUrl(videoId: string): string {
    const host = process.env.NEXT_PUBLIC_BUNNY_STREAM_HOST;
    return `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}`;
  }

  /**
   * Get direct HLS URL for custom player.
   */
  getHlsUrl(videoId: string): string {
    const host = process.env.NEXT_PUBLIC_BUNNY_STREAM_HOST;
    return `https://${host}/${videoId}/playlist.m3u8`;
  }

  /**
   * Get thumbnail URL.
   */
  getThumbnailUrl(videoId: string): string {
    const host = process.env.NEXT_PUBLIC_BUNNY_STREAM_HOST;
    return `https://${host}/${videoId}/thumbnail.jpg`;
  }
}
