import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import React from 'react'

import { ItemContent } from './ItemContent'

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
