import { Flex, Td, Tr } from '@chakra-ui/react'
import Tooltip from 'components/Tooltip'
import React from 'react'
import { BiNote } from 'react-icons/bi'
import { FaExpand } from 'react-icons/fa6'
import { getFullDateAndTime, timeSince } from 'utils'

const VulLinkRow = ({
  username,
  justification,
  status,
  timestamp,
  note,
  impact,
  onSelect
}) => {
  return (
    <Tr>
      <Td fontSize={'xs'} pl={0}>
        <Flex flexDir={'row'} alignItems={'center'} gap={2}>
          <FaExpand cursor={'pointer'} onClick={onSelect} />
          {status}
        </Flex>
      </Td>
      <Td fontSize={'xs'} pl={0}>
        {justification}
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
      <Td fontSize={'xs'} pl={0}>
        {username}
      </Td>
      <Td fontSize={'xs'} pl={0}>
        <Tooltip text={getFullDateAndTime(timestamp)}>
          {timeSince(timestamp)}
        </Tooltip>
      </Td>
    </Tr>
  )
}

export default VulLinkRow
