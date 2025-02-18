import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { CpeAutoComplete } from 'graphQL/Queries'

const Version = ({ disabled, version, onChange }) => {
  const [getCpe, { loading }] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState([])

  const handleChange = (item) => {
    setValue(item)
    onChange('version', item?.value, 5)
  }

  const onBlur = (index, val) => {
    onChange('version', val, index)
  }

  const handleBlur = () => searchInput !== '' && onBlur(5, searchInput)

  const onInputChange = (value) => {
    setSearchInput(value)
    if (value !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'cpe',
            ecosystem: 'cpe',
            search: {
              version: value
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
    if (version) {
      setValue({ label: version, value: version })
    }
  }, [version])

  return (
    <FormControl isRequired isDisabled={disabled}>
      <FormLabel>Version</FormLabel>
      <LynkSelect
        name='version'
        id='cpe_version'
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
        onBlur={handleBlur}
      />
    </FormControl>
  )
}

export default Version
