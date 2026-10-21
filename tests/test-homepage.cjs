const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Minimal DOM fixture: run the real renderer and click handlers without external dependencies.
function setup({ clipboard = 'success', legacy = false, page = 'today', language = 'en', storage = new Map(), blockedStorage = false } = {}) {
  class Element {
    constructor() { this.children = []; this.dataset = {}; this.handlers = {}; this.hidden = true; this.textContent = ''; this.value = ''; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute(name, value) { this[name] = value; }
    getAttribute(name) { return this[name]; }
    addEventListener(name, handler) { this.handlers[name] = handler; }
    focus() {} select() {} setSelectionRange() {}
  }
  const selectors = page === 'today'
    ? ['today-date', 'cycle-label', 'today-grid', 'forecast-content', 'forecast-toggle', 'forecast-toggle-text', 'countdown', 'copy-today', 'copy-text', 'copy-fallback', 'copy-status']
    : ['period-label', 'rotation-today', 'rotation-tbody', 'mobile-rotation', 'cycle-track', 'jump-today'];
  selectors.push('language-toggle');
  const nodes = Object.fromEntries(selectors.map(id => [`#${id}`, new Element()]));
  if (language && !storage.has('gw2-raids-language')) storage.set('gw2-raids-language', language);
  const staticNodes = [];
  const html = fs.readFileSync(path.join(__dirname, page === 'today' ? '../index.html' : '../rotation.html'), 'utf8');
  for (const match of html.matchAll(/<[^>]+>/g)) {
    const attrs = [...match[0].matchAll(/(data-i18n(?:-aria-label|-content)?)="([^"]+)"/g)];
    if (attrs.length) {
      const node = new Element();
      for (const [, attr, key] of attrs) node.setAttribute(attr, key);
      staticNodes.push(node);
    }
  }
  const documentElement = {};
  const events = {};
  let now = '2026-10-20T23:59:59Z';
  const writes = [];
  const navigator = {};
  if (clipboard !== 'missing') navigator.clipboard = { async writeText(text) {
    if (clipboard === 'denied') throw new Error('Clipboard denied');
    writes.push(text);
  } };
  const context = vm.createContext({
    navigator,
    localStorage: {
      getItem(key) { if (blockedStorage) throw Error('Storage blocked'); return storage.get(key) || null; },
      setItem(key, value) { if (blockedStorage) throw Error('Storage blocked'); storage.set(key, value); }
    },
    Date: class extends Date { constructor(...args) { super(...(args.length ? args : [now])); } },
    document: {
      documentElement, body: { dataset: { page } }, hidden: false,
      querySelectorAll: selector => staticNodes.filter(n => n.getAttribute(selector.slice(1, -1))),
      querySelector: selector => nodes[selector] || null,
      createElement: () => new Element(), createDocumentFragment: () => new Element(),
      createTextNode: text => ({ textContent: text }), addEventListener() {}, execCommand: () => legacy
    },
    window: { addEventListener(event, callback) { events[event] = callback; }, setInterval() {} }
  });
  for (const file of ['data.js', 'rotation.js', 'encounters-zh.js', 'i18n.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js', file), 'utf8'), context);
  }
  return { nodes, writes, storage, context, staticNodes, documentElement, events, toggle: () => nodes['#language-toggle'].handlers.click(), setNow: value => { now = value; }, click: () => nodes['#copy-today'].handlers.click() };
}

test('homepage renders four rows and seven forecast days; toggle still works', () => {
  const { nodes } = setup();
  assert.equal(nodes['#today-grid'].children.length, 4);
  assert.equal(nodes['#forecast-content'].children[0].children[0].children.length, 7);
  nodes['#forecast-toggle'].handlers.click();
  assert.equal(nodes['#forecast-content'].hidden, false);
  assert.equal(nodes['#forecast-toggle']['aria-expanded'], 'true');
  nodes['#forecast-toggle'].handlers.click();
  assert.equal(nodes['#forecast-content'].hidden, true);
});

test('one click copies the date, all four bosses, and their instances', async () => {
  const { nodes, writes, click } = setup();
  await click();
  assert.equal(writes.length, 1);
  assert.equal(writes[0], [
    'GW2 daily bounties (2026-10-20 UTC)',
    '1. Boss: Mursaat Overseer', '   Instance: W4 · Bastion of the Penitent',
    '2. Boss: Varinia Stormsounder (Minister of Morale)', '   Instance: Cold War',
    '3. Boss: Nikare · Kenut', '   Instance: W6 · Mythwright Gambit',
    '4. Boss: Greer, the Blightbringer', '   Instance: W8 · Mount Balrior'
  ].join('\n'));
  assert.equal(nodes['#copy-today'].disabled, false);
  assert.equal(nodes['#copy-fallback'].hidden, true);
  assert.match(nodes['#copy-status'].textContent, /Copied/);
});

test('copy after UTC midnight uses the new day and updates the visible list', async () => {
  const { setNow, writes, nodes, click } = setup();
  setNow('2026-10-21T00:00:00Z');
  await click();
  assert.match(writes[0], /2026-10-21 UTC/);
  assert.match(writes[0], /Legendary Icebrood Construct/);
  assert.match(writes[0], /Decima, the Stormsinger/);
  assert.equal(nodes['#today-grid'].children[0].children[1].textContent, 'Legendary Icebrood Construct');
});

test('denied clipboard permission exposes the complete text without claiming success', async () => {
  const { nodes, writes, click } = setup({ clipboard: 'denied' });
  await click();
  assert.equal(writes.length, 0);
  assert.equal(nodes['#copy-fallback'].hidden, false);
  assert.match(nodes['#copy-text'].value, /4\. Boss: Greer/);
  assert.match(nodes['#copy-status'].textContent, /manually/);
  assert.equal(nodes['#copy-status'].dataset.error, 'true');
  assert.equal(nodes['#copy-today'].disabled, false);
});

test('older browsers can use legacy copy and get a success message', async () => {
  const { nodes, click } = setup({ clipboard: 'missing', legacy: true });
  await click();
  assert.equal(nodes['#copy-fallback'].hidden, true);
  assert.match(nodes['#copy-status'].textContent, /Copied/);
});

test('shared renderer still builds all 12 rotation days', () => {
  const { nodes } = setup({ page: 'rotation' });
  assert.equal(nodes['#rotation-tbody'].children[0].children.length, 12);
  assert.equal(nodes['#mobile-rotation'].children[0].children.length, 12);
  assert.equal(nodes['#cycle-track'].children[0].children.length, 12);
});

test('one click switches all homepage names, dates, static labels and copied text to Chinese', async () => {
  const app = setup();
  app.nodes['#forecast-toggle'].handlers.click();
  app.toggle();
  assert.equal(app.documentElement.lang, 'zh-CN');
  assert.equal(app.nodes['#today-grid'].children[0].children[1].textContent, '末世魔监工');
  assert.match(app.nodes['#today-date'].textContent, /星期二/);
  assert.match(app.nodes['#cycle-label'].textContent, /轮换第 6/);
  assert.equal(app.nodes['#forecast-content'].hidden, false);
  assert.equal(app.nodes['#forecast-toggle-text'].textContent, '收起未来7天');
  assert.equal(app.nodes['#language-toggle'].textContent, 'English');
  for (const n of app.staticNodes) {
    if (n['data-i18n']) assert.equal(n.textContent, app.context.GW2_I18N.t(n['data-i18n']));
  }
  await app.click();
  assert.match(app.writes[0], /激战2今日日常/);
  assert.match(app.writes[0], /Boss：末世魔监工/);
  assert.match(app.writes[0], /副本：W4 · 忏悔者堡垒/);
  assert.match(app.writes[0], /风暴之声瓦里尼亚/);
  assert.match(app.writes[0], /尼凯尔 · 科纳特/);
  assert.doesNotMatch(app.writes[0], /Greer|Mursaat|Nikare/);
  app.toggle();
  assert.equal(app.documentElement.lang, 'en');
  assert.match(app.nodes['#copy-status'].textContent, /Copied/);
  await app.click();
  assert.match(app.writes[1], /Mursaat Overseer/);
});

test('language preference survives page navigation and synchronizes between tabs', () => {
  const first = setup();
  first.toggle();
  const second = setup({ page: 'rotation', storage: first.storage });
  assert.equal(second.documentElement.lang, 'zh-CN');
  const rows = second.nodes['#rotation-tbody'].children[0].children;
  assert.equal(rows[0].children[1].children[0].textContent, '传奇冰巢构造体');
  assert.equal(second.nodes['#mobile-rotation'].children[0].children.length, 12);
  second.events.storage({ key: 'gw2-raids-language', newValue: 'en' });
  assert.equal(second.documentElement.lang, 'en');
  assert.equal(second.nodes['#rotation-tbody'].children[0].children[0].children[1].children[0].textContent, 'Legendary Icebrood Construct');
  assert.match(second.nodes['#period-label'].textContent, /Current cycle:/);
});

test('manual copy text updates to the selected language without losing the fallback', async () => {
  const app = setup({ clipboard: 'denied' });
  await app.click();
  app.toggle();
  assert.equal(app.nodes['#copy-fallback'].hidden, false);
  assert.match(app.nodes['#copy-text'].value, /末世魔监工/);
  assert.match(app.nodes['#copy-status'].textContent, /手动复制/);
});

test('blocked storage does not prevent language switching', () => {
  const app = setup({ blockedStorage: true });
  assert.equal(app.documentElement.lang, 'zh-CN');
  app.toggle();
  assert.equal(app.documentElement.lang, 'en');
});

test('all 36 entries display translated names or a deliberate English fallback', () => {
  const { context } = setup({ language: 'zh' });
  const I = context.GW2_I18N;
  for (const [id, entry] of Object.entries(context.GW2_DATA.encounters)) {
    for (const field of ['boss', 'instance', 'bounty']) {
      const displayed = I.encounter({ id, ...entry }, field);
      assert.ok(displayed && displayed.trim(), `${id}.${field} must not be blank`);
      if (context.GW2_ENCOUNTERS_ZH[id][field]) assert.match(displayed, /[\u4e00-\u9fff]/, `${id}.${field}`);
      else assert.equal(displayed, entry[field], `${id}.${field} must fall back to English`);
    }
  }
  const futureItem = { id: 'future-encounter', boss: 'Future boss' };
  assert.equal(I.encounter(futureItem, 'boss'), 'Future boss');
  I.setLanguage('en');
  assert.equal(I.encounter({ id: 'mursaat', ...context.GW2_DATA.encounters.mursaat }, 'boss'), 'Mursaat Overseer');
});

test('every annotated label has a translation and unrecognized preferences use Chinese', () => {
  const storage = new Map([['gw2-raids-language', 'invalid']]);
  for (const page of ['today', 'rotation']) {
    const app = setup({ page, storage });
    assert.equal(app.documentElement.lang, 'zh-CN');
    for (const language of ['en', 'zh']) {
      app.context.GW2_I18N.setLanguage(language);
      for (const node of app.staticNodes) {
        for (const attr of ['data-i18n', 'data-i18n-aria-label', 'data-i18n-content']) {
          const key = node.getAttribute(attr);
          if (key) assert.notEqual(app.context.GW2_I18N.t(key), key, `${page}: ${language}.${key}`);
        }
      }
    }
  }
});

test('Wiki-backed corrections are consistent in names and copy text', async () => {
  const app = setup({ language: 'zh' });
  const I = app.context.GW2_I18N;
  const entries = app.context.GW2_DATA.encounters;
  const expected = {
    construct: '信仰要塞', slothasor: '救赎小道', decima: '巴里尔山',
    cosmic: '宇宙观测台', febe: '菲勃神殿', xunlai: '桑莱废料场', olc: '旧雄狮广场', shiverpeaks: '席瓦雪山小径'
  };
  for (const [id, instance] of Object.entries(expected)) {
    assert.equal(I.encounter({ id, ...entries[id] }, 'instance'), instance);
  }
  assert.equal(I.encounter({ id: 'kela', ...entries.kela }, 'boss'), '海浪总管齐拉');
  assert.equal(I.encounter({ id: 'olc', ...entries.olc }, 'boss'), 'Watchknight Triumvirate');
  assert.equal(I.encounter({ id: 'aetherblade', ...entries.aetherblade }, 'boss'), '美琴船长 · 绯红刺荆的回响');
  app.setNow('2026-10-25T12:00:00Z');
  await app.click();
  assert.match(app.writes[0], /信仰要塞/);
  assert.doesNotMatch(app.writes[0], /忠诚要塞/);
  I.setLanguage('en');
  await app.click();
  assert.match(app.writes[1], /Stronghold of the Faithful/);
  assert.doesNotMatch(app.writes[1], /信仰要塞/);
});
