import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { isCustomerView } from 'utils'
import { validateCPEString } from 'utils/cpeUtils'
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

  const validation = validateCPEString(identifiers?.cpe)
  const { isValid, error } = validation || ''

  const onChange = (item) => {
    setValue(item)
    setSearchInput('')
    handleChange('identifiers', 'cpe', item?.value || '')
  }

  const onBlur = () => {
    if (searchInput) {
      const result = options?.find(
        (item) => item?.label?.toLowerCase() === searchInput.toLowerCase()
      )
      if (result) {
        setValue(result)
        handleChange('identifiers', 'cpe', result?.value)
      } else {
        alert('No matching option found.')
      }
      setSearchInput('')
    }
  }

  const onInputChange = (input) => {
    const value = input?.trim()
    setSearchInput(value)
    if (value !== '') {
      getCpe({
        variables: {
          input: { idType: 'cpe', ecosystem: 'cpe', search: { idUri: value } }
        }
      }).then((res) => {
        const { result } = res?.data?.idAutoComplete || ''
        if (result?.length > 0) {
          const dataExists = result?.some((item) => item === value)
          const data = result?.map((item) => ({ label: item, value: item }))
          if (dataExists) {
            setOptions(data)
          } else {
            setOptions([{ label: value, value: value }, ...data])
          }
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
      isDisabled={customerView}
      isInvalid={identifiers?.cpe && !isValid}
    >
      <IdentifierLabel
        title={`CPE`}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      />
      <LynkSelect
        id='cpe'
        name='cpe'
        value={value}
        onBlur={onBlur}
        options={options}
        placeholder={''}
        isSearchable={true}
        isLoading={loading}
        onChange={onChange}
        filterOption={null}
        isDisabled={customerView}
        inputValue={searchInput}
        noOptionsMessage={() => null}
        onInputChange={onInputChange}
        isClearable={customerView ? false : true}
      />
      <FormErrorMessage>{error || ''}</FormErrorMessage>
    </FormControl>
  )
}

export default CpeField
