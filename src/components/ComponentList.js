import { TabContext } from 'context/TabContext'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import AsyncSelect from 'react-select/async'

import { useLazyDropDown } from 'hooks/useLazyDropDown'
import { useSelect } from 'hooks/useSelect'

import { GetAllComponents } from 'graphQL/Queries'

import CustomDropdownIndicator from './Misc/CustomDropdownIndicator'

const ComponentList = ({ id, value, setValue }) => {
  const params = useParams()

  const { tab, handleChange, tabData } = useContext(TabContext)
  const { style } = useSelect('lynkSelect')
  const { relationships } = tabData

  const compState = {
    projectId: params?.productid,
    sbomId: params?.sbomid,
    field: 'COMPONENTS_UPDATED_AT',
    direction: 'DESC'
  }

  const { lazyDropDownProps } = useLazyDropDown(GetAllComponents, {
    skip: tab === 'relationships' ? false : true,
    selector: 'sbom.components',
    variables: {
      ...compState,
      first: 5,
      orderBy: {
        direction: relationships?.relType === 'dependency_of' ? 'DESC' : 'ASC',
        field: 'COMPONENTS_NAME'
      }
    },
    onChange: (item) => {
      setValue(item)
      handleChange('relationships', 'to', item?.id ?? '')
    },
    optionLabel: (item) => `${item.name} - ${item.version}`,
    optionValue: 'id',
    selectedItem: value?.id,
    components: {
      IndicatorSeparator: () => null,
      DropdownIndicator: CustomDropdownIndicator
    }
  })

  return (
    <AsyncSelect
      {...{
        ...lazyDropDownProps,
        value,
        styles: style,
        id,
        isDisabled: lazyDropDownProps.isLoading,
        placeholder: ' --Select Component-- '
      }}
    />
  )
}

export default ComponentList
