import { MockedProvider } from '@apollo/client/testing'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import Automation from '.'

jest.mock('hooks/useGlobalState', () => ({
  useGlobalState: () => ({
    totalRows: 0,
    prodRulesState: {},
    dispatch: {}
  })
}))

test('Automation page renders correctly', () => {
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Automation />
    </MockedProvider>
  )
  const textElement = screen.getByText('RULE')
  expect(textElement).toBeInTheDocument()
})
