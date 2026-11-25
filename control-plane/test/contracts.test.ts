import { SettingsError, jungleStackName, parseEventSettings } from '../../contracts/event-settings.v0';

const now = new Date('2026-11-25T00:00:00Z');
const good = { event_id: 'rva-claims-2027', teams: ['alpha', 'team-2'], ends_at: '2027-03-28T18:00:00-04:00', seed: 'seed-1' };
const problems = (input: unknown): string[] => {
  try {
    parseEventSettings(input, now);
  } catch (e) {
    return (e as SettingsError).problems;
  }
  return [];
};

test('accepts valid settings unchanged', () => {
  expect(parseEventSettings(good, now)).toEqual(good);
});

test.each([
  ['not an object', 'nope', /must be an object/],
  ['missing event_id', { ...good, event_id: undefined }, /event_id/],
  ['uppercase event_id', { ...good, event_id: 'RVA' }, /event_id/],
  ['no teams', { ...good, teams: [] }, /teams must be a list/],
  ['21 teams', { ...good, teams: Array.from({ length: 21 }, (_, i) => `t${i}`) }, /teams must be a list/],
  ['team with a space', { ...good, teams: ['team one'] }, /team names must be/],
  ['duplicate teams', { ...good, teams: ['a', 'a'] }, /unique/],
  ['ends_at without offset', { ...good, ends_at: '2027-03-28T18:00:00' }, /ends_at must be an ISO-8601/],
  ['ends_at not a real date', { ...good, ends_at: '2027-13-45T18:00:00Z' }, /ends_at must be an ISO-8601/],
  ['ends_at in the past', { ...good, ends_at: '2026-01-01T00:00:00Z' }, /in the future/],
  ['empty seed', { ...good, seed: '' }, /seed/],
  ['unknown field', { ...good, budget: 5 }, /unknown fields: budget/],
])('rejects %s', (_name, input, pattern) => {
  expect(problems(input).join('; ')).toMatch(pattern);
});

test('reports every problem at once', () => {
  expect(problems({ event_id: 'X', teams: [], ends_at: 'soon', seed: '' })).toHaveLength(4);
});

test('stack name is jungl3-<event>-<team>', () => {
  expect(jungleStackName('rva', 'alpha')).toBe('jungl3-rva-alpha');
});
