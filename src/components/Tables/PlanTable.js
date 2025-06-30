import React, { useMemo } from 'react'
import {
  FREE_TIER_PRODUCT_LIMIT,
  FREE_TIER_USER_LIMIT
} from 'variables/general'

import { Button, Flex, Stack, Text, useDisclosure } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import { UpgradePlanModal } from 'components/Modal/UpgradePlanModal'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

const PlanTable = () => {
  const { isFreeTier } = useGlobalQueryContext()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const data = [
    {
      plan: isFreeTier ? 'Free' : 'Enterprise',
      products: isFreeTier ? FREE_TIER_PRODUCT_LIMIT : 'Unlimited',
      users: isFreeTier ? FREE_TIER_USER_LIMIT : 'Unlimited',
      renewalDate: 'N/A'
    }
  ]

  const columns = useMemo(
    () => [
      {
        id: 'plan',
        name: 'PLAN',
        selector: (row) => (
          <Text fontSize={14} color={primaryTextColor}>
            {row?.plan}
          </Text>
        )
      },
      {
        id: 'products',
        name: 'PRODUCTS',
        selector: (row) => (
          <Text fontSize={14} color={primaryTextColor}>
            {row?.products}
          </Text>
        )
      },
      {
        id: 'Users',
        name: 'USERS',
        selector: (row) => (
          <Text fontSize={14} color={primaryTextColor}>
            {row?.users}
          </Text>
        )
      },
      {
        id: 'renewal_date',
        name: 'RENEWAL DATE',
        selector: (row) => (
          <Text fontSize={14} color={primaryTextColor}>
            {row?.renewalDate}
          </Text>
        )
      }
    ],
    [primaryTextColor]
  )

  return (
    <Stack w='100%' spacing={6}>
      <LynkTable columns={columns} data={data} />

      {isFreeTier && (
        <Flex justify='left'>
          <Button title='Upgrade plan' colorScheme='blue' onClick={onOpen}>
            Upgrade Plan
          </Button>
        </Flex>
      )}

      {isFreeTier && isOpen && (
        <UpgradePlanModal isOpen={isOpen} onClose={onClose} />
      )}
    </Stack>
  )
}

export default PlanTable
