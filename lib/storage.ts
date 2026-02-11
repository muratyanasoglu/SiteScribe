/**
 * Storage provider interface for evidence files.
 * Implementations: LocalStorageProvider (dev), VercelBlobStorageProvider (production).
 */

export interface UploadResult {
  url: string;
  key?: string;
}

export interface StorageProvider {
  upload(
    buffer: Buffer,
    key: string,
    options: { mimeType: string; projectId: string; evidenceId: string }
  ): Promise<UploadResult>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

/** Local dev: store under public/uploads; files are served statically. */
import path from 'path';
import fs from 'fs';

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor(basePath = 'public/uploads') {
    this.basePath = path.join(process.cwd(), basePath);
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  async upload(
    buffer: Buffer,
    key: string,
    _options: { mimeType: string; projectId: string; evidenceId: string }
  ): Promise<UploadResult> {
    const dir = path.join(this.basePath, path.dirname(key));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(this.basePath, key);
    fs.writeFileSync(filePath, buffer);
    return { url: `/uploads/${key}`, key };
  }

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

/** Production: Vercel Blob storage. Requires @vercel/blob and BLOB_READ_WRITE_TOKEN. */
export class VercelBlobStorageProvider implements StorageProvider {
  async upload(
    buffer: Buffer,
    key: string,
    options: { mimeType: string; projectId: string; evidenceId: string }
  ): Promise<UploadResult> {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(key, buffer, {
        access: 'public',
        contentType: options.mimeType,
      });
      return { url: blob.url, key: blob.pathname };
    } catch (e) {
      throw new Error(
        'Vercel Blob upload failed. Set BLOB_READ_WRITE_TOKEN and install @vercel/blob.'
      );
    }
  }

  async getUrl(key: string): Promise<string> {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return '';
    return `https://${process.env.VERCEL_BLOB_STORE_ID || 'default'}.public.blob.vercel-storage.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    try {
      const { del } = await import('@vercel/blob');
      await del(key);
    } catch {
      // Ignore delete errors (e.g. key already removed)
    }
  }
}

export function getStorageProvider(): StorageProvider {
  if (process.env.STORAGE_PROVIDER === 'vercel') {
    return new VercelBlobStorageProvider();
  }
  return new LocalStorageProvider(process.env.UPLOAD_DIR || 'public/uploads');
}
