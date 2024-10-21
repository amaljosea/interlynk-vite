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
  Text
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const VexInfoDrawer = ({ isOpen, onClose, data, vulnId }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const CustomText = styled(Text)`
    font-size: 13px;
    font-weight: bold;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `

  const style = { color: primaryTextColor, mt: 1, fontSize: 14 }

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
              <Text sx={style}>{data?.justification || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>IMPACT STATEMENT</CustomText>
              <Text sx={style}>{data?.impact || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>INTERNAL NOTES</CustomText>
              <Text sx={style}>{data?.note || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>ACTION STATEMENT</CustomText>
              <Text sx={style}>{data?.actionStmt || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>FIXED VERSION</CustomText>
              <Text sx={style}>{data?.fixedIn || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>DETAIL</CustomText>
              <Text sx={style}>{data?.detail || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>CREATED BY</CustomText>
              <Text sx={style}>{data?.changedBy || 'N/A'}</Text>
            </Box>
            <Box>
              <CustomText>CREATED ON</CustomText>
              <Text sx={style}>
                {data?.updatedAt ? timeSince(data?.updatedAt) : 'N/A'}
              </Text>
            </Box>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default VexInfoDrawer
