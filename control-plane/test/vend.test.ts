import { REAP_GRACE_HOURS, reapAt } from '../lambda/vend';

test('reap time is ends_at plus the grace period, in UTC, in the form Scheduler takes', () => {
  expect(REAP_GRACE_HOURS).toBe(48);
  expect(reapAt('2027-03-28T18:00:00-04:00')).toBe('2027-03-30T22:00:00');
  expect(reapAt('2027-12-30T23:30:00Z')).toBe('2028-01-01T23:30:00');
});
