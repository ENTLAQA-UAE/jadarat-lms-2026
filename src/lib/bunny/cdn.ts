// src/lib/bunny/cdn.ts -- COMPLETE IMPLEMENTATION

import crypto from 'crypto';

export class BunnyCDN {
  private pullZoneKey: string;
  private cdnHost: string;

  constructor() {
    this.pullZoneKey = process.env.BUNNY_PULL_ZONE_KEY!;
    this.cdnHost = process.env.NEXT_PUBLIC_BUNNY_CDN_HOST || 'scorm.jadarat.com';

    if (!this.pullZoneKey) {
      throw new Error('Missing BUNNY_PULL_ZONE_KEY env var');
    }
  }

  /**
   * Generate a signed URL for a single file on the CDN.
   * Uses Bunny Token Authentication V2.
   *
   * Bunny signing algorithm:
   *   token_base = securityKey + signedPath + expiry + (token_countries) + (token_countries_blocked)
   *   token = base64url(sha256(token_base))
   *   url = https://host/path?token={token}&expires={expiry}
   */
  generateSignedUrl(path: string, expirationSeconds: number = 3600): string {
    const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
    const signedPath = `/${path}`;

    const hashableBase = `${this.pullZoneKey}${signedPath}${expires}`;
    const token = crypto
      .createHash('sha256')
      .update(hashableBase)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return `https://${this.cdnHost}${signedPath}?token=${token}&expires=${expires}`;
  }

  /**
   * Generate a signed URL that covers an entire directory path.
   * This allows all files under the path to be accessed with one token.
   * Used for SCORM packages where the iframe loads multiple files.
   *
   * The token_path parameter tells Bunny to sign for a directory prefix.
   */
  generateSignedDirectoryUrl(
    directoryPath: string,
    launchFile: string,
    expirationSeconds: number = 7200
  ): string {
    const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
    const signedPath = `/${directoryPath}/`;

    // For directory tokens, we sign the directory path
    const hashableBase = `${this.pullZoneKey}${signedPath}${expires}`;
    const token = crypto
      .createHash('sha256')
      .update(hashableBase)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Return the launch file URL with the directory token
    return `https://${this.cdnHost}/${directoryPath}/${launchFile}?token=${token}&token_path=${encodeURIComponent(signedPath)}&expires=${expires}`;
  }

  /**
   * Purge CDN cache for a specific path (after SCORM package update).
   */
  async purgeCache(path: string): Promise<void> {
    const pullZoneId = process.env.BUNNY_PULL_ZONE_ID!;
    const apiKey = process.env.BUNNY_API_KEY!;

    const res = await fetch(`https://api.bunny.net/pullzone/${pullZoneId}/purgeCache`, {
      method: 'POST',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CacheTag: path, // Purge by path prefix
      }),
    });

    if (!res.ok) {
      console.error(`Cache purge failed: ${res.status}`);
    }
  }
}
