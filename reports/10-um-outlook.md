# Report 10 — Contracting outlook for Unified Mechanics

*Prepared 3 October 2026 for the Unified Mechanics team. Internal. Every external claim links to its source; UM's own figures are marked as plans or placeholders, as they are in `data/us.json`.*

## Bottom line

The money and the buyers for UM's exact niche now exist. UM is not yet in a position to take them.

- **Demand fits UM's design.** The Pentagon's counter-drone task force (JIATF-401) has said publicly it wants [non-explosive kinetic interceptors for homeland use](https://www.army.mil/article/289166/media_roundtable_with_brig_gen_matt_ross_joint_interagency_task_force_401_commander). Its first Replicator 2 purchase was a [net-capture interceptor (Fortem DroneHunter), chosen because capture is low-collateral at home](https://insideunmannedsystems.com/pentagon-task-force-picks-fortem-dronehunter-for-first-replicator-2-purchase/). The Air Force's Point Defense Battle Lab asked industry in July 2026 for [drone-on-drone interceptors to defend domestic bases](https://migflug.com/jetflights/air-force-battle-lab-counter-drone-options-2026/).
- **Buying vehicles are open now.** JIATF-401 has a [$7B multi-vendor IDIQ](https://defensescoop.com/2026/09/29/pentagon-task-force-army-announce-billions-in-counter-drone-tech-awards/) (more awards due by end of October 2026), a [government marketplace at cuas.mil](https://www.defensenews.com/news/pentagon-congress/2026/08/10/pentagon-launches-online-marketplace-for-counter-uas-technology/), and a [$580M prototyping line in the House FY27 bill](https://www.hklaw.com/en/insights/publications/2026/07/drones-and-national-security-what-to-expect-from-congress). DHS has a [$1.5B department-wide IDIQ](https://insideunmannedsystems.com/dhs-awards-1-5-billion-counter-uas-contract-to-12-companies/). FEMA has [$250M more for states in FY27](https://www.fema.gov/grants/preparedness/counter-unmanned-aircraft-systems-grant-program).
- **UM's gap is evidence, not market.** Every award in the last 12 months went to a system with test data, field use, or both. JIATF-401 buys on a [test-then-buy model](https://www.army.mil/article/295795/jiatf_401_accelerates_kinetic_drone_defeat), and the marketplace lists only products that [pass vetting and product evaluation](https://www.defensenews.com/news/pentagon-congress/2026/08/10/pentagon-launches-online-marketplace-for-counter-uas-technology/). UM is a prototype at about 75% of target (`us.json`).
- **The legal wedge is narrower than the current deck says.** "The only capture method cleared for cities" rests on an [October 2024 NORTHCOM interview](https://www.twz.com/air/lasers-microwaves-missiles-guns-not-on-the-table-for-domestic-drone-defense). Since then, NORTHCOM's own fly-away kit includes [Anduril's Anvil low-collateral kinetic interceptor](https://thedefensepost.com/2025/11/10/us-military-fly-away-kit). The new state/local rule expects an [RF-only first list of authorized technologies](https://public-inspection.federalregister.gov/2026-13609.pdf). The honest version: UM is the lowest-collateral airborne effector that also defeats RF-silent drones, and physical capture still needs a policy path before police can buy it.

**Recommendation:** Make the next 6–9 months about getting characterized, listed and integrated, not about winning a production IDIQ. Concrete plan below.

## 1. What UM is selling, in the buyer's terms

| UM attribute (from `us.json`) | How a buyer will read it | Status |
|---|---|---|
| Onboard radar + EO/IR; no dependence on target emissions | Defeats RF-silent / pre-programmed drones that jammers and cyber takeover can't touch | Structural — true by design |
| Tethered-rope capture (v1) → kinetic ram → explosive | v1 and v2 are both non-explosive: they fit JIATF-401's stated homeland ask | Structural |
| Recoverable airframe | Cost per kill depends on recovery rate and cycle life | **Unmeasured** — 90% recovery and 100 sorties are placeholders |
| Man-portable canister launch | Matches "set it up like a Ring doorbell" ([Ross, Mar 2026](https://www.defenseone.com/threats/2026/03/drone-threat-will-far-exceed-gwots-roadside-bomb-threat-counter-drone-task-force-director/411921)) and the Navy's containerized-launch theme ([NAIP, Sep 2026](https://aviationweek.com/defense/missile-defense-weapons/us-navy-opens-search-containerized-missile-interceptor)) | Structural |
| $1,600 modelled cost per kill | Will be compared with Merops at ~$15K per unit, falling to [$3–5K at scale](https://www.twz.com/land/cheap-interceptor-drones-proven-in-ukraine-protected-u-s-troops-against-iranian-shaheds), and Ukrainian interceptors at [~$2,500](https://www.technology.org/2026/04/08/gulf-states-turn-to-2500-ukrainian-drone-to-replace-million-dollar-missiles/) | **Model only** |

The structural advantages hold up under questioning. The cost claim does not until recovery rate, consumable cost and cycle life are measured.

## 2. Where the money is (Oct 2025 – Oct 2026)

| Channel | Size | What's been bought | Fit for UM |
|---|---|---|---|
| JIATF-401 Marketplace IDIQ | $7B program ceiling; $4.15B to 10 vendors on 29 Sep 2026 plus ~$1B earlier (AV, CACI) ([Army](https://www.army.mil/article/295771/jiatf_401_advances_domestic_shield_with_counter_uas_contract_awards)) | Sensors, RF defeat, smart scopes, a gun station, radars, cameras | High as a future target; a near-term route is subcontracting to a holder |
| JIATF-401 interceptor buys | Perennial Autonomy $500M IDIQ ([May 2026](https://thedefensepost.com/2026/05/20/us-counter-drone-perennial-autonomy/)); Fortem DroneHunter (Replicator 2); Lockheed Grizzly (Sep 2026) | Air-to-air interceptors and capture | Highest: this is UM's category |
| Army enterprise C2 | Anduril $20B, 10-year ([DefenseScoop](https://defensescoop.com/2026/03/14/anduril-20-billion-dollar-army-contract/)) | Lattice as the C-UAS command-and-control standard | Gate: integrate with Lattice |
| Army programs of record | Coyote $5.04B (Sep 2025), E-HEL $464.8M, LCI and NGCM missiles | Missiles and lasers | Low: different class |
| DHS | $1.5B IDIQ (Aug 2026); DHS PEO for UAS/C-UAS ($115M, Jan 2026) | Products via 8 Track-1 holders incl. Fortem | Medium: reached through a Track-1 prime |
| FEMA to states | $250M awarded Dec 2025; $250M in FY27 | Detection and RF mitigation | Blocked until physical capture is authorized for SLTT (see §4) |
| Allies | Poland SAN $4.2B, Belgium/Netherlands €3.1B, Kuwait FMS $1.98B, UK LCADE, Latvia BLAZE framework | Layered systems; interceptor drones in most of them | Medium-term, via FMS or partners |

### Where homeland demand is, by mission

| Mission | Evidence of demand (last 12 months) | Who buys |
|---|---|---|
| Military bases at home | 1–2 incursions a day ([NORTHCOM](https://breakingdefense.com/2026/01/pentagon-expands-task-forces-counter-drone-authorities-handing-commanders-more-flexibility/)); DoD IG coverage gaps; Domestic Shield awards | JIATF-401, services, NORTHCOM |
| Southern border | 378 cartel drones detected in about five weeks (Aug–Sep 2026); first laser engagements; cartels adapting to avoid detection ([DVIDS](https://www.dvidshub.net/news/573423/joint-task-force-southern-border-uses-high-energy-laser-system-mitigate-cartel-linked-drone-threats), [DefenseScoop](https://defensescoop.com/2026/09/24/cartel-drone-operations-southern-border-getting-more-creative-task-force-warns/)) | JTF-SB / NORTHCOM, CBP |
| Major events | World Cup: [1,700 unauthorized drones detected, 700 seized, 400+ mitigation actions](https://fedscoop.com/fbi-drone-training-center-demand-outpaces-capacity/); UFC Freedom 250 plot; 2028 LA Olympics planning under way | DHS PEO, FEMA grantees, FBI, Secret Service |
| Nuclear and energy sites | NNSA $140M to Anduril for four sites; DOE prototypes | NNSA / DOE |
| Prisons, airports, transit | BOP C-UAS phase 4; TSA–Dedrone; US Marshals | DOJ, TSA |

The El Paso airspace closures in February 2026, after a counter-drone laser fired near Fort Bliss without FAA coordination ([NPR](https://www.npr.org/2026/02/27/g-s1-111794/lawmakers-say-us-military-used-laser-to-take-down-border-protection-drone)), show the political cost of high-collateral effectors at home. That works in favor of low-collateral capture, as long as the interceptor itself is coordinated with the FAA.

## 3. Who UM is up against, by what they actually won

| Competitor | Effector | Recent government wins | Threat to UM |
|---|---|---|---|
| Fortem Technologies (US) | Radar-guided net capture | First Replicator 2 buy (Jan 2026); [Army $18M](https://www.unmannedairspace.info/counter-uas-systems-and-policies/fortem-announces-usd-18-million-us-army-c-uas-base-defence-contract/) (Feb 2026); DHS IDIQ Track-1 prime; World Cup | **Critical.** Same capture niche, already on every US domestic vehicle UM wants |
| Perennial Autonomy (Bumblebee V2) | FPV collision interceptor | JIATF-401 $5.2M (Jan 2026), Global Response Force assessment | **Critical for Block 2.** Non-explosive ram, already bought |
| Perennial Autonomy (Merops) | Explosive air-to-air interceptor | 13,000 bought in 8 days; $500M JIATF-401 IDIQ; Poland, Romania | **Critical** on cost and scale abroad; explosive warhead limits it at home |
| Anduril (Anvil) | Kinetic ram interceptor | USMC CES $200M; NORTHCOM fly-away kit; Kuwait FMS $1.98B; owns the Lattice C2 standard | **Critical.** Kinetic non-explosive ram already fielded for homeland |
| OpenWorks (SkyWall) | Shoulder-fired net | Army buy (Feb 2026, $2.5M); European police | Medium: ground-launched, short range |
| Origin Robotics (BLAZE) | Man-portable HE interceptor | Latvia framework, Estonia, Belgium | Medium: portable, EU-funded, explosive |
| Alpine Eagle (Sentinel) | Airborne radar/EO + interceptors | Bundeswehr + 3 European customers | High conceptually: closest architecture to UM's onboard sensing |
| TYTAN (Germany) | Kinetic interceptor | Bundeswehr several hundred €M; 3,000/month target | Medium in US; high in Europe |
| Airobotics Iron Drone | Autonomous net interceptor | European NATO customer | Medium |

UM's honest differentiation against this field is the combination of capture, onboard radar plus EO/IR (works against RF-silent targets), canister portability and recoverability. No one competitor has all four. Fortem has capture and radar but launches from a fixed or vehicle nest. Anduril has portability-class launch and kinetic defeat but no capture. Alpine Eagle has airborne sensing but is European and not capture-first.

### What investors are paying for interceptors (2026)

| Company | Round | Valuation | Contract proof at the time |
|---|---|---|---|
| Cambridge Aerospace (UK, Skyhammer) | $200M Series B (Apr 2026), then [$300M Series C (10 Aug 2026)](https://euro-sd.com/2026/08/news/air/52774/cambridge-aerospace-raises-300m-at-a-valuation-of-3-4bn/) | $1.3B → $3.4B | UK MOD Skyhammer contract (Apr 2026); LCADE; target 2,500/month by Mar 2027 |
| Allen Control Systems (US, Bullfrog) | [$200M Series B (May 2026)](https://www.businesswire.com/news/home/20260526638233/en/Allen-Control-Systems-Raises-%24200-Million-Series-B-at-%242.2-Billion-Post-Money-Valuation-to-Scale-Manufacturing-and-Accelerate-Deployment-of-Bullfrog) | $2.2B | Army SBIR-derived contract; Korea and UAE; later a $500M JIATF-401 IDIQ |
| TYTAN Technologies (Germany) | [€30M Series A (Feb 2026), €46M total](https://www.thedefensenews.com/Germany-Awards-Contract-to-TYTAN-for-Over-1000-METIS-Interceptor-Drones-for-Ukraine/) | n/d | Bundeswehr contract; 1,000+ METIS for Ukraine |
| Frankenburg Technologies (Estonia) | [€30M Series A (Mar 2026), €40M total](https://investinestonia.com/estonian-frankenburg-technologies-raises-e30m-to-mass-produce-interceptors/) | n/d | UK LCADE (Jul 2026) |
| Skapion (US, counter-swarm) | [$36M seed (Jul 2026)](https://seedtable.com/companies/skapion/funding-rounds/seed-2026-07) | n/d | Pre-contract |
| Singularity Defense (affordable interceptors) | $80M (14 Jul 2026), Khosla and Felicis | n/d | n/d |
| Alta Ares (AI-guided interceptors) | ~$57M (9 Jun 2026), Air Street | n/d | n/d |
| **Askari Defense** (hand-launched CV-guided interceptor drones) | $9M (26 Jun 2026), Builders VC | n/d | Already on UM's competitor board |
| **Mara** (portable autonomous FPV-defeat with kinetic interceptors) | $7M (26 Aug 2026), Khosla | n/d | Closest new entrant to UM's portable form factor |

*Rows without a link are from the [New Market Pitch funding tracker](https://newmarketpitch.com/blogs/news/counter-uas-funding-news) (updated 19 Sep 2026), a third-party compilation; treat as ESTIMATE until confirmed.*

The pattern: valuations step up right after the first government contract. For UM, a first characterization or SBIR win is worth more to the fundraise than the dollar value suggests. Capital is concentrated. Of about $1.52B across 12 verifiable counter-UAS rounds tracked from 2025 to September 2026, four rounds of $200M or more took about 83%, and nine of the twelve closed in June–August 2026 ([New Market Pitch](https://newmarketpitch.com/blogs/news/counter-uas-funding-news)). Portable interceptor startups (Askari, Mara) are raising seed-sized rounds at the same time, so UM's portable niche is getting more crowded.

## 4. The gates UM has to pass

Each gate is something a buyer or regulator has stated as a requirement in the last year.

1. **Characterization data.** JIATF-401 selects after standardized shoot-offs ([Grizzly, Yuma, Aug 2026](https://www.army.mil/article/295795/jiatf_401_accelerates_kinetic_drone_defeat)); the marketplace requires product evaluation. *Without data UM can't be bought.*
2. **C2 integration.** Lattice is now the C-UAS C2 ([JIATF-401 first task order](https://defensescoop.com/2026/03/14/anduril-20-billion-dollar-army-contract/)), and marketplace listings will require the [US-UK common C-UAS data standard](https://www.globalsecurity.org/military/library/news/2026/03/mil-260312-arnews02.htm). Air Force topics also ask for [SOSA and MEDUSA compatibility](https://console.sweetspotgov.com/sbirs/31cbb0ea-d1d3-54eb-9549-7f87c8316787).
3. **Supply-chain compliance.** The Blue UAS list moved to [DCMA in December 2025](https://insideunmannedsystems.com/blue-uas-moves-out-of-diu-to-dcma/), and the Senate FY27 NDAA [widens the restricted-components list](https://www.hklaw.com/en/insights/publications/2026/07/drones-and-national-security-what-to-expect-from-congress) (communications, navigation, cameras, batteries, motors, ESCs). UM's interceptor is itself a UAS.
4. **Spectrum.** Onboard radar emits. DoD users need spectrum supportability; state and local users need [FCC authorization for RF-emitting C-UAS](https://public-inspection.federalregister.gov/2026-13609.pdf). Plan for frequency selection and a spectrum package early.
5. **Homeland legal path by customer:**
   - *DoD at home (10 U.S.C. 130i):* commanders can now engage [beyond the fence line, and surveillance of designated facilities counts as a threat](https://breakingdefense.com/2026/01/pentagon-expands-task-forces-counter-drone-authorities-handing-commanders-more-flexibility/). Non-explosive kinetic and capture are in use (Fortem, Anvil). **Open.**
   - *DHS/DOJ (6 U.S.C. 124n):* the statute allows disabling, damaging or destroying a drone with reasonable force. **Open** through DHS buyers.
   - *State and local (SAFER SKIES):* in-flight "catching or netting" counts as mitigation that needs FBI certification, and the first authorized technology list is expected to be RF-only ([IFR](https://public-inspection.federalregister.gov/2026-13609.pdf)). **Gated.** A physical-interception category has to be added through the interagency process. Even then, only [about 60 SLTT officers were certified by June 2026](https://www.lawfaremedia.org/article/the-counter-uas-certification-bottleneck) against 18,500+ agencies, with 250 more planned by end of FY27. State and local is a 2028+ market.
6. **Price.** The Army's public benchmark is $15K per interceptor today, falling to $3–10K ([Driscoll](https://www.twz.com/land/cheap-interceptor-drones-proven-in-ukraine-protected-u-s-troops-against-iranian-shaheds)). UM's case rests on reuse, so recovery rate and cycle life have to be measured first.
7. **Speed envelope.** Net drones were described as unable to keep up with [150–200+ mph FPV drones](https://www.twz.com/air/lasers-microwaves-missiles-guns-not-on-the-table-for-domestic-drone-defense). **Two rivals now publish speeds above 200 mph:** TYTAN METIS at [400 km/h (~249 mph)](https://www.thedefensenews.com/Germany-Awards-Contract-to-TYTAN-for-Over-1000-METIS-Interceptor-Drones-for-Ukraine/) and Cambridge Aerospace Skyhammer at [700 km/h](https://thedefensepost.com/2026/04/13/uk-skyhammer-interceptor/) (jet). Merops publishes 280 km/h. UM's pursuit speed is still an open question, and per UM's own refresh checklist it's the most important number to measure.
8. **Business plumbing.** SAM.gov/UEI, CAGE, NIST 800-171/CMMC posture for CUI, export classification (EAR vs. ITAR will likely change between the rope and explosive blocks), and a facility clearance if classified threat data is needed.

## 5. Pathways, ranked by time to first government dollar

| # | Pathway | Typical size | Time | Why now |
|---|---|---|---|---|
| 1 | **JIATF-401 Commercial Solutions Opening** (W912CH-26-S-X001) | Pilots to production, fixed-price | **Rolling through 31 Dec 2028** | The main front door. Its *Mobile* capability office wants rapidly transportable C-UAS for border defense and special events. Questions: `JIATF401CSO@army.mil` ([DefenseScoop](https://defensescoop.com/2026/02/27/jiatf-401-commercial-solutions-opening-cso-counter-uas/), [fact sheet](https://api.army.mil/e2/c/downloads/2026/04/15/a013eedf/jiatf-cso-fact-sheet.pdf)) |
| 1b | **USASOC C-sUAS open call** (Vulcan-SOF, quad chart) | $200K–$2M | Deadline **1 Dec 2026** | TRL 4–7 accepted. Its four areas (handheld sensors, handheld RF defeat, GNSS denial, man-packable <50 lb expeditionary sites) and low-EM-signature rule fit UM only if the pitch leads with passive EO/IR and the canister as a man-packable site ([BW&Co](https://www.bwcoconsulting.com/fod/usasoc-csuas)) |
| 2 | **DoD SBIR/STTR** (DSIP) | Phase I ~$75–250K; Phase II ~$1–2M; new $30M "strategic breakthrough" Phase II | Rolling | Reauthorized [13 Apr 2026 through 2031](https://www.mondaq.com/unitedstates/government-contracts-procurement-ppp/1774902/sbirsttr-programs-reauthorized-after-six-month-lapse); C-UAS topics appear every cycle (Air Force homeland convoy, Navy C-UAS) |
| 3 | **ACC Point Defense Battle Lab** (Grand Forks AFB) | Evaluation access | Exercises Aug and Dec 2026; next call TBD | Asked specifically for drone-on-drone interceptors for domestic bases |
| 3b | **Navy Thunderdome** (NAWCAD, annual) | Test and demo access | 2026 event 17–21 Aug; watch for 2027 RFI (~June) | 2026 spec: interceptor <18 lb, ≥85 kt, <$25K to produce, non-kinetic in testing. The closest published spec match to UM ([notice](https://samsearch.co/gov-explore/federal/thunderdome-2026-low-cost-interceptors-for-counter-uas/NAWCAD-SN-26-Thunderdome)) |
| 4 | **JIATF-401 industry engagement + characterization** | Leads to marketplace and IDIQ | Rolling | `jiatf401industryengagement@army.mil`; industry days (last one 5 Mar 2026) |
| 4b | **Bid JIATF-401's open buys at ACC–Detroit Arsenal** (award prefix W912CH) | $0.2M–$14M so far | Rolling on SAM.gov | FY26 buys there were competed under simplified acquisition with 5–50 offers ([DroneShield IRK, 50 offers](https://www.usaspending.gov/award/CONT_AWD_W912CH26CA014_9700_-NONE-_-NONE-)), and two April 2025 detection awards were [small-business set-asides](https://www.usaspending.gov/award/CONT_AWD_W912CH25C0042_9700_-NONE-_-NONE-) (A2 Labs, R-Dex; W912CH25R0082) |
| 5 | **cuas.mil marketplace listing** | Orders direct from DoD, DHS, DOJ, FBI and ~25 allies | After evaluation | ~58 vetted vendors by Aug 2026; buyer comparison uses government data |
| 6 | **Team with an IDIQ holder** | Subcontract | 3–9 months | Digital Force Technologies, Napatree, SRC, AV, CACI (JIATF-401); Leidos, BAE, CACI, Anduril (DHS T1). Fortem is a competitor; Anduril competes with Anvil but owns the C2 |
| 6b | **G-TEAD fast lane** (Army) | Unit buys | Weeks | Merops was [fast-tracked through G-TEAD and flagged to transition to PM Close Combat Systems](https://www.defensenews.com/global/europe/2026/05/05/nato-nations-size-up-an-interceptor-drone-bazaar-where-low-price-is-everything/). This is the demonstrated Army path for interceptor drones. |
| 7 | **xTech prize rounds** | $25K–$350K+ and G-TEAD marketplace placement | Per round | xTechCounterStrike winners got $350K and marketplace placement; Apex Intercept finals Oct–Nov 2026 |
| 8 | **Allies (FMS / direct)** | Large | 12–24 months | Poland SAN includes interceptor drones; Gulf states are buying cheap interceptors; JIATF-401 is pre-clearing products for allies |
| 9 | **State and local (FEMA grants)** | $250M pool | After the technology list expands | Start policy engagement now: DHS S&T, FBI NCUTC, and the docket |

## 6. Risks

- **Price compression.** Merops is heading to $3–5K at scale and Ukrainian interceptors sell for about $2,500. On UM's own placeholders ($25K airframe, $400 consumable per shot), cost per shot is $25,000 ÷ sorties + $400. Getting under $5K per shot takes about 6 sorties per airframe; under $3.5K takes about 9. Since sorties per airframe is roughly 1 ÷ (1 − recovery rate), that means a measured recovery rate of about 83–89%, before shots-per-kill is applied. Shots per kill matters as much: Ukraine reports [2–3 interceptors per Shahed](https://dronexl.co/2026/03/29/zelenskyy-ukraine-2000-interceptor-drones-per-day-budget), against UM's 1.5 placeholder.
- **Consolidation.** Anduril controls the C2 standard and a competing kinetic interceptor; DHS buys through primes. UM has to be easy to integrate and attractive to partner with.
- **The capture lane has an incumbent.** Fortem is on the Army, JIATF-401 and DHS vehicles. UM needs a clear performance edge over net capture (RF-silent defeat, pursuit envelope, portability, reuse) shown with data.
- **Budget timing.** The FY27 CR runs to [11 Dec 2026 and bars new production starts](https://www.govconwire.com/articles/continuing-resolution-fy2027-funding-signed). About 70% of the $20.6B C-UxS request is mandatory "Drone Dominance" money that depends on a reconciliation bill.
- **Speed.** If UM can't pursue fast FPV drones, it is a goalie-style point defense, which is the same box Fortem sits in.
- **Organizational churn.** JIATF-401 now sits under the new [DRPM-UxS](https://media.defense.gov/2026/Jul/01/2003956955/-1/-1/1/ESTABLISHMENT-OF-THE-DIRECT-REPORTING-PORTFOLIO-MANAGER-FOR-UNMANNED-SYSTEMS.PDF), whose director isn't yet named. Requirements may be reshuffled in FY27.

## 7. 90-day plan (October – December 2026)

1. **Paperwork (week 1–2):** SAM.gov/UEI and CAGE, NIST 800-171 self-assessment, first export-classification view (rope block). This blocks everything else.
2. **JIATF-401 CSO (October):** submit a solution brief to the Mobile capability office under W912CH-26-S-X001. Send scope questions to `JIATF401CSO@army.mil` first.
2b. **USASOC open call (by 1 Dec):** submit a quad chart framed as a man-packable expeditionary site with passive EO/IR detection and a capture effector.
3. **JIATF-401 (October):** email the industry-engagement mailbox with a one-page capability sheet, ask for the next characterization event, and ask how marketplace vetting works for a pre-production interceptor. Set a SAM.gov saved search for W912CH (ACC–Detroit Arsenal) and W31P4Q (ACC–Redstone) C-UAS notices.
4. **Test venues:** ask ACC's Point Defense Battle Lab how to get into a 2027 exercise, and prepare a Thunderdome 2027 response against the 2026 spec (<18 lb, ≥85 kt, <$25K, non-kinetic).
5. **SBIR:** set DSIP alerts for counter-UAS, interceptor, base defense, homeland; draft a reusable Phase I package.
6. **Integration:** start a Lattice SDK integration and map UM telemetry to the JIATF-401/US-UK data standard. Put SOSA and MEDUSA on the roadmap.
7. **Measure the three numbers** the cost claim depends on: recovery rate, consumable cost per shot, cycle life. Then measure pursuit speed against an FPV-class target.
8. **Partner outreach:** two conversations with JIATF-401 IDIQ holders that lack an airborne effector (Digital Force Technologies, Napatree, SRC) and one with a DHS Track-1 integrator (Leidos, BAE or CACI).
9. **Policy:** brief DHS S&T and the FBI NCUTC on physical interception for SLTT, citing §124.17 of the IFR.

## 7b. Milestones that would show buyers UM is real

1. Test data from a government venue (Battle Lab, Thunderdome, a JIATF-401 characterization event, or Project Flytrap).
2. A CSO solution brief accepted into presentation.
3. A Lattice integration demo and compliance with the US-UK data standard.
4. A marketplace listing on cuas.mil, and later G-TEAD.
5. Inclusion in the next edition of JIATF-401's [Quick Reference Guide](https://droneintelligence.ai/intelligence/us-military-counter-uas-systems), the de facto shelf of 37 systems in which DroneHunter (capture) and Bumblebee (collision) already appear.

## 8. What would change this outlook

- **Better:** UM posts measured pursuit speed above 200 mph and a recovery rate above 80%, or a physical-interception category is added to the SLTT technology list.
- **Worse:** Fortem or Anduril shows a recoverable interceptor with onboard radar at a lower price, or JIATF-401 standardizes on explosive interceptors for homeland use.
