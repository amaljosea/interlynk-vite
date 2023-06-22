import { Td, Tr, Tooltip } from '@chakra-ui/react'
import React from 'react'
import { BiNote } from 'react-icons/bi'

const VulLinkRow = ({
  id,
  username,
  justification,
  status,
  timestamp,
  notes
}) => {
  return (
    <Tr>
      <Td fontSize={'sm'} textTransform={'capitalize'}>
        {username}
      </Td>
      <Td fontSize={'sm'} textTransform={'capitalize'}>
        {justification}
      </Td>
      <Td fontSize={'sm'} textTransform={'capitalize'}>
        {status}
      </Td>
      <Td fontSize={'sm'} textTransform={'capitalize'}>
        {timestamp}
      </Td>
      <Tooltip label={notes}>
        <Td fontSize={'sm'} textTransform={'capitalize'}>
          <BiNote />
        </Td>
      </Tooltip>
    </Tr>
  )
}

export default VulLinkRow
