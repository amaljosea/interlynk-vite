import React from 'react'

import { RepeatIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import Filters from './Filters'

const SubHeader = ({ handleRefresh, filters, setFilters }) => {
  const isVuln = window.location.pathname === '/vendor/vulnerabilities'
  return (
    <Flex width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
      <Stack spacing={isVuln ? 3 : 1} direction={'row'}>
        <Filters filters={filters} setFilters={setFilters} />
      </Stack>
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

export default SubHeader
