import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import MonitoringDashboard from './pages/MonitoringDashboard'
import SiteRiskAnalyzer from './pages/SiteRiskAnalyzer'
import EncroachmentIntelligence from './pages/EncroachmentIntelligence'
import DataInsights from './pages/DataInsights'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<MonitoringDashboard />} />
        <Route path="/site-risk" element={<SiteRiskAnalyzer />} />
        <Route path="/encroachment" element={<EncroachmentIntelligence />} />
        <Route path="/insights" element={<DataInsights />} />
      </Route>
    </Routes>
  )
}

export default App
