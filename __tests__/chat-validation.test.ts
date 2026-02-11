import { validateChatMessageBody, isValidId } from '../lib/validation';

describe('Chat validation', () => {
  describe('validateChatMessageBody', () => {
    it('accepts non-empty string', () => {
      const r = validateChatMessageBody('Hello');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.body).toBe('Hello');
    });

    it('trims and collapses whitespace', () => {
      const r = validateChatMessageBody('  hi   there  ');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.body).toBe('hi there');
    });

    it('rejects empty string', () => {
      const r = validateChatMessageBody('');
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain('empty');
    });

    it('rejects whitespace-only', () => {
      const r = validateChatMessageBody('   \n\t  ');
      expect(r.ok).toBe(false);
    });

    it('rejects non-string', () => {
      expect(validateChatMessageBody(null).ok).toBe(false);
      expect(validateChatMessageBody(undefined).ok).toBe(false);
      expect(validateChatMessageBody(123).ok).toBe(false);
    });

    it('truncates to limit (10000)', () => {
      const long = 'a'.repeat(15000);
      const r = validateChatMessageBody(long);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.body.length).toBe(10000);
    });
  });

  describe('isValidId', () => {
    it('accepts valid cuid-like id', () => {
      expect(isValidId('clxx123456789012345678901')).toBe(true);
      expect(isValidId('a'.repeat(25))).toBe(true);
    });

    it('rejects too short', () => {
      expect(isValidId('abc')).toBe(false);
      expect(isValidId('a'.repeat(19))).toBe(false);
    });

    it('rejects too long', () => {
      expect(isValidId('a'.repeat(31))).toBe(false);
    });

    it('rejects non-string', () => {
      expect(isValidId(null)).toBe(false);
      expect(isValidId(undefined)).toBe(false);
      expect(isValidId(123)).toBe(false);
    });

    it('rejects invalid characters', () => {
      expect(isValidId('clxx!!!!!!123456789012345')).toBe(false);
    });
  });
});
