import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import React, { useMemo, useState } from 'react'

import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'

import { DashboardCard } from 'components/DashboardCard'
import DefectDensity from 'components/Graphs/DefectDensity'
import IdentityVelocity from 'components/Graphs/IdentificationVelocity'
import PatchVelocity from 'components/Graphs/PatchVelocity'
import VulnAge from 'components/Graphs/VulnAge'
import VulnBySeverity from 'components/Graphs/VulnBySeverity'
import VulnByStatus from 'components/Graphs/VulnByStatus'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'

function VulnerabilityTrendsGroup() {
  const { selectedTrends, setSelectedTrends } = useGlobalState()
  const { isFreeTier } = useGlobalQueryContext()

  const [trendCards, setTrendCards] = useState([
    {
      id: '1',
      title: 'Vulnerabilities by Severity',
      key: 'vulns_by_severity',
      desc: 'Number of vulnerabilities in included versions grouped by their severity',
      content: <VulnBySeverity />
    },
    {
      id: '2',
      key: 'vulns_by_status',
      title: 'Vulnerabilities by Status',
      desc: 'Number of vulnerabilities in included versions grouped by their vulnerabilty status',
      content: <VulnByStatus />
    },
    {
      id: '3',
      key: 'defect_density',
      title: 'Defect Density',
      desc: 'Percentage of identified vulnerabilities that are updated or patched',
      content: !isFreeTier ? <DefectDensity /> : null
    },
    {
      id: '4',
      key: 'resolution_age',
      title: 'Resolution Age',
      desc: 'Total number of days all vulnerabilities are present before resolution',
      content: !isFreeTier ? <VulnAge /> : null
    },
    {
      id: '5',
      key: 'resotion_velocity',
      title: 'Resolution Velocity',
      desc: 'Average number of days a vulnerability is present before resolution',
      content: !isFreeTier ? <IdentityVelocity /> : null
    },
    {
      id: '6',
      key: 'patch_velocity',
      title: 'Patch Velocity',
      desc: 'Duration from vulnerability identification to when it is updated or patched',
      content: !isFreeTier ? <PatchVelocity /> : null
    }
  ])

  const [isGridLayout, setIsGridLayout] = useState(true)

  const filteredTrendCards = useMemo(() => {
    return trendCards.filter((card) => selectedTrends.includes(card.key))
  }, [trendCards, selectedTrends])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTrendCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleDeleteCard = (key) => {
    setSelectedTrends(selectedTrends?.filter((item) => item !== key))
  }

  if (filteredTrendCards?.length === 0) return null

  return (
    <Stack spacing={3}>
      <Heading size={'md'}>Vulnerability Trends</Heading>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTrendCards}
          strategy={rectSortingStrategy}
        >
          <SimpleGrid
            columns={isGridLayout ? { base: 1, md: 2, lg: 3 } : 1}
            spacing={5}
          >
            {filteredTrendCards?.map((card) => (
              <DashboardCard
                key={card.id}
                id={card.key}
                title={card.title}
                desc={card.desc}
                content={card.content}
                onDelete={handleDeleteCard}
                isGridLayout={isGridLayout}
              />
            ))}
          </SimpleGrid>
        </SortableContext>
      </DndContext>
    </Stack>
  )
}

export default VulnerabilityTrendsGroup
