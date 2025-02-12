import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'

import { Flex } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { useRouteFlags } from 'hooks/useRouteFlags'

import Filters from './Filters'

const SubHeader = ({ reset, filters }) => {
  const { isVulnerabilitiesPage } = useRouteFlags()

  return (
    <Flex width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
      <Flex gap={2} spacing={isVulnerabilitiesPage ? 3 : 1}>
        <Filters reset={reset} />
      </Flex>
      <Flex gap={2}>
        <ExportCsv tableType='Vulnerability View' filters={{ ...filters }} />
        <RefreshBtn />
      </Flex>
    </Flex>
  )
}

export default SubHeader
