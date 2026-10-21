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

  function makeBossCard(item) {
    const row = element('article', 'boss-row');
    row.append(element('span', 'group-number', `0${item.group}`));
    row.append(element('h3', 'boss-name', item.boss));
    const instance = element('p', 'boss-instance');
    instance.append(element('span', 'instance-label', '副本：'));
    if (item.wing != null) instance.append(element('span', 'instance-wing', `W${item.wing}`));
    instance.append(document.createTextNode(item.instance));
    row.append(instance);
    return row;
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
    const copyButton = document.querySelector('#copy-today');
    if (copyButton) copyButton.disabled = false;
    document.querySelector('#copy-fallback').hidden = true;
    document.querySelector('#copy-status').textContent = '';
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

  function dailyCopyText(dateString) {
    const lines = [`激战2今日日常（${dateString} UTC）`];
    R.bountiesForDate(dateString).forEach((item, index) => {
      lines.push(`${index + 1}. Boss：${item.boss}`,
        `   副本：${item.wing == null ? '' : `W${item.wing} · `}${item.instance}`);
    });
    return lines.join('\n');
  }

  function legacyCopy(text) {
    const field = document.querySelector('#copy-text');
    const fallback = document.querySelector('#copy-fallback');
    fallback.hidden = false;
    field.value = text;
    field.focus({ preventScroll: true });
    field.select();
    field.setSelectionRange(0, text.length);
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { /* 手动复制降级。 */ }
    if (copied) fallback.hidden = true;
    return copied;
  }

  const copyToday = document.querySelector('#copy-today');
  if (copyToday) {
    copyToday.addEventListener('click', async () => {
      // 使用点击瞬间的 UTC 日期，避免跨日后复制到昨日目标。
      refresh();
      const text = dailyCopyText(renderedUtcDate);
      const status = document.querySelector('#copy-status');
      copyToday.disabled = true;
      copyToday.textContent = '正在复制…';
      status.textContent = '';
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          copied = true;
        } else {
          copied = legacyCopy(text);
        }
      } catch (_) {
        copied = legacyCopy(text);
      } finally {
        copyToday.disabled = false;
        copyToday.textContent = '一键复制今日日常';
      }
      status.dataset.error = String(!copied);
      status.textContent = copied ? '已复制 4 个 Boss 和所属副本，可直接粘贴分享。' : '复制未完成，请使用下方文本手动复制。';
      if (copied) {
        document.querySelector('#copy-fallback').hidden = true;
        copyToday.focus({ preventScroll: true });
      }
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
