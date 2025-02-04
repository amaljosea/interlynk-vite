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
    setValue(item || null)
    item?.value && onChange('version', item?.value)
  }

  const handleBlur = () => value && onBlur('version', value)

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
          name='version'
          id='purl_version'
          placeholder={''}
          isClearable={true}
          isSearchable={true}
          isLoading={loading}
          value={value}
          onBlur={handleBlur}
          onChange={handleChange}
          inputValue={searchInput}
          options={options}
          isDisabled={disabled}
          noOptionsMessage={() => null}
          onInputChange={onInputChange}
        />
      ) : (
        <Input
          {...inputProps}
          value={version}
          onBlur={(e) => onBlur('version', e.target.value)}
          onChange={(e) => onChange('version', e.target.value)}
        />
      )}
    </FormControl>
  )
}

export default Version
