import MapContainer from '../components/map/MapContainer'
import LayerControls from '../components/map/LayerControls'
import HUDMetricsBar from '../components/dashboard/HUDMetricsBar'
import AlertFeed from '../components/dashboard/AlertFeed'
import SatelliteTimeline from '../components/dashboard/SatelliteTimeline'

export default function MonitoringDashboard() {
  return (
    <div className="relative w-full h-full scan-lines">
      <MapContainer>
        <LayerControls />
        <HUDMetricsBar />
        <AlertFeed />
        <SatelliteTimeline />
      </MapContainer>
    </div>
  )
}
