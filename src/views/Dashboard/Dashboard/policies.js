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

import { useGlobalState } from 'hooks/useGlobalState'

import PolicyGraphs from './components/category/PolicyGraphs'

function PolicyGroup() {
  const { selectedPolicies, setSelectedPolicies } = useGlobalState()

  const [policyCards, setPolicyCards] = useState([
    {
      id: '1',
      key: 'policy_results',
      title: 'Policy Results',
      content: <PolicyGraphs />
    }
  ])
  const [isGridLayout, setIsGridLayout] = useState(true)

  const filteredPolicyCards = useMemo(() => {
    return policyCards.filter((card) => selectedPolicies.includes(card.key))
  }, [policyCards, selectedPolicies])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPolicyCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleDeleteCard = (key) => {
    setSelectedPolicies(selectedPolicies?.filter((item) => item !== key))
  }

  if (filteredPolicyCards?.length === 0) return null

  return (
    <Stack spacing={3}>
      <Heading size={'md'}>Policies</Heading>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredPolicyCards}
          strategy={rectSortingStrategy}
        >
          <SimpleGrid
            columns={isGridLayout ? { base: 1, md: 2, lg: 3 } : 1}
            spacing={5}
          >
            {filteredPolicyCards?.map((card) => (
              <DashboardCard
                key={card.id}
                id={card.key}
                title={card.title}
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

export default PolicyGroup
