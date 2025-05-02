import { Center, Icon, SimpleGrid, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import { DashboardCard } from 'components/DashboardCard'
import ComponentCount from 'components/Graphs/ComponentCount'
import DefectDensity from 'components/Graphs/DefectDensity'
import DeployVelocity from 'components/Graphs/DeployVelocity'
import LicenseCount from 'components/Graphs/LicenseCount'
import PatchVelocity from 'components/Graphs/PatchVelocity'
import VulnBySeverity from 'components/Graphs/VulnBySeverity'
import VulnByStatus from 'components/Graphs/VulnByStatus'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuChartArea } from 'react-icons/lu'

export const Graphs = () => {
  const { orgView } = useGlobalQueryContext()
  const { analyticsState } = useGlobalState()

  const { headingTextSecondary } = useThemeColor(['headingTextSecondary'])

  const { product, version, duration } = analyticsState || {}

  const trendCards = [
    {
      id: '1',
      title: 'Component Count',
      desc: 'Number of components in included versions over time',
      content: <ComponentCount />
    },
    {
      id: '2',
      title: 'License Count',
      desc: ' Number of unique licenses included in versions over time',
      content: <LicenseCount />
    },
    {
      id: '3',
      title: 'Vulnerabilities by Severity',
      desc: 'Number of vulnerabilities in included versions grouped by their severity',
      content: <VulnBySeverity />
    },
    {
      id: '4',
      title: 'Vulnerabilities by Status',
      desc: 'Number of vulnerabilities in included versions grouped by their vulnerabilty status',
      content: <VulnByStatus />
    },
    {
      id: '5',
      title: 'Patch Velocity',
      desc: 'Duration from vulnerability identification to when it is updated or patched',
      content: <PatchVelocity />
    },
    {
      id: '6',
      title: 'Defect Density',
      desc: 'Percentage of identified vulnerabilities that are updated or patched',
      content: <DefectDensity />
    },
    {
      id: '7',
      title: 'Deploy Velocity',
      desc: 'Duration from when an update or patch is available to complete implementation in devices deployed in the field, to the extent known',
      content: <DeployVelocity />
    }
  ]

  if (!product?.length || !version?.length || !duration) {
    return (
      <SimpleGrid w={'100%'} columns={[2, 3]} gap={6}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item}>
            <CardBody py={16} alignItems='center' justifyContent='center'>
              <Icon
                boxSize={32}
                as={LuChartArea}
                color={headingTextSecondary}
              />
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    )
  }

  if (!orgView)
    return (
      <Center w={'100%'} py={24}>
        <Text>You do not have permission to check analytics</Text>
      </Center>
    )

  return (
    <SimpleGrid gap={6} width={'100%'} columns={[2, 3]}>
      {trendCards?.map((card) => (
        <DashboardCard
          key={card.id}
          id={card.id}
          title={card.title}
          desc={card.desc}
          content={card.content}
        />
      ))}
    </SimpleGrid>
  )
}
