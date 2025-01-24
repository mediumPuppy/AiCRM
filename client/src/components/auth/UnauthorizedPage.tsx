import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else {
      navigate(isAdmin ? '/dashboard' : '/customer/chat/sessions');
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-4 space-y-8 p-8 bg-white rounded-lg shadow-lg border border-border">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleClick}
            className="w-full max-w-xs"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}; 