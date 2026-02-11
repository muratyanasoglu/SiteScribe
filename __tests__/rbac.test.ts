import {
  hasMinimumRole,
  canManageOrg,
  canUploadEvidence,
  canTriageSignals,
  canEditChangeOrder,
  canExport,
  canComment,
} from '../lib/rbac';
import type { Role } from '@prisma/client';

describe('RBAC', () => {
  describe('hasMinimumRole', () => {
    it('VIEWER has VIEWER', () => {
      expect(hasMinimumRole('VIEWER', 'VIEWER')).toBe(true);
    });
    it('VIEWER does not have FIELD', () => {
      expect(hasMinimumRole('VIEWER', 'FIELD')).toBe(false);
    });
    it('PM has FIELD and VIEWER', () => {
      expect(hasMinimumRole('PM', 'FIELD')).toBe(true);
      expect(hasMinimumRole('PM', 'VIEWER')).toBe(true);
    });
    it('OWNER has all roles', () => {
      (['VIEWER', 'SUBCONTRACTOR', 'FIELD', 'PM', 'OWNER'] as Role[]).forEach((r) => {
        expect(hasMinimumRole('OWNER', r)).toBe(true);
      });
    });
  });

  describe('permission helpers', () => {
    it('only OWNER can manage org', () => {
      expect(canManageOrg('OWNER')).toBe(true);
      expect(canManageOrg('PM')).toBe(false);
      expect(canManageOrg('VIEWER')).toBe(false);
    });
    it('FIELD and above can upload evidence', () => {
      expect(canUploadEvidence('FIELD')).toBe(true);
      expect(canUploadEvidence('PM')).toBe(true);
      expect(canUploadEvidence('VIEWER')).toBe(false);
    });
    it('PM and above can triage signals and edit CO', () => {
      expect(canTriageSignals('PM')).toBe(true);
      expect(canTriageSignals('FIELD')).toBe(false);
      expect(canEditChangeOrder('PM')).toBe(true);
      expect(canEditChangeOrder('FIELD')).toBe(false);
    });
    it('FIELD and above can export and comment', () => {
      expect(canExport('FIELD')).toBe(true);
      expect(canComment('FIELD')).toBe(true);
      expect(canExport('VIEWER')).toBe(false);
    });
  });
});
