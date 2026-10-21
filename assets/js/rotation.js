/* 无外部依赖的 UTC 日期与轮换计算。适用于 GitHub Pages。 */
(function () {
  'use strict';
  const data = globalThis.GW2_DATA;
  if (!data) throw new Error('请先加载 data.js');

  const DAY_MS = 86400000;
  const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

  function dayNumber(dateString) {
    const m = DATE_RE.exec(dateString);
    if (!m) throw new RangeError('无效日期格式：' + dateString);
    const year = +m[1], month = +m[2], day = +m[3];
    if (year < 100 || month < 1 || month > 12 || day < 1 || day > 31) {
      throw new RangeError('无效日期：' + dateString);
    }
    const time = Date.UTC(year, month - 1, day);
    if (new Date(time).toISOString().slice(0, 10) !== dateString) {
      throw new RangeError('不存在的日期：' + dateString);
    }
    return time / DAY_MS;
  }

  function dateFromDayNumber(n) {
    return new Date(n * DAY_MS).toISOString().slice(0, 10);
  }

  function utcToday(now = new Date()) {
    return now.toISOString().slice(0, 10);
  }

  function positiveMod(n, d) {
    return ((n % d) + d) % d;
  }

  const anchorDay = dayNumber(data.anchorDate);

  function cycleIndex(dateString) {
    return positiveMod(dayNumber(dateString) - anchorDay, 12);
  }

  function dayOffset(dateString, amount) {
    return dateFromDayNumber(dayNumber(dateString) + amount);
  }

  function bountiesForDate(dateString) {
    const index = cycleIndex(dateString);
    return data.groups.map((group, groupIndex) => {
      const id = group[index % group.length];
      return Object.freeze({ id, group: groupIndex + 1, ...data.encounters[id] });
    });
  }

  function currentCycleStart(dateString) {
    const difference = dayNumber(dateString) - anchorDay;
    return dateFromDayNumber(anchorDay + Math.floor(difference / 12) * 12);
  }

  function nextResetUtc(now = new Date()) {
    const tomorrow = dayOffset(utcToday(now), 1);
    return dayNumber(tomorrow) * DAY_MS;
  }

  function secondsUntilReset(now = new Date()) {
    return Math.max(0, Math.ceil((nextResetUtc(now) - now.getTime()) / 1000));
  }

  function dateLabel(dateString, withYear = false) {
    const date = new Date(dayNumber(dateString) * DAY_MS);
    const opts = { timeZone: 'UTC', month: 'long', day: 'numeric', weekday: 'long' };
    if (withYear) opts.year = 'numeric';
    return new Intl.DateTimeFormat('zh-CN', opts).format(date);
  }

  function validateData() {
    const ids = data.groups.flat();
    if (data.groups.length !== 4 || data.groups.map((g) => g.length).join(',') !== '6,12,12,6') {
      throw new Error('轮换组长度不正确');
    }
    if (new Set(ids).size !== 36 || Object.keys(data.encounters).length !== 36) {
      throw new Error('36 条 Boss 数据必须唯一且完整');
    }
    for (const id of ids) {
      const e = data.encounters[id];
      if (!e || !e.bounty || !e.boss || !e.instance) throw new Error('缺少副本数据：' + id);
    }
    return true;
  }

  validateData();
  globalThis.GW2_ROTATION = Object.freeze({
    dayNumber, dateFromDayNumber, dayOffset, utcToday,
    cycleIndex, bountiesForDate, currentCycleStart,
    nextResetUtc, secondsUntilReset, dateLabel, validateData
  });
})();
