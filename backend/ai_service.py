"""
Terra AI — AI Service (Google Gemini Integration)
Handles AI chat responses and site risk narrative generation.
Falls back to intelligent pre-built responses when no API key is configured.
"""

import os
import json
import logging

logger = logging.getLogger("terra_ai")

# Try to import Gemini SDK
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-generativeai not installed. AI features will use fallback responses.")

# ── Gemini Configuration ──
_model = None

SYSTEM_PROMPT = """You are Terra AI Risk Analyst, a geospatial intelligence agent specializing in riparian encroachment assessment in Nairobi, Kenya.

Your expertise includes:
- Kenya Water Act (2016) — particularly Section 25 on riparian buffer zones
- Nairobi's river network: Mathare River, Nairobi River, Ngong River, Kirichwa Kubwa
- Flood risk assessment and urban planning
- Satellite imagery change detection for encroachment monitoring
- The 30-metre mandatory riparian buffer zone regulations

When responding to site risk queries, be specific, cite the Kenya Water Act, and provide actionable recommendations.
When discussing general topics, stay in your domain of geospatial intelligence, environmental compliance, and flood risk.

Always be professional, concise, and evidence-based. Reference specific distances, regulations, and risk levels.
Format your responses in clear, readable paragraphs. Do not use markdown formatting."""


def _init_model():
    """Initialize the Gemini model if API key is available."""
    global _model
    if _model is not None:
        return _model

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or not GENAI_AVAILABLE:
        logger.info("No Gemini API key configured. Using fallback responses.")
        return None

    try:
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
        )
        logger.info("Gemini model initialized successfully.")
        return _model
    except Exception as e:
        logger.error(f"Failed to initialize Gemini model: {e}")
        return None


async def generate_site_risk_narrative(site_data: dict) -> dict:
    """
    Generate AI narrative for a site risk assessment.
    Returns dict with: ai_narrative, recommendation
    """
    model = _init_model()

    if model is None:
        return _fallback_site_narrative(site_data)

    prompt = f"""Analyze this site and generate a risk assessment narrative.

Site Data:
- Coordinates: {site_data['site']['lat']:.6f}, {site_data['site']['lng']:.6f}
- Distance to nearest river: {site_data['distance_from_river_m']}m
- Nearest river: {site_data['nearest_river']}
- Inside 30m riparian buffer: {'Yes' if site_data['inside_buffer'] else 'No'}
- Risk score: {site_data['risk_score']}/100
- Risk level: {site_data['risk_level']}
- Flood zone: {site_data['flood_zone']}
- Land classification: {site_data['land_classification']}
- Nearby encroachments detected: {site_data['nearby_encroachments']}

Respond in JSON format only:
{{
  "ai_narrative": "2-3 sentence evidence-based analysis of this specific site's risk. Include the distance, river name, buffer status, and flood implications. Reference the 2024 Mathare floods if relevant.",
  "recommendation": "One clear, actionable recommendation for this exact site."
}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Try to parse JSON from response
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        parsed = json.loads(text)
        return {
            "ai_narrative": parsed.get("ai_narrative", ""),
            "recommendation": parsed.get("recommendation", ""),
        }
    except Exception as e:
        logger.warning(f"Gemini site narrative failed: {e}. Using fallback.")
        return _fallback_site_narrative(site_data)


async def chat_response(message: str, lat: float = None, lng: float = None, site_context: dict = None) -> str:
    """
    Generate an AI chat response to a user message.
    If lat/lng provided, includes geographic context.
    """
    model = _init_model()

    if model is None:
        return _fallback_chat_response(message, site_context)

    context_parts = []
    if site_context:
        context_parts.append(f"""Current site context:
- Location: {site_context.get('site', {}).get('lat', 'N/A')}, {site_context.get('site', {}).get('lng', 'N/A')}
- Distance to {site_context.get('nearest_river', 'river')}: {site_context.get('distance_from_river_m', 'N/A')}m
- Risk level: {site_context.get('risk_level', 'N/A')}
- Risk score: {site_context.get('risk_score', 'N/A')}/100
- Inside buffer: {'Yes' if site_context.get('inside_buffer') else 'No'}
- Flood zone: {site_context.get('flood_zone', 'N/A')}""")
    elif lat is not None and lng is not None:
        context_parts.append(f"User is asking about location: {lat:.6f}, {lng:.6f}")

    prompt = f"""User question: {message}

{chr(10).join(context_parts) if context_parts else 'No specific location context provided.'}

Provide a helpful, concise response as Terra AI Risk Analyst. Stay within your domain of geospatial intelligence, riparian zone compliance, and flood risk in Nairobi. Keep the response to 2-4 sentences unless the question requires more detail."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.warning(f"Gemini chat failed: {e}. Using fallback.")
        return _fallback_chat_response(message, site_context)


def _fallback_site_narrative(site_data: dict) -> dict:
    """Generate pre-built narrative when Gemini is unavailable."""
    distance = site_data["distance_from_river_m"]
    river = site_data["nearest_river"]
    inside = site_data["inside_buffer"]
    risk_level = site_data["risk_level"]
    encroachments = site_data.get("nearby_encroachments", 0)

    if inside and distance <= 10:
        narrative = (
            f"This location is {distance}m from the {river} centreline, deep within the legally protected "
            f"30-metre riparian buffer. Building here directly violates the Kenya Water Act (2016). "
            f"Satellite imagery analysis shows this area is on the historical floodplain — structures in "
            f"this zone were among the hardest hit during the 2024 Mathare floods, which killed over 70 people "
            f"and displaced thousands. {f'{encroachments} other encroachments have been detected within 200m.' if encroachments > 0 else ''}"
        )
        recommendation = "Do not build. This site is a critical flood risk zone. Legal violations apply under the Kenya Water Act (2016), Section 25."
    elif inside:
        narrative = (
            f"This site is {distance}m from the {river} centreline — inside the legally protected 30-metre "
            f"riparian buffer but near its outer boundary. The area is classified as {site_data['flood_zone']}. "
            f"While some existing structures are present nearby, new construction technically requires a variance "
            f"from the county planning authority. Historical flood data shows this stretch experiences moderate "
            f"to severe flooding during heavy rains."
        )
        recommendation = "Proceed with extreme caution. Consult the county planning office for a possible variance. Flood insurance is mandatory at this distance."
    elif distance <= 100:
        narrative = (
            f"This location is {distance}m from the {river}, outside the 30-metre riparian buffer but still "
            f"within a moderate flood risk zone. The site is classified as {site_data['land_classification']}. "
            f"While no riparian buffer violations apply, standard flood risk precautions are recommended — "
            f"particularly given the increasing frequency of extreme rainfall events in Nairobi."
        )
        recommendation = "Site is buildable with precautions. Consider elevated foundations and flood-resistant construction. Consult county planning for standard approvals."
    else:
        narrative = (
            f"This location in the Nairobi area is {distance}m from the nearest river ({river}). It is well "
            f"outside any riparian buffer zone and in a {site_data['land_classification'].lower()} area. "
            f"The flood risk here is minimal, classified as {site_data['flood_zone']}. Standard building "
            f"regulations and county planning approvals apply, but no special riparian or flood-zone "
            f"restrictions are triggered."
        )
        recommendation = "Site is clear for construction subject to standard planning approvals. No riparian restrictions apply at this distance."

    return {
        "ai_narrative": narrative,
        "recommendation": recommendation,
    }


def _fallback_chat_response(message: str, site_context: dict = None) -> str:
    """Generate pre-built chat response when Gemini is unavailable."""
    msg_lower = message.lower()

    # If there's site context, build a contextual response
    if site_context:
        distance = site_context.get("distance_from_river_m", "unknown")
        river = site_context.get("nearest_river", "the nearest river")
        risk = site_context.get("risk_level", "unknown")
        inside = site_context.get("inside_buffer", False)

        if "safe" in msg_lower or "build" in msg_lower:
            if inside:
                return (
                    f"Based on my analysis, this site is NOT safe to build on. It is {distance}m from "
                    f"{river}, inside the legally protected 30-metre riparian buffer. Building here violates "
                    f"the Kenya Water Act (2016), Section 25. Risk level: {risk}."
                )
            elif distance and isinstance(distance, (int, float)) and distance < 100:
                return (
                    f"This site is {distance}m from {river}, outside the riparian buffer but still in a "
                    f"moderate risk zone. Building is permissible with standard county approvals, but I "
                    f"recommend elevated foundations and flood-resistant construction. Risk level: {risk}."
                )
            else:
                return (
                    f"This site is {distance}m from {river} and is clear for construction. It is well "
                    f"outside any riparian buffer zone. Standard planning approvals apply. Risk level: {risk}."
                )
        elif "flood" in msg_lower:
            return (
                f"The flood risk at this location ({distance}m from {river}) is classified as "
                f"{site_context.get('flood_zone', 'unknown')}. During the 2024 Mathare floods, areas within "
                f"30m of Nairobi's rivers experienced the most severe damage. {'This site is within that critical zone.' if inside else 'This site is outside the most critical zone.'}"
            )
        elif "legal" in msg_lower or "law" in msg_lower or "regulation" in msg_lower:
            return (
                f"Under the Kenya Water Act (2016), Section 25, a mandatory 30-metre riparian buffer applies "
                f"to all rivers. This site is {distance}m from {river}. "
                f"{'This site IS within the buffer and construction is prohibited without special variance.' if inside else 'This site is outside the buffer — standard regulations apply.'}"
            )

    # General responses (no site context)
    if "safe" in msg_lower or "build" in msg_lower or "risk" in msg_lower:
        return (
            "To assess whether a specific site is safe to build on, please drop a pin on the map. "
            "I'll analyze the exact location against river proximity, riparian buffer regulations, "
            "and flood risk zones to give you a detailed Site Risk Report."
        )
    elif "buffer" in msg_lower or "riparian" in msg_lower:
        return (
            "The Kenya Water Act (2016) establishes a mandatory 30-metre riparian buffer on both sides "
            "of every river. No construction is permitted within this zone without special variance from "
            "the county planning authority. This is the law that Terra AI monitors for compliance."
        )
    elif "flood" in msg_lower:
        return (
            "Nairobi's major rivers — Mathare, Nairobi, Ngong, and Kirichwa Kubwa — all pose flood "
            "risk during heavy rains. The 2024 Mathare floods killed over 70 people, mostly in structures "
            "built within the riparian buffer. Drop a pin on the map to check flood risk at a specific location."
        )
    elif "encroach" in msg_lower:
        return (
            "Terra AI monitors Nairobi's river corridors using satellite imagery change detection. We "
            "currently track encroachments along the Mathare, Nairobi, Ngong, and Kirichwa Kubwa rivers. "
            "Flagged structures are those detected within the 30-metre riparian buffer since our baseline imagery."
        )
    elif "hello" in msg_lower or "hi" in msg_lower:
        return (
            "Welcome to Terra AI Risk Analyst. I can help you assess construction risk for any location "
            "in Nairobi. Drop a pin on the map or ask me about riparian buffer regulations, flood risk zones, "
            "or specific site safety."
        )
    else:
        return (
            "I can help you with site risk assessment, riparian buffer compliance, and flood risk analysis "
            "for locations in Nairobi. Try asking 'Is this site safe to build on?' after dropping a pin "
            "on the map, or ask about Kenya's riparian regulations."
        )
