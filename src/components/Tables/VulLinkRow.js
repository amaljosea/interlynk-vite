import React from 'react'
import { getFullDateAndTime, timeSince } from 'utils'

import { Flex, Td, Tr } from '@chakra-ui/react'

import Tooltip from 'components/Tooltip'

import { BiNote } from 'react-icons/bi'
import { FaExpand } from 'react-icons/fa6'

const VulLinkRow = ({
  username,
  justification,
  status,
  timestamp,
  note,
  impact,
  onSelect
}) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  return (
    <Tr>
      <Td fontSize={'xs'} pl={0}>
        <Flex flexDir={'row'} alignItems={'center'} gap={2}>
          {/* {!signedUrlParams && <FaExpand cursor={'pointer'} onClick={onSelect} />} */}
          {status}
        </Flex>
      </Td>
      <Td fontSize={'xs'} pl={0}>
        {justification}
      </Td>
      <Td fontSize={'xs'} pl={0}>
        {impact && (
          <Tooltip
            text={
              impact?.length > 35 ? `${impact.substring(0, 35)}...` : impact
            }
          >
            <BiNote />
          </Tooltip>
        )}
      </Td>
      <Td fontSize={'xs'} pl={0}>
        {note && (
          <Tooltip
            text={note?.length > 35 ? `${note.substring(0, 35)}...` : note}
          >
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
