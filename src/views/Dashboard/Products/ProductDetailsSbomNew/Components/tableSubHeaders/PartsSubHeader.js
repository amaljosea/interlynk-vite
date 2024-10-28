import { useMemo, useRef } from 'react'

import { AddIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

const PartsSubHeader = (isArchived, onOpen, signedUrlParams, updateSboms) => {
  const addBtn = useRef()

  const subHeader = useMemo(() => {
    return (
      <Flex
        sx={{ w: '100%', gap: 2, alignItems: 'center' }}
        justifyContent={'flex-end'}
      >
        <Tooltip label='Add Part' placement='top'>
          <IconButton
            ref={addBtn}
            variant='solid'
            onClick={onOpen}
            colorScheme='blue'
            icon={<AddIcon />}
            hidden={isArchived}
            sx={{ fontSize: 'sm', fontWeight: 'normal' }}
            isDisabled={!updateSboms || signedUrlParams}
          />
        </Tooltip>
        <RefreshBtn />
      </Flex>
    )
  }, [isArchived, onOpen, signedUrlParams, updateSboms])

  return subHeader
}

export default PartsSubHeader
