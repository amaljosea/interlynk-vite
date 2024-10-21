import React from 'react'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'

import { Flex, Stack } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import Filters from './Filters'

const SubHeader = ({ filters, setFilters }) => {
  const isVuln = window.location.pathname === '/vendor/vulnerabilities'
  return (
    <Flex width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
      <Stack spacing={isVuln ? 3 : 1} direction={'row'}>
        <Filters filters={filters} setFilters={setFilters} />
      </Stack>
      <Flex gap={3}>
        {/* EXPORT CSV */}
        <ExportCsv tableType='Vulnerability View' filters={{ ...filters }} />
        <RefreshBtn />
      </Flex>
    </Flex>
  )
}

export default SubHeader
