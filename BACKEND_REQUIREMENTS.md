# Terra AI — Backend Requirements & Data Sources

> Everything listed here is **free** (or has a free tier sufficient for the MVP and demo) and integrates directly into the existing React frontend.

---

## Quick Checklist

| # | What You Need | Service | Cost | Time to Set Up |
|---|---|---|---|---|
| 1 | Real river coordinates for Nairobi | Overpass API (OpenStreetMap) | Free | 5 min |
| 2 | Satellite imagery (before/after) | Sentinel Hub / Google Earth Engine | Free | 30 min |
| 3 | AI chat / site risk analysis | Google Gemini API | Free | 10 min |
| 4 | Backend API server | Python FastAPI on Railway | Free | 20 min |
| 5 | Database (geospatial) | Supabase (PostGIS) | Free | 15 min |
| 6 | Flood zone data | SERVIR / HDX Kenya | Free | 10 min |
| 7 | Geocoding (plot lookup) | Nominatim (OpenStreetMap) | Free | 0 min (no signup) |

---

## 1. Real River Data — Overpass API (OpenStreetMap)

**What:** Actual coordinates of Nairobi's rivers (Mathare, Ngong, Nairobi, Kirichwa Kubwa) as GeoJSON LineStrings.

**Why:** Replaces our mock `rivers.json` with real-world geometry so the cyan river lines trace actual riverbeds on the map.

**Service:** [Overpass API](https://overpass-api.de/)
- **Cost:** Completely free, no signup, no API key
- **Rate limit:** ~10,000 requests/day

**How to get the data:**

Run this query at https://overpass-turbo.eu/ → click "Run" → click "Export" → "GeoJSON":

```
[out:json][timeout:30];
area["name"="Nairobi"]["admin_level"="4"]->.nairobi;
(
  way["waterway"="river"](area.nairobi);
  way["waterway"="stream"](area.nairobi);
  relation["waterway"="river"](area.nairobi);
);
out geom;
```

**Save the output** as `src/data/rivers_real.geojson` and I'll swap it into the map.

> [!TIP]
> For the demo, you only need the Mathare River stretch. To get just Mathare River, use:
> ```
> [out:json][timeout:30];
> way["waterway"="river"]["name"="Mathare River"]->.mathare;
> (.mathare;);
> out geom;
> ```

**Frontend integration:** Drop-in replacement — the `MapContainer.jsx` already reads GeoJSON. Just swap the import file.

---

## 2. Satellite Imagery — Sentinel Hub (Free Tier)

**What:** Before/after satellite images of Nairobi river corridors (2024 vs 2026) for the comparison slider and change detection.

**Why:** Powers the Encroachment Intelligence page's before/after slider and provides visual evidence for the demo.

### Option A: Sentinel Hub (Recommended)

- **URL:** https://www.sentinel-hub.com/
- **Cost:** Free tier = 30,000 processing units/month (enough for hundreds of images)
- **Signup:** Email only, **no credit card required**
- **Resolution:** 10m (Sentinel-2) — enough to detect individual buildings
- **API:** REST API returns PNG/JPEG tiles or GeoTIFF

**How to sign up:**
1. Go to https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/registrations?client_id=30cf1d69-af43-4dda-9876-2d7c18d4ad3c&redirect_uri=https%3A%2F%2Fapps.sentinel-hub.com
2. Create account (email + password only)
3. Go to Dashboard → create a new Configuration
4. Copy your **Instance ID** and **Client ID / Client Secret**

**What to request:**
- **True color** images of the Mathare River area
- **Date range A:** January 2024 (before)
- **Date range B:** January 2026 (after)
- **Bbox:** `36.83,-1.27,36.87,-1.25` (Mathare River corridor)

**API example:**
```bash
curl "https://services.sentinel-hub.com/api/v1/process" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "bounds": { "bbox": [36.83, -1.27, 36.87, -1.25] },
      "data": [{
        "type": "sentinel-2-l2a",
        "dataFilter": { "timeRange": { "from": "2024-01-01", "to": "2024-03-31" } }
      }]
    },
    "output": { "width": 512, "height": 512 }
  }'
```

**Frontend integration:** The response images go into the `ComparisonSlider.jsx` as `backgroundImage` URLs, replacing the current CSS gradient placeholders.

### Option B: Google Earth Engine (Alternative)

- **URL:** https://earthengine.google.com/
- **Cost:** Free for research/education/nonprofit
- **Signup:** Google account → apply for access (takes 1-3 days approval)
- **Pros:** Massive archive, powerful processing
- **Cons:** Slower signup, requires Python SDK for image export

> [!IMPORTANT]
> **For the demo, Sentinel Hub is faster to set up.** Earth Engine has a longer approval process.

---

## 3. AI Chat / Site Risk Analysis — Google Gemini API

**What:** Powers the AI Risk Analyst chat panel. Receives site coordinates + geospatial context → returns a structured Site Risk Report.

**Why:** Replaces the mock `siteRiskResponses.json` with real AI-generated analysis.

- **URL:** https://aistudio.google.com/apikey
- **Cost:** Free tier = 60 requests/minute, 1,500 requests/day
- **Signup:** Google account only, **no credit card**

**How to get the API key:**
1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key

**How it integrates:**

The frontend sends a request to your FastAPI backend with the clicked coordinates. The backend:
1. Calculates distance to nearest river (from your river GeoJSON)
2. Checks if inside 30m riparian buffer
3. Looks up flood zone classification
4. Sends all of this as context to Gemini with a system prompt
5. Returns the structured Site Risk Report to the frontend

**System prompt for Gemini:**
```
You are Terra AI Risk Analyst, a geospatial intelligence agent specializing
in riparian encroachment assessment in Nairobi, Kenya.

Given the following site data, generate a Site Risk Report:
- Coordinates: {lat}, {lng}
- Distance to nearest river: {distance}m
- Nearest river: {river_name}
- Inside 30m riparian buffer: {yes/no}
- Flood zone classification: {zone}
- Land classification: {class}

Respond in JSON format:
{
  "risk_level": "HIGH|MEDIUM|LOW",
  "risk_score": 0-100,
  "ai_narrative": "2-3 sentence plain language explanation",
  "recommendation": "one actionable recommendation",
  "legal_reference": "relevant Kenya Water Act section"
}
```

**Environment variable:** `VITE_GEMINI_API_KEY=your_key_here`

---

## 4. Backend API Server — Python FastAPI

**What:** A lightweight API server that handles geospatial calculations, AI queries, and serves processed data to the React frontend.

**Why:** The frontend needs a backend to calculate river distances, run buffer checks, and proxy AI requests (you shouldn't call Gemini directly from the browser with an exposed API key).

### Tech Stack

| Component | Library | Purpose |
|---|---|---|
| Web framework | FastAPI | REST API endpoints |
| Geospatial | GeoPandas + Shapely | Buffer calculations, distance-to-river |
| AI integration | google-generativeai | Gemini API calls |
| CORS | fastapi-cors | Allow React frontend to call the API |
| Server | Uvicorn | Run the FastAPI app |

### Hosting: Railway (Free)

- **URL:** https://railway.app/
- **Cost:** Free tier = 500 hours/month, 1 GB RAM
- **Signup:** GitHub account, **no credit card**
- **Deploy:** Connect your GitHub repo → auto-deploys on push

**Alternative (local for demo):** Just run `uvicorn main:app --reload` on your laptop.

### API Endpoints Needed

```
GET  /api/health                    → { status: "online" }
GET  /api/rivers                    → GeoJSON of all rivers
GET  /api/encroachments             → GeoJSON of detected encroachments
POST /api/site-risk                 → { lat, lng } → Site Risk Report
GET  /api/alerts                    → Recent alert feed
GET  /api/metrics                   → Dashboard summary metrics
POST /api/chat                      → { message, lat?, lng? } → AI response
```

### Key Python packages to install:

```bash
pip install fastapi uvicorn geopandas shapely google-generativeai python-dotenv
```

---

## 5. Database — Supabase (PostGIS)

**What:** A PostgreSQL database with PostGIS extension for storing river data, encroachments, alerts, and site risk reports.

**Why:** Lets you persist data, run spatial queries (e.g., "find all encroachments within 30m of this river"), and serve dynamic data to the frontend.

- **URL:** https://supabase.com/
- **Cost:** Free tier = 500 MB database, 1 GB file storage, 50,000 monthly active users
- **Signup:** GitHub account, **no credit card**
- **PostGIS:** Built-in — Supabase PostgreSQL includes the PostGIS extension by default

**How to set up:**
1. Go to https://supabase.com/ → "Start your project"
2. Sign in with GitHub
3. Create a new project (choose a region close to you)
4. Go to SQL Editor and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
5. Copy the **Project URL** and **anon key** from Settings → API

### Database Tables

```sql
-- Rivers
CREATE TABLE rivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  length_km NUMERIC,
  risk_level TEXT,
  geometry GEOMETRY(LineString, 4326) NOT NULL
);

-- Encroachments
CREATE TABLE encroachments (
  id TEXT PRIMARY KEY,
  river_id TEXT REFERENCES rivers(id),
  river_name TEXT,
  distance_from_river_m INTEGER,
  area_sqm INTEGER,
  severity TEXT,
  description TEXT,
  detected_date DATE,
  status TEXT DEFAULT 'Active Violation',
  geometry GEOMETRY(Polygon, 4326) NOT NULL
);

-- Site Risk Reports (logged queries)
CREATE TABLE site_risk_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  risk_level TEXT,
  risk_score INTEGER,
  nearest_river TEXT,
  distance_m INTEGER,
  inside_buffer BOOLEAN,
  ai_narrative TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alerts
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  severity TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

**Environment variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Frontend integration:** Install `@supabase/supabase-js` and query directly from React, or route through your FastAPI backend.

---

## 6. Flood Zone Data — SERVIR & HDX

**What:** Flood risk zones for Nairobi to overlay on the map and use in site risk calculations.

**Why:** The Site Risk Report needs flood zone classification (e.g., "100-year floodplain", "High risk flood zone").

### Source A: SERVIR East Africa

- **URL:** https://servirglobal.net/
- **Data:** Flood extent maps, historical flood boundaries for Nairobi
- **Cost:** Free, open data
- **Format:** GeoJSON / Shapefile

### Source B: Humanitarian Data Exchange (HDX)

- **URL:** https://data.humdata.org/dataset?q=nairobi+flood&ext_page_size=25
- **Cost:** Free, no signup needed for downloads
- **What to download:**
  - Kenya flood risk zones
  - Nairobi county admin boundaries
  - Kenya river network shapefiles

### Source C: Kenya Open Data

- **URL:** https://opendata.go.ke/
- **What:** Official Kenya government datasets — river corridors, county boundaries, land classification

**Frontend integration:** Download GeoJSON files → add as new map layers in `MapContainer.jsx`, similar to how rivers and encroachments are added.

---

## 7. Geocoding — Nominatim (OpenStreetMap)

**What:** Convert place names / addresses to coordinates and vice versa.

**Why:** Users might want to search "Mathare" or "Westlands" instead of clicking the map.

- **URL:** https://nominatim.openstreetmap.org/
- **Cost:** Completely free, **no signup, no API key**
- **Rate limit:** 1 request/second (sufficient for demo)

**Example API call:**
```
https://nominatim.openstreetmap.org/search?q=Mathare,Nairobi&format=json&limit=1
```

**Frontend integration:** Add a search bar in the TopBar that calls this API and flies the map to the result.

---

## Summary: Environment Variables You'll Need

Create a `.env` file in the project root:

```env
# AI — Google Gemini (free, no card)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Database — Supabase (free, no card)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Satellite Imagery — Sentinel Hub (free, no card)
SENTINEL_HUB_CLIENT_ID=your_client_id
SENTINEL_HUB_CLIENT_SECRET=your_client_secret

# Backend API (if deployed)
VITE_API_URL=http://localhost:8000
```

---

## Priority Order for Implementation

Do these in order — each one makes the demo stronger:

| Priority | Task | Impact on Demo |
|---|---|---|
| 🔴 1 | Get real river data from Overpass API | Rivers trace actual riverbeds on map |
| 🔴 2 | Get Gemini API key | AI chat gives real responses |
| 🟡 3 | Set up Supabase database | Persistent data, spatial queries |
| 🟡 4 | Build FastAPI backend (3 endpoints) | Connect frontend to real data |
| 🟢 5 | Get Sentinel Hub satellite images | Real before/after comparison |
| 🟢 6 | Download flood zone GeoJSON from HDX | Accurate flood risk in reports |
| 🟢 7 | Add Nominatim search | Search places by name |

> [!IMPORTANT]
> **For the demo, priorities 1 and 2 alone make a massive difference.** Real rivers + real AI responses = a convincing live demo. The rest can be mocked or added after.

---

## What I Need From You

Once you have any of these, hand them to me and I'll wire them into the existing UI:

1. **River GeoJSON** from Overpass Turbo → I'll replace `rivers.json`
2. **Gemini API key** → I'll connect the AI chat panel
3. **Supabase credentials** → I'll set up the database queries
4. **Sentinel Hub images** → I'll plug them into the comparison slider

Everything else (FastAPI backend, geocoding, flood data) I can build with just the items above.
