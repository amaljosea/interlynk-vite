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
import React, { useMemo, useState } from 'react'

import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'

import { DashboardCard } from 'components/DashboardCard'
import AllVulnerabilitiesBySeverity from 'components/Graphs/AllVulnerabilitiesBySeverity'
import AllVulnerabilitiesByStatus from 'components/Graphs/AllVulnerabilitiesByStatus'
import CriticalVulnerabilitiesByStatus from 'components/Graphs/CriticalVulnerabilitiesByStatus'
import HighVulnerabilitiesByStatus from 'components/Graphs/HighVulnerabilitiesByStatus'
import KevVulnerabilitiesByStatus from 'components/Graphs/KevVulnerabilitiesByStatus'

import { useGlobalState } from 'hooks/useGlobalState'

function VulnerabilityGroup() {
  const { updateCards, selectedVulns } = useGlobalState()

  const [vulnCards, setVulnCards] = useState([
    {
      id: '1',
      type: 'all_vulns_by_severity',
      title: 'All Vulnerabilities by Severity',
      content: <AllVulnerabilitiesBySeverity />
    },
    {
      id: '2',
      type: 'all_vulns_by_status',
      title: 'All Vulnerabilities by Status',
      content: <AllVulnerabilitiesByStatus />
    },
    {
      id: '3',
      type: 'critical_vulns_by_status',
      title: 'Critical Vulnerabilities by Status',
      content: <CriticalVulnerabilitiesByStatus />
    },
    {
      id: '4',
      type: 'high_vulns_by_status',
      title: 'High Vulnerabilities by Status',
      content: <HighVulnerabilitiesByStatus />
    },
    {
      id: '5',
      type: 'kev_vulns_by_status',
      title: 'KEV Vulnerabilties by Status',
      content: <KevVulnerabilitiesByStatus />
    }
  ])

  const filteredVulnCards = useMemo(() => {
    return vulnCards.filter((card) => selectedVulns?.includes(card.type))
  }, [vulnCards, selectedVulns])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setVulnCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleDeleteCard = (key) => {
    const filteredItems = selectedVulns?.filter((item) => item !== key)
    updateCards(filteredItems, 'vulns')
  }

  if (filteredVulnCards?.length === 0) return null

  return (
    <Stack spacing={3}>
      <Heading size={'md'}>Vulnerability</Heading>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext
          items={filteredVulnCards}
          strategy={rectSortingStrategy}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {filteredVulnCards?.map((card) => (
              <DashboardCard
                key={card.id}
                id={card.id}
                type={card.type}
                title={card.title}
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

export default VulnerabilityGroup
