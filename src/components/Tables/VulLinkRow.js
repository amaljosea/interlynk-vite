import React from 'react'
import { getFullDateAndTime, timeSince } from 'utils'

import {
  IconButton,
  Td,
  Text,
  Tooltip,
  Tr,
  useDisclosure
} from '@chakra-ui/react'

import VexInfoDrawer from 'components/Drawer/VexInfoDrawer'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaEye } from 'react-icons/fa6'

const VulLinkRow = ({ key, data, vulnId }) => {
  const { primaryTextColor, headingTextColor } = useThemeColor([
    'primaryTextColor',
    'headingTextColor'
  ])

  const { changedBy, status, updatedAt } = data || ''

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Tr key={key} border={'none'}>
        <Td pl={0} py={2.5}>
          <Text fontSize={'sm'} color={primaryTextColor} mb={0.5}>
            {status}
          </Text>
          <Tooltip label={getFullDateAndTime(updatedAt)}>
            <Text fontSize={'xs'} color={'gray.500'}>
              {timeSince(updatedAt)}
            </Text>
          </Tooltip>
        </Td>
        <Td py={2.5}>
          <Text fontSize={13} color={'gray.500'}>
            {changedBy}
          </Text>
        </Td>
        <Td pr={0} isNumeric py={2.5}>
          <IconButton
            size='sm'
            variant='outline'
            onClick={onOpen}
            icon={<FaEye color={headingTextColor} />}
          />
        </Td>
      </Tr>

      {isOpen && (
        <VexInfoDrawer
          vulnId={vulnId}
          data={data}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  )
}

export default VulLinkRow
