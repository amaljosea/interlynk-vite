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
      <Tooltip label={notes}>
        <Td fontSize={'xs'}>
          <BiNote />
        </Td>
      </Tooltip>
    </Tr>
  )
}

export default VulLinkRow
