import { Flex, Stack } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
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
      <AddButton
        label='Add License'
        isDisabled={!createLic}
        onClick={() => {
          setActiveRow(null)
          onOpen()
        }}
        aria-label='add_license'
      />
      <RefreshBtn />
    </Flex>
  )
}
