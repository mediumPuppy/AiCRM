import { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatsGrid } from '../dashboard/StatsGrid'
import { RecentActivity } from '../dashboard/RecentActivity'
import { QuickActions } from '../dashboard/QuickActions'
import { TicketTrends, ContactGrowth } from '../dashboard/Charts'
import { OutreachMetrics } from '../dashboard/OutreachMetrics'
import { useCompanyStats } from '../../hooks/useCompanyStats'

export default function Dashboard() {
  const { error } = useCompanyStats("1");
  const navigate = useNavigate();

  if (error) {
    return <div>Error loading dashboard data</div>;
  }

  const handleNewTicket = () => {
    navigate('/tickets?action=create&panel=new');
  };

  const handleStartChat = () => {
    navigate('/chats?action=create&panel=new');
  };

  const handleNewContact = () => {
    navigate('/contacts?action=create&panel=new');
  };

  return (
    <div className="flex flex-col">
      {/* Stats Grid - order-last on mobile, first on desktop */}
      <div className="order-last md:order-first">
        <Suspense fallback={<div>Loading stats...</div>}>
          <StatsGrid companyId="1" />
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Right Side Content */}
        <div className="md:col-span-1 md:col-start-3 space-y-6">
          {/* Quick Actions - first on mobile, top right on desktop */}
          <div className="order-first md:order-none">
            <QuickActions 
              onNewTicket={handleNewTicket}
              onStartChat={handleStartChat}
              onNewContact={handleNewContact}
            />
          </div>
          {/* Recent Activity - second on mobile, below quick actions on desktop */}
          <div className="order-2 md:order-none">
            <RecentActivity />
          </div>
        </div>

        {/* Charts Section - left side on desktop */}
        <div className="order-3 md:col-span-2 md:col-start-1 md:row-start-1 space-y-6">
          <Suspense fallback={<div>Loading charts...</div>}>
            <OutreachMetrics />
            <TicketTrends />
            <ContactGrowth />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 