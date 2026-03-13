"""
Terra AI — Geospatial Calculation Engine
Computes river distances, buffer checks, flood zones, and risk scores
using Shapely for geometry operations.
"""

import json
import math
from pathlib import Path
from shapely.geometry import Point, LineString, MultiLineString

# ── Load river data ──
DATA_DIR = Path(__file__).parent / "data"

def _load_json(filename):
    filepath = DATA_DIR / filename
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

# Cache loaded geometries
_rivers_cache = None
_encroachments_cache = None

def _get_river_geometries():
    """Load and cache river LineString geometries."""
    global _rivers_cache
    if _rivers_cache is not None:
        return _rivers_cache

    data = _load_json("rivers.json")
    if not data or "features" not in data:
        _rivers_cache = []
        return _rivers_cache

    rivers = []
    for feature in data["features"]:
        props = feature.get("properties", {})
        geom = feature.get("geometry", {})
        geom_type = geom.get("type")
        coords = geom.get("coordinates", [])

        if geom_type == "LineString" and len(coords) >= 2:
            line = LineString(coords)
        elif geom_type == "MultiLineString" and coords:
            lines = [LineString(c) for c in coords if len(c) >= 2]
            if lines:
                line = MultiLineString(lines) if len(lines) > 1 else lines[0]
            else:
                continue
        else:
            continue

        rivers.append({
            "name": props.get("name", "Unknown River"),
            "id": props.get("id", ""),
            "risk_level": props.get("risk_level", "MEDIUM"),
            "length_km": props.get("length_km", 0),
            "geometry": line,
        })

    _rivers_cache = rivers
    return rivers


def get_restricted_zones():
    """
    Generate GeoJSON of restricted zones (30m buffer around rivers).
    This serves data for the frontend heatmap/buffer layer.
    """
    rivers = _get_river_geometries()
    if not rivers:
        return {"type": "FeatureCollection", "features": []}

    features = []
    # Roughly 30 meters in degrees for Nairobi's latitude (lat ~ -1.2, lon ~ 36.8)
    # 1 degree of latitude is ~111km. 30m / 111,000m = ~0.00027 degrees.
    buffer_deg = 0.00027 

    for river in rivers:
        # Buffer the LineString geometry
        buffered_geom = river["geometry"].buffer(buffer_deg)
        
        # We need to construct the GeoJSON polygon geometry back from Shapely
        # Shapely's __geo_interface__ is perfect for this
        features.append({
            "type": "Feature",
            "properties": {
                "name": river["name"],
                "risk_level": river["risk_level"],
                "buffer_type": "30m Riparian Restricted Zone"
            },
            "geometry": buffered_geom.__geo_interface__
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


def _haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great-circle distance in meters between two points."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_nearest_river(lat: float, lng: float) -> dict:
    """
    Find the nearest river to a given point.
    Returns dict with: name, distance_m, river_id, risk_level
    """
    rivers = _get_river_geometries()
    if not rivers:
        return {
            "name": "Unknown",
            "distance_m": 9999,
            "river_id": None,
            "risk_level": "UNKNOWN",
        }

    point = Point(lng, lat)  # Shapely uses (x=lng, y=lat)
    nearest = None
    min_distance_deg = float("inf")

    for river in rivers:
        dist = river["geometry"].distance(point)
        if dist < min_distance_deg:
            min_distance_deg = dist
            nearest = river

    if nearest is None:
        return {
            "name": "Unknown",
            "distance_m": 9999,
            "river_id": None,
            "risk_level": "UNKNOWN",
        }

    # Convert degree distance to meters using nearest point on the line
    nearest_point_on_line = nearest["geometry"].interpolate(
        nearest["geometry"].project(point)
    )
    distance_m = _haversine_distance(
        lat, lng,
        nearest_point_on_line.y, nearest_point_on_line.x
    )

    return {
        "name": nearest["name"],
        "distance_m": round(distance_m),
        "river_id": nearest["id"],
        "risk_level": nearest["risk_level"],
    }


def is_inside_buffer(distance_m: float, buffer_m: float = 30) -> bool:
    """Check if a point is inside the riparian buffer zone."""
    return distance_m <= buffer_m


def classify_flood_zone(distance_m: float) -> str:
    """Classify flood zone based on distance from river."""
    if distance_m <= 15:
        return "Zone A — High Risk (Immediate Floodplain)"
    elif distance_m <= 30:
        return "Zone A — High Risk"
    elif distance_m <= 60:
        return "Zone B — Moderate Risk"
    elif distance_m <= 100:
        return "Zone B — Moderate Risk (Outer)"
    elif distance_m <= 200:
        return "Zone C — Low Risk"
    else:
        return "Zone C — Minimal Risk"


def classify_land(distance_m: float, inside_buffer: bool) -> str:
    """Classify land use based on proximity to river."""
    if inside_buffer:
        if distance_m <= 10:
            return "Riparian Reserve (Critical)"
        return "Riparian Reserve"
    elif distance_m <= 60:
        return "Buffer Adjacent Zone"
    elif distance_m <= 150:
        return "Transition Zone"
    else:
        return "General Development Zone"


def count_nearby_encroachments(lat: float, lng: float, radius_m: float = 200) -> int:
    """Count encroachments within a given radius of a point."""
    data = _load_json("encroachments.json")
    if not data or "features" not in data:
        return 0

    count = 0
    for feature in data["features"]:
        coords = feature.get("geometry", {}).get("coordinates", [[]])
        if not coords or not coords[0]:
            continue
        # Use centroid of polygon
        poly_coords = coords[0]
        cx = sum(c[0] for c in poly_coords) / len(poly_coords)
        cy = sum(c[1] for c in poly_coords) / len(poly_coords)
        dist = _haversine_distance(lat, lng, cy, cx)
        if dist <= radius_m:
            count += 1

    return count


def compute_risk_score(
    distance_from_river: float,
    flood_risk_level: str = "MEDIUM",
    inside_buffer: bool = False,
    encroachment_count: int = 0,
) -> int:
    """
    Compute composite risk score (0-100).
    Port of the frontend riskEngine.js logic.
    """
    score = 0

    # Proximity factor (0-40 points)
    if distance_from_river <= 5:
        score += 40
    elif distance_from_river <= 10:
        score += 35
    elif distance_from_river <= 15:
        score += 28
    elif distance_from_river <= 20:
        score += 20
    elif distance_from_river <= 30:
        score += 12
    elif distance_from_river <= 50:
        score += 5

    # Flood risk factor (0-30 points)
    flood_scores = {"CRITICAL": 30, "HIGH": 24, "MEDIUM": 16, "ELEVATED": 8, "LOW": 2}
    score += flood_scores.get(flood_risk_level, 2)

    # Buffer violation (0-20 points)
    if inside_buffer:
        score += 20

    # Encroachment density (0-10 points)
    if encroachment_count > 5:
        score += 10
    elif encroachment_count > 3:
        score += 7
    elif encroachment_count > 1:
        score += 4
    elif encroachment_count > 0:
        score += 2

    return min(100, score)


def classify_risk(score: int) -> str:
    """Classify risk level from score."""
    if score >= 80:
        return "CRITICAL"
    if score >= 60:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    if score >= 20:
        return "ELEVATED"
    return "LOW"


def assess_site(lat: float, lng: float) -> dict:
    """
    Full site risk assessment for a given lat/lng.
    Returns all data needed for the Site Risk Report Card.
    """
    river_info = find_nearest_river(lat, lng)
    distance_m = river_info["distance_m"]
    inside = is_inside_buffer(distance_m)
    flood_zone = classify_flood_zone(distance_m)
    land_class = classify_land(distance_m, inside)
    encroachment_count = count_nearby_encroachments(lat, lng)

    risk_score = compute_risk_score(
        distance_from_river=distance_m,
        flood_risk_level=river_info["risk_level"],
        inside_buffer=inside,
        encroachment_count=encroachment_count,
    )
    risk_level = classify_risk(risk_score)

    return {
        "site": {"lat": lat, "lng": lng},
        "risk_level": risk_level,
        "risk_score": risk_score,
        "distance_from_river_m": distance_m,
        "nearest_river": river_info["name"],
        "inside_buffer": inside,
        "buffer_width_m": 30,
        "flood_zone": flood_zone,
        "land_classification": land_class,
        "legal_reference": "Kenya Water Act (2016), Section 25",
        "nearby_encroachments": encroachment_count,
    }
