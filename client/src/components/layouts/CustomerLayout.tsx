import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Button } from '../ui/button'
import { IconMenu2 } from '@tabler/icons-react'
import { CustomerSidebar } from '../customer/CustomerSidebar'

export function CustomerLayout() {
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
        <CustomerSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold lg:ml-0 ml-12">Customer Portal</h1>
          <div className="flex items-center gap-4">
            {/* Add user profile/settings buttons here */}
          </div>
        </header>
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
} 