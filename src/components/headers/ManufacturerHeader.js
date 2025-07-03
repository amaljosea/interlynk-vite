import React, { useMemo } from 'react'

import { InfoIcon } from '@chakra-ui/icons'
import { Flex, Stack, Text, Tooltip } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

const ManufacturerHeader = ({ handleUpdate }) => {
  const { primaryBlueText, primaryTextColor } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor'
  ])

  const updateOrg = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  return useMemo(() => {
    const info = `For compliance, an SBOM may require the product manufacturer's name and contact information. A large corporation might have multiple legal names, including its subsidiaries.`

    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex flexDirection={'column'}>
          <Stack direction={'row'} alignItems={'center'}>
            <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
              Manufacturer Identities
            </Text>
            <Tooltip label={info}>
              <InfoIcon cursor={'pointer'} color={primaryBlueText} />
            </Tooltip>
          </Stack>
          <Text fontSize={'sm'}>
            View and manage the identities of manufacturers, ensuring
            authenticity and compliance across the supply chain.
          </Text>
        </Flex>
        <AddButton
          label='Add Manufacturer'
          tooltipPlacement='left'
          isDisabled={!updateOrg}
          aria-label='add_manufacturer'
          onClick={() => handleUpdate(null)}
        />
      </Flex>
    )
  }, [handleUpdate, primaryBlueText, primaryTextColor, updateOrg])
}

export default ManufacturerHeader
