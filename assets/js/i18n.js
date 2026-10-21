/* 全站文案、UTC日期格式与轻量语言偏好管理，无外部依赖。 */
(function () {
  'use strict';
  const messages = {
  "zh": {
    "skip": "跳转到主要内容",
    "brand": "日常查询",
    "nav": "主导航",
    "today": "今日日常",
    "rotation": "12天循环表",
    "todayTitle": "今日日常 · GW2 Raid Bounties",
    "rotationTitle": "12天循环表 · GW2 Raid Bounties",
    "descriptionToday": "快速查看激战2今日四个日常 Boss 及所属副本，一键复制分享，支持未来七天与完整12天轮换查询。",
    "descriptionRotation": "激战2每日团队悬赏完整12天轮换表，包含4组Boss、实际Boss名称与副本名。",
    "loadingDate": "读取当前日期…",
    "loadingCycle": "轮换计算中",
    "copy": "一键复制今日日常",
    "resetRule": "每日北京时间 08:00 刷新",
    "resetRemaining": "距离刷新",
    "resetTimer": "距离下一次刷新",
    "manualHelp": "自动复制不可用，请长按或选中下方文字复制。",
    "groupColumn": "组别",
    "instanceColumn": "所属副本",
    "noscript": "请启用 JavaScript 查看自动计算的日常数据。",
    "forecast": "未来七天",
    "expand": "展开未来7天",
    "collapse": "收起未来7天",
    "fullRotation": "查看完整12天循环表 →",
    "footerToday": "非官方玩家查询工具 · 日期以 UTC 为准",
    "wikiSource": "数据来源：GW2 Wiki ↗",
    "homeAria": "返回GW2日常十人本首页",
    "tagline": "泰瑞亚 · 每日悬赏指南",
    "headerReset": "每日 08:00 刷新",
    "rotationEyebrow": "完整轮换",
    "rotationSubtitle": "完整轮换周期",
    "rotationIntro": "每天四组各出现一个目标，完整组合每12天重复一次。表格中的日期会随当前周期自动更新。",
    "loadingPeriod": "正在计算本轮日期…",
    "loadingToday": "今天：—",
    "cycleNav": "12天周期导航",
    "tableAria": "完整每日悬赏表",
    "allDays": "全部12天",
    "overview": "每日悬赏总览",
    "jump": "定位今天",
    "currentDay": "今天",
    "legend": "每格：Boss 名称 / 所属副本 / 悬赏任务",
    "scrollTable": "12天循环表，可横向滚动",
    "dateColumn": "轮换日期",
    "group01": "第 01 组",
    "group02": "第 02 组",
    "group03": "第 03 组",
    "group04": "第 04 组",
    "footnote": "第13天重新回到第1天。6项组每6天重复，12项组每12天重复。每天 UTC 00:00 刷新。",
    "backAria": "返回首页",
    "backKicker": "返回今日",
    "backHeading": "先看看今天打什么？",
    "backHint": "首页为你整理好当天4个 Boss 和未来7天的安排。",
    "backLink": "返回今日日常",
    "footerRotation": "非官方玩家制作查询工具",
    "sourceLabel": "数据参考",
    "verified": "核对日期 2026-10-21",
    "instancePrefix": "副本：",
    "cycleLabel": "轮换第 {n} / 12 天",
    "futureDay": "未来第 {n} 天",
    "cycleShort": "循环 {n}/12",
    "independent": "独立",
    "bountyLabel": "悬赏：{name}",
    "groupLabel": "第 {n} 组",
    "periodLabel": "本轮周期：{start} — {end} (UTC)",
    "rotationToday": "今天：第 {n} 天",
    "day": "第 {n} 天",
    "viewDay": "查看第 {n} 天，{date}{today}",
    "todaySuffix": "，今天",
    "copyHeading": "激战2今日日常（{date} UTC）",
    "copyBoss": "{n}. Boss：{name}",
    "copyInstance": "   副本：{name}",
    "copying": "正在复制…",
    "copySuccess": "已复制 4 个 Boss 和所属副本，可直接粘贴分享。",
    "copyFailed": "复制未完成，请使用下方文本手动复制。",
    "switchLanguage": "Switch to English"
  },
  "en": {
    "skip": "Skip to content",
    "brand": "Daily bounties",
    "nav": "Main navigation",
    "today": "Today",
    "rotation": "12-day rotation",
    "todayTitle": "Today · GW2 Raid Bounties",
    "rotationTitle": "12-day rotation · GW2 Raid Bounties",
    "descriptionToday": "View all four daily GW2 bosses and their instances, copy the list, and check upcoming bounties.",
    "descriptionRotation": "Complete 12-day GW2 daily bounty rotation with all four groups, bosses, and instances.",
    "loadingDate": "Loading date…",
    "loadingCycle": "Loading rotation…",
    "copy": "Copy today's bounties",
    "resetRule": "Resets daily at 00:00 UTC (08:00 UTC+8)",
    "resetRemaining": "Next reset in",
    "resetTimer": "Time until next reset",
    "manualHelp": "Automatic copying is unavailable. Select or long-press the text below to copy.",
    "groupColumn": "Group",
    "instanceColumn": "Instance",
    "noscript": "Enable JavaScript to view the daily bounties.",
    "forecast": "Next 7 days",
    "expand": "Show next 7 days",
    "collapse": "Hide next 7 days",
    "fullRotation": "View full 12-day rotation →",
    "footerToday": "Unofficial fan tool · Dates use UTC",
    "wikiSource": "Source: GW2 Wiki ↗",
    "homeAria": "Go to daily bounties",
    "tagline": "Tyria · Daily bounty guide",
    "headerReset": "Daily reset at 08:00",
    "rotationEyebrow": "ROTATION OVERVIEW",
    "rotationSubtitle": "Complete rotation",
    "rotationIntro": "One target from each group appears daily. The full rotation repeats every 12 days; dates update with the current cycle.",
    "loadingPeriod": "Loading current cycle…",
    "loadingToday": "Today: —",
    "cycleNav": "12-day cycle navigation",
    "tableAria": "Complete daily bounty table",
    "allDays": "ALL 12 DAYS",
    "overview": "Daily bounty overview",
    "jump": "Jump to today",
    "currentDay": "Today",
    "legend": "Each cell: Boss / Instance / Bounty",
    "scrollTable": "12-day rotation table, scroll horizontally",
    "dateColumn": "Date",
    "group01": "Group 01",
    "group02": "Group 02",
    "group03": "Group 03",
    "group04": "Group 04",
    "footnote": "Day 13 returns to day 1. Groups with 6 entries repeat every 6 days; groups with 12 entries repeat every 12 days. Resets daily at 00:00 UTC.",
    "backAria": "Back to home",
    "backKicker": "BACK TO TODAY",
    "backHeading": "What are today's targets?",
    "backHint": "Find all four daily bosses and the next 7 days on the home page.",
    "backLink": "Back to today",
    "footerRotation": "Unofficial fan tool",
    "sourceLabel": "Source",
    "verified": "Verified 2026-10-21",
    "instancePrefix": "Instance: ",
    "cycleLabel": "Cycle day {n} / 12",
    "futureDay": "Day +{n}",
    "cycleShort": "Cycle {n}/12",
    "independent": "Strike",
    "bountyLabel": "Bounty: {name}",
    "groupLabel": "Group {n}",
    "periodLabel": "Current cycle: {start} — {end} (UTC)",
    "rotationToday": "Today: day {n}",
    "day": "DAY {n}",
    "viewDay": "View day {n}, {date}{today}",
    "todaySuffix": ", today",
    "copyHeading": "GW2 daily bounties ({date} UTC)",
    "copyBoss": "{n}. Boss: {name}",
    "copyInstance": "   Instance: {name}",
    "copying": "Copying…",
    "copySuccess": "Copied all 4 bosses and their instances. Ready to paste.",
    "copyFailed": "Copy failed. Use the text below to copy manually.",
    "switchLanguage": "切换为中文"
  }
};
  const key = 'gw2-raids-language';
  let language = 'zh';
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'en' || saved === 'zh') language = saved;
  } catch (_) { /* 隐私模式下保留本页的语言状态。 */ }
  const listeners = [];
  function t(name, values = {}) {
    return (messages[language][name] || messages.en[name] || name)
      .replace(/\{(\w+)\}/g, (match, field) => values[field] === undefined ? match : String(values[field]));
  }
  function encounter(item, field) {
    return language === 'zh' ? (globalThis.GW2_ENCOUNTERS_ZH?.[item.id]?.[field] || item[field]) : item[field];
  }
  function dateLabel(date, withYear = false) {
    const options = { timeZone: 'UTC', month: 'long', day: 'numeric', weekday: 'long' };
    if (withYear) options.year = 'numeric';
    return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', options).format(new Date(date + 'T00:00:00Z'));
  }
  function apply() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    for (const attribute of ['text', 'aria-label', 'content']) {
      const dataAttribute = attribute === 'text' ? 'data-i18n' : 'data-i18n-' + attribute;
      document.querySelectorAll('[' + dataAttribute + ']').forEach(node => {
        const value = t(node.getAttribute(dataAttribute));
        if (attribute === 'text') node.textContent = value;
        else node.setAttribute(attribute, value);
      });
    }
    const toggle = document.querySelector('#language-toggle');
    if (toggle) {
      toggle.textContent = language === 'zh' ? 'English' : '中文';
      toggle.setAttribute('aria-label', t('switchLanguage'));
      toggle.setAttribute('lang', language === 'zh' ? 'en' : 'zh-CN');
    }
  }
  function setLanguage(next, persist = true) {
    if (!['zh', 'en'].includes(next)) return;
    language = next;
    if (persist) {
      try { localStorage.setItem(key, language); } catch (_) { /* 本页仍可正常切换。 */ }
    }
    apply();
    listeners.forEach(listener => listener());
  }
  globalThis.GW2_I18N = Object.freeze({
    t, encounter, dateLabel, get language() { return language; },
    setLanguage, onChange(listener) { listeners.push(listener); }
  });
  document.querySelector('#language-toggle')?.addEventListener('click', () => setLanguage(language === 'zh' ? 'en' : 'zh'));
  window.addEventListener('storage', event => {
    if (event.key === key) setLanguage(event.newValue === 'en' ? 'en' : 'zh', false);
  });
  apply();
})();
