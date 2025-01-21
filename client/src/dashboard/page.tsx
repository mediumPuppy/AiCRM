import { Suspense } from 'react'
import { Header } from '../components/dashboard/Header'
import { Sidebar } from '../components/dashboard/Sidebar'
import { StatsGrid } from '../components/dashboard/StatsGrid'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { QuickActions } from '../components/dashboard/QuickActions'
import { TicketTrends, ContactGrowth } from '../components/dashboard/Charts'

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Suspense fallback={<div>Loading stats...</div>}>
            <StatsGrid />
          </Suspense>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 space-y-6">
              <Suspense fallback={<div>Loading charts...</div>}>
                <TicketTrends />
                <ContactGrowth />
              </Suspense>
            </div>
            
            <div className="space-y-6">
              <QuickActions />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 