import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { CpeAutoComplete } from 'graphQL/Queries'

const Product = ({ disabled, product, onChange, onBlur }) => {
  const [getCpe, { loading }] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState([])

  const handleChange = (item) => {
    setValue(item)
    onChange('product', item?.value)
  }

  const handleBlur = () => searchInput !== '' && onBlur(4, searchInput)

  const onInputChange = (value) => {
    setSearchInput(value)
    if (value !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'cpe',
            ecosystem: 'cpe',
            search: {
              product: value
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
    if (product) {
      setValue({ label: product, value: product })
    }
  }, [product])

  return (
    <FormControl isRequired isDisabled={disabled}>
      <FormLabel>Product</FormLabel>
      <LynkSelect
        name='product'
        id='cpe_product'
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
    </FormControl>
  )
}

export default Product
