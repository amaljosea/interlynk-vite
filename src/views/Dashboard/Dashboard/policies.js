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

import { useGlobalState } from 'hooks/useGlobalState'

import { LuLayoutGrid, LuLayoutList, LuPlus } from 'react-icons/lu'

import PolicyGraphs from './components/category/PolicyGraphs'

function PolicyGroup() {
  const { selectedPolicies } = useGlobalState()

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

  const handleAddCard = () => {
    const newCard = {
      id: Date.now().toString(),
      title: 'New Card',
      content: 'Add your content here'
    }
    setPolicyCards([...policyCards, newCard])
  }

  const handleDeleteCard = (id) => {
    setPolicyCards(policyCards?.filter((card) => card.id !== id))
  }

  if (filteredPolicyCards?.length === 0) return null

  return (
    <Box>
      <Flex justify='space-between' align='center' mb={4}>
        <Heading size={'md'}>Policies</Heading>
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

export default PolicyGroup
