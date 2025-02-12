import React from 'react'
import {
  FREE_TIER_PRODUCT_LIMIT,
  FREE_TIER_USER_LIMIT
} from 'variables/general'

import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'
import { Box, Button, Flex, useDisclosure } from '@chakra-ui/react'

import { UpgradePlanModal } from 'components/Modal/UpgradePlanModal'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

const PlanTable = () => {
  const { isFreeTier } = useGlobalQueryContext()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { headingTextColor, grayBorderColor } = useThemeColor([
    'headingTextColor',
    'grayBorderColor'
  ])

  const LynkTd = ({ children, ...props }) => (
    <Td {...props} borderColor={grayBorderColor}>
      {children}
    </Td>
  )

  const headStyle = {
    fontWeight: 'bold',
    color: headingTextColor,
    borderColor: grayBorderColor
  }

  return (
    <Box>
      {/* Plan Overview Section */}
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th sx={headStyle}>Plan</Th>
              <Th sx={headStyle}>Products</Th>
              <Th sx={headStyle}>Users</Th>
              <Th sx={headStyle}>Renewal Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <LynkTd fontSize={'sm'}>
                {isFreeTier ? 'Free' : 'Enterprise'}
              </LynkTd>
              <LynkTd fontSize={'sm'}>
                {isFreeTier ? FREE_TIER_PRODUCT_LIMIT : 'Unlimited'}
              </LynkTd>
              <LynkTd fontSize={'sm'}>
                {isFreeTier ? FREE_TIER_USER_LIMIT : 'Unlimited'}
              </LynkTd>
              <LynkTd fontSize={'sm'}>N/A</LynkTd>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>

      {/* Upgrade Modal Button */}
      {isFreeTier && (
        <Flex justify='left' mt={6}>
          <Button title='Upgrade plan' colorScheme='blue' onClick={onOpen}>
            Upgrade Plan
          </Button>
        </Flex>
      )}

      {isFreeTier && isOpen && (
        <UpgradePlanModal isOpen={isOpen} onClose={onClose} />
      )}
    </Box>
  )
}

export default PlanTable
