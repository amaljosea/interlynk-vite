import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import { setItem } from 'utils/localStorageUtils'

import { Center, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react'

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
  const { analyticsState, selectedAnalytics, setSelectedAnalytics } =
    useGlobalState()

  const { headingTextSecondary } = useThemeColor(['headingTextSecondary'])

  const { product, version, duration } = analyticsState || {}

  const [analyticsCards, setAnalyticsCards] = useState([
    {
      id: '1',
      type: 'component_count',
      title: 'Component Count',
      desc: 'Number of components in included versions over time',
      content: <ComponentCount />
    },
    {
      id: '2',
      type: 'license_count',
      title: 'License Count',
      desc: ' Number of unique licenses included in versions over time',
      content: <LicenseCount />
    },
    {
      id: '3',
      type: 'vulnerabilities_by_severity',
      title: 'Vulnerabilities by Severity',
      desc: 'Number of vulnerabilities in included versions grouped by their severity',
      content: <VulnBySeverity />
    },
    {
      id: '4',
      type: 'vulnerabilities_by_status',
      title: 'Vulnerabilities by Status',
      desc: 'Number of vulnerabilities in included versions grouped by their vulnerabilty status',
      content: <VulnByStatus />
    },
    {
      id: '5',
      type: 'patch_velocity',
      title: 'Patch Velocity',
      desc: 'Duration from vulnerability identification to when it is updated or patched',
      content: <PatchVelocity />
    },
    {
      id: '6',
      type: 'defect_density',
      title: 'Defect Density',
      desc: 'Percentage of identified vulnerabilities that are updated or patched',
      content: <DefectDensity />
    },
    {
      id: '7',
      type: 'deploy_velocity',
      title: 'Deploy Velocity',
      desc: 'Duration from when an update or patch is available to complete implementation in devices deployed in the field, to the extent known',
      content: <DeployVelocity />
    }
  ])

  const filteredAnalyticsCards = useMemo(() => {
    return analyticsCards?.filter((card) =>
      selectedAnalytics?.includes(card.type)
    )
  }, [analyticsCards, selectedAnalytics])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setAnalyticsCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleDeleteCard = (key) => {
    const filteredItems = selectedAnalytics?.filter((item) => item !== key)
    setItem('selectedAnalytics', JSON.stringify(filteredItems))
    setSelectedAnalytics(filteredItems)
  }

  if (!product?.length || !version?.length || !duration) {
    return (
      <SimpleGrid w={'100%'} columns={[2, 3]} gap={6}>
        {[1, 2, 3, 4, 5, 6]?.map((item) => (
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

  if (filteredAnalyticsCards?.length === 0) return null

  return (
    <Stack>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext
          items={filteredAnalyticsCards}
          strategy={rectSortingStrategy}
        >
          <SimpleGrid gap={6} width={'100%'} columns={[2, 3]}>
            {filteredAnalyticsCards?.map((card) => (
              <DashboardCard
                key={card.id}
                id={card.id}
                type={card.type}
                title={card.title}
                desc={card.desc}
                content={card.content}
                onDelete={handleDeleteCard}
              />
            ))}
          </SimpleGrid>
        </SortableContext>
      </DndContext>
    </Stack>
  )
}
