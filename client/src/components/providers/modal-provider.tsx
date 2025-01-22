import { createContext, useContext, useState, ReactNode } from 'react'
import { TicketDetail } from '../tickets/TicketDetail'

interface ModalContextType {
  showTicketDetail: (ticketId: number) => void
  hideTicketDetail: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null)

  const showTicketDetail = (ticketId: number) => {
    setActiveTicketId(ticketId)
  }

  const hideTicketDetail = () => {
    setActiveTicketId(null)
  }

  return (
    <ModalContext.Provider value={{ showTicketDetail, hideTicketDetail }}>
      {children}
      
      {activeTicketId && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="absolute inset-y-0 right-0 w-full max-w-4xl bg-white shadow-xl">
            <TicketDetail
              ticketId={activeTicketId}
              onClose={hideTicketDetail}
            />
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
} 