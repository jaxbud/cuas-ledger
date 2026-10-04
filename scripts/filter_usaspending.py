#!/usr/bin/env python3
"""Filter harvested USAspending awards down to genuine counter-UAS awards."""
import json, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")

STRONG = re.compile(r"""(?ix)
 counter[\s\-]*s?uas | \bc[\s\-]?s?uas\b | \bcuas\b | \bc[\s\-]?uav\b | counter[\s\-]*uav |
 counter[\s\-]*(small[\s\-]*)?unmanned | counter[\s\-]*drone | anti[\s\-]*drone | counter[\s\-]*suas |
 (drone|uas|suas|uav|unmanned\s+aircraft(\s+system)?s?)\s+(detection|mitigation|defeat|defense|interdiction|countermeasure|jammer|jamming|neutraliz) |
 (detect|detection|defeat|mitigat\w*|interdict\w*|neutraliz\w*)\s+(of\s+)?(small\s+)?(drones?|uas|suas|uavs?|unmanned\s+aircraft) |
 dronebuster | \bsuads\b | l[\s\-]?madis | marine\s+air\s+defense\s+integrated | \bkurfs\b | ku[\s\-]band\s+radio\s+frequency\s+sensor |
 \bm[\s\-]?lids\b | \bfs[\s\-]?lids\b | drone\s*hunter | dronesentry | droneshield | dedrone | d[\s\-]fend | enforceair |
 echoguard | echoshield | skywall | smash\s*2000 | drone\s*dome | \bthor\b.*(microwave|drone) | (high[\s\-]power(ed)?\s+microwave).*(drone|uas|swarm) |
 interceptor.*(drone|uas|suas) | (drone|uas|suas).*interceptor | coyote\s+(block|interceptor|missile|launcher|2c|uas) |
 leonidas.*(microwave|drone|uas|epirus) | epirus | ifpc[\s\-]?hpm | de[\s\-]?m[\s\-]?shorad | anti[\s\-]?uas | \bluas\b.*defeat | drone\s+gun | droneguard |
 negation\s+of\s+(small\s+)?(uas|unmanned)
""")
# Known false-positive patterns
FALSE = re.compile(r"(?i)meteorolog|MADIS\s+(data|weather)|weather|NOAA|cuas\s+(ventures|llc)|Cuas\s+de|flood\s+control|township|commercial\s+use\s+authoriz|CUA\s+(ASSISTANT|PROGR)|hazard\s+elimination|sensory\s+biology|wireless\s+charging|renew\s+energy|water\s*trap|anesthesia|ventilation|datex|ohmeda|cardinal\s+health|owens\s*&\s*minor|catering|lodging")
SKIP_AGENCY = re.compile(r"(?i)highway|national park|national institutes of health|rural business")

def load(g):
    p = os.path.join(RAW, f"usaspending_{g}.json")
    return json.load(open(p)) if os.path.exists(p) else []

out = []
for g in ["contracts", "idvs", "grants", "other"]:
    for r in load(g):
        desc = (r.get("Description") or "")
        rec = (r.get("Recipient Name") or "")
        text = desc + " | " + rec
        if FALSE.search(text) or SKIP_AGENCY.search(r.get('Awarding Sub Agency') or ''):
            continue
        if not STRONG.search(text):
            continue
        r["_group"] = g
        out.append(r)

out.sort(key=lambda r: -(r.get("Award Amount") or 0))
json.dump(out, open(os.path.join(ROOT, "data", "usaspending_filtered.json"), "w"), indent=1)
print(len(out), "relevant awards; total obligated $%.2fB" % (sum((r.get("Award Amount") or 0) for r in out) / 1e9))
from collections import Counter
print(Counter(r["_group"] for r in out))
print(Counter((r.get("Awarding Sub Agency") or r.get("Awarding Agency")) for r in out).most_common(20))
