#!/usr/bin/env python3
"""Harvest every USAspending.gov award matching a counter-UAS keyword.

Writes data/raw/usaspending_<group>.json (deduped by generated_internal_id).
Public API, no key: https://api.usaspending.gov/docs/endpoints
"""
import json, os, sys, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
API = "https://api.usaspending.gov/api/v2/search/spending_by_award/"

KEYWORDS = [
    "counter-UAS", "counter UAS", "C-UAS", "CUAS", "C-sUAS", "counter-sUAS",
    "counter small unmanned", "counter unmanned", "counter-unmanned",
    "counter-drone", "counter drone", "anti-drone", "drone mitigation",
    "drone detection", "UAS detection", "drone defeat", "SUADS", "DroneBuster",
    "drone defense", "unmanned aircraft mitigation", "sUAS defeat",
    "counter-small UAS", "Coyote interceptor", "KuRFS", "M-LIDS", "FS-LIDS",
    "Leonidas", "high power microwave", "IFPC-HPM", "DE M-SHORAD", "Drone Dome",
    "Dedrone", "DroneShield", "DroneHunter", "Fortem", "Epirus", "D-Fend",
    "EnforceAir", "SkyWall", "SMASH", "Bullfrog", "Roadrunner", "Anvil",
    "EchoGuard", "Echodyne", "Hidden Level", "Black Sage", "CLAWS",
    "L-MADIS", "Marine Air Defense Integrated System",
    "Low, Slow, Small", "LSS UAS", "Group 1 UAS", "drone jammer",
    "RF defeat", "Titan C-UAS", "Drone Sentinel", "DroneSentry",
    "Bal Harbor", "interceptor UAS", "UAS interceptor", "ROADRUNNER-M",
    "Coyote Block", "Ku-band radio frequency sensor", "counter-UAV",
    "C-UAV", "unmanned aircraft system defeat", "drone countermeasure",
    "UAS countermeasure", "Expeditionary-Mobile Fires", "Golden Dome",
    "JIATF 401", "Replicator", "low cost interceptor", "LCI",
]

GROUPS = {
    "contracts": ["A", "B", "C", "D"],
    "idvs": ["IDV_A", "IDV_B", "IDV_B_A", "IDV_B_B", "IDV_B_C", "IDV_C", "IDV_D", "IDV_E"],
    "grants": ["02", "03", "04", "05"],
    "other": ["09", "11", "-1"],
}

FIELDS = {
    "contracts": ["Award ID", "Recipient Name", "Award Amount", "Total Outlays", "Description",
                  "Contract Award Type", "Awarding Agency", "Awarding Sub Agency", "Funding Agency",
                  "Funding Sub Agency", "Start Date", "End Date", "Place of Performance State Code",
                  "NAICS", "PSC", "Last Modified Date", "recipient_id"],
    "idvs": ["Award ID", "Recipient Name", "Award Amount", "Total Outlays", "Description",
             "Contract Award Type", "Awarding Agency", "Awarding Sub Agency", "Funding Agency",
             "Start Date", "End Date", "NAICS", "PSC", "Last Modified Date", "recipient_id"],
    "grants": ["Award ID", "Recipient Name", "Award Amount", "Total Outlays", "Description",
               "Award Type", "Awarding Agency", "Awarding Sub Agency", "Start Date", "End Date",
               "CFDA Number", "Last Modified Date", "recipient_id"],
    "other": ["Award ID", "Recipient Name", "Award Amount", "Description", "Award Type",
              "Awarding Agency", "Awarding Sub Agency", "Start Date", "End Date", "recipient_id"],
}

# Keywords too generic to keep without a C-UAS term in the description.
NOISY = {"MADIS", "Anvil", "Roadrunner", "SMASH", "CLAWS", "Fortem", "Leonidas",
         "high power microwave", "Group 1 UAS", "RF defeat", "Bal Harbor", "LCI",
         "Golden Dome", "Replicator", "low cost interceptor", "Drone Sentinel",
         "Low, Slow, Small", "LSS UAS", "Expeditionary-Mobile Fires", "CUAS"}


def post(body, tries=4):
    data = json.dumps(body).encode()
    for i in range(tries):
        try:
            req = urllib.request.Request(API, data=data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except Exception as e:  # noqa: BLE001
            print("  retry", i, e, file=sys.stderr)
            time.sleep(2 + 3 * i)
    return None


def harvest():
    os.makedirs(RAW, exist_ok=True)
    for group, codes in GROUPS.items():
        out = {}
        path = os.path.join(RAW, f"usaspending_{group}.json")
        if os.path.exists(path):
            out = {r["generated_internal_id"]: r for r in json.load(open(path))}
        for kw in KEYWORDS:
            page = 1
            n = 0
            while True:
                body = {
                    "filters": {
                        "keywords": [kw],
                        "award_type_codes": codes,
                        "time_period": [{"start_date": "2007-10-01", "end_date": "2026-09-30"}],
                    },
                    "fields": FIELDS[group],
                    "limit": 100,
                    "page": page,
                    "sort": "Award Amount",
                    "order": "desc",
                }
                res = post(body)
                if not res or "results" not in res:
                    print(f"  {group} {kw!r}: error {res and res.get('detail')}", file=sys.stderr)
                    break
                for r in res["results"]:
                    gid = r.get("generated_internal_id")
                    if not gid:
                        continue
                    r.setdefault("_keywords", [])
                    if gid in out:
                        if kw not in out[gid]["_keywords"]:
                            out[gid]["_keywords"].append(kw)
                    else:
                        r["_keywords"] = [kw]
                        r["_group"] = group
                        out[gid] = r
                    n += 1
                if not res.get("page_metadata", {}).get("hasNext") or page >= (8 if kw in NOISY else 40):
                    break
                page += 1
                time.sleep(0.3)
            print(f"{group:9s} {kw!r}: {n} hits (total unique {len(out)})")
        json.dump(list(out.values()), open(path, "w"), indent=1)


if __name__ == "__main__":
    harvest()
