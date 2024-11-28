import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { isCustomerView, validateCpe } from 'utils'
import IdentifierLabel from 'views/Dashboard/Products/components/IdentifierLabel'

import { FormControl, FormErrorMessage } from '@chakra-ui/react'

import { CpeAutoComplete } from 'graphQL/Queries'

import LynkSelect from './LynkSelect'

const CpeField = ({ isOpen, onOpen, onClose }) => {
  const customerView = isCustomerView()
  const { tabData, handleChange } = useContext(TabContext)
  const { identifiers } = tabData || ''

  const [getCpe, { loading }] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState([])

  const onChange = (item) => {
    setValue(item)
    if (item?.value) {
      handleChange('identifiers', 'cpe', item?.value)
      const matches = validateCpe(item?.value)
      handleChange('identifiers', 'cpeError', matches ? '' : 'Invalid CPE')
    } else {
      handleChange('identifiers', 'cpe', '')
    }
  }

  const onInputChange = (value) => {
    setSearchInput(value)
    if (value !== '') {
      getCpe({
        variables: {
          input: { idType: 'cpe', ecosystem: 'cpe', search: { idUri: value } }
        }
      }).then((res) => {
        const { result } = res?.data?.idAutoComplete || ''
        if (result?.length > 0) {
          setOptions(() =>
            result?.map((item) => ({ label: item, value: item }))
          )
        } else {
          setOptions([{ label: value, value: value }])
        }
      })
    } else {
      setOptions([])
    }
  }

  useEffect(() => {
    if (identifiers?.cpe) {
      setValue({ label: identifiers?.cpe, value: identifiers?.cpe })
    }
  }, [identifiers?.cpe])

  return (
    <FormControl
      isReadOnly={customerView}
      isInvalid={value && identifiers?.cpeError !== ''}
    >
      <IdentifierLabel
        title={`CPE`}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      />
      <LynkSelect
        name='cpe'
        id='cpe'
        placeholder={''}
        isClearable={true}
        isSearchable={true}
        isLoading={loading}
        value={value}
        onChange={onChange}
        inputValue={searchInput}
        options={options}
        filterOption={null}
        noOptionsMessage={() => null}
        onInputChange={onInputChange}
      />
      <FormErrorMessage>This CPE format is not valid</FormErrorMessage>
    </FormControl>
  )
}

export default CpeField
