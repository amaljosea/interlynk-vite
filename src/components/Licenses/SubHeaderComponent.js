import { AddIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import Filter from './Filter'

export const SubHeaderComponent = ({
  setFilters,
  onOpen,
  createLic,
  setActiveRow
}) => {
  return (
    <Flex width={'100%'} alignItems={'center'} gap={3}>
      <Stack width={'100%'} direction={'row'} spacing={3} alignItems={'center'}>
        <Filter setFilters={setFilters} />
      </Stack>

      {/* ADD LICNESE */}
      <Tooltip label='Add License'>
        <IconButton
          variant='solid'
          icon={<AddIcon />}
          colorScheme='blue'
          isDisabled={!createLic}
          onClick={() => {
            setActiveRow(null)
            onOpen()
          }}
          aria-label='add_license'
          sx={{ fontSize: 'sm', fontWeight: 'normal' }}
        />
      </Tooltip>
      <RefreshBtn />
    </Flex>
  )
}
