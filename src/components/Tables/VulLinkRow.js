import { Td, Tr } from '@chakra-ui/react'
import Tooltip from 'components/Tooltip'
import React from 'react'
import { BiNote } from 'react-icons/bi'
import { getFullDateAndTime, timeSince } from 'utils'

const VulLinkRow = ({
  username,
  justification,
  status,
  timestamp,
  note,
  impact
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
        <Tooltip text={getFullDateAndTime(timestamp)}>
          {timeSince(timestamp)}
        </Tooltip>
      </Td>
      <Td fontSize={'xs'} pl={0}>
        {impact && (
          <Tooltip text={impact}>
            <BiNote />
          </Tooltip>
        )}
      </Td>
      <Td fontSize={'xs'} pl={0}>
        {note && (
          <Tooltip text={note}>
            <BiNote />
          </Tooltip>
        )}
      </Td>
    </Tr>
  )
}

export default VulLinkRow
