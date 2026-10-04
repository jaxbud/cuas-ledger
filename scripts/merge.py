#!/usr/bin/env python3
"""Merge research batches into the site dataset and compute summary stats.

Reads data/curated/*.json, data/statements/*.json, data/opportunities/*.json,
data/contacts/contacts.json, data/timeline/timeline.json, data/ma/ma.json and
data/usaspending_filtered.json. Writes data/site.json. Fails loudly on any
record without a source URL.
"""
import glob, json, os, re, sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "data")
WINDOW_START = "2025-10-01"   # FY2026 start; deep-dive window runs to today
TODAY = "2026-10-03"

CATEGORIES = {
    "detect": "Sensing & detection",
    "rf-soft-kill": "RF / EW defeat",
    "cyber-takeover": "Cyber takeover",
    "interceptor-drone": "Interceptor drones",
    "capture-net": "Capture (net / tether)",
    "missile-rocket": "Missiles & rockets",
    "gun": "Guns & smart fire control",
    "laser": "High-energy laser",
    "hpm": "High-power microwave",
    "c2-integration": "C2 & integration",
    "layered-system": "Layered systems",
    "services": "Services & sustainment",
    "rnd": "R&D & prizes",
    "grant": "Grants",
}
REGION = [
    (r"USA|FMS", "United States"),
    (r"Ukraine", "Ukraine"),
    (r"Poland|Germany|United Kingdom|France|Netherlands|Belgium|Denmark|Latvia|Europe|European|Romania|NATO", "Europe"),
    (r"Israel|Saudi|Qatar|UAE|Kuwait|Gulf|Middle East", "Middle East"),
    (r"Taiwan|Japan|India|Korea|Australia", "Asia-Pacific"),
    (r"Colombia", "Americas (ex-US)"),
    (r"Nigeria", "Africa"),
]

errors = []


def load_many(pattern):
    out = []
    for f in sorted(glob.glob(os.path.join(D, pattern))):
        out.extend(json.load(open(f)))
    return out


def region_of(country):
    # FMS buyers are foreign customers even though the US sells them
    if "FMS" in country:
        for pat, name in REGION[1:]:
            if re.search(pat, country):
                return name
    for pat, name in REGION:
        if re.search(pat, country):
            return name
    return "Other"


contracts = load_many("curated/*.json")
seen = set()
for c in contracts:
    if c["id"] in seen:
        errors.append(f"duplicate contract id {c['id']}")
    seen.add(c["id"])
    if not str(c.get("source", "")).startswith("http"):
        errors.append(f"{c['id']}: missing source")
    if c["category"] not in CATEGORIES:
        errors.append(f"{c['id']}: bad category {c['category']}")
    if c.get("value_usd") is not None and not isinstance(c["value_usd"], (int, float)):
        errors.append(f"{c['id']}: value_usd must be numeric")
    c["category_label"] = CATEGORIES[c["category"]]
    c["region"] = region_of(c["country"])
    c["recent"] = c["date"] >= WINDOW_START
    c["year"] = int(c["date"][:4])

statements = load_many("statements/*.json")
for s in statements:
    if not str(s.get("source", "")).startswith("http"):
        errors.append(f"statement {s['id']}: missing source")
    s["recent"] = s["date"] >= WINDOW_START
opportunities = load_many("opportunities/*.json")
for o in opportunities:
    if not str(o.get("source", "")).startswith("http"):
        errors.append(f"opportunity {o['id']}: missing source")
contacts = json.load(open(os.path.join(D, "contacts", "contacts.json")))
for c in contacts:
    if not str(c.get("source", "")).startswith("http"):
        errors.append(f"contact {c['id']}: missing source")
timeline = json.load(open(os.path.join(D, "timeline", "timeline.json")))
for t in timeline:
    if not str(t.get("source", "")).startswith("http"):
        errors.append(f"timeline {t['title']}: missing source")
ma = json.load(open(os.path.join(D, "ma", "ma.json")))

# ---------- federal ledger (USAspending) ----------
fed_raw = json.load(open(os.path.join(D, "usaspending_filtered.json")))


def fed_category(desc, rec):
    t = (desc + " " + rec).lower()
    rules = [
        (r"laser|\bhel\b|helws|locust", "laser"),
        (r"microwave|\bhpm\b|\bthor\b|mjolnir|leonidas|epirus", "hpm"),
        (r"coyote|interceptor|apkws|missile|kinetic kill|roadrunner|anvil", "missile-rocket"),
        (r"enforceair|d-fend|cyber", "cyber-takeover"),
        (r"dronebuster|jammer|dedrone|droneshield|electronic warfare|\brf\b|radio frequency|ninja|bal chatri", "rf-soft-kill"),
        (r"smash|gun|weapon station|crows|mk 38|cannon", "gun"),
        (r"radar|detection|sensor|kurfs|krfs|echodyne|\brada\b|gimba|optic|camera", "detect"),
        (r"grant program|grant", "grant"),
        (r"research|r&d|development|prototype|study|analysis|university", "rnd"),
        (r"support|sustainment|services|engineering|logistics|training|maintenance|fsr|o&s", "services"),
        (r"command and control|\bc2\b|integration|faad|lattice", "c2-integration"),
    ]
    for pat, cat in rules:
        if re.search(pat, t):
            return cat
    return "layered-system"


def fy(date):
    if not date:
        return None
    y, m = int(date[:4]), int(date[5:7])
    return y + 1 if m >= 10 else y


federal = []
for r in fed_raw:
    amt = r.get("Award Amount") or 0
    desc = (r.get("Description") or "").strip()
    rec = (r.get("Recipient Name") or "").strip()
    date = r.get("Start Date") or r.get("Base Obligation Date")
    federal.append({
        "id": r.get("Award ID"),
        "gid": r.get("generated_internal_id"),
        "date": date,
        "fy": fy(date),
        "agency": r.get("Awarding Agency"),
        "sub": r.get("Awarding Sub Agency"),
        "recipient": rec.title() if rec.isupper() else rec,
        "amount": round(amt, 2),
        "desc": desc[:320] + ("…" if len(desc) > 320 else ""),
        "group": r["_group"],
        "cat": fed_category(desc, rec),
    })
federal.sort(key=lambda x: (x["date"] or ""), reverse=True)

# ---------- stats ----------
by_fy = defaultdict(float)
by_fy_n = Counter()
for f in federal:
    if f["fy"] and 2008 <= f["fy"] <= 2026:
        by_fy[f["fy"]] += f["amount"]
        by_fy_n[f["fy"]] += 1
by_sub = defaultdict(float)
for f in federal:
    by_sub[f["sub"] or f["agency"]] += f["amount"]
by_recipient = defaultdict(float)
for f in federal:
    by_recipient[f["recipient"]] += f["amount"]

cur_by_cat = Counter(c["category"] for c in contracts)
cur_val_by_cat = defaultdict(float)
for c in contracts:
    if c.get("value_usd"):
        cur_val_by_cat[c["category"]] += c["value_usd"]
cur_by_region = Counter(c["region"] for c in contracts)
recent = [c for c in contracts if c["recent"]]

stats = {
    "federal_count": len(federal),
    "federal_total": round(sum(f["amount"] for f in federal), 2),
    "federal_by_fy": [{"fy": k, "amount": round(by_fy[k], 2), "count": by_fy_n[k]} for k in sorted(by_fy)],
    "federal_top_agencies": sorted(([k, round(v, 2)] for k, v in by_sub.items()), key=lambda x: -x[1])[:12],
    "federal_top_recipients": sorted(([k, round(v, 2)] for k, v in by_recipient.items()), key=lambda x: -x[1])[:15],
    "curated_count": len(contracts),
    "curated_recent_count": len(recent),
    "curated_recent_value": round(sum(c["value_usd"] or 0 for c in recent), 2),
    "curated_by_category": sorted(([CATEGORIES[k], v, round(cur_val_by_cat[k], 2)] for k, v in cur_by_cat.items()), key=lambda x: -x[1]),
    "curated_by_region": sorted(([k, v] for k, v in cur_by_region.items()), key=lambda x: -x[1]),
    "statements_count": len(statements),
    "contacts_count": len(contacts),
    "opportunities_count": len(opportunities),
}

if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)

site = {
    "meta": {"window_start": WINDOW_START, "today": TODAY, "categories": CATEGORIES},
    "contracts": sorted(contracts, key=lambda c: c["date"], reverse=True),
    "statements": sorted(statements, key=lambda s: s["date"], reverse=True),
    "opportunities": opportunities,
    "contacts": sorted(contacts, key=lambda c: (c.get("priority", 9), c["name"])),
    "timeline": sorted(timeline, key=lambda t: t["date"]),
    "ma": ma,
    "federal": federal,
    "stats": stats,
}
json.dump(site, open(os.path.join(D, "site.json"), "w"), separators=(",", ":"))
print(json.dumps({k: v for k, v in stats.items() if not isinstance(v, list)}, indent=1))
print("federal by FY:", [(x["fy"], round(x["amount"] / 1e6, 1)) for x in stats["federal_by_fy"]])
print("top agencies:", [(a, round(v / 1e6, 1)) for a, v in stats["federal_top_agencies"]])
print("top recipients:", [(a, round(v / 1e6, 1)) for a, v in stats["federal_top_recipients"]])
print("curated by cat:", stats["curated_by_category"])
print("curated by region:", stats["curated_by_region"])
