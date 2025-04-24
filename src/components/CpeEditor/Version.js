import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { useDebounce } from 'hooks/useDebounce'

import { CpeAutoComplete } from 'graphQL/Queries'

const Version = ({ disabled, version, onChange, product }) => {
  const [getCpe, { loading }] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState([])
  const debouncedInput = useDebounce(searchInput, 300)

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
  }

  useEffect(() => {
    if (debouncedInput !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'cpe',
            ecosystem: 'cpe',
            search: {
              version: debouncedInput
            },
            hints: product ? { cpe: { product } } : undefined
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
  }, [debouncedInput, product, getCpe])

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
