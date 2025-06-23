import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { useDebounce } from 'hooks/useDebounce'

import { CpeAutoComplete } from 'graphQL/Queries'

const Vendor = ({ disabled, vendor, onChange, isValid }) => {
  const [getCpe, { loading }] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState([])
  const debouncedInput = useDebounce(searchInput, 300)

  const handleChange = (item) => {
    setValue(item)
    onChange('vendor', item?.value, 3)
  }

  const onBlur = (index, val) => {
    onChange('vendor', val, index)
  }

  const handleBlur = () => searchInput !== '' && onBlur(3, searchInput)

  const onInputChange = (value) => {
    setSearchInput(value)
  }

  useEffect(() => {
    if (debouncedInput !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'cpe',
            ecosystem: 'cpe',
            search: {
              vendor: debouncedInput
            }
          }
        }
      }).then((res) => {
        const { result } = res.data.idAutoComplete || ''
        setOptions(
          result?.length > 0
            ? result.map((item) => ({ label: item, value: item }))
            : [{ label: debouncedInput, value: debouncedInput }]
        )
      })
    } else {
      setOptions([])
    }
  }, [debouncedInput, getCpe])

  useEffect(() => {
    if (vendor) {
      setValue({ label: vendor, value: vendor })
    }
  }, [vendor])

  return (
    <FormControl isRequired isDisabled={disabled} isInvalid={!isValid}>
      <FormLabel>Vendor</FormLabel>
      <LynkSelect
        name='vendor'
        value={value}
        id='cpe_vendor'
        options={options}
        isClearable={true}
        isSearchable={true}
        isLoading={loading}
        onBlur={handleBlur}
        isDisabled={disabled}
        onChange={handleChange}
        inputValue={searchInput}
        noOptionsMessage={() => null}
        onInputChange={onInputChange}
        placeholder='Enter vendor name'
      />
      {!isValid && <FormErrorMessage>Invalid vendor format</FormErrorMessage>}
    </FormControl>
  )
}

export default Vendor
