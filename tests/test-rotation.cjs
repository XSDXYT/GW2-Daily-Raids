const assert = require('node:assert/strict');
const test = require('node:test');

require('../assets/js/data.js');
require('../assets/js/rotation.js');
const data = globalThis.GW2_DATA;
const R = globalThis.GW2_ROTATION;

test('数据完整：4组6/12/12/6，36项独立悬赏', () => {
  assert.equal(R.validateData(), true);
  assert.deepEqual(data.groups.map((g) => g.length), [6, 12, 12, 6]);
});

test('2026-10-15 是第1天', () => {
  assert.equal(R.cycleIndex('2026-10-15'), 0);
  assert.deepEqual(R.bountiesForDate('2026-10-15').map((x) => x.bounty),
    ['Shiverpeaks Pass', 'Aetherblade Hideout', 'Slothasor', 'Qadim']);
});

test('2026-10-20 第6天按Wiki一致', () => {
  assert.deepEqual(R.bountiesForDate('2026-10-20').map((x) => x.bounty),
    ['Mursaat Overseer', 'Cold War', 'Twin Largos', 'Greer']);
});

test('2026-10-21 第7天按Wiki一致', () => {
  assert.equal(R.cycleIndex('2026-10-21'), 6);
  assert.deepEqual(R.bountiesForDate('2026-10-21').map((x) => x.bounty),
    ['Shiverpeaks Pass', 'Boneskinner', 'Decima', 'Qadim']);
});

test('2026-10-26 是第12天，10-27 返回第1天', () => {
  assert.deepEqual(R.bountiesForDate('2026-10-26').map((x) => x.bounty),
    ['Mursaat Overseer', 'Kela', 'Deimos', 'Greer']);
  assert.equal(R.cycleIndex('2026-10-27'), 0);
  assert.equal(R.currentCycleStart('2026-10-27'), '2026-10-27');
});

test('第1/4组每6天重复，完整轮换12天重复', () => {
  for (let i = 0; i < 48; i++) {
    const a = R.bountiesForDate(R.dayOffset('2026-10-15', i));
    const b = R.bountiesForDate(R.dayOffset('2026-10-15', i + 12));
    const c = R.bountiesForDate(R.dayOffset('2026-10-15', i + 6));
    assert.deepEqual(a, b);
    assert.equal(a[0].id, c[0].id);
    assert.equal(a[3].id, c[3].id);
  }
});

test('锚点之前的日期也可计算', () => {
  assert.equal(R.cycleIndex('2026-10-14'), 11);
  assert.equal(R.currentCycleStart('2026-10-14'), '2026-10-03');
});

test('UTC跨日从2026-10-20切到2026-10-21，与本地时区无关', () => {
  const a = new Date('2026-10-20T23:59:59.500Z');
  const b = new Date('2026-10-21T00:00:00.000Z');
  assert.equal(R.utcToday(a), '2026-10-20');
  assert.equal(R.utcToday(b), '2026-10-21');
  assert.equal(R.secondsUntilReset(a), 1);
  assert.equal(R.secondsUntilReset(b), 86400);
});

test('日期验证拒绝不存在日期', () => {
  assert.throws(() => R.dayNumber('2026-02-30'), RangeError);
  assert.throws(() => R.dayNumber('2026-2-3'), RangeError);
  assert.equal(R.dayOffset('2026-12-31', 1), '2027-01-01');
});
