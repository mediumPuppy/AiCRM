export function RecentActivity() {
  return (
    <div className="bg-card rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {/* Will populate with ticket updates and chat sessions */}
        <div className="text-sm text-muted-foreground">
          Loading activities...
        </div>
      </div>
    </div>
  )
} 