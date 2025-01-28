import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OutreachModal } from './OutreachModal'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

describe('OutreachModal', () => {
  const mockProps = {
    contactId: 1,
    open: true,
    onClose: jest.fn(),
    onSaveNote: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly when open', () => {
    render(<OutreachModal {...mockProps} />)
    
    expect(screen.getByText('Generate Outreach Message')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Write a welcome email/)).toBeInTheDocument()
    expect(screen.getByText('Generate Draft')).toBeInTheDocument()
  })

  it('handles message generation', async () => {
    const mockDraft = 'Generated message content'
    mockAxios.post.mockResolvedValueOnce({ data: { draft: mockDraft } })

    render(<OutreachModal {...mockProps} />)
    
    const input = screen.getByPlaceholderText(/Write a welcome email/)
    fireEvent.change(input, { target: { value: 'Test instruction' } })
    
    const generateButton = screen.getByText('Generate Draft')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(mockDraft)).toBeInTheDocument()
      expect(screen.getByText('Regenerate')).toBeInTheDocument()
    })

    expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/outreach-gpt', {
      contactId: mockProps.contactId,
      instruction: 'Test instruction'
    })
  })

  it('handles save as note', async () => {
    const mockDraft = 'Generated message content'
    mockAxios.post.mockResolvedValueOnce({ data: { draft: mockDraft } })

    render(<OutreachModal {...mockProps} />)
    
    // Generate a message first
    const input = screen.getByPlaceholderText(/Write a welcome email/)
    fireEvent.change(input, { target: { value: 'Test instruction' } })
    
    const generateButton = screen.getByText('Generate Draft')
    fireEvent.click(generateButton)

    await waitFor(() => {
      const saveButton = screen.getByText('Save as Note')
      fireEvent.click(saveButton)
    })

    expect(mockProps.onSaveNote).toHaveBeenCalledWith(
      mockDraft,
      expect.any(Object)
    )
  })

  it('handles errors during generation', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('API Error'))

    render(<OutreachModal {...mockProps} />)
    
    const input = screen.getByPlaceholderText(/Write a welcome email/)
    fireEvent.change(input, { target: { value: 'Test instruction' } })
    
    const generateButton = screen.getByText('Generate Draft')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Failed to generate message. Please try again.')).toBeInTheDocument()
    })
  })

  it('closes and resets state when closed', () => {
    render(<OutreachModal {...mockProps} />)
    
    const input = screen.getByPlaceholderText(/Write a welcome email/)
    fireEvent.change(input, { target: { value: 'Test instruction' } })
    
    // Close the modal
    mockProps.onClose()

    // Reopen the modal
    render(<OutreachModal {...mockProps} />)
    
    // Input should be empty
    expect(input.value).toBe('')
  })
}) 