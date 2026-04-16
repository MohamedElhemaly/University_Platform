import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout({ userType }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#050505] text-white flex panel-grid">
      <Sidebar
        userType={userType}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="relative flex-1 min-w-0 flex flex-col">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-[-160px] h-80 w-80 rounded-full bg-primary-500/5 blur-3xl" />
        </div>
        <Header
          userType={userType}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="relative flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
