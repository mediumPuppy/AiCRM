import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { useCompanyBranding } from "@/hooks/useCompanyBranding"

export function QuickActions() {
  const { branding } = useCompanyBranding()
  
  return (
    <Card className="relative">
      <CardHeader>
        <h2 className="text-lg font-semibold">Quick Actions</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          style={{
            borderRadius: branding?.button_style === 'pill' ? '9999px' : branding?.border_radius
          }}
        >
          New Ticket
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          style={{
            borderRadius: branding?.button_style === 'pill' ? '9999px' : branding?.border_radius
          }}
        >
          Start Chat
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          style={{
            borderRadius: branding?.button_style === 'pill' ? '9999px' : branding?.border_radius
          }}
        >
          Add Contact
        </Button>
      </CardContent>
    </Card>
  )
} 