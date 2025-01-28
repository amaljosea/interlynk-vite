import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'

import { Flex } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'
import EnvGeneralFilter from 'components/Misc/EnvGeneralFilter'

import { useEnvTotalCounts } from 'hooks/useEnvTotalCount'
import useQueryParam from 'hooks/useQueryParam'

import Filters from './Filters'

const SubHeader = ({ reset, filters }) => {
  const isVuln = window.location.pathname === '/vendor/vulnerabilities'
  const tab = useQueryParam('tab')

  const totalCounts = useEnvTotalCounts({
    filters,
    queryOptions: {
      skip: tab === 'vulnerabilities',
      selector: 'organization.vulns'
    }
  })

  return (
    <Flex width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
      <Flex gap={2} spacing={isVuln ? 3 : 1}>
        <Filters reset={reset} />
        {tab !== 'vulnerabilities' && (
          <EnvGeneralFilter reset={reset} totalCounts={totalCounts} />
        )}
      </Flex>
      <Flex gap={2}>
        <ExportCsv tableType='Vulnerability View' filters={{ ...filters }} />
        <RefreshBtn />
      </Flex>
    </Flex>
  )
}

export default SubHeader
