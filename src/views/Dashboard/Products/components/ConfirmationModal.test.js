import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { ChakraProvider } from '@chakra-ui/react'

import ConfirmationModal from './ConfirmationModal'

const renderWithChakra = (ui) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>)
}

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    name: 'Sample Name',
    title: 'Delete Item',
    description: 'This action will delete the item.',
    items: ['Item 1', 'Item 2', 'Item 3'],
    isLoading: false
  }

  it('should render the modal with correct title, name, description, and items', () => {
    renderWithChakra(<ConfirmationModal {...defaultProps} />)

    // Check if title is rendered correctly
    expect(screen.getByText('Delete Item')).toBeInTheDocument()

    // Check if name is rendered as a Tag
    expect(screen.getByText('Sample Name')).toBeInTheDocument()

    // Check if description is rendered
    expect(
      screen.getByText('This action will delete the item.')
    ).toBeInTheDocument()

    // Check if items are rendered
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()

    // Check if confirmation message is rendered
    expect(
      screen.getByText('Are you sure you want to proceed?')
    ).toBeInTheDocument()
  })

  it('should call onConfirm when confirming the action', () => {
    renderWithChakra(<ConfirmationModal {...defaultProps} />)

    // Simulate confirm button click (assuming the confirm button is within the LynkModal)
    fireEvent.click(screen.getByRole('button', { name: /yes/i }))

    // Check if onConfirm handler is called
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onConfirm when confirming the action', () => {
    // Render the ConfirmationModal with props
    render(<ConfirmationModal {...defaultProps} />)

    // Find the submit button (this should match the buttonLabel in LynkModal)
    const confirmButton = screen.getByRole('button', { name: /yes/i })

    // Simulate a click event on the submit button
    fireEvent.click(confirmButton)

    // Check if onConfirm handler is called
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should render the Cancel button and call onClose when clicked', () => {
    render(<ConfirmationModal {...defaultProps} />)

    // Find the Cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    // Simulate a click event on the cancel button
    fireEvent.click(cancelButton)

    // Check if onClose handler is called
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should display a loading state if isLoading is true', () => {
    renderWithChakra(<ConfirmationModal {...defaultProps} isLoading={true} />)

    // Check for loading spinner or state (modify based on how loading is displayed)
    expect(screen.getByText(/loading/i)).toBeInTheDocument() // Example of loading text, adjust as necessary
  })

  it('should not render modal when isOpen is false', () => {
    renderWithChakra(<ConfirmationModal {...defaultProps} isOpen={false} />)

    // Check that the modal is not visible
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument()
  })
})
