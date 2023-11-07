import { Td, Tr, Tooltip } from '@chakra-ui/react'
import React from 'react'
import { BiNote } from 'react-icons/bi'
import { getFullDateAndTime, timeSince } from 'utils'

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
      <Td fontSize={'xs'} pl={0}>
        {username}
      </Td>
      <Td fontSize={'xs'} pl={0}>
        {status}
      </Td>
      <Td fontSize={'xs'} pl={0}>
        {justification}
      </Td>
      <Td fontSize={'xs'} pl={0}>
        <Tooltip label={getFullDateAndTime(timestamp)} placement={'top'}>
          {timeSince(timestamp)}
        </Tooltip>
      </Td>
      <Td fontSize={'xs'} pl={0}>
        <BiNote />
      </Td>
      <Td fontSize={'xs'} pl={0}>
        <Tooltip label={notes}>
          <BiNote />
        </Tooltip>
      </Td>
    </Tr>
  )
}

export default VulLinkRow
