import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { namespaceOptions } from 'variables/general'

import { FormControl, FormLabel, Input } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { CpeAutoComplete } from 'graphQL/Queries'

const Namespace = ({ disabled, namespace, type, onChange, onBlur }) => {
  const [getCpe, { loading }] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState([])

  const handleChange = (item) => {
    setValue(item)
    onChange('namespace', item?.value)
  }

  const handleBlur = () =>
    searchInput !== '' && onBlur('namespace', searchInput)

  const searchTypes = ['npm', 'maven', 'gem']
  const isSearchable = searchTypes?.includes(type)
  const isSelectable = namespaceOptions[type]?.length > 0

  const onInputChange = (value) => {
    setSearchInput(value)
    if (value !== '' && isSearchable) {
      getCpe({
        variables: {
          input: {
            idType: 'purl',
            ecosystem: type,
            search: {
              namespace: value
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

  const inputProps = { size: 'md', name: 'namespace' }

  useEffect(() => {
    if (isSearchable && namespace) {
      setValue({ label: namespace, value: namespace })
    }
  }, [isSearchable, namespace])

  return (
    <FormControl
      hidden={type === 'nuget' || type === 'oci'}
      isDisabled={disabled}
    >
      <FormLabel>Namespace</FormLabel>
      {isSearchable ? (
        <LynkSelect
          id='purl_namespace'
          name='namespace'
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
      ) : isSelectable ? (
        <LynkSelect
          {...inputProps}
          value={
            namespaceOptions[type]?.find((opt) => opt.value === namespace) ||
            null
          }
          onBlur={(selected) => onBlur('namespace', selected?.value || '')}
          onChange={(selected) => onChange('namespace', selected.value)}
          options={namespaceOptions[type] || []}
        />
      ) : (
        <Input
          {...inputProps}
          value={namespace}
          onBlur={(e) => onBlur('namespace', e.target.value)}
          onChange={(e) => onChange('namespace', e.target.value)}
        />
      )}
    </FormControl>
  )
}

export default Namespace
