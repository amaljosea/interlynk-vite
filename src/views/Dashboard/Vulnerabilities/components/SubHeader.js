import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'

import { Flex } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import Filters from './Filters'

const SubHeader = ({ filters, setFilters }) => {
  const isVuln = window.location.pathname === '/vendor/vulnerabilities'

  return (
    <Flex width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
      <Flex gap={2} spacing={isVuln ? 3 : 1}>
        <Filters filters={filters} setFilters={setFilters} />
      </Flex>
      <Flex gap={2}>
        <ExportCsv tableType='Vulnerability View' filters={{ ...filters }} />
        <RefreshBtn />
      </Flex>
    </Flex>
  )
}

export default SubHeader
