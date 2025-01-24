import { Link, useNavigate } from 'react-router-dom'
import { IconDashboard, IconX, IconLogout } from '@tabler/icons-react'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="w-64 h-full bg-card border-r p-4 flex flex-col">
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

        <Link to="/articles" className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
          <span>Articles</span>
        </Link>
      </nav>

      {/* Sign Out Button - Added at bottom */}
      <div className="mt-auto pt-4 border-t">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-3 py-2 w-full text-left rounded-md hover:bg-accent text-destructive"
        >
          <IconLogout size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
} 