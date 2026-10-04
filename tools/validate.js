// Sanity-checks keigo-seed.js and parse.js. Run: node tools/validate.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = {};
eval(fs.readFileSync(path.join(root, 'keigo-seed.js'), 'utf8'));
const parseKeigo = require(path.join(root, 'parse.js'));
const deck = window.SEED_KEIGO;
const errs = [], ids = new Set();
deck.forEach(it => {
  const at = '[' + it.id + '] ';
  if (ids.has(it.id)) errs.push(at + 'duplicate id'); ids.add(it.id);
  if (it.type === 'pair') {
    ['verb', 'meaning', 'keigo', 'reading'].forEach(k => { if (!it[k]) errs.push(at + 'missing ' + k); });
    if (!['S', 'K', 'T'].includes(it.kind)) errs.push(at + 'bad kind');
  } else if (it.type === 'quiz') {
    if (it.wrong.length !== 3) errs.push(at + 'needs exactly 3 wrong choices');
    if (new Set([it.answer, ...it.wrong]).size !== 4) errs.push(at + 'choices are not distinct');
    if (it.mode !== 'error' && !it.sentence.includes('＿＿')) errs.push(at + 'sentence has no blank');
    if (it.mode === 'error' && it.wrong.includes(it.sentence)) errs.push(at + 'a choice equals the wrong sentence');
    if (it.mode === 'error' && it.answer === it.sentence) errs.push(at + 'answer equals the wrong sentence');
    if (!it.why) errs.push(at + 'missing why');
  } else errs.push(at + 'unknown type');
});
const t = parseKeigo('Verb: 渡す\nMeaning: to hand over\nKind: 謙譲\nKeigo: お渡しする\n---\nMode: who\nSentence: お＿＿ください。\nAnswer: 待ち\nWrong: a | b | c');
if (t.items.length !== 2 || t.errors.length) errs.push('parser self-test failed: ' + JSON.stringify(t));
const n = k => deck.filter(i => (k === 'pair' ? i.type === 'pair' : i.mode === k)).length;
console.log('items:', deck.length, '· pairs', n('pair'), '· who', n('who'), '· error', n('error'), '· build', n('build'));
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log('OK');
