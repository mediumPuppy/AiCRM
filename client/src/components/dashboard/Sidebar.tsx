export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card">
      <nav className="p-4 space-y-2">
        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
          Menu
        </div>
        
        <a href="/dashboard" className="flex items-center px-3 py-2 text-sm rounded-md bg-accent">
          Dashboard
        </a>

        <a href="/tickets" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
          Tickets
        </a>

        <a href="/contacts" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
          Contacts
        </a>

        <a href="/chats" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
          Chat Sessions
        </a>
      </nav>
    </aside>
  )
} 