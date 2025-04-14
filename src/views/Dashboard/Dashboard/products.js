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

import ProductLabels from './components/ProductLabels'
import ProductLifestages from './components/ProductLifestages'
import VersionLifestages from './components/VersionLifestage'

function ProductGroup() {
  const { selectedProducts } = useGlobalState()

  const [productCards, setProductCards] = useState([
    {
      id: '1',
      key: 'products_by_lifestages',
      title: 'Products by Lifestages',
      content: <ProductLifestages />
    },
    {
      id: '2',
      key: 'versions_by_lifestages',
      title: 'Versions by Lifestages',
      content: <VersionLifestages />
    },
    {
      id: '3',
      key: 'products_by_labels',
      title: 'Products by Label',
      content: <ProductLabels />
    }
  ])
  const [isGridLayout, setIsGridLayout] = useState(true)

  const filteredProductCards = useMemo(() => {
    return productCards.filter((card) => selectedProducts.includes(card.key))
  }, [productCards, selectedProducts])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setProductCards((items) => {
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
    setProductCards([...productCards, newCard])
  }

  const handleDeleteCard = (id) => {
    setProductCards(productCards?.filter((card) => card.id !== id))
  }

  if (filteredProductCards?.length === 0) return null

  return (
    <Box>
      <Flex justify='space-between' align='center' mb={4}>
        <Heading size={'md'}>Products</Heading>
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
          items={filteredProductCards}
          strategy={rectSortingStrategy}
        >
          <SimpleGrid
            columns={isGridLayout ? { base: 1, md: 2, lg: 3 } : 1}
            spacing={5}
          >
            {filteredProductCards.map((card) => (
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

export default ProductGroup
