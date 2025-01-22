import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../dashboard/Header'
import { Sidebar } from '../dashboard/Sidebar'
import { Button } from '../ui/button'
import { IconMenu2 } from '@tabler/icons-react'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button - only show when sidebar is closed */}
      {!sidebarOpen && (
        <Button
          variant="ghost"
          className="lg:hidden fixed top-4 left-4 z-50"
          onClick={() => setSidebarOpen(true)}
        >
          <IconMenu2 className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar with mobile overlay */}
      <div className={`
        fixed inset-0 z-40 lg:static lg:z-auto
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
