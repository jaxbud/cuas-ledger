(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('brief-data').textContent);
  var W = D.walk;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'source'; } }
  function link(u, label) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(label || host(u)) + '</a>'; }
  function usd(v) {
    if (v == null || isNaN(v)) return '—';
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(v >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(v >= 1e8 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (v >= 1e3) return '$' + Math.round(v / 1e3) + 'K';
    return '$' + Math.round(v);
  }
  function fdate(d) {
    var p = String(d).split('-');
    if (p.length === 1) return p[0];
    if (p.length === 2) return MONTHS[+p[1] - 1] + ' ' + p[0];
    return +p[2] + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0];
  }

  var STEPS = [
    ['threat', 'The threat'], ['money', 'The money'], ['gaps', 'The gaps'],
    ['fit', 'Where we fit'], ['path', 'Getting on contract'], ['tracker', 'Contract tracker']
  ];

  function statGrid(stats) {
    return '<div class="stats">' + stats.map(function (s) {
      return '<div class="stat"><div class="v">' + esc(s.value) + '</div><div class="l">' + esc(s.label) + '</div>' + link(s.source, s.source_name) + '</div>';
    }).join('') + '</div>';
  }

  function sectionHead(i, title, takeaway) {
    return '<div class="step-num">' + String(i + 1).padStart(2, '0') + ' / ' + STEPS.length + '</div><h2>' + esc(title) + '</h2><p class="takeaway">' + esc(takeaway) + '</p>';
  }

  function chart() {
    var rows = D.fy.filter(function (r) { return r.fy >= 2016; });
    var W0 = 760, H = 230, L = 52, R = 8, T = 10, B = 26;
    var max = Math.max.apply(null, rows.map(function (r) { return r.amount; }));
    var top = Math.ceil(max / 250e6) * 250e6;
    var iw = W0 - L - R, ih = H - T - B, bw = iw / rows.length;
    var y = function (v) { return T + ih - (v / top) * ih; };
    var g = '';
    for (var v = 0; v <= top + 1; v += 250e6) {
      g += '<line x1="' + L + '" x2="' + (W0 - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"></line><text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + usd(v).replace('$0', '$0') + '</text>';
    }
    var bars = rows.map(function (r, i) {
      var x = L + i * bw + bw * 0.2, w = bw * 0.6, yy = y(r.amount), hh = T + ih - yy, rad = Math.min(4, w / 2, hh);
      var partial = r.fy === 2026;
      var path = hh > 0 ? 'M' + x + ',' + (T + ih) + 'V' + (yy + rad) + 'Q' + x + ',' + yy + ' ' + (x + rad) + ',' + yy + 'H' + (x + w - rad) + 'Q' + (x + w) + ',' + yy + ' ' + (x + w) + ',' + (yy + rad) + 'V' + (T + ih) + 'Z' : '';
      var tip = 'FY' + r.fy + ': ' + usd(r.amount) + ' obligated' + (partial ? ' (partial, data lags ~90 days)' : '');
      return '<path d="' + path + '" style="fill:' + (partial ? 'color-mix(in srgb, var(--bar) 45%, var(--surface))' : 'var(--bar)') + '"></path>' +
        '<text x="' + (x + w / 2) + '" y="' + (H - 8) + '" text-anchor="middle">FY' + String(r.fy).slice(2) + '</text>' +
        '<rect class="hit" x="' + (L + i * bw) + '" y="' + T + '" width="' + bw + '" height="' + ih + '" data-tip="' + esc(tip) + '"></rect>';
    }).join('');
    return '<div class="chart" id="fy-chart"><h3>What US agencies have actually spent on counter-drone contracts</h3>' +
      '<p class="note">Money obligated per fiscal year, from USAspending.gov. FY2026 is partial because defense data posts with a delay. The FY2027 request is $20.6B.</p>' +
      '<svg viewBox="0 0 ' + W0 + ' ' + H + '" role="img" aria-label="Federal counter-drone obligations by fiscal year, rising from about $11M in FY2016 to $1.1B in FY2025"><g class="grid">' + g + '</g>' + bars + '</svg></div>';
  }

  function mark(v) {
    if (v === 'yes') return '<span class="mk yes"><i aria-hidden="true">✓</i>Yes</span>';
    if (v === 'no') return '<span class="mk no"><i aria-hidden="true">✕</i>No</span>';
    return '<span class="mk na">n/a</span>';
  }

  function render() {
    var app = document.getElementById('app');
    var nav = STEPS.map(function (s, i) { return '<a href="#' + s[0] + '" data-step="' + s[0] + '"><b>' + (i + 1) + '</b>' + esc(s[1]) + '</a>'; }).join('');
    var html = '';
    html += '<header class="stepbar"><div class="wrap"><a class="brand" href="#top">Unified <span>Mechanics</span> <small style="font-weight:500;color:var(--ink-3)">· Counter-drone briefing</small></a>' +
      '<nav class="steps" aria-label="Briefing steps">' + nav + '</nav><button class="theme" id="theme" type="button">Theme: light</button></div></header>';

    html += '<main id="top"><div class="wrap">';
    html += '<section class="cover"><div class="kicker">Investor briefing · updated ' + fdate(W.updated) + '</div>' +
      '<h1>Drone defense a soldier can <em>carry and forget.</em></h1>' +
      '<p>Where the counter-drone market is still failing, what the Pentagon is buying, and where Unified Mechanics fits. Every number on this page links to its source.</p>' +
      '<ol class="agenda">' + STEPS.map(function (s, i) { return '<li><a href="#' + s[0] + '"><b>' + (i + 1) + '</b>' + esc(s[1]) + '</a></li>'; }).join('') + '</ol>' +
      '<div class="hint">Presenting? Use <kbd>←</kbd> <kbd>→</kbd> to move between steps.</div></section>';

    // 1 threat
    html += '<section class="step" id="threat">' + sectionHead(0, 'The threat', W.threat.headline) + statGrid(W.threat.stats) +
      '<blockquote class="pull">“' + esc(W.threat.quote.text) + '”<cite>' + esc(W.threat.quote.who) + ' · ' + link(W.threat.quote.source, 'Defense One') + '</cite></blockquote></section>';

    // 2 money
    html += '<section class="step" id="money">' + sectionHead(1, 'The money', W.money.headline) + statGrid(W.money.stats) + chart() + '</section>';

    // 3 gaps
    var fitLabel = { core: 'UM’s core advantage', strong: 'Strong fit for UM', partial: 'UM fit: to be proven' };
    html += '<section class="step" id="gaps">' + sectionHead(2, 'The gaps', 'Five problems the market still hasn’t solved. The first one is where Unified Mechanics starts.') + '<div class="gaps">' +
      W.gaps.map(function (g, i) {
        return '<article class="gap' + (g.fit === 'core' ? ' core' : '') + '"><div><div class="gno">Gap ' + (i + 1) + '</div><h3>' + esc(g.title) + '</h3>' +
          '<div class="tags"><span class="tag">Market status: ' + esc(g.status) + '</span><span class="tag fit-' + g.fit + '">' + esc(fitLabel[g.fit]) + '</span></div>' +
          '<p class="problem">' + esc(g.problem) + '</p><div class="fitnote"><b>Where UM fits</b>' + esc(g.fit_note) + '</div></div>' +
          '<ul class="evidence">' + g.evidence.map(function (e) { return '<li>' + esc(e.text) + ' ' + link(e.source) + '</li>'; }).join('') + '</ul></article>';
      }).join('') + '</div>';
    var M = W.matrix;
    html += '<div class="matrix-wrap"><h3>How today’s options stack up</h3><p>Plenty of systems do one or two of these well. None of them does all five.</p><div class="scroll"><table class="matrix"><thead><tr><th class="row">Approach</th>' +
      M.columns.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      M.rows.map(function (r) {
        return '<tr' + (r.ours ? ' class="ours"' : '') + '><td class="row"><b>' + esc(r.name) + '</b><span>' + esc(r.example) + (r.source ? ' · ' + link(r.source, 'source') : '') + (r.note ? ' · ' + esc(r.note) : '') + '</span></td>' +
          M.columns.map(function (c) { return '<td>' + mark(r[c.id]) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div><p class="foot">' + esc(M.footnote) + '</p></div></section>';

    // 4 fit
    var F = W.fit;
    html += '<section class="step" id="fit">' + sectionHead(3, 'Where we fit', 'Unified Mechanics is built around the gap nobody else has closed: getting a defense into action without taking a soldier off the mission.') +
      '<div class="fit-hero"><h3>' + esc(F.headline) + '</h3><p>' + esc(F.lede) + '</p></div>' +
      '<div class="points"><div class="point lead"><div><h4>' + esc(F.points[0].title) + '</h4><p>' + esc(F.points[0].text) + '</p></div><div><h4>' + esc(F.points[1].title) + '</h4><p>' + esc(F.points[1].text) + '</p></div></div>' +
      F.points.slice(2).map(function (p) { return '<div class="point"><h4>' + esc(p.title) + '</h4><p>' + esc(p.text) + '</p></div>'; }).join('') + '</div>' +
      '<div class="compare"><h4>' + esc(F.setup.title) + '</h4><div class="setup">' + F.setup.rows.map(function (r) {
        return '<div class="setup-row' + (r.ours ? ' ours' : '') + '"><div class="lbl"><b>' + esc(r.name) + '</b><span>' + esc(r.what) + '</span></div><div class="val">' + esc(r.val) +
          (r.source ? ' ' + link(r.source, 'source') : '') + (r.note ? ' <span style="color:var(--ink-3);font-weight:400">(' + esc(r.note) + ')</span>' : '') + '</div></div>';
      }).join('') + '</div></div>' +
      '<div class="prove"><div><h4>' + esc(F.milestones_title) + '</h4><ul>' + F.milestones.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>' +
      '<div><h4>Who else is close</h4><p>' + esc(F.competition_note) + '</p></div></div></section>';

    // 5 path
    html += '<section class="step" id="path">' + sectionHead(4, 'Getting on contract', 'The buying channels are open now, and they reward systems that test well and plug into what units already use.') +
      '<ol class="path">' + W.path.steps.map(function (s) {
        return '<li><div><h4>' + esc(s.title) + '</h4><p>' + esc(s.text) + '</p><div class="src">' + s.sources.map(function (u) { return link(u); }).join('') + '</div></div></li>';
      }).join('') + '</ol></section>';

    // 6 tracker
    html += '<section class="step" id="tracker">' + sectionHead(5, 'Contract tracker', 'Every major Department of War counter-drone award we can verify, newest first, plus the openings UM can respond to now.') +
      '<div class="open">' + W.open_now.map(function (o) { return '<a href="' + esc(o.source) + '" target="_blank" rel="noopener"><span>' + esc(o.when) + '</span>' + esc(o.title) + '</a>'; }).join('') + '</div>' +
      '<div class="controls"><input type="search" id="t-q" placeholder="Search contractor or system" aria-label="Search contracts">' +
      '<select id="t-svc" aria-label="Service"><option value="">All of DoW</option>' + D.services.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('') + '</select>' +
      '<div class="seg" role="group" aria-label="Period"><button type="button" data-p="recent" aria-pressed="true">Last 12 months</button><button type="button" data-p="all" aria-pressed="false">All years</button></div>' +
      '<span class="count" id="t-count"></span></div>' +
      '<div class="scroll"><table class="tracker"><thead><tr><th>Date</th><th>Buyer</th><th>Contractor and system</th><th class="v">Value</th><th>Source</th></tr></thead><tbody id="t-body"></tbody></table></div></section>';

    html += '</div></main><footer><div class="wrap"><p>Prepared for Unified Mechanics. Figures are as published by the cited source; contract values are labelled as ceilings, obligations or contract values and are not added together. UM capabilities shown are design features, with the performance numbers listed under "What we’re proving next".</p>' +
      '<p>Data updated ' + fdate(W.updated) + '. Department of War awards are tracked from DoD and service releases and USAspending.gov.</p></div></footer>';
    app.innerHTML = html;
  }

  function tracker() {
    var st = { q: '', svc: '', p: 'recent' };
    var body = document.getElementById('t-body'), count = document.getElementById('t-count');
    var kind = { ceiling: 'ceiling', obligated: 'obligated', firm: 'contract value', estimate: 'estimate' };
    function draw() {
      var q = st.q.toLowerCase();
      var rows = D.dod.filter(function (c) {
        if (st.p === 'recent' && !c.recent) return false;
        if (st.svc && c.service !== st.svc) return false;
        if (q && (c.vendor + ' ' + c.system + ' ' + c.customer).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      count.textContent = rows.length + ' awards';
      body.innerHTML = rows.map(function (c) {
        return '<tr><td class="d">' + fdate(c.date) + '</td><td><span class="svc">' + esc(c.service) + '</span></td>' +
          '<td><span class="who">' + esc(c.vendor) + '</span><span class="sub">' + esc(c.system) + '</span></td>' +
          '<td class="v">' + (c.value_usd ? usd(c.value_usd) : '<span class="sub">not disclosed</span>') + (c.value_kind ? '<span class="sub">' + esc(kind[c.value_kind] || '') + '</span>' : '') + '</td>' +
          '<td>' + link(c.source, c.source_name) + '</td></tr>';
      }).join('') || '<tr><td colspan="5">No awards match. Clear the search or choose "All years".</td></tr>';
    }
    document.getElementById('t-q').addEventListener('input', function (e) { st.q = e.target.value; draw(); });
    document.getElementById('t-svc').addEventListener('change', function (e) { st.svc = e.target.value; draw(); });
    document.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.p = b.getAttribute('data-p');
        document.querySelectorAll('[data-p]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        draw();
      });
    });
    draw();
  }

  function chartTips() {
    var el = document.getElementById('fy-chart');
    if (!el) return;
    var tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; el.appendChild(tip);
    el.addEventListener('mousemove', function (e) {
      var t = e.target.closest('[data-tip]');
      if (!t) { tip.hidden = true; return; }
      var r = el.getBoundingClientRect();
      tip.textContent = t.getAttribute('data-tip'); tip.hidden = false;
      tip.style.left = Math.min(Math.max(e.clientX - r.left, 90), r.width - 90) + 'px';
      tip.style.top = (e.clientY - r.top) + 'px';
    });
    el.addEventListener('mouseleave', function () { tip.hidden = true; });
  }

  function steps() {
    var ids = STEPS.map(function (s) { return s[0]; });
    var links = document.querySelectorAll('.steps a');
    function current() {
      var y = window.scrollY + 120, cur = null;
      ids.forEach(function (id) { var el = document.getElementById(id); if (el && el.offsetTop <= y) cur = id; });
      return cur;
    }
    function mark() {
      var cur = current();
      links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-step') === cur); });
    }
    window.addEventListener('scroll', mark, { passive: true });
    mark();
    document.addEventListener('keydown', function (e) {
      if (e.target.closest('input, select, textarea')) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var cur = current(), i = cur ? ids.indexOf(cur) : -1;
      var next = e.key === 'ArrowRight' ? Math.min(i + 1, ids.length - 1) : Math.max(i - 1, -1);
      e.preventDefault();
      if (next < 0) window.scrollTo({ top: 0 }); else document.getElementById(ids[next]).scrollIntoView();
    });
  }

  function theme() {
    var btn = document.getElementById('theme'), cur = 'light';
    try { if (localStorage.getItem('um-brief-theme') === 'dark') cur = 'dark'; } catch (e) { /* storage blocked */ }
    function apply(t) {
      if (t === 'light') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
      btn.textContent = 'Theme: ' + t;
    }
    apply(cur);
    btn.addEventListener('click', function () {
      cur = cur === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('um-brief-theme', cur); } catch (e) { /* storage blocked */ }
      apply(cur);
    });
  }

  render();
  tracker();
  chartTips();
  steps();
  theme();
})();
