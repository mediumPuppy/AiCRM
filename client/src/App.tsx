import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CompanyThemeProvider } from './components/providers/company-theme-provider'
import Dashboard from './dashboard/page'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CompanyThemeProvider>
        <Dashboard />
      </CompanyThemeProvider>
    </QueryClientProvider>
  )
}

export default App
