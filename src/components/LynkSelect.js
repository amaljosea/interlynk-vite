import ReactSelect, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import useQueryParam from 'hooks/useQueryParam'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaChevronDown } from 'react-icons/fa6'
import { MdClose } from 'react-icons/md'

const LynkSelect = (props) => {
  const { style } = useSelect('field')
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  const activeTab = useQueryParam('tab')
  const isGeneral = activeTab === 'general'

  const ClearIndicator = (props) => {
    if (isGeneral) return null

    return (
      <components.ClearIndicator {...props}>
        <MdClose fontSize={16} color={primaryTextColor} cursor='pointer' />
      </components.ClearIndicator>
    )
  }

  const DropdownIndicator = (props) => {
    if (isGeneral) {
      return (
        <components.DropdownIndicator {...props}>
          <FaChevronDown size={12} color='darkgray' cursor='pointer' />
        </components.DropdownIndicator>
      )
    }
    return null
  }

  return props.isCreatable ? (
    <CreatableSelect
      {...props}
      styles={style}
      className='react-select'
      components={{
        ClearIndicator,
        DropdownIndicator,
        IndicatorSeparator: () => null
      }}
    />
  ) : (
    <ReactSelect
      {...props}
      styles={style}
      className='react-select'
      components={{
        ClearIndicator,
        DropdownIndicator,
        IndicatorSeparator: () => null
      }}
    />
  )
}

export default LynkSelect
