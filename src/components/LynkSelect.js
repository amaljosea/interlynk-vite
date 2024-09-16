import ReactSelect, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { useSelect } from 'hooks/useSelect'

import { FaTimes } from 'react-icons/fa'

const LynkSelect = (props) => {
  const { style } = useSelect('field')

  const ClearIndicator = (props) => {
    return (
      <components.ClearIndicator {...props}>
        <FaTimes color='gray.800' />
      </components.ClearIndicator>
    )
  }

  return props.isCreatable ? (
    <CreatableSelect
      styles={style}
      className='react-select'
      {...props}
      components={{
        ClearIndicator,
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
    />
  ) : (
    <ReactSelect
      styles={style}
      className='react-select'
      {...props}
      components={{
        ClearIndicator,
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
    />
  )
}

export default LynkSelect
