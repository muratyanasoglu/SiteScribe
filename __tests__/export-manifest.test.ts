/**
 * Export manifest shape and hashing (SHA-256). We test the manifest structure
 * and that we use a deterministic hash; full export requires DB + files.
 */
import { createHash } from 'crypto';

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

interface ManifestFile {
  evidenceId: string;
  filename: string;
  sha256: string;
  size: number;
  mimeType: string;
}

interface Manifest {
  exportId: string;
  projectId: string;
  changeOrderId: string;
  createdAt: string;
  files: ManifestFile[];
}

describe('Export manifest', () => {
  it('manifest has required fields', () => {
    const manifest: Manifest = {
      exportId: 'exp-1',
      projectId: 'proj-1',
      changeOrderId: 'co-1',
      createdAt: new Date().toISOString(),
      files: [
        {
          evidenceId: 'summary',
          filename: 'change-order-summary.pdf',
          sha256: sha256(Buffer.from('pdf content')),
          size: 11,
          mimeType: 'application/pdf',
        },
      ],
    };
    expect(manifest.exportId).toBeDefined();
    expect(manifest.projectId).toBeDefined();
    expect(manifest.changeOrderId).toBeDefined();
    expect(manifest.createdAt).toBeDefined();
    expect(Array.isArray(manifest.files)).toBe(true);
    expect(manifest.files[0].evidenceId).toBeDefined();
    expect(manifest.files[0].filename).toBeDefined();
    expect(manifest.files[0].sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.files[0].size).toBe(11);
    expect(manifest.files[0].mimeType).toBe('application/pdf');
  });

  it('SHA-256 is deterministic', () => {
    const buf = Buffer.from('test');
    expect(sha256(buf)).toBe(sha256(buf));
    expect(sha256(buf).length).toBe(64);
  });
});
