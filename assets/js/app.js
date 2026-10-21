/* 纯静态页面渲染，不需要后端，也不请求外部 API。 */
(function () {
  'use strict';

  const R = globalThis.GW2_ROTATION;
  if (!R) throw new Error('请先加载 rotation.js');
  const page = document.body.dataset.page;
  let renderedUtcDate = '';
  let forecastExpanded = false;

  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function textRow(label, value, className) {
    const row = element('div', className || 'info-line');
    row.append(element('span', 'info-label', label), element('span', 'info-value', value));
    return row;
  }

  function wingTag(item) {
    return item.wing == null ? '独立遭遇战' : `W${item.wing} · 团队副本`;
  }

  const SIGILS = [
    '<path d="m32 6 6 14 14 6-14 6-6 17-6-17-14-6 14-6Z"/><path d="m13 48 19 10 19-10M10 14l7 3M54 14l-7 3"/>',
    '<path d="m32 7 17 10-4 26-13 14-13-14-4-26Z"/><path d="m23 24 9-6 9 6-3 15-6 7-6-7Zm9-6V7m-9 17-8-7m26 7 8-7"/>',
    '<path d="m32 6 5 14 15-7-7 17 12 7-18 3-7 18-7-18-18-3 12-7-7-17 15 7Z"/><path d="m32 20 7 12-7 12-7-12Z"/>',
    '<path d="m18 9 7 15-7 12 14 21 14-21-7-12 7-15-14 9Z"/><path d="m18 36 14-6 14 6m-14-6V18m-9 21 9 9 9-9"/>'
  ];

  function makeBossVisual(item) {
    const visual = element('div', 'boss-visual');
    visual.setAttribute('aria-hidden', 'true');
    // Decorative original emblems; encounter data is rendered as text below.
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.4');
    svg.setAttribute('class', 'boss-sigil');
    svg.innerHTML = SIGILS[item.group - 1];
    visual.append(svg, element('span', 'visual-number', `0${item.group} / IV`), element('span', 'visual-caption', 'DAILY BOUNTY'));
    return visual;
  }

  function makeBossCard(item) {
    const card = element('article', `boss-card group-${item.group}`);
    const top = element('div', 'boss-top');
    top.append(element('span', 'group-tag', `GROUP 0${item.group}`), element('span', 'type-tag', wingTag(item)));

    const content = element('div', 'boss-content');
    content.append(element('div', 'card-field-label', '实际 BOSS'));
    content.append(element('h3', 'boss-name', item.boss));
    content.append(element('div', 'boss-instance-label', '所属副本'));
    content.append(element('p', 'boss-instance', item.instance));

    const bottom = element('div', 'boss-bottom');
    bottom.append(element('span', 'bounty-flag', '悬赏任务'), element('span', 'bounty-name', item.bounty));

    const guide = element('a', 'boss-link', '↗');
    guide.href = `https://wiki.guildwars2.com/wiki/${encodeURIComponent(item.bounty.replace(/ /g, '_'))}`;
    guide.target = '_blank';
    guide.rel = 'noopener noreferrer';
    guide.setAttribute('aria-label', `在 Guild Wars 2 Wiki 查看 ${item.bounty}（新窗口）`);
    bottom.append(guide);
    card.append(makeBossVisual(item), top, content, bottom);
    return card;
  }

  function makeForecastItem(item) {
    const row = element('div', 'forecast-item');
    row.append(element('span', 'forecast-index', `0${item.group}`));
    const body = element('div', 'forecast-item-main');
    body.append(element('div', 'forecast-boss', item.boss), element('div', 'forecast-instance', `${item.wing ? `W${item.wing} · ` : ''}${item.instance}`));
    row.append(body);
    return row;
  }

  function makeForecastDay(dateString, offset) {
    const card = element('article', 'forecast-day');
    const header = element('header', 'forecast-day-header');
    const left = element('div');
    left.append(element('span', 'forecast-day-overline', `未来第 ${offset} 天`), element('h3', 'forecast-day-title', R.dateLabel(dateString)));
    header.append(left, element('span', 'forecast-day-index', `循环 ${String(R.cycleIndex(dateString) + 1).padStart(2, '0')}/12`));
    const list = element('div', 'forecast-list');
    R.bountiesForDate(dateString).forEach((item) => list.append(makeForecastItem(item)));
    card.append(header, list);
    return card;
  }

  function renderToday(dateString) {
    document.querySelector('#today-date').textContent = `${R.dateLabel(dateString, true)} · UTC`;
    document.querySelector('#cycle-label').textContent = `轮换第 ${R.cycleIndex(dateString) + 1} / 12 天`;
    const grid = document.querySelector('#today-grid');
    grid.replaceChildren(...R.bountiesForDate(dateString).map(makeBossCard));
    renderForecast(dateString);
  }

  function renderForecast(today) {
    const content = document.querySelector('#forecast-content');
    const fragment = document.createDocumentFragment();
    const grid = element('div', 'forecast-grid');
    for (let i = 1; i <= 7; i++) grid.append(makeForecastDay(R.dayOffset(today, i), i));
    fragment.append(grid);
    content.replaceChildren(fragment);
  }

  function makeRotationCell(item) {
    const cell = element('td', `rotation-cell group-${item.group}`);
    cell.append(element('strong', 'rotation-boss', item.boss));
    const details = element('div', 'rotation-instance');
    details.append(element('span', 'mini-wing', item.wing == null ? '独立' : `W${item.wing}`), document.createTextNode(item.instance));
    cell.append(details);
    if (item.bounty !== item.boss) cell.append(element('div', 'rotation-bounty', `悬赏：${item.bounty}`));
    return cell;
  }

  function makeRotationMobileRow(item) {
    const row = element('div', `mobile-rotation-row group-${item.group}`);
    row.append(element('span', 'mobile-group', `第 ${item.group} 组`));
    const main = element('div', 'mobile-rotation-row-main');
    main.append(element('strong', '', item.boss), element('span', '', `${item.wing ? `W${item.wing} · ` : ''}${item.instance}`));
    if (item.bounty !== item.boss) main.append(element('small', '', `悬赏：${item.bounty}`));
    row.append(main);
    return row;
  }

  function renderRotation(dateString) {
    const start = R.currentCycleStart(dateString);
    const last = R.dayOffset(start, 11);
    document.querySelector('#period-label').textContent = `本轮周期：${start} — ${last} (UTC)`;
    document.querySelector('#rotation-today').textContent = `今天：第 ${R.cycleIndex(dateString) + 1} 天`;
    const tbody = document.querySelector('#rotation-tbody');
    const mobile = document.querySelector('#mobile-rotation');
    const track = document.querySelector('#cycle-track');
    const steps = document.createDocumentFragment();
    const rows = document.createDocumentFragment();
    const cards = document.createDocumentFragment();

    for (let i = 0; i < 12; i++) {
      const date = R.dayOffset(start, i);
      const isToday = date === dateString;
      const items = R.bountiesForDate(date);
      const tr = document.createElement('tr');
      tr.id = `rotation-day-${i}`;
      if (isToday) tr.className = 'today-row';
      const step = element('button', 'cycle-step');
      step.type = 'button';
      step.append(element('span', '', 'DAY'), element('strong', '', String(i + 1).padStart(2, '0')), element('span', '', isToday ? '今天' : date.slice(5)));
      if (isToday) step.setAttribute('aria-current', 'date');
      step.setAttribute('aria-label', `查看第 ${i + 1} 天，${date}${isToday ? '，今天' : ''}`);
      step.addEventListener('click', () => scrollToDay(i));
      steps.append(step);
      const th = element('th', 'day-heading');
      th.scope = 'row';
      th.append(element('span', 'day-number', `DAY ${String(i + 1).padStart(2, '0')}`), element('strong', 'day-date', date.slice(5)), element('span', 'day-week', R.dateLabel(date)));
      if (isToday) th.append(element('span', 'today-chip', '今天'));
      tr.append(th);
      items.forEach((item) => tr.append(makeRotationCell(item)));
      rows.append(tr);

      const card = element('article', `mobile-rotation-day${isToday ? ' mobile-rotation-today' : ''}`);
      card.id = `mobile-day-${i}`;
      const heading = element('div', 'mobile-day-heading');
      const title = element('div');
      title.append(element('span', 'mobile-day-count', `DAY ${String(i + 1).padStart(2, '0')}`), element('strong', '', R.dateLabel(date)));
      heading.append(title);
      if (isToday) heading.append(element('span', 'today-chip', '今天'));
      card.append(heading);
      items.forEach((item) => card.append(makeRotationMobileRow(item)));
      cards.append(card);
    }
    track.replaceChildren(steps);
    tbody.replaceChildren(rows);
    mobile.replaceChildren(cards);
  }

  function scrollToDay(index) {
    const prefix = matchMedia('(max-width: 780px)').matches ? '#mobile-day-' : '#rotation-day-';
    const target = document.querySelector(`${prefix}${index}`);
    if (!target) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
    target.classList.remove('row-highlight');
    void target.offsetWidth;
    target.classList.add('row-highlight');
  }

  function updateCountdown(now) {
    const counter = document.querySelector('#countdown');
    if (!counter) return;
    const remain = R.secondsUntilReset(now);
    const h = String(Math.floor(remain / 3600)).padStart(2, '0');
    const m = String(Math.floor((remain % 3600) / 60)).padStart(2, '0');
    const s = String(remain % 60).padStart(2, '0');
    counter.textContent = `${h}:${m}:${s}`;
  }

  function refresh() {
    const now = new Date();
    const utcDate = R.utcToday(now);
    if (utcDate !== renderedUtcDate) {
      if (page === 'today') renderToday(utcDate);
      if (page === 'rotation') renderRotation(utcDate);
      renderedUtcDate = utcDate;
    }
    updateCountdown(now);
  }

  const forecastToggle = document.querySelector('#forecast-toggle');
  if (forecastToggle) {
    forecastToggle.addEventListener('click', () => {
      forecastExpanded = !forecastExpanded;
      document.querySelector('#forecast-content').hidden = !forecastExpanded;
      forecastToggle.setAttribute('aria-expanded', String(forecastExpanded));
      document.querySelector('#forecast-toggle-text').textContent = forecastExpanded ? '收起未来7天' : '展开未来7天';
    });
  }

  const jumpToday = document.querySelector('#jump-today');
  if (jumpToday) {
    jumpToday.addEventListener('click', () => {
      scrollToDay(R.cycleIndex(renderedUtcDate));
    });
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  window.addEventListener('focus', refresh);
  refresh();
  window.setInterval(refresh, 1000);
})();
