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
import { setItem } from 'utils/localStorageUtils'

import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'

import { DashboardCard } from 'components/DashboardCard'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'

import ProductLabels from './components/ProductLabels'
import ProductLifestages from './components/ProductLifestages'
import VersionLifestages from './components/VersionLifestage'

function ProductGroup() {
  const { updateCards, selectedProducts, setSelectedProducts } =
    useGlobalState()
  const { isFreeTier } = useGlobalQueryContext()

  const [productCards, setProductCards] = useState([
    {
      id: '1',
      type: 'products_by_lifestages',
      title: 'Products by Lifestages',
      content: <ProductLifestages />
    },
    {
      id: '2',
      type: 'versions_by_lifestages',
      title: 'Versions by Lifestages',
      content: <VersionLifestages />
    },
    {
      id: '3',
      type: 'products_by_labels',
      title: 'Products by Label',
      content: !isFreeTier ? <ProductLabels /> : null
    }
  ])
  const [isGridLayout, setIsGridLayout] = useState(true)

  const filteredProductCards = useMemo(() => {
    return productCards.filter((card) => selectedProducts.includes(card.type))
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

  const handleDeleteCard = (key) => {
    const filteredItems = selectedProducts?.filter((item) => item !== key)
    setSelectedProducts(filteredItems)
    updateCards(filteredItems, 'products')
  }

  if (filteredProductCards?.length === 0) return null

  return (
    <Stack spacing={3}>
      <Heading size={'md'}>Product</Heading>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis, restrictToWindowEdges]}
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
                type={card.type}
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

export default ProductGroup
