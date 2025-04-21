import { useMemo } from 'react'

import { Flex } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

import Filter from './Filter'

export const SubHeaderComponent = ({
  onOpen,
  updateLic,
  setActiveRow,
  setFilters,
}) => {
  return useMemo(() => {
    return (
      <Flex gap={2} width={'100%'} justifyContent={'space-between'}>
        <Flex gap={2}>
          <Filter setFilters={setFilters} />
        </Flex>
        <Flex gap={2}>
          {/* ADD LICNESE */}
          <AddButton
            label='Add License'
            isDisabled={!updateLic}
            onClick={() => {
              setActiveRow(null)
              onOpen()
            }}
            aria-label='add_license'
          />
          <RefreshBtn />
        </Flex>
      </Flex>
    )
  }, [updateLic, onOpen, setActiveRow, setFilters])
}
