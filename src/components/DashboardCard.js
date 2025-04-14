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

export function DashboardCard({
  id,
  title,
  content,
  desc,
  onDelete,
  isGridLayout
}) {
  const location = useLocation()

  const isAnalytics = location.pathname === '/vendor/analytics'

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const { lightAndDarkBgColor } = useThemeColor(['lightAndDarkBgColor'])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <Card ref={setNodeRef} style={style} rounded='lg' bg={lightAndDarkBgColor}>
      <CardHeader h={'24'}>
        <Flex justify='space-between' align='center' mb={2}>
          <Flex align='center'>
            <IconButton
              {...attributes}
              {...listeners}
              aria-label='Drag handle'
              icon={<LuGripVertical />}
              variant='ghost'
              cursor='grab'
              _hover={{ bg: 'none' }}
              hidden={isAnalytics}
              _active={{ cursor: 'grabbing' }}
            />
            <Heading size='md'>{title}</Heading>
          </Flex>
          <IconButton
            aria-label='Delete card'
            icon={<LuX />}
            variant='ghost'
            colorScheme='red'
            hidden={isAnalytics}
            onClick={() => onDelete(id)}
            _hover={{ bg: 'none' }}
          />
        </Flex>
        <Text fontSize='sm'>{desc}</Text>
      </CardHeader>
      <CardBody pb={8} h='fit-content'>{content}</CardBody>
    </Card>
  )
}
