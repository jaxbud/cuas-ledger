#!/usr/bin/env node
'use strict';

// CUAS Ledger build. Zero dependencies.
//   node build.js          -> dist/index.html (investor briefing), dist/ledger/index.html (full research ledger)
//                             dist/artifact.html (body-only, for Artifact publish)
//                             dist/data.json, dist/reports/*.md, dist/robots.txt, dist/.nojekyll
//   CUSTOM_DOMAIN=cuasledger.com node build.js  -> also writes dist/CNAME once the domain is owned
//   node build.js --check  -> validate only
// Data comes from data/site.json (produced by scripts/merge.py) and reports/*.md.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
// Live site. Swap to the custom domain once it is registered and pointed at GitHub Pages.
const CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN || '';
const SITE_URL = CUSTOM_DOMAIN ? `https://${CUSTOM_DOMAIN}/` : 'https://jaxbud.github.io/cuas-ledger/';
const CHECK_ONLY = process.argv.includes('--check');

function fail(msgs) {
  console.error('Build failed:\n  ' + msgs.join('\n  '));
  process.exit(1);
}

// ---------- minimal markdown -> html (headings, lists, tables, quotes, inline) ----------
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (m, t, u) =>
    `<a href="${u.replace(/"/g, '%22')}" target="_blank" rel="noopener">${t}</a>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return out;
}
function md(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  const html = [];
  let i = 0;
  let title = '';
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { i++; continue; }
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      const lvl = m[1].length;
      if (lvl === 1 && !title) { title = m[2]; i++; continue; }
      const id = m[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      html.push(`<h${lvl + 1} id="${id}">${inline(m[2])}</h${lvl + 1}>`);
      i++; continue;
    }
    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      html.push('<div class="table-scroll"><table class="md-table"><thead><tr>' +
        head.map(h => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>' +
        body.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }
    if (/^>\s?/.test(line)) {
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      html.push(`<blockquote>${inline(q.join(' '))}</blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        if (/^\s{2,}[-*]\s+/.test(lines[i])) {
          items[items.length - 1] += '<ul><li>' + inline(lines[i].replace(/^\s*[-*]\s+/, '')) + '</li></ul>';
        } else if (/^\s{2,}\S/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
          items[items.length - 1] += ' ' + inline(lines[i].trim());
        } else {
          items.push(inline(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '')));
        }
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>` + items.map(it => `<li>${it.replace(/<\/ul><ul>/g, '')}</li>`).join('') + `</${tag}>`);
      continue;
    }
    if (/^---+\s*$/.test(line)) { html.push('<hr>'); i++; continue; }
    const para = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#|\||>|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    html.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return { title, html: html.join('\n') };
}

// ---------- load ----------
const errors = [];
let site;
try {
  site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'site.json'), 'utf8'));
} catch (e) {
  fail([`data/site.json: ${e.message} (run: python3 scripts/merge.py)`]);
}
const reportFiles = fs.readdirSync(path.join(ROOT, 'reports')).filter(f => /^\d\d-.*\.md$/.test(f)).sort();
if (reportFiles.length !== 10) errors.push(`expected 10 reports, found ${reportFiles.length}`);
const reports = reportFiles.map(f => {
  const src = fs.readFileSync(path.join(ROOT, 'reports', f), 'utf8');
  const { title, html } = md(src);
  const num = parseInt(f.slice(0, 2), 10);
  const links = (src.match(/\]\(https?:[^)\s]+\)/g) || []).length;
  if (!title) errors.push(`${f}: missing # title`);
  return { id: `report-${num}`, num, file: f, title: title.replace(/^Report \d+ — /, ''), html, links };
});

for (const c of site.contracts) {
  if (!/^https?:/.test(c.source)) errors.push(`contract ${c.id}: bad source`);
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(c.date)) errors.push(`contract ${c.id}: bad date ${c.date}`);
}
if (errors.length) fail(errors);
if (CHECK_ONLY) {
  console.log(`OK — ${site.contracts.length} contracts, ${site.federal.length} federal awards, ${reports.length} reports.`);
  process.exit(0);
}

const css = fs.readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8');
const payload = JSON.stringify({ ...site, reports }).replace(/</g, '\\u003c');

const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap';

const head = `<title>CUAS Ledger</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
${css}
</style>`;

const main = `<div id="app" class="shell">
  <noscript><p class="noscript">CUAS Ledger needs JavaScript to render its tables. The raw data is in data.json.</p></noscript>
</div>
<script type="application/json" id="ledger-data">${payload}</script>
<script>
${js}
</script>`;

// Artifact host supplies doctype/html/head/body; the page starts with its own title and style.
const body = `${head}\n${main}\n`;

const standalone = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Counter-drone (C-UAS) contracts, government statements, contacts and contracting outlook, sourced and searchable.">
<link rel="canonical" href="${SITE_URL}">
<meta name="robots" content="noindex, nofollow">
${head}
</head>
<body>
${main}
</body>
</html>
`;

// ---------- investor briefing (site root) ----------
const walk = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'walkthrough.json'), 'utf8'));
for (const sec of ['threat', 'money']) for (const st of walk[sec].stats) if (!/^https?:/.test(st.source)) fail([`walkthrough ${sec}: stat without source`]);
for (const g of walk.gaps) for (const e of g.evidence) if (!/^https?:/.test(e.source)) fail([`walkthrough gap ${g.id}: evidence without source`]);

// Department of War buyers only: no foreign, FMS or civilian-agency awards.
const NON_DOW = /FMS|DHS|Homeland|FEMA|TSA|FAA|Aviation Administration|Energy|NNSA|Marshals|Prisons|Department of State|Secret Service|Customs|Coast Guard|for Ukraine|Grant/i;
function service(c) {
  const s = c.customer;
  if (/JIATF|Joint Interagency|Replicator/i.test(s)) return 'JIATF-401';
  if (/Marine/i.test(s)) return 'Marine Corps';
  if (/Navy|NAVAIR|NAVSEA|Naval/i.test(s)) return 'Navy';
  if (/Air Force|AFRL|Air Combat|AFLCMC/i.test(s)) return 'Air Force';
  if (/SOCOM|Special Operations/i.test(s)) return 'SOCOM';
  if (/Army|ACC|PAE|RCCTO|PEO|DEVCOM|Redstone/i.test(s)) return 'Army';
  if (/DIU|Defense Innovation/i.test(s)) return 'DIU';
  if (/NORTHCOM|Northern Command/i.test(s)) return 'NORTHCOM';
  if (/DLA|Defense Logistics/i.test(s)) return 'DLA';
  if (/Department of War|DoD|DoW|Secretary of Defense|Microelectronics|DCMA|Defense Contract/i.test(s)) return 'DoW / OSD';
  return null;
}
const dod = site.contracts
  .filter(c => /^USA$/.test(c.country) && !NON_DOW.test(c.customer) && c.category !== 'grant')
  .map(c => ({ ...c, service: service(c) }))
  .filter(c => c.service)
  .map(c => ({ date: c.date, recent: c.recent, service: c.service, vendor: c.vendor, system: c.system, customer: c.customer,
    value_usd: c.value_usd, value_kind: c.value_kind, source: c.source, source_name: c.source_name }));
const services = [...new Set(dod.map(c => c.service))].sort();
const briefPayload = JSON.stringify({ walk, dod, services, fy: site.stats.federal_by_fy }).replace(/</g, '\\u003c');
const bcss = fs.readFileSync(path.join(ROOT, 'src', 'walkthrough.css'), 'utf8');
const bjs = fs.readFileSync(path.join(ROOT, 'src', 'walkthrough.js'), 'utf8');
const briefHead = `<title>Unified Mechanics Briefing</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
${bcss}
</style>`;
const briefMain = `<div id="app"><noscript><p style="padding:24px">This briefing needs JavaScript.</p></noscript></div>
<script type="application/json" id="brief-data">${briefPayload}</script>
<script>
${bjs}
</script>`;
const brief = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Counter-drone market gaps, Department of War contracts, and where Unified Mechanics fits.">
<link rel="canonical" href="${SITE_URL}">
<meta name="robots" content="noindex, nofollow">
${briefHead}
</head>
<body>
${briefMain}
</body>
</html>
`;

const LEDGER = path.join(DIST, 'ledger');
fs.mkdirSync(path.join(LEDGER, 'reports'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), brief);
fs.writeFileSync(path.join(DIST, 'briefing-artifact.html'), `${briefHead}\n${briefMain}\n`);
fs.writeFileSync(path.join(LEDGER, 'index.html'), standalone.replace(`<link rel="canonical" href="${SITE_URL}">`, `<link rel="canonical" href="${SITE_URL}ledger/">`));
fs.writeFileSync(path.join(DIST, 'artifact.html'), body);
fs.writeFileSync(path.join(LEDGER, 'data.json'), JSON.stringify(site, null, 1));
if (CUSTOM_DOMAIN) fs.writeFileSync(path.join(DIST, 'CNAME'), CUSTOM_DOMAIN + '\n');
// Unlisted by default: the UM outlook is internal, so keep search engines out.
fs.writeFileSync(path.join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
for (const f of reportFiles) fs.copyFileSync(path.join(ROOT, 'reports', f), path.join(LEDGER, 'reports', f));
const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log(`Built dist/index.html briefing (${kb(Buffer.byteLength(brief))}; ${dod.length} DoW awards, ${dod.filter(c => c.recent).length} in the last 12 months) and dist/ledger/index.html (${kb(Buffer.byteLength(standalone))})`);
console.log(`${site.contracts.length} contracts · ${site.federal.length} federal awards · ${site.statements.length} statements · ${site.contacts.length} contacts · ${reports.length} reports (${reports.reduce((a, r) => a + r.links, 0)} source links)`);
