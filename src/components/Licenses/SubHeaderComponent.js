import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import Filter from './Filter'

export const SubHeaderComponent = ({
  setFilters,
  onOpen,
  createLic,
  setActiveRow,
  handleRefresh
}) => {
  return (
    <Flex width={'100%'} alignItems={'center'} gap={3}>
      <Stack width={'100%'} direction={'row'} spacing={4} alignItems={'center'}>
        <Filter setFilters={setFilters} />
      </Stack>

      {/* ADD LICNESE */}
      <Tooltip label='Add License'>
        <IconButton
          isDisabled={!createLic}
          onClick={() => {
            setActiveRow(null)
            onOpen()
          }}
          icon={<AddIcon />}
          colorScheme='blue'
          variant='solid'
          fontWeight='normal'
          fontSize={'sm'}
        />
      </Tooltip>
      <Tooltip label='Refresh'>
        <IconButton
          onClick={handleRefresh}
          colorScheme='blue'
          icon={<RepeatIcon />}
        />
      </Tooltip>
    </Flex>
  )
}
