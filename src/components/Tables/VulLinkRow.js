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
      <Td fontSize={'xs'} textTransform={'capitalize'}>
        {username}
      </Td>
      <Td fontSize={'xs'} textTransform={'capitalize'}>
        {justification}
      </Td>
      <Td fontSize={'xs'} textTransform={'capitalize'}>
        {status}
      </Td>
      <Td fontSize={'xs'} textTransform={'capitalize'}>
        {new Date(timestamp).toISOString().slice(0, 10)}
      </Td>
      <Tooltip label={notes}>
        <Td fontSize={'xs'} textTransform={'capitalize'}>
          <BiNote />
        </Td>
      </Tooltip>
    </Tr>
  )
}

export default VulLinkRow
