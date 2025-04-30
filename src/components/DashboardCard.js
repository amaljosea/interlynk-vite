import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import { useLocation } from 'react-router-dom'

import {
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Text
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuGripVertical, LuX } from 'react-icons/lu'

export function DashboardCard({ id, type, title, content, desc, onDelete }) {
  const location = useLocation()

  const isAnalytics = location.pathname === '/vendor/analytics'

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const isActivities = type === 'recent_changes' || type === 'recent_imports'

  const { lightAndDarkBgColor } = useThemeColor(['lightAndDarkBgColor'])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  if (!content) return null

  return (
    <Card
      style={style}
      rounded='lg'
      ref={setNodeRef}
      overflow={'hidden'}
      bg={lightAndDarkBgColor}
    >
      <CardHeader h={desc ? '24' : 'auto'}>
        <Flex justify='space-between' align='center' mb={2}>
          <Flex align='center'>
            <IconButton
              {...attributes}
              {...listeners}
              cursor='grab'
              variant='ghost'
              _hover={{ bg: 'none' }}
              aria-label='Drag handle'
              icon={<LuGripVertical />}
              _active={{ cursor: 'grabbing' }}
              hidden={isAnalytics || isActivities}
            />
            <Heading size='sm'>{title}</Heading>
          </Flex>
          <IconButton
            aria-label='Delete card'
            icon={<LuX />}
            variant='ghost'
            hidden={isAnalytics}
            onClick={() => onDelete(type)}
            _hover={{ bg: 'none' }}
          />
        </Flex>
        {desc && <Text fontSize='sm'>{desc}</Text>}
      </CardHeader>
      <CardBody pt={isActivities ? 0 : 'auto'} pb={8} h='fit-content'>
        {content}
      </CardBody>
    </Card>
  )
}
