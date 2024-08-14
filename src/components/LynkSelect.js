import ReactSelect from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { useSelect } from 'hooks/useSelect'

const LynkSelect = (props) => {
  const { style } = useSelect('field')

  return props.isCreatable ? (
    <CreatableSelect
      styles={style}
      className='react-select'
      {...props}
      components={{
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
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
    />
  )
}

export default LynkSelect
