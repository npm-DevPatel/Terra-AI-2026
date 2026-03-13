import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import fallbackRiversData from '../../data/rivers.json'
import encroachmentData from '../../data/encroachments.json'
import { fetchNairobiRivers } from '../../services/overpassService'
import { fetchFloodData, generateFloodZones } from '../../services/floodService'
import { generateRiskZones } from '../../services/riskEngine'

const NAIROBI_CENTER = [36.8219, -1.2921]

// ── Tile Sources ──
const PLACE_LABELS_SOURCE = {
  type: 'raster',
  tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png'],
  tileSize: 256,
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
}

// ── Map Styles ──
const MAP_STYLE_CONFIGS = {
  satellite: (sessionToken, apiKey) => {
    const baseSources = {}
    const baseLayers = []

    if (sessionToken && apiKey) {
      baseSources['google-satellite'] = {
        type: 'raster',
        tiles: [`https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${apiKey}`],
        tileSize: 256,
        attribution: '&copy; Google',
      }
      baseLayers.push({
        id: 'google-satellite-layer',
        type: 'raster',
        source: 'google-satellite',
        minzoom: 0,
        maxzoom: 20,
      })
    } else {
      baseSources['esri-world-imagery'] = {
        type: 'raster',
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: '&copy; Esri',
      }
      baseLayers.push({
        id: 'esri-world-imagery-layer',
        type: 'raster',
        source: 'esri-world-imagery',
        minzoom: 0,
        maxzoom: 19,
      })
    }

    return {
      version: 8,
      name: 'Satellite',
      sources: { ...baseSources, 'place-labels': PLACE_LABELS_SOURCE },
      layers: [
        ...baseLayers,
        { id: 'place-labels-layer', type: 'raster', source: 'place-labels', minzoom: 3, maxzoom: 20 },
      ],
    }
  },

  rivers: () => ({
    version: 8,
    name: 'Rivers',
    sources: {
      'carto-light': {
        type: 'raster',
        tiles: ['https://basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      },
      'place-labels': PLACE_LABELS_SOURCE,
    },
    layers: [
      { id: 'carto-light-layer', type: 'raster', source: 'carto-light', minzoom: 0, maxzoom: 20 },
      { id: 'place-labels-layer', type: 'raster', source: 'place-labels', minzoom: 3, maxzoom: 20 },
    ],
  }),

  terrain: () => ({
    version: 8,
    name: 'Terrain',
    sources: {
      'esri-topo': {
        type: 'raster',
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: '&copy; Esri',
      },
    },
    layers: [
      { id: 'esri-topo-layer', type: 'raster', source: 'esri-topo', minzoom: 0, maxzoom: 19 },
    ],
  }),

  dark: () => ({
    version: 8,
    name: 'Dark',
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      },
    },
    layers: [
      { id: 'carto-dark-layer', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 20 },
    ],
  }),
}

async function createGoogleTilesSession(apiKey) {
  const response = await fetch(`https://tile.googleapis.com/v1/createSession?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mapType: 'satellite',
      language: 'en-US',
      region: 'KE',
      scale: 'scaleFactor1x',
    }),
  })
  if (!response.ok) throw new Error(`Google Tiles session request failed (${response.status})`)
  const data = await response.json()
  if (!data.session) throw new Error('Google Tiles session missing in response')
  return data.session
}

// ── Layer Groups ──
const RIVER_LAYER_IDS = ['rivers-glow-outer', 'rivers-glow', 'rivers-glow-mid', 'rivers-core']
const BUFFER_LAYER_IDS = ['riparian-buffers-fill', 'riparian-buffers-line']
const ENCROACHMENT_LAYER_IDS = ['encroachments-glow', 'encroachments-fill', 'encroachments-outline']
const FLOOD_LAYER_IDS = ['flood-zones-bg', 'flood-zones-fill', 'flood-zones-outline']
const RISK_LAYER_IDS = ['risk-zones-fill', 'risk-zones-outline', 'risk-zones-glow']

const ALL_DATA_LAYER_IDS = [
  ...RIVER_LAYER_IDS, ...BUFFER_LAYER_IDS, ...ENCROACHMENT_LAYER_IDS,
  ...FLOOD_LAYER_IDS, ...RISK_LAYER_IDS,
]

const MapContainer = forwardRef(function MapContainer(
  { onMapClick, interactive = true, center, zoom, mapStyle = 'satellite', selectedYear = 2026, layerVisibility = {}, children },
  ref
) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const animationRef = useRef(null)
  const sessionRef = useRef(null)
  const apiKeyRef = useRef(null)
  const dataLoadedRef = useRef(false)
  const currentStyleRef = useRef(mapStyle)
  const riversDataRef = useRef(null)

  // Expose map ref to parent
  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
  }))

  // ── Add Data Layers ──
  const addDataLayers = useCallback((map, riversGeoJSON, floodZonesGeoJSON, riskZonesGeoJSON) => {
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true

    // ── River Network (Glow Layer) ──
    try {
      map.addSource('rivers', { type: 'geojson', data: riversGeoJSON })

      const isLightStyle = ['rivers', 'terrain'].includes(currentStyleRef.current)
      const isRiversMode = currentStyleRef.current === 'rivers'
      const riverColor = isLightStyle ? '#0096C7' : '#00E5FF'
      const streamColor = isLightStyle ? '#48CAE4' : '#00B8D4'

      // Outer glow — wide soft halo
      map.addLayer({
        id: 'rivers-glow-outer', type: 'line', source: 'rivers',
        paint: {
          'line-color': riverColor,
          'line-width': [
            'case',
            ['==', ['get', 'waterway_type'], 'stream'],
            isRiversMode ? 10 : 8,
            isRiversMode ? 22 : 20
          ],
          'line-opacity': isRiversMode ? 0.18 : 0.25,
          'line-blur': isRiversMode ? 6 : 12,
        },
      })

      // Mid glow — tighter halo
      map.addLayer({
        id: 'rivers-glow-mid', type: 'line', source: 'rivers',
        paint: {
          'line-color': riverColor,
          'line-width': [
            'case',
            ['==', ['get', 'waterway_type'], 'stream'],
            isRiversMode ? 5 : 4,
            isRiversMode ? 12 : 10
          ],
          'line-opacity': isRiversMode ? 0.35 : 0.3,
          'line-blur': isRiversMode ? 3 : 6,
        },
      })

      // Inner glow
      map.addLayer({
        id: 'rivers-glow', type: 'line', source: 'rivers',
        paint: {
          'line-color': riverColor,
          'line-width': [
            'case',
            ['==', ['get', 'waterway_type'], 'stream'],
            isRiversMode ? 3 : 2,
            isRiversMode ? 8 : 6
          ],
          'line-opacity': isRiversMode ? 0.55 : 0.45,
          'line-blur': isRiversMode ? 1 : 3,
        },
      })

      // Core — solid bright line on top
      map.addLayer({
        id: 'rivers-core', type: 'line', source: 'rivers',
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'waterway_type'], 'stream'],
            streamColor,
            riverColor
          ],
          'line-width': [
            'case',
            ['==', ['get', 'waterway_type'], 'stream'],
            isRiversMode ? 2 : 1.5,
            isRiversMode ? 5 : 4
          ],
          'line-opacity': 1,
        },
      })
    } catch (err) {
      console.error('[Terra AI] Failed to add river layers:', err)
    }

    // ── Riparian Buffer (30m zone) ──
    try {
      const bufferFeatures = riversGeoJSON.features.flatMap(river => {
        const coordsList = river.geometry.type === 'LineString'
          ? [river.geometry.coordinates]
          : river.geometry.type === 'MultiLineString'
            ? river.geometry.coordinates
            : []

        return coordsList.map(coords => {
          const offset = 0.00027
          const upper = coords.map(c => [c[0], c[1] - offset])
          const lower = [...coords].reverse().map(c => [c[0], c[1] + offset])
          return {
            type: 'Feature',
            properties: { ...river.properties, buffer_width_m: 30 },
            geometry: { type: 'Polygon', coordinates: [[...upper, ...lower, upper[0]]] },
          }
        })
      })

      map.addSource('riparian-buffers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: bufferFeatures },
      })
      map.addLayer({
        id: 'riparian-buffers-fill', type: 'fill', source: 'riparian-buffers',
        paint: { 'fill-color': '#14B8A6', 'fill-opacity': 0.1 },
      })
      map.addLayer({
        id: 'riparian-buffers-line', type: 'line', source: 'riparian-buffers',
        paint: { 'line-color': '#14B8A6', 'line-width': 1.5, 'line-opacity': 0.5, 'line-dasharray': [4, 4] },
      })
    } catch (err) {
      console.error('[Terra AI] Failed to add riparian buffer layer:', err)
    }

    // ── Flood Zones ──
    if (floodZonesGeoJSON && floodZonesGeoJSON.features.length > 0) {
      try {
        map.addSource('flood-zones', { type: 'geojson', data: floodZonesGeoJSON })

        map.addLayer({
          id: 'flood-zones-bg', type: 'fill', source: 'flood-zones',
          filter: ['==', ['get', 'risk_level'], 'BACKGROUND'],
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': ['get', 'opacity'],
          },
        })
        map.addLayer({
          id: 'flood-zones-fill', type: 'fill', source: 'flood-zones',
          filter: ['!=', ['get', 'risk_level'], 'BACKGROUND'],
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': ['get', 'opacity'],
          },
        })
        map.addLayer({
          id: 'flood-zones-outline', type: 'line', source: 'flood-zones',
          filter: ['!=', ['get', 'risk_level'], 'BACKGROUND'],
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 1.5,
            'line-opacity': 0.5,
            'line-dasharray': [6, 3],
          },
        })
      } catch (err) {
        console.error('[Terra AI] Failed to add flood zones layer:', err)
      }
    }

    // ── Risk Zones ──
    if (riskZonesGeoJSON && riskZonesGeoJSON.features.length > 0) {
      try {
        map.addSource('risk-zones', { type: 'geojson', data: riskZonesGeoJSON })

        map.addLayer({
          id: 'risk-zones-glow', type: 'fill', source: 'risk-zones',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.15,
          },
        })
        map.addLayer({
          id: 'risk-zones-fill', type: 'fill', source: 'risk-zones',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.35,
          },
        })
        map.addLayer({
          id: 'risk-zones-outline', type: 'line', source: 'risk-zones',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 4,
            'line-opacity': 0.9,
            'line-dasharray': [2, 2],
          },
        })
      } catch (err) {
        console.error('[Terra AI] Failed to add risk zones layer:', err)
      }
    }

    // ── Encroachment Zones ──
    try {
      map.addSource('encroachments', { type: 'geojson', data: encroachmentData })

      map.addLayer({
        id: 'encroachments-glow', type: 'line', source: 'encroachments',
        paint: { 'line-color': '#FF1744', 'line-width': 8, 'line-opacity': 0.15, 'line-blur': 6 },
      })
      map.addLayer({
        id: 'encroachments-fill', type: 'fill', source: 'encroachments',
        paint: {
          'fill-color': [
            'match', ['get', 'severity'],
            'HIGH', '#EF4444',
            'MEDIUM', '#F97316',
            '#FBBF24',
          ],
          'fill-opacity': 0.4,
        },
      })
      map.addLayer({
        id: 'encroachments-outline', type: 'line', source: 'encroachments',
        paint: { 'line-color': '#FF1744', 'line-width': 2, 'line-opacity': 0.8 },
      })
    } catch (err) {
      console.error('[Terra AI] Failed to add encroachments layer:', err)
    }

    // ── Pulse Animation ──
    let pulsePhase = 0
    function pulseAnimation() {
      pulsePhase += 0.02
      const opacity = 0.25 + Math.sin(pulsePhase) * 0.2
      if (map.getLayer('encroachments-fill')) {
        map.setPaintProperty('encroachments-fill', 'fill-opacity', opacity)
      }
      const glowOpacity = 0.5 + Math.sin(pulsePhase * 0.7) * 0.3
      if (map.getLayer('encroachments-outline')) {
        map.setPaintProperty('encroachments-outline', 'line-opacity', glowOpacity)
      }
      const riverGlow = 0.35 + Math.sin(pulsePhase * 0.3) * 0.1
      if (map.getLayer('rivers-glow')) {
        map.setPaintProperty('rivers-glow', 'line-opacity', riverGlow)
      }
      // Risk zone pulse
      if (map.getLayer('risk-zones-fill')) {
        const riskOpacity = 0.25 + Math.sin(pulsePhase * 0.8) * 0.15
        map.setPaintProperty('risk-zones-fill', 'fill-opacity', riskOpacity)
      }
      if (map.getLayer('risk-zones-outline')) {
        const outlineOpacity = 0.6 + Math.sin(pulsePhase * 0.8) * 0.4
        map.setPaintProperty('risk-zones-outline', 'line-opacity', outlineOpacity)
      }
      animationRef.current = requestAnimationFrame(pulseAnimation)
    }
    pulseAnimation()

    // ── Hover & Click ──
    map.on('mouseenter', 'rivers-core', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'rivers-core', () => { map.getCanvas().style.cursor = '' })

    // River click popup
    map.on('click', 'rivers-core', (e) => {
      if (!e.features?.length) return
      const f = e.features[0]
      new maplibregl.Popup({ offset: 10, className: 'terra-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="min-width:180px">
            <div style="font-weight:600;margin-bottom:4px;color:#00E5FF">${f.properties.name || 'River'}</div>
            <div style="font-size:11px;color:#94A3B8">
              Type: ${f.properties.waterway_type || 'river'}<br/>
              Risk: <span style="color:${f.properties.risk_level === 'HIGH' ? '#EF4444' : f.properties.risk_level === 'MEDIUM' ? '#F97316' : '#22D3EE'}">${f.properties.risk_level}</span>
            </div>
          </div>
        `)
        .addTo(map)
    })

    // Encroachment click popup
    map.on('click', 'encroachments-fill', (e) => {
      if (!e.features?.length) return
      const f = e.features[0]
      new maplibregl.Popup({ offset: 10, className: 'terra-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="min-width:200px">
            <div style="font-size:11px;color:#94A3B8;margin-bottom:4px">${f.properties.id}</div>
            <div style="font-weight:600;margin-bottom:6px;color:#F1F5F9">${f.properties.description}</div>
            <div style="display:flex;gap:12px;font-size:12px;color:#94A3B8">
              <span>🏞 ${f.properties.river_name}</span>
              <span>📏 ${f.properties.distance_from_river_m}m</span>
            </div>
            <div style="margin-top:6px;padding:4px 8px;background:rgba(239,68,68,0.15);border-radius:4px;font-size:11px;color:#EF4444;font-weight:600;display:inline-block">
              ${f.properties.severity} RISK
            </div>
          </div>
        `)
        .addTo(map)
    })

    // Flood zone hover
    map.on('mouseenter', 'flood-zones-fill', () => { map.getCanvas().style.cursor = 'crosshair' })
    map.on('mouseleave', 'flood-zones-fill', () => { map.getCanvas().style.cursor = '' })

    map.on('click', 'flood-zones-fill', (e) => {
      if (!e.features?.length) return
      const f = e.features[0]
      new maplibregl.Popup({ offset: 10, className: 'terra-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="min-width:180px">
            <div style="font-weight:600;margin-bottom:4px;color:#38BDF8">Flood Risk Zone</div>
            <div style="font-size:11px;color:#94A3B8">
              River: ${f.properties.river_name}<br/>
              Depth: <span style="font-weight:600;color:${f.properties.color}">${f.properties.flood_depth}</span><br/>
              Risk: <span style="font-weight:600;color:${f.properties.color}">${f.properties.risk_level}</span><br/>
              Discharge: ${f.properties.discharge} m³/s
            </div>
          </div>
        `)
        .addTo(map)
    })

    // Risk zone click
    map.on('click', 'risk-zones-fill', (e) => {
      if (!e.features?.length) return
      const f = e.features[0]
      new maplibregl.Popup({ offset: 10, className: 'terra-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="min-width:200px">
            <div style="font-weight:600;margin-bottom:4px;color:${f.properties.color}">⚠ ${f.properties.risk_level} Risk Zone</div>
            <div style="font-size:11px;color:#94A3B8">
              Score: <span style="font-weight:700;color:${f.properties.color}">${f.properties.risk_score}/100</span><br/>
              ${f.properties.description}
            </div>
          </div>
        `)
        .addTo(map)
    })

    // ── General map click ──
    if (interactive && onMapClick) {
      map.on('click', (e) => {
        const hitLayers = ['encroachments-fill', 'flood-zones-fill', 'risk-zones-fill', 'rivers-core']
        for (const layer of hitLayers) {
          if (map.getLayer(layer)) {
            const features = map.queryRenderedFeatures(e.point, { layers: [layer] })
            if (features.length > 0) return
          }
        }
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng }, map)
      })
    }
  }, [interactive, onMapClick])

  // ── Initialize Map ──
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return

    let isCancelled = false

    const initMap = async () => {
      const apiKey = import.meta.env.GOOGLE_EARTH_API_KEY || import.meta.env.VITE_GOOGLE_EARTH_API_KEY
      apiKeyRef.current = apiKey

      // Get Google session token for satellite
      let sessionToken = null
      if (apiKey) {
        try {
          sessionToken = await createGoogleTilesSession(apiKey)
          sessionRef.current = sessionToken
        } catch (error) {
          console.warn('Google satellite tiles unavailable, using fallback:', error)
        }
      }

      if (isCancelled) return

      // Build initial style
      const styleBuilder = MAP_STYLE_CONFIGS[mapStyle] || MAP_STYLE_CONFIGS.satellite
      const style = mapStyle === 'satellite'
        ? styleBuilder(sessionToken, apiKey)
        : styleBuilder()

      currentStyleRef.current = mapStyle

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style,
        center: center || NAIROBI_CENTER,
        zoom: zoom || 13,
        pitch: 40,
        bearing: -15,
        antialias: true,
      })

      mapRef.current = map
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

      map.on('load', async () => {
        // Fetch real river data (with fallback to mock)
        let riversGeoJSON = fallbackRiversData
        try {
          const realRivers = await fetchNairobiRivers()
          if (realRivers && realRivers.features.length > 0) {
            riversGeoJSON = realRivers
            console.log('[Terra AI] Using REAL river data from OpenStreetMap')
          } else {
            console.log('[Terra AI] Using fallback mock river data')
          }
        } catch {
          console.log('[Terra AI] Using fallback mock river data')
        }
        riversDataRef.current = riversGeoJSON

        // Fetch real flood data
        let floodZonesGeoJSON = { type: 'FeatureCollection', features: [] }
        let floodData = []
        try {
          floodData = await fetchFloodData()
          if (floodData.length > 0) {
            floodZonesGeoJSON = generateFloodZones(riversGeoJSON, floodData)
            console.log('[Terra AI] Generated %d flood zone features from real GloFAS data', floodZonesGeoJSON.features.length)
          }
        } catch (error) {
          console.warn('[Terra AI] Flood data fetch failed:', error)
        }

        // Generate risk zones
        let riskZonesGeoJSON = { type: 'FeatureCollection', features: [] }
        try {
          riskZonesGeoJSON = generateRiskZones(encroachmentData, riversGeoJSON, floodData)
          console.log('[Terra AI] Generated %d risk zone features', riskZonesGeoJSON.features.length)
        } catch (error) {
          console.warn('[Terra AI] Risk zone generation failed:', error)
        }

        if (!isCancelled) {
          addDataLayers(map, riversGeoJSON, floodZonesGeoJSON, riskZonesGeoJSON)
          setMapLoaded(true)
        }
      })
    }

    initMap()

    return () => {
      isCancelled = true
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (mapRef.current) mapRef.current.remove()
      mapRef.current = null
      dataLoadedRef.current = false
    }
  }, [center, zoom]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Style switching ──
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded || mapStyle === currentStyleRef.current) return

    currentStyleRef.current = mapStyle

    const styleBuilder = MAP_STYLE_CONFIGS[mapStyle] || MAP_STYLE_CONFIGS.satellite
    const newStyle = mapStyle === 'satellite'
      ? styleBuilder(sessionRef.current, apiKeyRef.current)
      : styleBuilder()

    // Save current data sources and layers state
    dataLoadedRef.current = false

    map.setStyle(newStyle)

    map.once('style.load', async () => {
      // Re-add data layers after style change
      const riversGeoJSON = riversDataRef.current || fallbackRiversData

      let floodZonesGeoJSON = { type: 'FeatureCollection', features: [] }
      let floodData = []
      try {
        floodData = await fetchFloodData()
        if (floodData.length > 0) {
          floodZonesGeoJSON = generateFloodZones(riversGeoJSON, floodData)
        }
      } catch { /* ignore */ }

      let riskZonesGeoJSON = { type: 'FeatureCollection', features: [] }
      try {
        riskZonesGeoJSON = generateRiskZones(encroachmentData, riversGeoJSON, floodData)
      } catch { /* ignore */ }

      addDataLayers(map, riversGeoJSON, floodZonesGeoJSON, riskZonesGeoJSON)
    })
  }, [mapStyle, mapLoaded, addDataLayers])

  // ── Layer Visibility ──
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const layerGroups = {
      rivers: RIVER_LAYER_IDS,
      buffers: BUFFER_LAYER_IDS,
      encroachments: ENCROACHMENT_LAYER_IDS,
      floodZones: FLOOD_LAYER_IDS,
      riskZones: RISK_LAYER_IDS,
    }

    for (const [groupKey, layerIds] of Object.entries(layerGroups)) {
      const isVisible = layerVisibility[groupKey] !== false // default to visible
      for (const layerId of layerIds) {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none')
        }
      }
    }
  }, [layerVisibility, mapLoaded])

  // ── Timeline filtering ──
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const source = map.getSource('encroachments')
    if (!source) return

    // Filter encroachments to show only those detected up to the selected year
    const filteredFeatures = encroachmentData.features.filter(f => {
      const year = new Date(f.properties.detected_date).getFullYear()
      return year <= selectedYear
    })

    source.setData({
      type: 'FeatureCollection',
      features: filteredFeatures,
    })
  }, [selectedYear, mapLoaded])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="absolute inset-0" />
      {mapLoaded && children}
    </div>
  )
})

export default MapContainer
