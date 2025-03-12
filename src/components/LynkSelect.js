import ReactSelect, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import CustomDropdownIndicator from 'components/Misc/CustomDropdownIndicator'

import useQueryParam from 'hooks/useQueryParam'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

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

  const shouldShowDropdown = props.isMulti
    ? props.dropDown && Array.isArray(props.value) && props.value.length === 0
    : props.dropDown

  return props.isCreatable ? (
    <CreatableSelect
      {...props}
      styles={style}
      className='react-select'
      components={{
        ClearIndicator,
        DropdownIndicator: shouldShowDropdown
          ? CustomDropdownIndicator
          : () => null,
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
        DropdownIndicator: shouldShowDropdown
          ? CustomDropdownIndicator
          : () => null,
        IndicatorSeparator: () => null,
        ...(props.components || {})
      }}
    />
  )
}

export default LynkSelect
