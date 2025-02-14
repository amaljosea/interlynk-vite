import { Box, Heading, SimpleGrid, Stack } from '@chakra-ui/react'

import AllVulnerabilitiesBySeverity from 'components/Graphs/AllVulnerabilitiesBySeverity'
import AllVulnerabilitiesByStatus from 'components/Graphs/AllVulnerabilitiesByStatus'
import CriticalVulnerabilitiesByStatus from 'components/Graphs/CriticalVulnerabilitiesByStatus'
import DefectDensity from 'components/Graphs/DefectDensity'
import HighVulnerabilitiesByStatus from 'components/Graphs/HighVulnerabilitiesByStatus'
// import DeployVelocity from 'components/Graphs/DeployVelocity'
import IdentityVelocity from 'components/Graphs/IdentificationVelocity'
import KevVulnerabilitiesByStatus from 'components/Graphs/KevVulnerabilitiesByStatus'
import PatchVelocity from 'components/Graphs/PatchVelocity'
import VulnAge from 'components/Graphs/VulnAge'
import VulnBySeverity from 'components/Graphs/VulnBySeverity'
import VulnByStatus from 'components/Graphs/VulnByStatus'

import useDateRange from 'hooks/useDateRange'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'

const VulnGraphs = () => {
  const { labelIds } = useGlobalState()
  const { startDate, endDate } = useDateRange()
  const { isFreeTier } = useGlobalQueryContext()

  const filters = {
    label: labelIds,
    duration: { startDate: startDate, endDate: endDate }
  }

  return (
    <Stack spacing={4} mt={6}>
      <Heading size={'md'}>Vulnerabilities</Heading>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5} pb={6}>
        <AllVulnerabilitiesBySeverity />
        <AllVulnerabilitiesByStatus />
        <Box />
        <CriticalVulnerabilitiesByStatus />
        <HighVulnerabilitiesByStatus />
        <KevVulnerabilitiesByStatus />
      </SimpleGrid>
      <Heading size={'md'} mt={6}>
        Vulnerability Trends
      </Heading>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        <VulnBySeverity filters={filters} />
        <VulnByStatus filters={filters} />
        {!isFreeTier && (
          <>
            <DefectDensity filters={filters} />
            <VulnAge filters={filters} />
            <IdentityVelocity filters={filters} />
            <PatchVelocity filters={filters} />
            {/* <DeployVelocity filters={filters} /> */}
          </>
        )}
      </SimpleGrid>
    </Stack>
  )
}

export default VulnGraphs
