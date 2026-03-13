import { useState } from 'react'
import MapContainer from '../components/map/MapContainer'
import LayerControls from '../components/map/LayerControls'
import HUDMetricsBar from '../components/dashboard/HUDMetricsBar'
import AlertFeed from '../components/dashboard/AlertFeed'
import SatelliteTimeline from '../components/dashboard/SatelliteTimeline'
import MapStyleSwitcher from '../components/map/MapStyleSwitcher'

export default function MonitoringDashboard() {
  const [mapStyle, setMapStyle] = useState('satellite')
  const [selectedYear, setSelectedYear] = useState(2026)
  const [layerVisibility, setLayerVisibility] = useState({})

  return (
    <div className="relative w-full h-full scan-lines">
      {/* Visual map layer style options */}
      <MapStyleSwitcher activeStyle={mapStyle} onStyleChange={setMapStyle} />

      <MapContainer
        center={[36.8219, -1.2921]}
        zoom={13}
        mapStyle={mapStyle}
        selectedYear={selectedYear}
        layerVisibility={layerVisibility}
      >
        <LayerControls onLayerToggle={setLayerVisibility} />
        <HUDMetricsBar />
        <AlertFeed />
        <SatelliteTimeline selectedYear={selectedYear} onYearChange={setSelectedYear} />
      </MapContainer>
    </div>
  )
}
