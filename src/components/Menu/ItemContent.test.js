import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import React from 'react'

import { ItemContent } from './ItemContent'

jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useTheme: () => ({
    colors: {
      // eslint-disable-next-line
      inverseSecondaryBgColor: { light: '#f0f0f0', dark: '#1a1a1a' }
    }
  }),
  useColorModeValue: (light, dark) => light
}))

describe('ItemContent component', () => {
  it('renders time correctly', () => {
    const props = {
      aName: 'John Doe',
      aSrc: '/path/to/avatar.jpg',
      boldInfo: 'Bold Info',
      info: 'Info',
      time: '12:00 PM'
    }

    const { getByText } = render(<ItemContent {...props} />)

    expect(getByText('12:00 PM')).toBeInTheDocument()
  })
})
