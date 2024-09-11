import styled from 'styled-components'
import { timeSince } from 'utils'

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Tag,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

const VexInfoDrawer = ({ isOpen, onClose, data, vulnId }) => {
  const {
    changedBy,
    status,
    updatedAt,
    justification,
    note,
    impact,
    detail,
    fixedIn,
    actionStmt
  } = data || ''
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const CustomText = styled(Text)`
    font-size: 13px;
    font-weight: bold;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `

  const style = { color: textColor, mt: 1, fontSize: 14 }

  return (
    <Drawer size='sm' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={3} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text mb={1} fontWeight={'medium'}>
            View Status
          </Text>
          <Tag variant='subtle' colorScheme='blue' wordBreak={'break-all'}>
            {vulnId || ''}
          </Tag>
        </DrawerHeader>
        <DrawerBody mt={2}>
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
              <Text sx={style}>{note || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>ACTION STATEMENT</CustomText>
              <Text sx={style}>{actionStmt || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>FIXED VERSOIN</CustomText>
              <Text sx={style}>{fixedIn || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>DETAIL</CustomText>
              <Text sx={style}>{detail || 'N/A'}</Text>
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
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default VexInfoDrawer
