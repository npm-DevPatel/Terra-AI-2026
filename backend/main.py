"""
Terra AI — FastAPI Backend
Main application with all API endpoints for the Terra AI geospatial intelligence platform.
"""

import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from geo_engine import assess_site, find_nearest_river
from ai_service import generate_site_risk_narrative, chat_response

# ── Logging ──
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("terra_ai")

# ── FastAPI App ──
app = FastAPI(
    title="Terra AI API",
    description="Geospatial intelligence API for riparian encroachment detection in Nairobi",
    version="1.0.0",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Data Loading ──
DATA_DIR = Path(__file__).parent / "data"


def load_json(filename: str):
    """Load a JSON file from the data directory."""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail=f"Data file {filename} not found")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Request/Response Models ──
class SiteRiskRequest(BaseModel):
    lat: float
    lng: float


class ChatRequest(BaseModel):
    message: str
    lat: Optional[float] = None
    lng: Optional[float] = None


# ══════════════════════════════════════════════
# API ENDPOINTS
# ══════════════════════════════════════════════

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Terra AI Backend",
        "version": "1.0.0",
    }


@app.get("/api/rivers")
async def get_rivers():
    """Return river GeoJSON data."""
    return load_json("rivers.json")


@app.get("/api/encroachments")
async def get_encroachments():
    """Return encroachment GeoJSON data."""
    return load_json("encroachments.json")


@app.get("/api/alerts")
async def get_alerts():
    """Return alert feed."""
    return load_json("alerts.json")


@app.get("/api/metrics")
async def get_metrics():
    """Return dashboard summary metrics."""
    return load_json("metrics.json")


@app.post("/api/site-risk")
async def site_risk_assessment(request: SiteRiskRequest):
    """
    Assess site risk for a given lat/lng.
    Computes real distance to nearest river, buffer status,
    flood zone, risk score, and generates AI narrative.
    """
    try:
        # Run geospatial assessment
        site_data = assess_site(request.lat, request.lng)

        # Generate AI narrative
        ai_result = await generate_site_risk_narrative(site_data)

        # Merge all data
        result = {
            **site_data,
            "ai_narrative": ai_result["ai_narrative"],
            "recommendation": ai_result["recommendation"],
        }

        logger.info(
            f"Site risk assessed: ({request.lat:.4f}, {request.lng:.4f}) → "
            f"{result['risk_level']} ({result['risk_score']}/100), "
            f"{result['distance_from_river_m']}m from {result['nearest_river']}"
        )

        return result

    except Exception as e:
        logger.error(f"Site risk assessment failed: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")


@app.post("/api/chat")
async def ai_chat(request: ChatRequest):
    """
    AI chat endpoint.
    Sends user message to Gemini (or fallback) with optional location context.
    """
    try:
        # If coordinates provided, get site context
        site_context = None
        if request.lat is not None and request.lng is not None:
            site_context = assess_site(request.lat, request.lng)

        response_text = await chat_response(
            message=request.message,
            lat=request.lat,
            lng=request.lng,
            site_context=site_context,
        )

        return {
            "response": response_text,
            "site_context": site_context,
        }

    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.get("/api/geocode")
async def geocode(q: str):
    """
    Proxy geocoding requests to Nominatim (OpenStreetMap).
    Avoids CORS issues and respects rate limits.
    """
    import httpx

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": q,
                    "format": "json",
                    "limit": 5,
                    "countrycodes": "ke",  # Restrict to Kenya
                },
                headers={
                    "User-Agent": "TerraAI/1.0 (contact@terra-ai.dev)",
                },
                timeout=10.0,
            )
            response.raise_for_status()
            results = response.json()

            # Simplify the response
            return [
                {
                    "name": r.get("display_name", ""),
                    "lat": float(r.get("lat", 0)),
                    "lng": float(r.get("lon", 0)),
                    "type": r.get("type", ""),
                }
                for r in results
            ]

    except Exception as e:
        logger.error(f"Geocoding failed: {e}")
        raise HTTPException(status_code=500, detail=f"Geocoding failed: {str(e)}")


# ── Startup ──
@app.on_event("startup")
async def startup():
    logger.info("🌍 Terra AI Backend starting up...")
    logger.info(f"📂 Data directory: {DATA_DIR}")
    # Verify data files exist
    for f in ["rivers.json", "encroachments.json", "alerts.json", "metrics.json"]:
        if (DATA_DIR / f).exists():
            logger.info(f"  ✓ {f}")
        else:
            logger.warning(f"  ✗ {f} missing!")
    logger.info("🚀 Terra AI Backend ready.")
