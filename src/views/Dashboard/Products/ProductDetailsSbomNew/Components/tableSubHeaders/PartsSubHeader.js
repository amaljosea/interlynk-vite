import { useMemo, useRef } from 'react'

import { Flex } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'

const PartsSubHeader = (isArchived, onOpen, signedUrlParams, updateSboms) => {
  const addBtn = useRef()

  const subHeader = useMemo(() => {
    return (
      <Flex
        sx={{ w: '100%', gap: 2, alignItems: 'center' }}
        justifyContent={'flex-end'}
      >
        <AddButton
          ref={addBtn}
          label='Add Part'
          tooltipPlacement='top'
          onClick={onOpen}
          hidden={isArchived}
          aria-label='add_part'
          isDisabled={!updateSboms || signedUrlParams}
        />
        <RefreshBtn />
      </Flex>
    )
  }, [isArchived, onOpen, signedUrlParams, updateSboms])

  return subHeader
}

export default PartsSubHeader
