import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'

import LynkModal from './LynkModal'

const renderModal = (props) => {
  render(
    <ChakraProvider>
      <LynkModal {...props} />
    </ChakraProvider>
  )
}

describe('LynkModal', () => {
  const onCloseMock = jest.fn()
  const onSubmitMock = jest.fn()

  beforeEach(() => {
    onCloseMock.mockClear()
    onSubmitMock.mockClear()
  })

  test('renders modal with title and children', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Modal',
      children: <div>Modal Content</div>
    })

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  test('calls onClose when cancel button is clicked', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Modal'
    })

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  test('calls onSubmit when submit button is clicked', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Modal',
      buttonText: 'Submit'
    })

    const submitButton = screen.getByText('Submit')
    fireEvent.click(submitButton)

    expect(onSubmitMock).toHaveBeenCalledTimes(1)
  })

  test('disables submit button when disabled prop is true', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Modal',
      disabled: true,
      buttonText: 'Submit'
    })

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    expect(submitButton).toBeDisabled()
  })

  test('hides footer when noFooter prop is true', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Modal',
      noFooter: true
    })

    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Submit' })
    ).not.toBeInTheDocument()
  })

  test('renders correct button text for confirmation modal', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Delete Item',
      type: 'confirmation',
      buttonText: 'Delete'
    })

    const submitButton = screen.getByRole('button', { name: 'Yes' })
    expect(submitButton).toBeInTheDocument()
  })

  test('renders correct button text', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Item',
      buttonText: 'Test name'
    })

    const submitButton = screen.getByRole('button', { name: 'Test name' })
    expect(submitButton).toBeInTheDocument()
  })

  test('displays custom icon when Icon prop is provided', () => {
    const CustomIcon = () => <svg data-testid='custom-icon'></svg>

    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Modal',
      Icon: CustomIcon
    })

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  test('renders leftFooterContent and rightFooterContent if provided', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Modal',
      leftFooterContent: <div>Left Footer Content</div>,
      rightFooterContent: <div>Right Footer Content</div>
    })

    expect(screen.getByText('Left Footer Content')).toBeInTheDocument()
    expect(screen.getByText('Right Footer Content')).toBeInTheDocument()
  })

  test('hides cancel button when hideCancelButton is true', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Modal',
      hideCancelButton: true
    })

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toHaveAttribute('hidden')
  })

  test('hides submit button when hidden is true', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Test Modal',
      hidden: true
    })

    const submitButton = screen.queryByRole('button', { name: /submit/i })
    expect(submitButton).not.toBeInTheDocument()
  })

  test('modal has proper aria attributes for accessibility', () => {
    renderModal({
      isOpen: true,
      onClose: onCloseMock,
      onSubmit: onSubmitMock,
      title: 'Accessible Modal',
      buttonText: 'Submit'
    })

    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby')
    expect(modal).toHaveAttribute('aria-describedby')
  })
})
