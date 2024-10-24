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

jest.mock('react-router-dom', () => ({
  useLocation: () => '',
  useParams: () => ''
}))

jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useTheme: () => ({
    colors: {
      // eslint-disable-next-line
      headingTextColor: { light: '#000', dark: '#fff' }
    }
  }),
  useColorModeValue: (light, dark) => light
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
