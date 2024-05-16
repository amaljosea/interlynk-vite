import React from 'react'

import { RepeatIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import Filters from './Filters'

const SubHeader = ({ handleRefresh, setFilters }) => {
  return (
    <Flex width={'100%'} alignItems={'center'} gap={3}>
      <Stack
        width={'100%'}
        direction={'row'}
        spacing={4}
        alignItems={'flex-start'}
      >
        <Filters setFilters={setFilters} />
      </Stack>
      <Stack
        width={'100%'}
        direction={'row'}
        spacing={2}
        justifyContent={'flex-end'}
      >
        <Tooltip label='Refresh'>
          <IconButton
            onClick={handleRefresh}
            colorScheme='blue'
            icon={<RepeatIcon />}
          />
        </Tooltip>
      </Stack>
    </Flex>
  )
}

export default SubHeader
