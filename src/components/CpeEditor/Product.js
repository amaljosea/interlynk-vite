import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { useDebounce } from 'hooks/useDebounce'

import { CpeAutoComplete } from 'graphQL/Queries'

const Product = ({ disabled, product, onChange, isValid, vendor }) => {
  const [getCpe, { loading }] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState([])
  const debouncedInput = useDebounce(searchInput, 300)

  const handleChange = (item) => {
    setValue(item)
    onChange('product', item?.value, 4)
  }

  const onBlur = (index, val) => {
    onChange('product', val, index)
  }

  const handleBlur = () => searchInput !== '' && onBlur(4, searchInput)

  const onInputChange = (value) => {
    setSearchInput(value)
  }

  useEffect(() => {
    if (debouncedInput) {
      getCpe({
        variables: {
          input: {
            idType: 'cpe',
            ecosystem: 'cpe',
            search: {
              product: debouncedInput
            },
            hints: vendor ? { cpe: { vendor } } : undefined
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
  }, [debouncedInput, vendor, getCpe])

  useEffect(() => {
    if (product) {
      setValue({ label: product, value: product })
    }
  }, [product])

  return (
    <FormControl isRequired isDisabled={disabled} isInvalid={!isValid}>
      <FormLabel>Product</FormLabel>
      <LynkSelect
        value={value}
        name='product'
        id='cpe_product'
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
        placeholder='e.g. lynk-product'
      />
      {!isValid && <FormErrorMessage>Invalid product format</FormErrorMessage>}
    </FormControl>
  )
}

export default Product
