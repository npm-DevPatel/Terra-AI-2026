# Terra AI --- Frontend Master Build Document

This document guides AI models to design a **top‑tier geospatial
intelligence UI** for the Terra AI MVP.

Key goals: - Map‑first interface - Dark geospatial intelligence
aesthetic - Cinematic monitoring UI - Avoid generic AI dashboards

Core pages: - Monitoring Dashboard - Site Risk Analyzer - Encroachment
Intelligence - Data Insights

Core tech: React + Mapbox GL JS + Tailwind + mock JSON APIs

Encroachments should appear as glowing red polygons with pulsing
animation.

Include: - Satellite timeline scrubber (2020--2026) - Before/after
comparison slider - Real‑time risk metrics panel - AI chat interface -
Site Risk report card

Map design: Dark satellite basemap Glowing river network
Semi‑transparent riparian buffers Red encroachment highlights



More details on this project:

TERRA AI
Riparian Encroachment Detection & Flood Risk Intelligence for Nairobi
Project Brief  |  USIU Innovation Challenge 2026  |  Team of 3

Day 1 — Ideation	Day 2 — Build MVP	Day 3 — Present to Judges

1.  Executive Summary
Terra AI is a geospatial AI platform that detects illegal building on Nairobi's protected riverbank zones — before the next flood kills anyone.

Every year, Nairobi floods. Every year, the same explanation emerges: rivers have been squeezed by illegal construction, their natural drainage capacity destroyed. The 2024 Mathare floods — which killed over 70 people — were not a natural disaster. They were the predictable result of decades of encroachment on protected riparian land, with no real-time monitoring to stop it.

Terra AI uses satellite imagery and AI-powered change detection to flag new construction within Nairobi's legally protected 30-metre riparian buffer before enforcement becomes reactive and political. It gives county planners, NEMA, and developers a single tool to ask: "Is this site safe to build on?" — and receive an evidence-based answer in seconds, not weeks.

The core insight:
Riparian encroachment is not invisible. It shows up in satellite imagery. The problem is that no one is watching — and no affordable tool exists to watch for you.

2.  The Problem
Nairobi is flooding because we've built over our lungs
Nairobi's river network — the Nairobi River, Mathare River, Ngong River, and their tributaries — acts as the city's natural drainage infrastructure. Kenya's Water Act (2016) establishes a mandatory 30-metre riparian buffer on both sides of every river: a protected corridor that must remain clear of construction to allow rivers to rise, absorb, and recede safely during heavy rain.

That buffer is being systematically violated. Across Nairobi's informal settlements and peri-urban fringes, buildings are being erected metres from riverbanks — and sometimes directly on them. The consequences are predictable and catastrophic:

Problem Mechanism	What It Means for Nairobi
Reduced river width	Natural floodplains are physically blocked by structures, forcing the same volume of water through a smaller channel at higher velocity.
Destroyed drainage capacity	Concrete and compacted earth replace permeable vegetation, preventing rainwater from being absorbed before it reaches the river.
Accelerated flood damage	When rivers overflow, they overflow into densely populated areas — precisely because people live on what used to be the natural flood margin.
Compounding enforcement failure	Illegal structures are expensive to demolish and politically difficult. The longer they stand, the harder they are to remove.

The scale of the crisis:
In the 2024 Mathare floods, over 70 people died and thousands were displaced. Government post-mortems confirmed that the majority of casualties occurred in structures built within legally protected riparian buffers. Nairobi County spends billions of shillings annually on flood response and demolitions — almost all of it reactive.

3.  Why Current Solutions Fail
Three enforcement mechanisms exist on paper. All three fail in practice:

Current Approach	Why It Fails
Manual Inspections	Nairobi has over 2,000 km of river corridors. It is physically impossible to walk and check every section frequently enough to catch new construction before it becomes entrenched. Inspectors also operate in politically charged environments where structures belong to connected individuals.
Survey of Kenya Maps	The official reference maps used by most county officers date from the 1990s. They do not reflect current construction, do not update automatically, and require specialist training to interpret. A ward officer cannot use them to make a siting decision on the spot.
Commercial GIS Tools	ArcGIS, QGIS, and similar platforms require months of training and significant licensing costs. A site assessment using these tools — if procured through consultants — costs KSh 150,000–300,000 and takes three to six weeks. This is incompatible with the pace of informal construction.
Post-flood Investigations	The most common "monitoring" is damage assessment after floods have already occurred. By then, structures are occupied, communities are established, and demolition is a social crisis rather than a simple enforcement action.

The critical gap:
There is no tool that can answer — cheaply, quickly, and without specialist training — the question: "Has anything been built in this riparian buffer in the last six months?"  Terra AI fills that gap.

4.  Our Solution
Terra AI — Know Before You Build
Terra AI is a web-based geospatial AI platform with two integrated capabilities:

•	Automated Encroachment Monitoring: The system continuously analyses satellite imagery over Nairobi's river corridors, detecting changes between historical and current imagery. When a new structure appears within the 30-metre riparian buffer, the system flags it automatically and generates an alert for county planners or NEMA enforcement officers.
•	Conversational Site Risk Assessment: Any user — a developer, ward officer, NGO, or individual buyer — can drop a pin on a map or enter a plot number and ask in plain language: "Is this site safe to build on?" The AI agent checks the site against riparian buffer boundaries, flood risk zones, and land classification data and returns a Site Risk Report in seconds.

For Government & NEMA
Automated weekly scans of all major Nairobi rivers
Geo-tagged alerts showing new encroachments with before/after imagery
Enforcement dashboard with priority-ranked violations
Evidence package exportable for legal action	For Developers & Individuals
Instant site safety check via map pin or plot number
Plain-language Site Risk Report with risk score
Riparian proximity, flood zone, and land use status
Downloadable PDF report for due diligence

5.  How the System Works
The concept in plain terms
Think of it this way: satellites photograph the same patch of land repeatedly over time. Terra AI compares those photographs. If something has changed — specifically, if vegetation or bare earth inside a riparian buffer has been replaced with a building — the system notices, measures it, and flags it.

There are three stages:

Stage	What Happens
Stage 1 — Ingest & Anchor	The system loads the river network for Nairobi (sourced from OpenStreetMap and official Kenya Water Authority data) and draws the 30-metre legal buffer on both sides of every river. This becomes the protected zone boundary.
Stage 2 — Compare & Detect	Satellite images from two time periods are compared using a technique called temporal change detection. The system calculates the difference in land cover (vegetation vs. impervious surface) pixel by pixel inside the buffer zone. Areas where new impervious surface has appeared are flagged as potential encroachments.
Stage 3 — Report & Act	Flagged zones are classified by confidence level and displayed on an interactive map. A plain-language AI agent interprets the findings and generates a report that a non-specialist can read and act on — without needing to understand satellite data or GIS.

The key technical distinction:
This is not a static map. It is a living comparison engine. The question it answers is not "where are the rivers?" but "what has changed near the rivers, and when?" That shift from descriptive to prescriptive is what makes Terra AI actionable.

6.  The MVP We Will Build Tomorrow
Scope: one river, one screen, two questions answered
The MVP is deliberately scoped to what can be built, tested, and demoed confidently in 24 hours by a team of three. Every feature decision should be made with the demo in mind.

What the MVP includes
•	Interactive map (Leaflet.js or Mapbox): Nairobi base map with the Mathare or Ngong River corridor loaded, riparian buffer overlay drawn in a visible colour, and the ability to click anywhere on the map to trigger a risk check.
•	Change detection layer: A pre-computed or live-queried comparison of a selected 1–2 km river stretch showing new construction detected between 2024 and 2026. Flagged areas rendered as red/orange heatmap overlay on the map.
•	AI chat interface: A text input where a user types a natural-language question ("Is this site safe to build on?") and receives a structured Site Risk Report: riparian proximity, flood risk level, land classification status, and a plain-language recommendation.
•	Site Risk Report card: The output of the AI agent displayed as a formatted card showing: distance from river, risk classification (HIGH / MEDIUM / LOW), legal status (inside or outside buffer), and a one-line recommendation.

What the MVP does NOT include (by design)
•	Live satellite feed — pre-loaded imagery is sufficient for the demo
•	Full Nairobi river network — one well-chosen stretch performs better than a broken city-wide view
•	User accounts or authentication — unnecessary complexity for Day 2
•	PDF export — describe it verbally as a future feature

The guiding principle for MVP day:
"Does this feature make the demo stronger?" If yes, build it. If no, cut it. A clean demo of two working pins beats a complex demo that crashes.

7.  Demo Plan for Judges
Exactly what the judges will see — rehearse this until it is automatic
The demo is a live 90-second sequence embedded in the 5-minute presentation. It should be rehearsed at least five times before the presentation. Two pins are prepared in advance, verified to work, and the demo never deviates from the script.

Demo Step	What to Say and Show
Step 1 (15 seconds)	Open the Terra AI interface. Show the Nairobi map with the river network and riparian buffer overlay visible. Set the scene: "This red zone is the legally protected 30-metre buffer. Nothing should be built here."
Step 2 (20 seconds)	Show the change detection layer on the pre-selected Mathare River stretch. Point to the flagged encroachments. "These highlighted areas — five structures in this 1 km stretch — did not exist in 2024. They appeared in the last 18 months. This is illegal construction. And until now, no one was watching."
Step 3 (30 seconds)	Drop Pin A on a flagged encroachment site near Mathare River. Type into the AI chat: "Is this site safe to build on?" Show the Site Risk Report: DISTANCE: 12m from Mathare River | RISK: HIGH | STATUS: Inside riparian buffer | RECOMMENDATION: Do not build. Legal violations apply under Water Act (2016).
Step 4 (20 seconds)	Drop Pin B on a site in Westlands, well clear of any river. Same question. Show: DISTANCE: 340m from nearest river | RISK: LOW | STATUS: Outside riparian buffer | RECOMMENDATION: Site is clear for construction subject to standard planning approvals.
Step 5 (5 seconds)	Close the demo. One line: "This took ten seconds. A consultant charges KSh 200,000 and three weeks for the same answer."

Preparation is the demo:
If a judge says "can I suggest a location?" — take it. Having the live system work on an unscripted pin from the audience is the most powerful moment possible. Only do this if the system is genuinely reliable. Otherwise, stay with the script.

8.  Technology Stack
Component	Tool / Approach
Satellite Imagery	Google Earth Engine (free API) or Sentinel Hub — both provide access to Sentinel-2 and Landsat imagery with free tiers sufficient for the demo. Sentinel-2 offers 10m resolution, adequate for detecting individual buildings.
Change Detection	Python with rasterio, numpy, and scikit-learn. The core algorithm subtracts the spectral signature of Imagery B (2026) from Imagery A (2024) within the buffer zone. NDVI difference is the simplest implementation: where NDVI drops sharply, vegetation has been replaced by impervious surface.
Spatial Data & Buffers	GeoPandas for buffer geometry calculations. River centreline data from OpenStreetMap (via Overpass API) or the Kenya Water Authority open data portal. The 30m buffer is a single buffer() function call.
Backend	Python / FastAPI (already set up per the repository). Handles the AI agent requests, geospatial queries, and site risk scoring.
AI Agent	OpenAI or Anthropic API (or a local LLM). The agent receives structured geospatial data (riparian proximity, flood zone classification, land use) and formats it into a plain-language Site Risk Report.
Frontend / Map	React (already set up per the repository) with Leaflet.js or Mapbox GL JS for the interactive map. The change detection layer is rendered as a GeoJSON overlay. The chat interface is a simple React component.
Hosting	AWS EC2 (setup script already in the repository). Run locally for the demo if cloud deployment introduces risk.
Data Sources	OpenStreetMap (river network), SERVIR Eastern & Southern Africa (flood extent), Humanitarian Data Exchange / HDX (Kenya admin boundaries), Google Earth Engine (satellite imagery archive).

9.  Competitive Advantage
Why this stands out in the competition
Advantage	Why It Matters to Judges
Kenya-specific calibration	Most GIS tools are generic. Terra AI is built around Kenya's Water Act (2016), Nairobi's specific river network, and the enforcement reality of NEMA and Nairobi County. This specificity makes it immediately credible to judges with policy knowledge.
Conversational interface	No GIS expertise required. A ward officer, developer, or journalist can use it. This dramatically expands the addressable user base beyond technical specialists.
Prescriptive, not descriptive	Existing tools show you a map. Terra AI tells you what the map means and what to do about it. Moving from "here is data" to "here is a decision" is the product breakthrough.
Real-world anchoring	The problem is not hypothetical. The 2024 Mathare floods are documented. The deaths are on record. The 30m riparian rule is law. Terra AI is not a research project — it is an enforcement tool for a real regulatory regime.
Clear buyer	Government (NEMA, Nairobi County), construction firms doing due diligence, and mortgage banks verifying collateral land status. The revenue model does not require inventing a market — it taps into existing procurement and compliance budgets.
Unbiased evidence	Satellite imagery does not accept bribes. This is the system's defining advantage over manual inspection. The encroachment is either there or it is not. The evidence is objective and timestamped.

10.  Impact in Kenya
SDG alignment and real-world outcomes
SDG	Connection to Terra AI
SDG 11 Sustainable Cities & Communities	Directly addresses SDG 11.5 (reducing deaths and economic losses from disasters). Supports evidence-based urban planning. Reduces the cost of flood damage to Nairobi's infrastructure and households.
SDG 13 Climate Action	Flood frequency and intensity are increasing with climate change. Protecting riparian corridors is one of the highest-leverage climate adaptation measures available to African cities. Terra AI makes enforcement of existing protections scalable.
SDG 9 Resilient Infrastructure	Prevents infrastructure from being built in locations that will destroy it. Every road, school, or hospital built outside a riparian zone rather than inside one is a resilience gain for the city.

Immediate, measurable outcomes
•	County enforcement officers can prioritise riparian violations by recency and severity rather than by political connection or random inspection routes.
•	Developers and individual buyers can screen sites in seconds, reducing the risk of purchasing land that will be demolished.
•	NEMA gains a scalable evidence base for legal action against encroachers that is objective, timestamped, and court-admissible.
•	Mortgage banks and property financiers can verify collateral land status against riparian risk before approving loans.

The scale story for judges:
Nairobi is the proof of concept. Kenya has 47 counties. Every county has rivers. Every county has this problem. The system scales by loading new river data — the core algorithm does not change. Kisumu, Mombasa, Nakuru, and Eldoret are the next markets.

11.  Future Potential
Beyond the MVP — the 12-month roadmap
Phase	What It Includes
Phase 1 (MVP — now)	Single river, Nairobi. Change detection for 2024–2026. Manual AI queries for site risk. Demo-ready in 24 hours.
Phase 2 (Month 1–3)	Full Nairobi river network. Automated weekly scans. Government enforcement dashboard. Integration with NEMA reporting workflow. Early-access pilot with Nairobi County.
Phase 3 (Month 4–9)	API for mortgage banks and property platforms (e.g. BuyRentKenya, Hauzisha). PDF Site Risk Report as paid product. Expansion to Mombasa and Kisumu. Mobile app for field officers.
Phase 4 (Month 10–12)	East Africa expansion (Tanzania, Uganda, Rwanda). White-label licensing to municipal governments. Integration with national land registry APIs for plot-number lookup. Predictive flood modelling layer.

Business model
Revenue Stream	How It Works
B2G SaaS	Annual licensing to county governments and NEMA for the enforcement dashboard. This is the primary revenue stream. Target: 5 counties at KSh 2M/year = KSh 10M ARR in Year 1.
API Access	Per-query pricing for mortgage banks, property platforms, and construction firms doing bulk due diligence. Estimated KSh 500–2,000 per site check.
Freemium	Free basic site check (up to 5 per month) for individuals and NGOs. Paid upgrade for unlimited checks, PDF reports, and historical comparison.

12.  Five-Slide Presentation Outline
What each slide must accomplish in front of judges

1	Problem Statement + Solution
Open with the 2024 Mathare flood image — people on rooftops, submerged streets. No text needed. Let the image breathe for five seconds. Then one line: "Nairobi is drowning because we have built over our lungs." Explain the riparian buffer rule in one sentence. State the gap: no monitoring tool exists. Introduce Terra AI with its tagline: Know Before You Build. End the slide in under 90 seconds.

2	Methodology
Show the three-stage flow (Ingest — Detect — Report) as a simple diagram. Name the data sources: OSM river data, Sentinel-2 satellite imagery, SERVIR flood layers. Name the core technique: temporal change detection. Cite the legal anchor: Kenya Water Act (2016), 30m riparian buffer. Connect to SDG 11.5 and SDG 13. Keep this factual and confident — judges will be reassured by real data sources and real law.

3	Competitive Analysis
Present a 2x2 matrix: X-axis is Ease of Use (Expert Tool to Anyone Can Use), Y-axis is Kenya-Specific Data (Generic to Kenya-Calibrated). Place ArcGIS and QGIS in the bottom-left. Survey of Kenya maps in the bottom-right. Generic international geo-AI tools in the top-left. Terra AI in the top-right — the only tool that is both easy and Kenya-specific. One sentence: "That empty quadrant is our market."

4	MVP Demo
This is the most important slide. Do not put much text here — the demo IS the slide. Run the live demo sequence exactly as scripted in Section 7. Drop Pin A (HIGH risk, inside buffer). Drop Pin B (LOW risk, safe). Show the AI report both times. If possible, invite a judge to suggest a third location. Close with: "This took ten seconds. A consultant charges KSh 200,000 and three weeks for the same answer."

5	Impact
Three layers of impact: Immediate (prevent illegal builds, save lives), Economic (reduce demolition costs, reduce flood losses), Scale (47 counties in Kenya, then East Africa). Show the business model in three lines: B2G SaaS for county governments, API for banks and developers, freemium for citizens. End with the team's names, a one-line call to action, and your contact. Final words: "Making the invisible, visible — before the next flood."

Opening line for the judges — memorise this:
"In April 2024, floods killed over 70 people in Nairobi. Most died in structures that should never have been built where they were. No one checked. There was no tool to check. We built one."

Terra AI  |  USIU Innovation Challenge 2026  |  Confidential Team Brief
