import { Link, useNavigate } from 'react-router-dom'
import { IconMessage, IconX, IconUser, IconLogout } from '@tabler/icons-react'
import { useAuth } from '../../contexts/AuthContext'

interface CustomerSidebarProps {
  onClose?: () => void;
}

export function CustomerSidebar({ onClose }: CustomerSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/client/login');
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
          to="/customer/chat/sessions"
          className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent"
        >
          <IconMessage size={20} />
          <span>Chat Sessions</span>
        </Link>

        <Link 
          to="/customer/profile"
          className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent"
        >
          <IconUser size={20} />
          <span>My Profile</span>
        </Link>
      </nav>

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