// Parses pasted keigo cards. Works in the browser (window.parseKeigo) and node (module.exports).
//
// Blocks are separated by a line of "---". Each line is "Key: value" (keys are case-insensitive).
//
// Verb-form card (Type: pair, or inferred from Verb):
//   Verb, Meaning, Kind (S/K/T or 尊敬/謙譲/丁重), Keigo   -- required
//   Reading, Notes, Sentence, Translation, Id            -- optional
//
// Question (Type: quiz, or inferred from Answer):
//   Mode (who / error / build), Sentence, Answer, Wrong (3 wrong choices separated by | )  -- required
//   Situation, Why, Id                                                                      -- optional
(function (root) {
  const KEYS = {
    type: 'type', id: 'id',
    verb: 'verb', plain: 'verb', meaning: 'meaning', kind: 'kind', keigo: 'keigo', form: 'keigo',
    reading: 'reading', notes: 'notes', note: 'notes',
    sentence: 'sentence', translation: 'translation',
    mode: 'mode', situation: 'situation', answer: 'answer', wrong: 'wrong', why: 'why', explanation: 'why',
  };
  const KIND = { s: 'S', '尊敬': 'S', '尊敬語': 'S', k: 'K', '謙譲': 'K', '謙譲語': 'K', t: 'T', '丁重': 'T', '丁重語': 'T', '謙譲語ii': 'T', '謙譲語2': 'T' };

  function parseKeigo(text) {
    const blocks = String(text || '').replace(/\r/g, '').split(/^\s*-{3,}\s*$/m);
    const items = [], errors = [];
    blocks.forEach((block, i) => {
      if (!block.trim()) return;
      const it = {};
      let last = null;
      block.split('\n').forEach(line => {
        const m = line.match(/^\s*([A-Za-z# ]+?)\s*[:：]\s*(.*)$/);
        const key = m && KEYS[m[1].toLowerCase()];
        if (key) { it[key] = m[2].trim(); last = key; }
        else if (last && line.trim()) it[last] += ' ' + line.trim();
      });
      const n = 'Card ' + (i + 1);
      let type = (it.type || '').toLowerCase();
      if (type !== 'pair' && type !== 'quiz') type = it.verb ? 'pair' : it.answer ? 'quiz' : '';
      if (!type) { errors.push(n + ': add a Verb (pair card) or an Answer (quiz)'); return; }
      if (type === 'pair') {
        const missing = ['verb', 'meaning', 'kind', 'keigo'].filter(k => !it[k]);
        if (missing.length) { errors.push(n + ': missing ' + missing.join(', ')); return; }
        const kind = KIND[it.kind.toLowerCase()];
        if (!kind) { errors.push(n + ': Kind must be S, K or T (or 尊敬 / 謙譲 / 丁重)'); return; }
        items.push({ type, id: it.id || 'x:' + it.verb + ':' + kind + ':' + it.keigo, verb: it.verb, meaning: it.meaning, kind, keigo: it.keigo,
          reading: it.reading || it.keigo, notes: it.notes || '', sentence: it.sentence || '', translation: it.translation || '' });
      } else {
        const missing = ['mode', 'sentence', 'answer', 'wrong'].filter(k => !it[k]);
        if (missing.length) { errors.push(n + ': missing ' + missing.join(', ')); return; }
        const mode = it.mode.toLowerCase();
        if (!['who', 'error', 'build'].includes(mode)) { errors.push(n + ': Mode must be who, error or build'); return; }
        const wrong = it.wrong.split(/[|｜]/).map(s => s.trim()).filter(Boolean);
        if (wrong.length !== 3 || wrong.includes(it.answer)) { errors.push(n + ': Wrong needs exactly 3 different choices separated by |'); return; }
        items.push({ type, id: it.id || 'x:' + mode + ':' + it.sentence + ':' + it.answer, mode, situation: it.situation || '', sentence: it.sentence, answer: it.answer, wrong, why: it.why || '' });
      }
    });
    return { items, errors };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = parseKeigo;
  else root.parseKeigo = parseKeigo;
})(typeof window !== 'undefined' ? window : globalThis);
