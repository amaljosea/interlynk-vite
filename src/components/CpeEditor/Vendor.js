import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { CpeAutoComplete } from 'graphQL/Queries'

const Vendor = ({ disabled, vendor, onChange, onBlur }) => {
  const [getCpe, { loading }] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState([])

  const handleChange = (item) => {
    setValue(item)
    onChange('vendor', item?.value)
    onBlur(3, item?.value)
  }

  const onInputChange = (value) => {
    setSearchInput(value)
    if (value !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'cpe',
            ecosystem: 'cpe',
            search: {
              vendor: value
            }
          }
        }
      }).then((res) => {
        const { result } = res.data.idAutoComplete || ''
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
    if (vendor) {
      setValue({ label: vendor, value: vendor })
    }
  }, [vendor])

  return (
    <FormControl isRequired isDisabled={disabled}>
      <FormLabel>Vendor</FormLabel>
      <LynkSelect
        name='vendor'
        id='cpe_vendor'
        placeholder={''}
        isClearable={true}
        isSearchable={true}
        isLoading={loading}
        value={value}
        onChange={handleChange}
        inputValue={searchInput}
        options={options}
        isDisabled={disabled}
        noOptionsMessage={() => null}
        onInputChange={onInputChange}
      />
    </FormControl>
  )
}

export default Vendor
