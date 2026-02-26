// src/lib/bunny/storage.ts -- COMPLETE IMPLEMENTATION

const BUNNY_STORAGE_REGIONS: Record<string, string> = {
  de: 'storage.bunnycdn.com',
  ny: 'ny.storage.bunnycdn.com',
  la: 'la.storage.bunnycdn.com',
  sg: 'sg.storage.bunnycdn.com',
  syd: 'syd.storage.bunnycdn.com',
  jh: 'jh.storage.bunnycdn.com',
};

interface StorageItem {
  Guid: string;
  ObjectName: string;
  Path: string;
  Length: number;
  IsDirectory: boolean;
  LastChanged: string;
}

export class BunnyStorage {
  private storageKey: string;
  private storageName: string;
  private baseUrl: string;

  constructor() {
    this.storageKey = process.env.BUNNY_STORAGE_KEY!;
    this.storageName = process.env.BUNNY_STORAGE_ZONE!;
    const region = process.env.BUNNY_STORAGE_REGION || 'de';
    const host = BUNNY_STORAGE_REGIONS[region] || BUNNY_STORAGE_REGIONS.de;
    this.baseUrl = `https://${host}/${this.storageName}`;

    if (!this.storageKey || !this.storageName) {
      throw new Error('Missing BUNNY_STORAGE_KEY or BUNNY_STORAGE_ZONE env vars');
    }
  }

  /**
   * Upload a single file to Bunny Storage.
   * Path is relative to the storage zone root, e.g., "scorm/org-1/my-course/index.html"
   */
  async uploadFile(path: string, buffer: Buffer): Promise<void> {
    const url = `${this.baseUrl}/${path}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': this.storageKey,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bunny Storage upload failed for ${path}: ${res.status} ${text}`);
    }
  }

  /**
   * Delete a single file from storage.
   */
  async deleteFile(path: string): Promise<void> {
    const url = `${this.baseUrl}/${path}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'AccessKey': this.storageKey },
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`Bunny Storage delete failed: ${res.status}`);
    }
  }

  /**
   * List directory contents.
   */
  async listDirectory(path: string): Promise<StorageItem[]> {
    const url = `${this.baseUrl}/${path}/`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'AccessKey': this.storageKey },
    });

    if (!res.ok) return [];
    return res.json();
  }

  /**
   * Delete entire directory (recursive).
   * Lists all files then deletes each one.
   */
  async deleteDirectory(path: string): Promise<void> {
    const items = await this.listDirectory(path);
    for (const item of items) {
      const fullPath = `${path}/${item.ObjectName}`;
      if (item.IsDirectory) {
        await this.deleteDirectory(fullPath);
      } else {
        await this.deleteFile(fullPath);
      }
    }
  }

  /**
   * Upload an entire SCORM package (extracted ZIP files).
   * packagePath = "scorm/{org_id}/{slug}"
   */
  async uploadScormPackage(
    packagePath: string,
    files: Map<string, Buffer>
  ): Promise<{ totalFiles: number; totalBytes: number }> {
    let totalFiles = 0;
    let totalBytes = 0;

    // Upload files in parallel batches of 10
    const entries = Array.from(files.entries());
    const batchSize = 10;

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async ([filePath, buffer]) => {
          await this.uploadFile(`${packagePath}/${filePath}`, buffer);
          totalFiles++;
          totalBytes += buffer.length;
        })
      );
    }

    return { totalFiles, totalBytes };
  }
}
