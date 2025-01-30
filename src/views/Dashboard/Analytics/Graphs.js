import { Center, Icon, SimpleGrid, Text } from '@chakra-ui/react'

import ComponentCount from 'components/Graphs/ComponentCount'
import DefectDensity from 'components/Graphs/DefectDensity'
import DeployVelocity from 'components/Graphs/DeployVelocity'
import LicenseCount from 'components/Graphs/LicenseCount'
import PatchVelocity from 'components/Graphs/PatchVelocity'
import VulnBySeverity from 'components/Graphs/VulnBySeverity'
import VulnByStatus from 'components/Graphs/VulnByStatus'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { TfiBarChart } from 'react-icons/tfi'

export const Graphs = ({ filters }) => {
  const { orgView } = useGlobalQueryContext()
  const { headingTextSecondary } = useThemeColor(['headingTextSecondary'])

  const { product, version, duration } = filters || ''

  if (!product?.length || !version?.length || !duration) {
    return (
      <Center w={'100%'} py={24}>
        <Icon as={TfiBarChart} boxSize={44} color={headingTextSecondary} />
      </Center>
    )
  }

  if (!orgView)
    return (
      <Center w={'100%'} py={24}>
        <Text>You do not have permission to check analytics</Text>
      </Center>
    )

  return (
    <SimpleGrid gap={6} width={'100%'} columns={3}>
      <ComponentCount filters={filters} />
      <LicenseCount filters={filters} />
      <VulnBySeverity filters={filters} />
      <VulnByStatus filters={filters} />
      <PatchVelocity filters={filters} />
      <DefectDensity filters={filters} />
      <DeployVelocity filters={filters} />
    </SimpleGrid>
  )
}
