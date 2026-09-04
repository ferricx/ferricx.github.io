import { JSDOM, ResourceLoader } from 'jsdom';
const url = 'http://127.0.0.1:8232/angular-app/browser/tabs/index.html';
const dom = await JSDOM.fromURL(url, {
  runScripts: 'dangerously', resources: new ResourceLoader(), pretendToBeVisual: true,
});
await new Promise(r => setTimeout(r, 6000));
const d = dom.window.document;
const lists = [...d.querySelectorAll('[role=tablist]')];
console.log('tablists:', lists.length);
lists.forEach(tl => {
  const tabs = [...tl.querySelectorAll('[role=tab]')];
  console.log('  labelledby:', tl.getAttribute('aria-labelledby'), '| tabs:', tabs.length);
  tabs.forEach(t => console.log('   tab', t.id, 'sel=' + t.getAttribute('aria-selected'), 'ctrl=' + t.getAttribute('aria-controls'), 'ti=' + t.getAttribute('tabindex')));
});
[...d.querySelectorAll('[role=tabpanel]')].forEach(p => {
  const ul = p.querySelector('ul');
  console.log('panel', p.id, 'labelledby=' + p.getAttribute('aria-labelledby'),
    '| ul aria-labelledby=' + ul.getAttribute('aria-labelledby'), '| links=' + ul.querySelectorAll('a').length,
    '| panel tabindex=' + p.getAttribute('tabindex'));
});
dom.window.close();
