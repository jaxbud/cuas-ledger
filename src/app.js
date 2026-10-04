(function () {
  'use strict';

  var D = JSON.parse(document.getElementById('ledger-data').textContent);
  var app = document.getElementById('app');
  var CATS = D.meta.categories;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function usd(v, opts) {
    if (v == null || v === '' || isNaN(v)) return '—';
    var a = Math.abs(v);
    if (opts && opts.exact) return '$' + Math.round(v).toLocaleString('en-US');
    if (a >= 1e9) return '$' + (v / 1e9).toFixed(a >= 1e10 ? 1 : 2).replace(/\.?0+$/, '') + 'B';
    if (a >= 1e6) return '$' + (v / 1e6).toFixed(a >= 1e8 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (a >= 1e3) return '$' + Math.round(v / 1e3) + 'K';
    return '$' + Math.round(v);
  }
  function fdate(d) {
    if (!d) return '—';
    var p = String(d).split('-');
    if (p.length === 1) return p[0];
    if (p.length === 2) return MONTHS[+p[1] - 1] + ' ' + p[0];
    return +p[2] + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0];
  }
  function host(u) {
    try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'source'; }
  }
  function srcLink(u, name) {
    if (!u) return '';
    return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(name || host(u)) + '</a>';
  }
  function kindLabel(k) {
    return { ceiling: 'ceiling', obligated: 'obligated', firm: 'contract value', estimate: 'estimate' }[k] || '';
  }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }
  function h(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

  // ---------- routes ----------
  var GROUPS = [
    { label: 'Start', items: [['overview', 'Overview'], ['outlook', 'Outlook for UM']] },
    { label: 'Last 12 months', items: [['deep-dive', 'Contracts', D.stats.curated_recent_count], ['statements', 'Statements', D.statements.length], ['contacts', 'Contacts', D.contacts.length], ['opportunities', 'Opportunities', D.opportunities.length]] },
    { label: 'The record', items: [['history', 'History'], ['contracts', 'All contracts', D.contracts.length], ['ledger', 'Federal ledger', D.federal.length]] },
    { label: 'Library', items: [['reports', 'Reports', D.reports.length], ['method', 'Sources & domain']] }
  ];
  var VIEWS = {};

  function shell() {
    var stamp = '<div class="stamp">Data as of <b>' + fdate(D.meta.today) + '</b><br>' +
      D.contracts.length + ' curated awards · ' + D.federal.length + ' federal records<br>' +
      '<button class="theme-toggle" id="theme-toggle" type="button">Theme: system</button></div>';
    var nav = GROUPS.map(function (g) {
      return '<div class="index-group"><h2>' + esc(g.label) + '</h2>' + g.items.map(function (it) {
        return '<a href="#' + it[0] + '" data-route="' + it[0] + '"><span>' + esc(it[1]) + '</span>' +
          (it[2] != null ? '<span class="n">' + it[2] + '</span>' : '') + '</a>';
      }).join('') + '</div>';
    }).join('');
    app.innerHTML =
      '<header class="masthead"><div><h1 class="wordmark">CUAS <span>Ledger</span></h1>' +
      '<p class="dek">Every public counter-drone contract we could verify, the government statements and contacts behind the last twelve months of buying, and what it means for Unified Mechanics.</p></div>' + stamp + '</header>' +
      '<div class="layout"><nav class="index" aria-label="Sections">' + nav + '</nav><main class="view" id="view" tabindex="-1"></main></div>' +
      '<footer class="colophon"><span>CUAS Ledger · prepared for Unified Mechanics</span><span>Live at jaxbud.github.io/cuas-ledger</span>' +
      '<span>Sources: USAspending.gov, DoD and agency releases, Federal Register, trade press — every row links to its source</span></footer>';
    initTheme();
  }

  function initTheme() {
    var btn = document.getElementById('theme-toggle');
    var order = ['system', 'light', 'dark'];
    var cur = store('cuas-theme') || 'system';
    function apply(t) {
      if (t === 'system') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', t);
      btn.textContent = 'Theme: ' + t;
    }
    apply(cur);
    btn.addEventListener('click', function () {
      cur = order[(order.indexOf(cur) + 1) % 3];
      store('cuas-theme', cur);
      apply(cur);
    });
  }

  function route() {
    var token = (location.hash || '').replace(/^#/, '') || 'overview';
    var base = token;
    if (/^report-\d+$/.test(token)) base = 'reports';
    if (!VIEWS[base]) { base = 'overview'; token = 'overview'; }
    document.querySelectorAll('nav.index a').forEach(function (a) {
      if (a.getAttribute('data-route') === base) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    var view = document.getElementById('view');
    view.innerHTML = '';
    VIEWS[base](view, token);
    var active = document.querySelector('nav.index a[aria-current="page"]');
    if (active && active.scrollIntoView && window.innerWidth <= 900) active.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function pageHead(eyebrow, title, lede) {
    return '<div class="page-head"><div class="eyebrow">' + esc(eyebrow) + '</div><h1 class="page-title">' + esc(title) + '</h1>' +
      (lede ? '<p class="lede">' + lede + '</p>' : '') + '</div>';
  }

  // ---------- charts ----------
  function attachTip(chartEl) {
    var tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.hidden = true;
    chartEl.appendChild(tip);
    chartEl.addEventListener('mousemove', function (e) {
      var t = e.target.closest('[data-tip]');
      if (!t) { tip.hidden = true; return; }
      var r = chartEl.getBoundingClientRect();
      tip.innerHTML = t.getAttribute('data-tip');
      tip.hidden = false;
      tip.style.left = Math.min(Math.max(e.clientX - r.left, 70), r.width - 70) + 'px';
      tip.style.top = (e.clientY - r.top - 8) + 'px';
    });
    chartEl.addEventListener('mouseleave', function () { tip.hidden = true; });
  }

  // vertical bars: rows = [{label, value, tip, partial}]
  function vbars(title, note, rows) {
    var W = 720, H = 240, L = 52, R = 8, T = 10, B = 26;
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }));
    var step = niceStep(max);
    var top = Math.ceil(max / step) * step;
    var iw = W - L - R, ih = H - T - B;
    var bw = iw / rows.length;
    var y = function (v) { return T + ih - (v / top) * ih; };
    var g = '';
    for (var v = 0; v <= top + 1e-6; v += step) {
      g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"></line>';
      g += '<text class="lbl" x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + usd(v) + '</text>';
    }
    var bars = rows.map(function (r, i) {
      var x = L + i * bw + bw * 0.18, w = bw * 0.64, yy = y(r.value), hh = T + ih - yy;
      var rad = Math.min(4, w / 2, hh);
      var path = hh > 0 ? 'M' + x + ',' + (T + ih) + 'V' + (yy + rad) + 'Q' + x + ',' + yy + ' ' + (x + rad) + ',' + yy + 'H' + (x + w - rad) + 'Q' + (x + w) + ',' + yy + ' ' + (x + w) + ',' + (yy + rad) + 'V' + (T + ih) + 'Z' : '';
      var showLbl = rows.length <= 20 && (i % (rows.length > 12 ? 2 : 1) === 0 || i === rows.length - 1);
      return '<g><path class="barpath' + (r.partial ? ' partial' : '') + '" d="' + path + '" style="fill:' + (r.partial ? 'color-mix(in srgb, var(--bar) 45%, var(--surface))' : 'var(--bar)') + '"></path>' +
        '<rect class="hit" x="' + (L + i * bw) + '" y="' + T + '" width="' + bw + '" height="' + ih + '" data-tip="' + esc(r.tip) + '"></rect>' +
        (showLbl ? '<text class="lbl" x="' + (x + w / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(r.label) + '</text>' : '') + '</g>';
    }).join('');
    var el = h('<div class="chart"><h3>' + esc(title) + '</h3><p class="note">' + note + '</p><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(title) + '"><g class="grid">' + g + '</g>' + bars + '</svg></div>');
    el.querySelectorAll('rect.hit').forEach(function (rc) {
      var p = rc.previousElementSibling;
      rc.addEventListener('mouseenter', function () { p.style.opacity = '0.75'; });
      rc.addEventListener('mouseleave', function () { p.style.opacity = ''; });
    });
    attachTip(el);
    return el;
  }

  // horizontal bars: rows = [{label, value, display, tip}]
  function hbars(title, note, rows, opts) {
    opts = opts || {};
    var W = 500, rowH = 26, L = opts.labelW || 170, R = 64, T = 4;
    var H = T + rows.length * rowH + 4;
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; })) || 1;
    var iw = W - L - R;
    var body = rows.map(function (r, i) {
      var y = T + i * rowH, w = Math.max(2, (r.value / max) * iw), bh = 14, by = y + (rowH - bh) / 2;
      var rad = Math.min(4, w / 2);
      var path = 'M' + L + ',' + by + 'H' + (L + w - rad) + 'Q' + (L + w) + ',' + by + ' ' + (L + w) + ',' + (by + rad) + 'V' + (by + bh - rad) + 'Q' + (L + w) + ',' + (by + bh) + ' ' + (L + w - rad) + ',' + (by + bh) + 'H' + L + 'Z';
      return '<g><text class="catlbl" x="' + (L - 8) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end">' + esc(trunc(r.label, opts.maxChars || 30)) + '</text>' +
        '<path d="' + path + '" style="fill:var(--bar)"></path>' +
        '<text class="val" x="' + (L + w + 6) + '" y="' + (y + rowH / 2 + 4) + '">' + esc(r.display) + '</text>' +
        '<rect class="hit" x="0" y="' + y + '" width="' + W + '" height="' + rowH + '" data-tip="' + esc(r.tip || (r.label + ': ' + r.display)) + '"></rect></g>';
    }).join('');
    var el = h('<div class="chart"><h3>' + esc(title) + '</h3><p class="note">' + note + '</p><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(title) + '">' + body + '</svg></div>');
    attachTip(el);
    return el;
  }
  function trunc(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function niceStep(max) {
    var raw = max / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  }

  function fyChart() {
    var rows = D.stats.federal_by_fy.filter(function (r) { return r.fy >= 2016; }).map(function (r) {
      var partial = r.fy === 2026;
      return { label: 'FY' + String(r.fy).slice(2), value: r.amount, partial: partial,
        tip: '<b>FY' + r.fy + '</b> · ' + usd(r.amount) + ' obligated · ' + r.count + ' awards' + (partial ? ' · partial (90-day DoD lag)' : '') };
    });
    return vbars('US federal C-UAS obligations by fiscal year',
      'USAspending.gov awards matching counter-drone terms, FY2016–FY2026. FY2026 (lighter) is partial: DoD data posts with a ~90-day delay. Obligations, not ceilings.', rows);
  }

  // ---------- contracts table ----------
  function contractTable(container, list, opts) {
    opts = opts || {};
    var state = { q: '', cat: '', region: '', era: opts.era || '', sort: 'date', dir: -1, open: {} };
    var regions = uniq(list.map(function (c) { return c.region; }));
    var cats = uniq(list.map(function (c) { return c.category; }));
    var ctl = h('<div class="controls">' +
      '<input type="search" id="' + opts.id + '-q" placeholder="Search vendor, buyer, system…" aria-label="Search contracts">' +
      '<select id="' + opts.id + '-cat" aria-label="Effector category"><option value="">All categories</option>' + cats.map(function (c) { return '<option value="' + c + '">' + esc(CATS[c]) + '</option>'; }).join('') + '</select>' +
      '<select id="' + opts.id + '-reg" aria-label="Region"><option value="">All regions</option>' + regions.map(function (r) { return '<option>' + esc(r) + '</option>'; }).join('') + '</select>' +
      (opts.showEra ? '<div class="seg" role="group" aria-label="Period"><button type="button" data-era="" aria-pressed="true">All</button><button type="button" data-era="recent" aria-pressed="false">Last 12 months</button><button type="button" data-era="history" aria-pressed="false">History</button></div>' : '') +
      '<span class="count"></span></div>');
    var wrap = h('<div class="table-scroll"><table><thead><tr>' +
      '<th class="sortable" data-k="date" aria-sort="descending">Date</th><th class="sortable c-vendor" data-k="vendor">Vendor · system</th><th class="c-buyer">Buyer</th><th>Category</th><th class="num sortable" data-k="value">Value</th><th>Source</th>' +
      '</tr></thead><tbody></tbody></table></div>');
    container.appendChild(ctl);
    container.appendChild(wrap);
    var tbody = wrap.querySelector('tbody');
    var count = ctl.querySelector('.count');

    function filtered() {
      var q = state.q.toLowerCase();
      return list.filter(function (c) {
        if (state.cat && c.category !== state.cat) return false;
        if (state.region && c.region !== state.region) return false;
        if (state.era === 'recent' && !c.recent) return false;
        if (state.era === 'history' && c.recent) return false;
        if (q && (c.vendor + ' ' + c.customer + ' ' + c.system + ' ' + c.country + ' ' + c.summary).toLowerCase().indexOf(q) < 0) return false;
        return true;
      }).sort(function (a, b) {
        var k = state.sort, x, y;
        if (k === 'value') { x = a.value_usd || -1; y = b.value_usd || -1; }
        else if (k === 'vendor') { x = a.vendor.toLowerCase(); y = b.vendor.toLowerCase(); }
        else { x = a.date; y = b.date; }
        return x < y ? -state.dir : x > y ? state.dir : 0;
      });
    }
    function render() {
      var rows = filtered();
      count.textContent = rows.length + ' of ' + list.length;
      tbody.innerHTML = rows.map(function (c) {
        var open = state.open[c.id];
        var main = '<tr class="row-main" data-id="' + esc(c.id) + '" tabindex="0" aria-expanded="' + (open ? 'true' : 'false') + '">' +
          '<td class="mono">' + fdate(c.date) + (c.recent ? '<br><span class="chip recent">FY26+</span>' : '') + '</td>' +
          '<td><span class="vendor">' + esc(c.vendor) + '</span><div class="sub">' + esc(c.system) + '</div></td>' +
          '<td>' + esc(c.customer) + '<div class="sub">' + esc(c.country) + '</div></td>' +
          '<td><span class="chip">' + esc(c.category_label) + '</span></td>' +
          '<td class="num">' + (c.value_usd ? usd(c.value_usd) : '<span class="sub">n/d</span>') + '<span class="val-kind">' + esc(kindLabel(c.value_kind)) + '</span></td>' +
          '<td>' + srcLink(c.source, c.source_name) + '</td></tr>';
        var det = open ? '<tr class="row-detail"><td colspan="6"><p>' + esc(c.summary) + '</p>' +
          '<div class="sub">Reported value: ' + esc(c.value_original || '—') + (c.vehicle ? ' · Vehicle: ' + esc(c.vehicle) : '') + ' · Confidence: ' + esc(c.confidence) + '</div>' +
          '<div class="sub">Sources: ' + srcLink(c.source, c.source_name) + (c.source2 ? ' · ' + srcLink(c.source2) : '') + '</div></td></tr>' : '';
        return main + det;
      }).join('') || '<tr><td colspan="6">No awards match these filters. Clear the search or pick "All".</td></tr>';
    }
    ctl.querySelector('input').addEventListener('input', function (e) { state.q = e.target.value; render(); });
    ctl.querySelector('#' + opts.id + '-cat').addEventListener('change', function (e) { state.cat = e.target.value; render(); });
    ctl.querySelector('#' + opts.id + '-reg').addEventListener('change', function (e) { state.region = e.target.value; render(); });
    ctl.querySelectorAll('[data-era]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.era = b.getAttribute('data-era');
        ctl.querySelectorAll('[data-era]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render();
      });
    });
    wrap.querySelectorAll('th.sortable').forEach(function (th) {
      th.addEventListener('click', function () {
        var k = th.getAttribute('data-k');
        state.dir = state.sort === k ? -state.dir : (k === 'vendor' ? 1 : -1);
        state.sort = k;
        wrap.querySelectorAll('th.sortable').forEach(function (x) { x.removeAttribute('aria-sort'); });
        th.setAttribute('aria-sort', state.dir === 1 ? 'ascending' : 'descending');
        render();
      });
    });
    function toggle(tr) { var id = tr.getAttribute('data-id'); state.open[id] = !state.open[id]; render(); }
    tbody.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var tr = e.target.closest('tr.row-main');
      if (tr) toggle(tr);
    });
    tbody.addEventListener('keydown', function (e) {
      var tr = e.target.closest('tr.row-main');
      if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(tr); }
    });
    render();
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }).sort(); }

  // ---------- views ----------
  VIEWS.overview = function (v) {
    var s = D.stats;
    v.innerHTML = pageHead('Overview · as of ' + fdate(D.meta.today), 'The counter-drone market moved from pilots to enterprise buying this year',
      'Ten reports, a curated database of ' + s.curated_count + ' awards and programmes, and ' + s.federal_count + ' US federal award records pulled from USAspending.gov. The last twelve months (FY2026 onward) get their own deep dive. Older awards are kept as notable history.') +
      '<section class="block"><div class="tiles">' +
      tile(usd(s.federal_total), 'US federal C-UAS obligations since FY2011', s.federal_count + ' awards · USAspending') +
      tile('$20.6B', 'FY2027 request for counter-unmanned systems', '+424% vs FY26 enacted') +
      tile('$53B+', 'Announced C-UAS contracts worldwide, Jan–Sep 2026', 'Unmanned Airspace tracker') +
      tile(String(s.curated_recent_count), 'Major awards logged since 1 Oct 2025', 'of ' + s.curated_count + ' curated') +
      '</div></section>';
    var b1 = h('<section class="block"></section>');
    b1.appendChild(fyChart());
    v.appendChild(b1);

    var two = h('<section class="block two-col"><div><h2 class="section-title">What changed in the last twelve months</h2><ul class="plain">' +
      '<li><strong>JIATF-401 became the buyer.</strong> A $7B multi-vendor IDIQ (12 holders), the cuas.mil marketplace, Domestic Shield and Replicator 2, with $1.4B in the House FY27 bill.</li>' +
      '<li><strong>Anduril\'s $20B Army vehicle</strong> made Lattice the C-UAS command-and-control standard.</li>' +
      '<li><strong>Interceptor drones went to volume:</strong> 13,000 Merops in eight days, then a $500M Perennial IDIQ. Germany, the UK, Latvia, Australia and the Gulf states bought interceptors too.</li>' +
      '<li><strong>Homeland defense got money and authority:</strong> FEMA $250M, the DHS $1.5B IDIQ, SAFER SKIES, and beyond-the-fence-line rules for commanders.</li>' +
      '<li><strong>Lasers reached production</strong> (E-HEL $464.8M, DragonFire £316M), and Europe started building its drone wall (Poland $4.2B).</li></ul></div>' +
      '<aside class="callout"><h3>For Unified Mechanics</h3><p>Buyers have asked for exactly what UM is building: non-explosive interceptors for homeland use, drone-on-drone defense of US bases, and capture. JIATF-401\'s first Replicator 2 buy was a net-capture interceptor.</p><p>The gap is evidence. Awards go to systems with test data, C2 integration and a marketplace listing. The front doors are JIATF-401\'s Commercial Solutions Opening (rolling through 2028), a USASOC open call (closes 1 Dec 2026), SBIR, and test events such as the Air Force battle lab and the Navy\'s Thunderdome.</p><p><a href="#outlook">Read the outlook →</a></p></aside></section>');
    v.appendChild(two);

    var catRows = s.curated_by_category.map(function (r) { return { label: r[0], value: r[1], display: r[1] + ' awards', tip: r[0] + ': ' + r[1] + ' awards · ' + usd(r[2]) + ' reported (mixed ceilings and values)' }; });
    var b2 = h('<section class="block two-col"></section>');
    var c1 = h('<div></div>'); c1.appendChild(hbars('Curated awards by effector', 'Count of curated awards and programmes, all years. Hover for summed reported values (ceilings and values mixed, so read as scale only).', catRows, { labelW: 170, maxChars: 26 }));
    var recRows = s.federal_top_recipients.slice(0, 10).map(function (r) { return { label: r[0], value: r[1], display: usd(r[1]) }; });
    var c2 = h('<div></div>'); c2.appendChild(hbars('Largest federal C-UAS recipients', 'Obligations in the USAspending ledger, FY2011–FY2026.', recRows, { labelW: 190, maxChars: 28 }));
    b2.appendChild(c1); b2.appendChild(c2);
    v.appendChild(b2);

    var latest = D.contracts.filter(function (c) { return c.recent; }).slice(0, 8);
    var b3 = h('<section class="block"><h2 class="section-title">Latest awards</h2></section>');
    var holder = h('<div></div>'); b3.appendChild(holder);
    contractTable(holder, latest, { id: 'latest' });
    b3.appendChild(h('<p class="src" style="margin-top:8px"><a href="#deep-dive">All ' + s.curated_recent_count + ' awards from the last twelve months →</a></p>'));
    v.appendChild(b3);
  };
  function tile(k, l, s) { return '<div class="tile"><div class="k">' + esc(k) + '</div><div class="l">' + esc(l) + '</div><div class="s">' + esc(s) + '</div></div>'; }

  VIEWS['deep-dive'] = function (v) {
    var recent = D.contracts.filter(function (c) { return c.recent; });
    v.innerHTML = pageHead('Deep dive · 1 Oct 2025 – ' + fdate(D.meta.today), 'Every major award in the last twelve months',
      recent.length + ' awards and programmes, US and international. Click a row for the summary and both sources. Values are labelled as ceiling, obligated, contract value or estimate, and are never summed across types.');
    // month histogram
    var months = {};
    recent.forEach(function (c) { var k = c.date.slice(0, 7); if (k.length === 7) months[k] = (months[k] || 0) + 1; });
    var keys = [];
    for (var y = 2025, m = 10; y < 2026 || (y === 2026 && m <= 9); m++) { if (m > 12) { m = 1; y++; } keys.push(y + '-' + (m < 10 ? '0' : '') + m); }
    var rows = keys.map(function (k) { var p = k.split('-'); return { label: MONTHS[+p[1] - 1], value: months[k] || 0, tip: '<b>' + MONTHS[+p[1] - 1] + ' ' + p[0] + '</b> · ' + (months[k] || 0) + ' awards logged' }; });
    var b = h('<section class="block"></section>');
    var ch = vbars('Awards logged per month', 'Curated awards with a known month, Oct 2025 – Sep 2026. Counts, not dollars (y-axis shows counts).', rows);
    ch.querySelectorAll('text.lbl').forEach(function (t) { if (/^\$/.test(t.textContent)) t.textContent = t.textContent.replace('$', ''); });
    b.appendChild(ch);
    v.appendChild(b);
    var t = h('<section class="block"><h2 class="section-title">Award database — last twelve months</h2></section>');
    var holder = h('<div></div>'); t.appendChild(holder); v.appendChild(t);
    contractTable(holder, recent, { id: 'recent' });
    var r = D.reports.filter(function (x) { return x.num === 6; })[0];
    v.appendChild(h('<section class="block"><div class="eyebrow">Report 6</div><h2 class="section-title">' + esc(r.title) + '</h2><article class="prose">' + r.html + '</article></section>'));
  };

  VIEWS.statements = function (v) {
    var topics = uniq(D.statements.map(function (s) { return s.topic; }));
    v.innerHTML = pageHead('Deep dive · government statements', 'What officials said, and what it means for UM',
      D.statements.length + ' statements, rules, budget documents and oversight findings. Each has a short exact quote (or a marked paraphrase), the key points, a note on relevance to Unified Mechanics, and its source.');
    var ctl = h('<div class="controls"><input type="search" id="st-q" placeholder="Search speaker, office, topic…" aria-label="Search statements"><select id="st-topic" aria-label="Topic"><option value="">All topics</option>' +
      topics.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('') + '</select><div class="seg" role="group" aria-label="Period"><button type="button" data-p="recent" aria-pressed="true">Last 12 months</button><button type="button" data-p="" aria-pressed="false">All</button></div><span class="count"></span></div>');
    var list = h('<div class="stack"></div>');
    v.appendChild(ctl); v.appendChild(list);
    var st = { q: '', topic: '', p: 'recent' };
    function render() {
      var q = st.q.toLowerCase();
      var rows = D.statements.filter(function (s) {
        if (st.p === 'recent' && !s.recent) return false;
        if (st.topic && s.topic !== st.topic) return false;
        if (q && (s.speaker + ' ' + s.role + ' ' + s.org + ' ' + s.quote + ' ' + s.points.join(' ') + ' ' + s.topic).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      ctl.querySelector('.count').textContent = rows.length + ' of ' + D.statements.length;
      list.innerHTML = rows.map(function (s) {
        return '<article class="statement"><div class="when"><span>' + fdate(s.date) + '</span><span class="chip">' + esc(s.topic) + '</span>' + (s.recent ? '' : '<span class="chip">baseline</span>') + '</div><div>' +
          '<div class="who">' + esc(s.speaker) + '</div><div class="role">' + esc(s.role) + ' · ' + esc(s.org) + '</div>' +
          (/^\(|\(paraphrase/.test(s.quote) ? '<blockquote class="para">' + esc(s.quote.replace(/^\((.*?)\)\s*/, '$1: ')) + '</blockquote>' : '<blockquote>' + esc(s.quote) + '</blockquote>') +
          '<ul>' + s.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
          '<div class="for-um"><b>For UM</b>' + esc(s.um_relevance) + '</div>' +
          '<div class="src" style="margin-top:6px">' + esc(s.venue) + ' · ' + srcLink(s.source, s.source_name) + (s.source2 ? ' · ' + srcLink(s.source2) : '') + '</div></div></article>';
      }).join('') || '<p>No statements match. Try "All".</p>';
    }
    ctl.querySelector('input').addEventListener('input', function (e) { st.q = e.target.value; render(); });
    ctl.querySelector('select').addEventListener('change', function (e) { st.topic = e.target.value; render(); });
    ctl.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.p = b.getAttribute('data-p');
        ctl.querySelectorAll('[data-p]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render();
      });
    });
    render();
    var r = D.reports.filter(function (x) { return x.num === 7; })[0];
    v.appendChild(h('<section class="block"><div class="eyebrow">Report 7</div><h2 class="section-title">' + esc(r.title) + '</h2><article class="prose">' + r.html + '</article></section>'));
  };

  VIEWS.contacts = function (v) {
    v.innerHTML = pageHead('Deep dive · who decides', 'Contacts and program offices',
      'Public officials in their official roles, and the official channels they publish for industry. No personal details. Priority 1 means the first conversations for UM. Verify titles before outreach: several offices were reorganized in 2026.');
    var tiers = { channel: 'Front door', decision: 'Decision-maker', program: 'Program owner', gate: 'Authority / gate' };
    var ctl = h('<div class="controls"><input type="search" id="ct-q" placeholder="Search name, office, channel…" aria-label="Search contacts"><select id="ct-tier" aria-label="Type"><option value="">All types</option>' +
      Object.keys(tiers).map(function (k) { return '<option value="' + k + '">' + tiers[k] + '</option>'; }).join('') + '</select><span class="count"></span></div>');
    var wrap = h('<div class="table-scroll"><table class="wide"><thead><tr><th>Priority</th><th class="c-vendor">Name / office</th><th class="c-buyer">Role</th><th class="c-chan">How to engage</th><th class="c-why">Why it matters to UM</th><th>Source</th></tr></thead><tbody></tbody></table></div>');
    v.appendChild(ctl); v.appendChild(wrap);
    var st = { q: '', tier: '' };
    function channelHtml(c) {
      var t = esc(c.channel);
      return t.replace(/([A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[a-z]{2,})/g, '<span class="addr">$1</span><button class="copy" type="button" data-copy="$1">Copy</button>');
    }
    function render() {
      var q = st.q.toLowerCase();
      var rows = D.contacts.filter(function (c) {
        if (st.tier && c.tier !== st.tier) return false;
        if (q && (c.name + ' ' + c.title + ' ' + c.org + ' ' + c.channel + ' ' + c.why).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      ctl.querySelector('.count').textContent = rows.length + ' of ' + D.contacts.length;
      wrap.querySelector('tbody').innerHTML = rows.map(function (c) {
        return '<tr><td class="prio prio-' + c.priority + '">P' + c.priority + '<div class="sub">' + esc(tiers[c.tier] || c.tier) + '</div></td>' +
          '<td><span class="vendor">' + esc(c.name) + '</span><div class="sub">' + esc(c.org) + '</div></td>' +
          '<td>' + esc(c.title) + '</td><td>' + channelHtml(c) + '</td><td>' + esc(c.why) + '</td><td>' + srcLink(c.source) + '</td></tr>';
      }).join('');
    }
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-copy]');
      if (!b) return;
      var text = b.getAttribute('data-copy');
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { selectText(b.previousElementSibling); b.textContent = 'Selected'; });
      } else { selectText(b.previousElementSibling); b.textContent = 'Selected'; }
    });
    ctl.querySelector('input').addEventListener('input', function (e) { st.q = e.target.value; render(); });
    ctl.querySelector('select').addEventListener('change', function (e) { st.tier = e.target.value; render(); });
    render();
    var r = D.reports.filter(function (x) { return x.num === 8; })[0];
    v.appendChild(h('<section class="block"><div class="eyebrow">Report 8</div><h2 class="section-title">' + esc(r.title) + '</h2><article class="prose">' + r.html + '</article></section>'));
  };
  function selectText(el) {
    try { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) { /* ignore */ }
  }

  VIEWS.opportunities = function (v) {
    var order = { open: 0, imminent: 1, recurring: 2, upcoming: 3, 'in-progress': 4, watch: 5, closed: 6 };
    var fitOrder = { high: 0, medium: 1, low: 2 };
    var rows = D.opportunities.slice().sort(function (a, b) { return (order[a.status] - order[b.status]) || (fitOrder[a.fit] - fitOrder[b.fit]); });
    v.innerHTML = pageHead('Deep dive · openings', 'Where UM can get in',
      'Open, imminent, recurring and recently closed opportunities, each rated for fit with UM\'s interceptor. Closed items stay listed because these calls tend to recur on a cycle.');
    var grid = h('<div class="opp-grid"></div>');
    grid.innerHTML = rows.map(function (o) {
      return '<article class="opp"><div class="meta"><span class="pill-status st-' + esc(o.status) + '">' + esc(o.status.replace('-', ' ')) + '</span><span class="pill-status st-' + esc(o.fit) + '">' + esc(o.fit) + ' fit</span></div>' +
        '<h3>' + esc(o.title) + '</h3><dl><dt>Agency</dt><dd>' + esc(o.agency) + '</dd><dt>Type</dt><dd>' + esc(o.type) + '</dd><dt>Deadline</dt><dd>' + esc(o.deadline) + '</dd><dt>Size</dt><dd>' + esc(o.amount) + '</dd></dl>' +
        '<p>' + esc(o.fit_note) + '</p>' + (o.contact ? '<p class="addr">' + esc(o.contact) + '</p>' : '') +
        '<div class="src">' + srcLink(o.url, 'Listing') + (o.source && o.source !== o.url ? ' · ' + srcLink(o.source) : '') + (o.verify ? ' · ' + esc(o.verify) : '') + '</div></article>';
    }).join('');
    v.appendChild(grid);
  };

  VIEWS.outlook = function (v) {
    var r = D.reports.filter(function (x) { return x.num === 10; })[0];
    v.innerHTML = pageHead('Unified Mechanics · internal', 'Contracting outlook for Unified Mechanics',
      'The money and buyers for UM\'s niche now exist. The work for the next 6–9 months is getting characterized, listed and integrated. Use the calculator to test the cost case against the interceptor prices buyers have quoted.');
    var gates = [
      ['Characterization data', 'JIATF-401 picks after standardized shoot-offs; the marketplace requires product evaluation.', 'Not started', 'critical'],
      ['C2 integration', 'Lattice is the C-UAS C2; the US-UK data standard is becoming a listing requirement. SOSA/MEDUSA on Air Force topics.', 'Not started', 'critical'],
      ['NDAA / Blue UAS components', 'Blue UAS list now at DCMA; FY27 NDAA widens restricted components.', 'Design choice', 'serious'],
      ['Radar spectrum', 'DoD spectrum supportability; FCC authorization for RF-emitting C-UAS used by police.', 'Plan early', 'serious'],
      ['Homeland legal path', 'DoD (130i) and DHS/DOJ (124n) open. State and local: physical capture isn\'t on the expected first technology list.', 'Partly open', 'warning'],
      ['Price vs. benchmarks', 'Merops $15K → $3–5K at scale; Ukrainian ~$2.5K. UM depends on measured recovery and cycle life.', 'Unmeasured', 'serious'],
      ['Pursuit speed', 'TYTAN METIS publishes 400 km/h (~249 mph), Skyhammer 700 km/h. Net drones struggle above 150–200 mph.', 'Unmeasured', 'serious'],
      ['Business plumbing', 'SAM/UEI, CAGE, NIST 800-171/CMMC, export classification (EAR vs ITAR by block).', 'Do now', 'warning']
    ];
    var g = h('<section class="block"><h2 class="section-title">The gates, at a glance</h2><div class="gates">' + gates.map(function (x) {
      return '<div class="gate"><span class="pill-status" style="color:var(--' + x[3] + ')">' + esc(x[2]) + '</span><h4>' + esc(x[0]) + '</h4><p>' + esc(x[1]) + '</p></div>';
    }).join('') + '</div></section>');
    v.appendChild(g);
    v.appendChild(calculator());
    v.appendChild(h('<section class="block"><div class="eyebrow">Report 10</div><article class="prose">' + r.html + '</article></section>'));
  };

  function calculator() {
    var el = h('<section class="block"><h2 class="section-title">Cost-per-kill check</h2>' +
      '<p class="lede" style="margin-bottom:16px">Defaults are UM\'s placeholders from <code>us.json</code>, not measurements. Sorties per airframe = 1 ÷ (1 − recovery rate), capped at cycle life. Cost per shot = airframe ÷ sorties + consumable. Cost per kill = cost per shot × shots per kill.</p>' +
      '<div class="calc"><div class="fields">' +
      field('c-air', 'Airframe unit cost (USD)', 25000, 1000) + field('c-con', 'Consumable per shot (USD)', 400, 50) +
      field('c-rec', 'Recovery rate (%)', 90, 1) + field('c-life', 'Cycle life (sorties)', 100, 5) + field('c-spk', 'Shots per kill', 1.5, 0.1) +
      '</div><div class="out"><div><div class="eyebrow">Modelled cost per kill</div><div class="big" id="c-out">—</div><div class="sub" id="c-detail"></div></div>' +
      '<div class="bench" id="c-bench"></div><div class="sub" id="c-target"></div></div></div></section>');
    var ids = ['c-air', 'c-con', 'c-rec', 'c-life', 'c-spk'];
    function val(id) { var x = parseFloat(el.querySelector('#' + id).value); return isNaN(x) ? 0 : x; }
    function calc() {
      var A = val('c-air'), c = val('c-con'), r = Math.min(Math.max(val('c-rec'), 0), 100) / 100, life = Math.max(val('c-life'), 1), spk = Math.max(val('c-spk'), 0.01);
      var N = r >= 1 ? life : Math.min(life, 1 / (1 - r));
      var shot = A / N + c, kill = shot * spk;
      el.querySelector('#c-out').textContent = usd(kill, { exact: true });
      el.querySelector('#c-detail').textContent = N.toFixed(1) + ' sorties per airframe · ' + usd(shot, { exact: true }) + ' per shot';
      var bench = [
        ['Merops today (~$15K/unit, Army)', 15000],
        ['Merops at scale ($5K, Army target)', 5000],
        ['Merops best case ($3K, Driscoll)', 3000],
        ['Ukrainian interceptor (~$2.5K, Gulf deals)', 2500],
        ['UM deck target', 1600]
      ];
      el.querySelector('#c-bench').innerHTML = bench.map(function (b) {
        var win = kill <= b[1];
        return '<div class="bench-row"><span>' + esc(b[0]) + ' · ' + usd(b[1], { exact: true }) + '</span><span class="verdict ' + (win ? 'win' : 'lose') + '">' + (win ? '✓ UM cheaper' : '✗ UM dearer') + '</span></div>';
      }).join('');
      // recovery needed for the deck target
      var perShot = 1600 / spk - c;
      var msg;
      if (perShot <= 0) msg = 'At these consumable and shots-per-kill values, $1,600 per kill is out of reach whatever the recovery rate.';
      else {
        var need = A / perShot;
        msg = need > life ? 'Hitting $1,600 per kill needs ' + need.toFixed(0) + ' sorties per airframe, which is more than the ' + life + '-sortie cycle life.' :
          'Hitting $1,600 per kill needs ' + need.toFixed(0) + ' sorties per airframe, a recovery rate of about ' + (100 * (1 - 1 / need)).toFixed(1) + '%.';
      }
      el.querySelector('#c-target').textContent = msg + ' Benchmark prices are per round, not per kill. Ukraine reports 2–3 interceptor drones per Shahed.';
    }
    ids.forEach(function (id) { el.querySelector('#' + id).addEventListener('input', calc); });
    calc();
    return el;
  }
  function field(id, label, v, step) {
    return '<label for="' + id + '">' + esc(label) + '<input type="number" id="' + id + '" value="' + v + '" step="' + step + '" min="0"></label>';
  }

  VIEWS.history = function (v) {
    v.innerHTML = pageHead('Notable history · 2015 – Sep 2025', 'How counter-drone contracting got here',
      'Thirty-two sourced milestones: the threats that forced each buying wave, the policy that shaped it, and the contracts that defined it. Recent milestones are included so the arc is complete.');
    var lg = h('<div class="legend"><span><i class="c"></i>Contract</span><span><i class="t"></i>Threat event</span><span><i class="p"></i>Policy</span><span><i class="b"></i>Budget</span></div>');
    var ol = h('<ol class="timeline"></ol>');
    ol.innerHTML = D.timeline.map(function (t) {
      return '<li class="k-' + esc(t.kind) + '"><span class="d">' + fdate(t.date) + '</span><span class="tick" aria-hidden="true"></span><div><h4>' + esc(t.title) + '</h4><p>' + esc(t.detail) + ' ' + srcLink(t.source, 'Source') + '</p></div></li>';
    }).join('');
    v.appendChild(lg); v.appendChild(ol);
    var hist = D.contracts.filter(function (c) { return !c.recent; });
    var t = h('<section class="block"><h2 class="section-title">Notable historical awards</h2></section>');
    var holder = h('<div></div>'); t.appendChild(holder); v.appendChild(t);
    contractTable(holder, hist, { id: 'hist' });
    var r = D.reports.filter(function (x) { return x.num === 2; })[0];
    v.appendChild(h('<section class="block"><div class="eyebrow">Report 2</div><h2 class="section-title">' + esc(r.title) + '</h2><article class="prose">' + r.html + '</article></section>'));
  };

  VIEWS.contracts = function (v) {
    v.innerHTML = pageHead('The record · curated database', 'All curated contracts and programmes',
      D.contracts.length + ' significant awards, programmes and FMS notifications worldwide, 2017–2026. Search, filter by category, region or period, and sort. For the complete US federal transaction record, see the Federal ledger.');
    var holder = h('<div></div>'); v.appendChild(holder);
    contractTable(holder, D.contracts, { id: 'all', showEra: true });
    var ma = h('<section class="block"><h2 class="section-title">Acquisitions that reshaped the field</h2><div class="table-scroll"><table><thead><tr><th>Date</th><th>Acquirer</th><th>Target</th><th class="num">Value</th><th>Note</th><th>Source</th></tr></thead><tbody>' +
      D.ma.map(function (m) { return '<tr><td class="mono">' + fdate(m.date) + '</td><td>' + esc(m.acquirer) + '</td><td class="vendor">' + esc(m.target) + '</td><td class="num">' + (m.value_usd ? usd(m.value_usd) : 'n/d') + '</td><td>' + esc(m.note) + '</td><td>' + srcLink(m.source) + '</td></tr>'; }).join('') +
      '</tbody></table></div></section>');
    v.appendChild(ma);
  };

  VIEWS.ledger = function (v) {
    var F = D.federal;
    v.innerHTML = pageHead('The record · USAspending.gov', 'Federal ledger: every US government C-UAS award we could match',
      F.length + ' awards from the public USAspending API (contracts, delivery orders, IDVs, grants), matched on 70+ counter-drone terms and filtered by hand-checked rules. Amounts are obligations to date, not ceilings. Each ID links to the official award page.');
    var b = h('<section class="block stack"></section>');
    var c1 = h('<div></div>'); c1.appendChild(fyChart());
    var ag = D.stats.federal_top_agencies.slice(0, 9).map(function (r) { return { label: r[0], value: r[1], display: usd(r[1]) }; });
    var c2 = h('<div></div>'); c2.appendChild(hbars('Obligations by awarding office', 'Top awarding sub-agencies, FY2011–FY2026.', ag, { labelW: 220, maxChars: 34 }));
    b.appendChild(c1); b.appendChild(c2); v.appendChild(b);

    var subs = uniq(F.map(function (r) { return r.sub || r.agency; }));
    var fys = uniq(F.map(function (r) { return r.fy; }).filter(Boolean)).reverse();
    var cats = uniq(F.map(function (r) { return r.cat; }));
    var sec = h('<section class="block"><h2 class="section-title">Award records</h2></section>');
    var ctl = h('<div class="controls"><input type="search" id="fl-q" placeholder="Search recipient, description, award ID…" aria-label="Search federal awards">' +
      '<select id="fl-sub" aria-label="Awarding office"><option value="">All offices</option>' + subs.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('') + '</select>' +
      '<select id="fl-fy" aria-label="Fiscal year"><option value="">All years</option>' + fys.map(function (y) { return '<option value="' + y + '">FY' + y + '</option>'; }).join('') + '</select>' +
      '<select id="fl-cat" aria-label="Category (auto)"><option value="">All categories (auto-tagged)</option>' + cats.map(function (c) { return '<option value="' + c + '">' + esc(CATS[c]) + '</option>'; }).join('') + '</select>' +
      '<span class="count"></span></div>');
    var wrap = h('<div class="table-scroll"><table class="wide"><thead><tr><th class="sortable" data-k="date" aria-sort="descending">Start</th><th>Award ID</th><th>Office</th><th class="sortable" data-k="recipient">Recipient</th><th class="c-desc">Description</th><th class="num sortable" data-k="amount">Obligated</th></tr></thead><tbody></tbody></table></div>');
    var pager = h('<div class="pager"><button type="button" data-d="-1">Previous</button><span class="pg"></span><button type="button" data-d="1">Next</button></div>');
    sec.appendChild(ctl); sec.appendChild(wrap); sec.appendChild(pager); v.appendChild(sec);
    var st = { q: '', sub: '', fy: '', cat: '', sort: 'date', dir: -1, page: 0 };
    var PER = 50;
    function rows() {
      var q = st.q.toLowerCase();
      return F.filter(function (r) {
        if (st.sub && (r.sub || r.agency) !== st.sub) return false;
        if (st.fy && String(r.fy) !== st.fy) return false;
        if (st.cat && r.cat !== st.cat) return false;
        if (q && (r.recipient + ' ' + r.desc + ' ' + r.id).toLowerCase().indexOf(q) < 0) return false;
        return true;
      }).sort(function (a, b) {
        var x = a[st.sort] || '', y = b[st.sort] || '';
        if (st.sort === 'amount') { x = a.amount; y = b.amount; }
        return x < y ? -st.dir : x > y ? st.dir : 0;
      });
    }
    function render() {
      var all = rows(), pages = Math.max(1, Math.ceil(all.length / PER));
      st.page = Math.min(st.page, pages - 1);
      var sum = all.reduce(function (a, r) { return a + r.amount; }, 0);
      ctl.querySelector('.count').textContent = all.length + ' awards · ' + usd(sum) + ' obligated';
      wrap.querySelector('tbody').innerHTML = all.slice(st.page * PER, st.page * PER + PER).map(function (r) {
        return '<tr><td class="mono">' + fdate(r.date) + '</td><td class="mono"><a href="https://www.usaspending.gov/award/' + encodeURIComponent(r.gid) + '" target="_blank" rel="noopener">' + esc(r.id) + '</a></td>' +
          '<td>' + esc(r.sub || r.agency) + '</td><td class="vendor">' + esc(r.recipient) + '</td><td><div class="clamp" title="' + esc(r.desc) + '">' + esc(r.desc) + '</div><div class="sub">' + esc(CATS[r.cat]) + ' (auto)</div></td><td class="num">' + usd(r.amount, { exact: r.amount < 1e6 }) + '</td></tr>';
      }).join('') || '<tr><td colspan="6">No awards match. Clear a filter to see more.</td></tr>';
      pager.querySelector('.pg').textContent = 'Page ' + (st.page + 1) + ' of ' + pages;
      pager.querySelector('[data-d="-1"]').disabled = st.page === 0;
      pager.querySelector('[data-d="1"]').disabled = st.page >= pages - 1;
    }
    ctl.querySelector('input').addEventListener('input', function (e) { st.q = e.target.value; st.page = 0; render(); });
    ctl.querySelector('#fl-sub').addEventListener('change', function (e) { st.sub = e.target.value; st.page = 0; render(); });
    ctl.querySelector('#fl-fy').addEventListener('change', function (e) { st.fy = e.target.value; st.page = 0; render(); });
    ctl.querySelector('#fl-cat').addEventListener('change', function (e) { st.cat = e.target.value; st.page = 0; render(); });
    pager.addEventListener('click', function (e) { var d = e.target.getAttribute('data-d'); if (d) { st.page += +d; render(); } });
    wrap.querySelectorAll('th.sortable').forEach(function (th) {
      th.addEventListener('click', function () {
        var k = th.getAttribute('data-k');
        st.dir = st.sort === k ? -st.dir : (k === 'recipient' ? 1 : -1); st.sort = k;
        wrap.querySelectorAll('th.sortable').forEach(function (x) { x.removeAttribute('aria-sort'); });
        th.setAttribute('aria-sort', st.dir === 1 ? 'ascending' : 'descending');
        render();
      });
    });
    render();
    var r = D.reports.filter(function (x) { return x.num === 9; })[0];
    v.appendChild(h('<section class="block"><div class="eyebrow">Report 9</div><h2 class="section-title">' + esc(r.title) + '</h2><article class="prose">' + r.html + '</article></section>'));
  };

  VIEWS.reports = function (v, token) {
    var n = /^report-(\d+)$/.test(token) ? +token.split('-')[1] : 1;
    var r = D.reports.filter(function (x) { return x.num === n; })[0] || D.reports[0];
    v.innerHTML = pageHead('Library', 'Ten small reports', 'Each report stands alone and links every claim to its source. The Markdown originals ship with the site in /reports.');
    var lay = h('<div class="reports-layout"><ol class="report-list">' + D.reports.map(function (x) {
      return '<li><a href="#report-' + x.num + '"' + (x.num === r.num ? ' aria-current="true"' : '') + '><span class="no">' + (x.num < 10 ? '0' : '') + x.num + '</span><span>' + esc(x.title) + '</span></a></li>';
    }).join('') + '</ol><div><div class="eyebrow">Report ' + r.num + ' · ' + r.links + ' source links</div><h2 class="report-title">' + esc(r.title) + '</h2><article class="prose">' + r.html + '</article></div></div>');
    v.appendChild(lay);
  };

  VIEWS.method = function (v) {
    v.innerHTML = pageHead('Library · method', 'Sources, method and the domain',
      'How the data was gathered, what it can and can\'t tell you, and how to put this site on its own domain.') +
      '<section class="block two-col"><article class="prose">' +
      '<h2>Method</h2><ul>' +
      '<li><strong>Federal ledger:</strong> USAspending.gov public API, harvested ' + fdate(D.meta.today) + ' with 70+ counter-drone search terms across contracts, IDVs, grants and other awards (FY2008 onward, the API\'s limit). Keyword hits were filtered with explicit include and exclude rules, which removed, for example, a GE anesthesia part also called "D-Fend" and a "Leonidas Street" flood project.</li>' +
      '<li><strong>Curated database:</strong> awards found through primary sources (Army.mil, DVIDS, FEMA, DSCA, Federal Register, company filings) and established trade press. Each record carries a source, a second source where available, and a confidence label.</li>' +
      '<li><strong>Statements and contacts:</strong> official remarks, testimony, rules and oversight reports from 1 Oct 2025 onward, plus a few earlier baselines marked as such. Contacts are public officials in official roles and the channels they publish for industry.</li>' +
      '<li><strong>Values:</strong> ceilings, obligations, contract values and estimates are labelled and not summed across types. Foreign currencies are converted at the source\'s stated USD figure where given.</li></ul>' +
      '<h2>Limits</h2><ul><li>Classified awards, most Other Transaction agreements and many foreign contracts aren\'t publicly itemized. "Every contract ever" isn\'t fully reachable; the ledger is a floor.</li><li>DoD data reaches USAspending on about a 90-day lag, so FY2026 is understated.</li><li>Ledger categories are auto-tagged from description text and are approximate.</li></ul>' +
      '<h2>Confidence labels</h2><ul><li><strong>PUBLISHED</strong> — primary document or official release.</li><li><strong>FIELD</strong> — combat or test record reported by a credible third party.</li><li><strong>VENDOR</strong> — company announcement, not independently confirmed.</li><li><strong>ESTIMATE</strong> — programme budget or analyst figure, not a signed value.</li></ul>' +
      '</article><aside><div class="callout"><h3>Domain: cuasledger.com</h3><p><strong>Available</strong> when checked on ' + fdate(D.meta.today) + ' at 21:22 UTC. The .com registry RDAP returned 404 (not registered) and there are no nameservers. Alternates that were also unregistered: counterdronecontracts.com, cuascontracts.com, cuastracker.com.</p><p>The site is live now at <a href="https://jaxbud.github.io/cuas-ledger/" target="_blank" rel="noopener">jaxbud.github.io/cuas-ledger</a> on GitHub Pages. To move it to cuasledger.com: register the domain, add a CNAME record pointing <code>www</code> to <code>jaxbud.github.io</code> (plus GitHub\'s four A records for the apex), enter the domain under Settings → Pages in the cuas-ledger repo, and rebuild with <code>CUSTOM_DOMAIN=cuasledger.com</code>.</p><p>Search engines are blocked (robots noindex) because the Unified Mechanics outlook is internal. Anyone with the link can open the site.</p></div>' +
      '<div class="callout" style="margin-top:16px"><h3>Rebuild</h3><p><code>python3 scripts/harvest_usaspending.py</code> refreshes the federal ledger; <code>python3 scripts/filter_usaspending.py && python3 scripts/merge.py && node build.js</code> rebuilds the site.</p></div></aside></section>';
  };

  // ---------- boot ----------
  shell();
  window.addEventListener('hashchange', function () { route(); var m = document.getElementById('view'); if (m) m.focus({ preventScroll: true }); window.scrollTo(0, 0); });
  route();
})();
