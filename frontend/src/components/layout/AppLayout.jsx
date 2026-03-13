import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  return (
    <div className="h-screen w-screen bg-bg-base text-text-primary">
      <Sidebar />
      <div className="flex flex-col h-screen ml-[72px]">
        <TopBar />
        <main className="flex-1 relative overflow-hidden bg-bg-base mt-14">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
