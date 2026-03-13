import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import SiteRiskAnalyzer from './pages/SiteRiskAnalyzer'
import DataInsights from './pages/DataInsights'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<SiteRiskAnalyzer />} />
        <Route path="/site-risk" element={<SiteRiskAnalyzer />} />
        <Route path="/insights" element={<DataInsights />} />
      </Route>
    </Routes>
  )
}

export default App
