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

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  IconButton,
  SimpleGrid
} from '@chakra-ui/react'

import { DashboardCard } from 'components/DashboardCard'
import AllVulnerabilitiesBySeverity from 'components/Graphs/AllVulnerabilitiesBySeverity'
import AllVulnerabilitiesByStatus from 'components/Graphs/AllVulnerabilitiesByStatus'
import CriticalVulnerabilitiesByStatus from 'components/Graphs/CriticalVulnerabilitiesByStatus'
import HighVulnerabilitiesByStatus from 'components/Graphs/HighVulnerabilitiesByStatus'
import KevVulnerabilitiesByStatus from 'components/Graphs/KevVulnerabilitiesByStatus'

import { useGlobalState } from 'hooks/useGlobalState'

import { LuLayoutGrid, LuLayoutList, LuPlus } from 'react-icons/lu'

function VulnerabilityGroup() {
  const { selectedVulns } = useGlobalState()

  const [vulnCards, setVulnCards] = useState([
    {
      id: '1',
      key: 'all_vulns_by_severity',
      title: 'All Vulnerabilities by Severity',
      content: <AllVulnerabilitiesBySeverity />
    },
    {
      id: '2',
      key: 'all_vulns_by_status',
      title: 'All Vulnerabilities by Status',
      content: <AllVulnerabilitiesByStatus />
    },
    {
      id: '3',
      key: 'critical_vulns_by_status',
      title: 'Critical Vulnerabilities by Status',
      content: <CriticalVulnerabilitiesByStatus />
    },
    {
      id: '4',
      key: 'high_vulns_by_status',
      title: 'High Vulnerabilities by Status',
      content: <HighVulnerabilitiesByStatus />
    },
    {
      id: '5',
      key: 'kev_vulns_by_status',
      title: 'KEV Vulnerabilties by Status',
      content: <KevVulnerabilitiesByStatus />
    }
  ])
  const [isGridLayout, setIsGridLayout] = useState(true)

  const filteredVulnCards = useMemo(() => {
    return vulnCards.filter((card) => selectedVulns.includes(card.key))
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

  const handleAddCard = () => {
    const newCard = {
      id: Date.now().toString(),
      title: 'New Card',
      content: 'Add your content here'
    }
    setVulnCards([...vulnCards, newCard])
  }

  const handleDeleteCard = (id) => {
    setVulnCards(vulnCards?.filter((card) => card.id !== id))
  }

  if (filteredVulnCards?.length === 0) return null

  return (
    <Box>
      <Flex justify='space-between' align='center' mb={4}>
        <Heading size={'md'}>Vulnerabilities</Heading>
        <Flex gap={4} hidden>
          <ButtonGroup size='md' isAttached variant='outline'>
            <IconButton
              aria-label='Grid Layout'
              icon={<LuLayoutGrid />}
              onClick={() => setIsGridLayout(true)}
              colorScheme={isGridLayout ? 'blue' : 'gray'}
            />
            <IconButton
              aria-label='List Layout'
              icon={<LuLayoutList />}
              onClick={() => setIsGridLayout(false)}
              colorScheme={!isGridLayout ? 'blue' : 'gray'}
            />
          </ButtonGroup>
          <Button
            fontSize={'sm'}
            leftIcon={<LuPlus />}
            colorScheme='blue'
            onClick={handleAddCard}
          >
            Add Card
          </Button>
        </Flex>
      </Flex>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredVulnCards}
          strategy={rectSortingStrategy}
        >
          <SimpleGrid
            columns={isGridLayout ? { base: 1, md: 2, lg: 3 } : 1}
            spacing={5}
          >
            {filteredVulnCards?.map((card) => (
              <DashboardCard
                key={card.id}
                id={card.id}
                title={card.title}
                content={card.content}
                onDelete={handleDeleteCard}
                isGridLayout={isGridLayout}
              />
            ))}
          </SimpleGrid>
        </SortableContext>
      </DndContext>
    </Box>
  )
}

export default VulnerabilityGroup
