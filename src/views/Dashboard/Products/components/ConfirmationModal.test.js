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

    expect(screen.getByText('Delete Item')).toBeInTheDocument()

    expect(screen.getByText('Sample Name')).toBeInTheDocument()

    expect(
      screen.getByText('This action will delete the item.')
    ).toBeInTheDocument()

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()

    expect(
      screen.getByText('Are you sure you want to proceed?')
    ).toBeInTheDocument()
  })

  it('should call onConfirm when confirming the action', () => {
    renderWithChakra(<ConfirmationModal {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /yes/i }))

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  // it('should call onConfirm when confirming the action', () => {
  //   render(<ConfirmationModal {...defaultProps} />)

  //   const confirmButton = screen.getByRole('button', { name: /yes/i })

  //   fireEvent.click(confirmButton)

  //   expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  // })

  // it('should render the Cancel button and call onClose when clicked', () => {
  //   render(<ConfirmationModal {...defaultProps} />)

  //   const cancelButton = screen.getByRole('button', { name: /cancel/i })

  //   fireEvent.click(cancelButton)

  //   expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  // })

  it('should display a loading state if isLoading is true', () => {
    renderWithChakra(<ConfirmationModal {...defaultProps} isLoading={true} />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    renderWithChakra(<ConfirmationModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument()
  })
})
