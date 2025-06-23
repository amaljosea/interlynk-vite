import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormLabel, Input } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { CpeAutoComplete } from 'graphQL/Queries'

const Version = ({ disabled, version, type, onChange, onBlur }) => {
  const [getCpe, { loading }] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState([])

  const handleChange = (item) => {
    setValue(item)
    onChange('version', item?.value)
  }

  const handleBlur = () => searchInput !== '' && onBlur('version', searchInput)

  const searchTypes = ['npm', 'maven', 'gem']
  const isSearchable = searchTypes?.includes(type)

  const onInputChange = (value) => {
    setSearchInput(value)
    if (value !== '' && isSearchable) {
      getCpe({
        variables: {
          input: {
            idType: 'purl',
            ecosystem: type,
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

  const inputProps = { size: 'md', fontSize: 'sm', name: 'version' }

  useEffect(() => {
    if (isSearchable && version !== '') {
      setValue({ label: version, value: version })
    }
  }, [isSearchable, version])

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>Version</FormLabel>
      {isSearchable ? (
        <LynkSelect
          value={value}
          name='version'
          options={options}
          id='purl_version'
          isClearable={true}
          isSearchable={true}
          isLoading={loading}
          onBlur={handleBlur}
          isDisabled={disabled}
          onChange={handleChange}
          inputValue={searchInput}
          placeholder={`e.g. 1.0.0`}
          noOptionsMessage={() => null}
          onInputChange={onInputChange}
        />
      ) : (
        <Input
          {...inputProps}
          value={version}
          placeholder={`e.g. 1.0.0`}
          onBlur={(e) => onBlur('version', e.target.value)}
          onChange={(e) => onChange('version', e.target.value)}
        />
      )}
    </FormControl>
  )
}

export default Version
