const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Minimal DOM fixture: run the real renderer and click handlers without external dependencies.
function setup({ clipboard = 'success', legacy = false, page = 'today' } = {}) {
  class Element {
    constructor() { this.children = []; this.dataset = {}; this.handlers = {}; this.hidden = true; this.textContent = ''; this.value = ''; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute(name, value) { this[name] = value; }
    addEventListener(name, handler) { this.handlers[name] = handler; }
    focus() {} select() {} setSelectionRange() {}
  }
  const selectors = page === 'today'
    ? ['today-date', 'cycle-label', 'today-grid', 'forecast-content', 'forecast-toggle', 'forecast-toggle-text', 'countdown', 'copy-today', 'copy-text', 'copy-fallback', 'copy-status']
    : ['period-label', 'rotation-today', 'rotation-tbody', 'mobile-rotation', 'cycle-track', 'jump-today'];
  const nodes = Object.fromEntries(selectors.map(id => [`#${id}`, new Element()]));
  let now = '2026-10-20T23:59:59Z';
  const writes = [];
  const navigator = {};
  if (clipboard !== 'missing') navigator.clipboard = { async writeText(text) {
    if (clipboard === 'denied') throw new Error('Clipboard denied');
    writes.push(text);
  } };
  const context = vm.createContext({
    navigator,
    Date: class extends Date { constructor(...args) { super(...(args.length ? args : [now])); } },
    document: {
      body: { dataset: { page } }, hidden: false,
      querySelector: selector => nodes[selector] || null,
      createElement: () => new Element(), createDocumentFragment: () => new Element(),
      createTextNode: text => ({ textContent: text }), addEventListener() {}, execCommand: () => legacy
    },
    window: { addEventListener() {}, setInterval() {} }
  });
  for (const file of ['data.js', 'rotation.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js', file), 'utf8'), context);
  }
  return { nodes, writes, setNow: value => { now = value; }, click: () => nodes['#copy-today'].handlers.click() };
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
    '激战2今日日常（2026-10-20 UTC）',
    '1. Boss：Mursaat Overseer', '   副本：W4 · Bastion of the Penitent',
    '2. Boss：Varinia Stormsounder (Minister of Morale)', '   副本：Cold War',
    '3. Boss：Nikare · Kenut', '   副本：W6 · Mythwright Gambit',
    '4. Boss：Greer, the Blightbringer', '   副本：W8 · Mount Balrior'
  ].join('\n'));
  assert.equal(nodes['#copy-today'].disabled, false);
  assert.equal(nodes['#copy-fallback'].hidden, true);
  assert.match(nodes['#copy-status'].textContent, /已复制/);
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
  assert.match(nodes['#copy-text'].value, /4\. Boss：Greer/);
  assert.match(nodes['#copy-status'].textContent, /手动复制/);
  assert.equal(nodes['#copy-status'].dataset.error, 'true');
  assert.equal(nodes['#copy-today'].disabled, false);
});

test('older browsers can use legacy copy and get a success message', async () => {
  const { nodes, click } = setup({ clipboard: 'missing', legacy: true });
  await click();
  assert.equal(nodes['#copy-fallback'].hidden, true);
  assert.match(nodes['#copy-status'].textContent, /已复制/);
});

test('shared renderer still builds all 12 rotation days', () => {
  const { nodes } = setup({ page: 'rotation' });
  assert.equal(nodes['#rotation-tbody'].children[0].children.length, 12);
  assert.equal(nodes['#mobile-rotation'].children[0].children.length, 12);
  assert.equal(nodes['#cycle-track'].children[0].children.length, 12);
});
