/* Cloud sync for the N2 SRS apps. Load BEFORE the app script:
   <script src="sync.js" data-app="vocab" data-keys="n2srs.v1,n2srs.v1.session"></script>
   localStorage stays the working copy; every write to a watched key is pushed to the sync Worker
   (debounced). On open, a newer cloud copy replaces the local one. Failures never block studying. */
(function () {
  'use strict';
  var me = document.currentScript;
  var APP = me.dataset.app, KEYS = me.dataset.keys.split(',');
  var API = (function () { try { return localStorage.getItem('srs.api'); } catch (e) { return null; } })() || me.dataset.api || 'https://srs-sync.espi-code.workers.dev';
  var TS_KEY = 'srs.sync.ts.' + APP, TOKEN_KEY = 'srs.token';
  var ls = window.localStorage, setRaw = Storage.prototype.setItem, delRaw = Storage.prototype.removeItem;
  var timer = null, pushing = false, blocked = false;

  var get = function (k) { try { return ls.getItem(k); } catch (e) { return null; } };
  var localTs = function () { return +get(TS_KEY) || 0; };
  var setTs = function (t) { try { setRaw.call(ls, TS_KEY, String(t)); } catch (e) {} };
  var hasData = function () { return KEYS.some(function (k) { return get(k) != null; }); };
  var token = function () { return get(TOKEN_KEY); };

  // small status badge so it is always clear whether the data is safely in the cloud
  var badge;
  function say(text, bad) {
    if (!document.body) { document.addEventListener('DOMContentLoaded', function () { say(text, bad); }); return; }
    if (!badge) {
      badge = document.createElement('div');
      badge.style.cssText = 'position:fixed;right:8px;bottom:calc(6px + env(safe-area-inset-bottom,0px));font:11px/1 system-ui,sans-serif;opacity:.65;pointer-events:none;z-index:9999;padding:3px 6px;border-radius:8px;background:rgba(128,128,128,.18)';
      document.body.appendChild(badge);
    }
    badge.textContent = '☁ ' + text;
    badge.style.color = bad ? '#c0392b' : 'inherit';
  }

  function snapshot() { var d = {}; KEYS.forEach(function (k) { var v = get(k); if (v != null) d[k] = v; }); return d; }
  function request(method, body, keepalive) {
    return fetch(API + '/state/' + APP, {
      method: method, keepalive: !!keepalive,
      headers: { 'Authorization': 'Bearer ' + token(), 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
  }

  function push(keepalive) {
    if (blocked || !token() || pushing || !hasData()) return Promise.resolve();
    pushing = true;
    var ts = localTs() || Date.now();
    return request('PUT', { ts: ts, data: snapshot() }, keepalive).then(function (r) {
      if (r.status === 409) { blocked = true; say('cloud has newer data – reload', true); return; }
      if (r.status === 401) { blocked = true; try { delRaw.call(ls, TOKEN_KEY); } catch (e) {} say('wrong token – reload to re-enter', true); return; }
      if (!r.ok) throw new Error('http ' + r.status);
      say('saved');
    }).catch(function () { say('offline – will sync later', true); })
      .then(function () { pushing = false; });
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(function () { push(false); }, 1500); }

  // every write to a watched key bumps the local timestamp and schedules a push
  function touched(k) { if (KEYS.indexOf(k) > -1) { setTs(Date.now()); schedule(); } }
  Storage.prototype.setItem = function (k, v) { setRaw.call(this, k, v); if (this === ls) touched(k); };
  Storage.prototype.removeItem = function (k) { delRaw.call(this, k); if (this === ls) touched(k); };

  function adopt(rec) {
    KEYS.forEach(function (k) { if (rec.data[k] != null) setRaw.call(ls, k, rec.data[k]); else delRaw.call(ls, k); });
    setTs(rec.ts);
    location.reload();
  }

  function boot() {
    if (!token()) {
      var skipped = false; try { skipped = sessionStorage.getItem('srs.skip') === '1'; } catch (e) {}
      if (skipped) return say('sync off', true);
      var t = window.prompt('Sync token (one-time; leave empty to skip):');
      if (!t || !t.trim()) { try { sessionStorage.setItem('srs.skip', '1'); } catch (e) {} return say('sync off', true); }
      try { setRaw.call(ls, TOKEN_KEY, t.trim()); } catch (e) {}
    }
    say('syncing…');
    request('GET').then(function (r) {
      if (r.status === 401) { try { delRaw.call(ls, TOKEN_KEY); } catch (e) {} blocked = true; say('wrong token – reload to re-enter', true); return null; }
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (rec) {
      if (!rec) return;
      var haveCloud = rec.data && Object.keys(rec.data).length > 0;
      if (haveCloud && !hasData()) return adopt(rec);                       // fresh/cleared device: restore from cloud
      if (haveCloud && localTs() === 0 && hasData()) {                       // both sides have data, no history on this device
        if (window.confirm('Cloud and this device both have saved progress.\nOK = keep THIS device (overwrite cloud)\nCancel = use the CLOUD copy')) { setTs(Math.max(Date.now(), rec.ts + 1)); return push(false); }
        return adopt(rec);
      }
      if (haveCloud && rec.ts > localTs()) return adopt(rec);               // cloud is newer
      if (hasData() && (!haveCloud || localTs() > rec.ts || localTs() === 0)) { if (!localTs()) setTs(Date.now()); return push(false); }
      say('synced');
    }).catch(function () { say('offline – will sync later', true); });
  }

  window.addEventListener('online', function () { schedule(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && timer) { clearTimeout(timer); timer = null; push(true); } });
  boot();
})();
