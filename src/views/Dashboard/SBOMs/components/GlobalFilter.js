import React, { useState } from 'react'
import { Input } from '@chakra-ui/react'

const GlobalFilter = ({ filter, setFilter }) => {
  const [value, setValue] = useState(filter)
  const onChange = (e) => {
    setValue(e.target.value)
    setFilter(e.target.value || undefined)
  }
  return (
    <>
      <Input
        width={'400px'}
        value={value || ''}
        onChange={onChange}
        placeholder='Search...'
      />
    </>
  )
}

export default GlobalFilter
