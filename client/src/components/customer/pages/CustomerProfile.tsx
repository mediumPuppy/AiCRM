import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { IconBell, IconMail, IconPhone } from '@tabler/icons-react'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'

export default function CustomerProfile() {
  const { profile, isLoading, updateProfile } = useCustomerProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  })

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile(formData)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-[200px] bg-gray-200 rounded"></div>
          <div className="h-[200px] bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-8">My Profile</h1>

      <div className="space-y-6">
        {/* Personal Information Card */}
        <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Personal Information</h2>
            <div>
              {!isEditing && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      full_name: profile?.full_name || '',
                      email: profile?.email || '',
                      phone: profile?.phone || ''
                    });
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default">
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </form>

        {/* Portal Information */}
        {profile?.portal_enabled && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Portal Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Username</span>
                <span>{profile.portal_username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Login</span>
                <span>{profile.last_portal_login ? new Date(profile.last_portal_login).toLocaleString() : 'Never'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-6">Notifications</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <IconBell className="text-gray-500" />
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications for updates</p>
                </div>
              </div>
              <Switch disabled aria-label="Toggle push notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <IconMail className="text-gray-500" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive email updates for new messages</p>
                </div>
              </div>
              <Switch disabled aria-label="Toggle email notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <IconPhone className="text-gray-500" />
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive SMS alerts for urgent updates</p>
                </div>
              </div>
              <Switch disabled aria-label="Toggle SMS notifications" />
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Account Information</h2>
          <div className="text-sm text-gray-500">
            <p>Account created: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
            <p>Status: {profile?.status}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 