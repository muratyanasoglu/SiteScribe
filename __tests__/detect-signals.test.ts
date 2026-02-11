/**
 * Unit test for heuristic scoring logic (keyword + type triggers).
 * We test the keyword list and score behavior; full detectChangeSignals requires DB.
 */
const KEYWORDS = [
  'changed',
  'revision',
  'rfi',
  'delay',
  'additional',
  'unforeseen',
  'change order',
  'scope change',
  'extra work',
  'directive',
];

function scoreText(text: string, type: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  if (type === 'PLAN_REVISION') score = 0.9;
  if (type === 'RFI_DOC') score = Math.max(score, 0.7);
  for (const kw of KEYWORDS) {
    if (lower.includes(kw)) score = Math.min(1, score + 0.2);
  }
  return score;
}

describe('detectChangeSignals scoring', () => {
  it('scores PLAN_REVISION high', () => {
    expect(scoreText('', 'PLAN_REVISION')).toBe(0.9);
  });

  it('scores RFI_DOC', () => {
    expect(scoreText('', 'RFI_DOC')).toBe(0.7);
  });

  it('keyword "changed" adds to score', () => {
    expect(scoreText('The scope was changed', 'SITE_LOG')).toBeGreaterThan(0);
    expect(scoreText('Nothing here', 'SITE_LOG')).toBe(0);
  });

  it('multiple keywords cap at 1', () => {
    const many = KEYWORDS.join(' ');
    expect(scoreText(many, 'SITE_LOG')).toBeLessThanOrEqual(1);
  });

  it('revision + keyword increases score', () => {
    const s = scoreText('Revision required due to change', 'RFI_DOC');
    expect(s).toBeGreaterThanOrEqual(0.7);
  });
});
