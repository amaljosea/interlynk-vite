import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Automation from '.'

test('Automation page renders correctly', () => {
  render(<Automation />)
  const textElement = screen.getByText('Automation Rules')
  expect(textElement).toBeInTheDocument()
})
