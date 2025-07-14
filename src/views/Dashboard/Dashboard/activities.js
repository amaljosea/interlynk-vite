import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  restrictToHorizontalAxis,
  restrictToWindowEdges
} from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import React, { useMemo, useState } from 'react'

import { Grid, GridItem, Heading, Stack } from '@chakra-ui/react'

import { DashboardCard } from 'components/DashboardCard'

import { useGlobalState } from 'hooks/useGlobalState'

import ActivitiesOverview from './components/ActivitiesOverview'
import ProductsOverview from './components/ProductsOverview'

function Activities() {
  const { updateCards, selectedActivities } = useGlobalState()

  const [activityCards, setActivityCards] = useState([
    {
      id: '1',
      type: 'recent_imports',
      title: 'Latest Imports',
      content: <ProductsOverview />
    },
    {
      id: '2',
      type: 'recent_changes',
      title: 'Latest Changes',
      content: <ActivitiesOverview />
    }
  ])

  const filteredActivityCards = useMemo(() => {
    return activityCards.filter((card) =>
      selectedActivities?.includes(card.type)
    )
  }, [activityCards, selectedActivities])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setActivityCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleDeleteCard = (key) => {
    const filteredItems = selectedActivities?.filter((item) => item !== key)
    updateCards(filteredItems, 'activities')
  }

  if (filteredActivityCards?.length === 0) return null

  return (
    <Stack spacing={3}>
      <Heading size={'md'}>Activity</Heading>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis, restrictToWindowEdges]}
      >
        <SortableContext
          items={filteredActivityCards}
          strategy={rectSortingStrategy}
        >
          <Grid h={'100%'} templateColumns='repeat(12, 1fr)' gap={5}>
            {filteredActivityCards?.map((card) => (
              <GridItem
                w='100%'
                key={card.id}
                colSpan={card.type === 'recent_imports' ? 8 : 4}
              >
                <DashboardCard
                  key={card.id}
                  id={card.id}
                  type={card.type}
                  title={card.title}
                  content={card.content}
                  onDelete={handleDeleteCard}
                />
              </GridItem>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>
    </Stack>
  )
}

export default Activities
