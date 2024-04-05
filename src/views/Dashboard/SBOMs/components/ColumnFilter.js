import React, { useState } from 'react'

import { Input } from '@chakra-ui/react'

const ColumnFilter = ({ column }) => {
  const { filterValue, setFilter } = column
  return (
    <>
      <Input
        width={'400px'}
        value={filterValue || ''}
        onChange={(e) => setFilter(e.target.value)}
        placeholder='Search...'
      />
    </>
  )
}

export default ColumnFilter
