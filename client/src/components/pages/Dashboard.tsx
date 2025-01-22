import { Suspense } from 'react'
import { StatsGrid } from '../dashboard/StatsGrid'
import { RecentActivity } from '../dashboard/RecentActivity'
import { QuickActions } from '../dashboard/QuickActions'
import { TicketTrends, ContactGrowth } from '../dashboard/Charts'

export default function Dashboard() {
  return (
    <>
      <Suspense fallback={<div>Loading stats...</div>}>
        <StatsGrid companyId="1" />
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
    </>
  )
} 