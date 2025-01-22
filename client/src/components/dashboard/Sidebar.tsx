import { Link } from 'react-router-dom'
import { IconDashboard, IconX } from '@tabler/icons-react'

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="w-64 h-full bg-card border-r p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Menu</h2>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-accent rounded-md"
        >
          <IconX size={20} />
        </button>
      </div>
      
      <nav className="space-y-2">
        <Link 
          to="/dashboard"
          className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent"
        >
          <IconDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link to="/tickets" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
          Tickets
        </Link>

        <Link to="/contacts" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
          Contacts
        </Link>

        <Link to="/chats" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
          Chat Sessions
        </Link>
      </nav>
    </div>
  )
} 