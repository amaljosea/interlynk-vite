import React from 'react'
import styled from 'styled-components'
import { getFullDateAndTime, timeSince } from 'utils'

import {
  Box,
  IconButton,
  Stack,
  Td,
  Text,
  Tooltip,
  Tr,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { FaEye } from 'react-icons/fa6'

const VulLinkRow = ({ key, data }) => {
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const iconColor = useColorModeValue('#4A5568', '#E2E8F0')

  const { changedBy, status, updatedAt, justification, notes, impact } =
    data || ''
  const { isOpen, onOpen, onClose } = useDisclosure()

  const CustomText = styled(Text)`
    font-size: 13px;
    font-weight: bold;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `

  const style = { color: textColor, mt: 1, fontSize: 14 }

  return (
    <>
      <Tr key={key} border={'none'}>
        <Td pl={0} py={2.5}>
          <Text fontSize={'sm'} color={textColor} mb={0.5}>
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
            icon={<FaEye color={iconColor} />}
          />
        </Td>
      </Tr>

      {isOpen && (
        <LynkModal
          noFooter
          isOpen={isOpen}
          onClose={onClose}
          title={'View Status'}
        >
          <Stack spacing={6}>
            <Box>
              <CustomText>STATUS</CustomText>
              <Text sx={style}>{status || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>JUSTIFICATION</CustomText>
              <Text sx={style}>{justification || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>IMPACT STATEMENT</CustomText>
              <Text sx={style}>{impact || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>INTERNAL NOTES</CustomText>
              <Text sx={style}>{notes || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>CREATED BY</CustomText>
              <Text sx={style}>{changedBy || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>CREATED ON</CustomText>
              <Text sx={style}>{timeSince(updatedAt) || 'N/A'}</Text>
            </Box>
          </Stack>
        </LynkModal>
      )}
    </>
  )
}

export default VulLinkRow
