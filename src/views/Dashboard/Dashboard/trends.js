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
import DefectDensity from 'components/Graphs/DefectDensity'
import IdentityVelocity from 'components/Graphs/IdentificationVelocity'
import PatchVelocity from 'components/Graphs/PatchVelocity'
import VulnAge from 'components/Graphs/VulnAge'
import VulnBySeverity from 'components/Graphs/VulnBySeverity'
import VulnByStatus from 'components/Graphs/VulnByStatus'

import { useGlobalState } from 'hooks/useGlobalState'

import { LuLayoutGrid, LuLayoutList, LuPlus } from 'react-icons/lu'

function VulnerabilityTrendsGroup() {
  const { selectedTrends } = useGlobalState()

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
      content: <DefectDensity />
    },
    {
      id: '4',
      key: 'resolution_age',
      title: 'Resolution Age',
      desc: 'Total number of days all vulnerabilities are present before resolution',
      content: <VulnAge />
    },
    {
      id: '5',
      key: 'resotion_velocity',
      title: 'Resolution Velocity',
      desc: 'Average number of days a vulnerability is present before resolution',
      content: <IdentityVelocity />
    },
    {
      id: '6',
      key: 'patch_velocity',
      title: 'Patch Velocity',
      desc: 'Duration from vulnerability identification to when it is updated or patched',
      content: <PatchVelocity />
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

  const handleAddCard = () => {
    const newCard = {
      id: Date.now().toString(),
      title: 'New Card',
      content: 'Add your content here'
    }
    setTrendCards([...trendCards, newCard])
  }

  const handleDeleteCard = (id) => {
    setTrendCards(trendCards?.filter((card) => card.id !== id))
  }

  if (filteredTrendCards?.length === 0) return null

  return (
    <Box>
      <Flex justify='space-between' align='center' mb={4}>
        <Heading size={'md'}>Vulnerability Trends</Heading>
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
                id={card.id}
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
    </Box>
  )
}

export default VulnerabilityTrendsGroup
