import { useState } from 'react'
import { generateRandomColor, hexToRGBA } from 'utils/styleUtils'

import {
  CheckIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
  RepeatIcon
} from '@chakra-ui/icons'
import { Flex, IconButton, Stack, Text } from '@chakra-ui/react'
import { Divider, Input, Spacer } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useThemeColor } from 'hooks/useThemeColors'

import ProdLabel from './ProdLabel'

const LabelList = ({ loading, labels, onDeleteLabel, onEditLabel }) => {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const { sameSecondaryText, primaryErrorColor } = useThemeColor([
    'sameSecondaryText',
    'primaryErrorColor'
  ])

  const startEditing = (label) => {
    setEditingId(label.id)
    setEditName(label.name)
    setEditColor(label.color)
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  const saveEdit = (id) => {
    onEditLabel({ id, name: editName, color: editColor })
    setEditingId(null)
  }

  const handleNewColor = () => {
    setEditColor(generateRandomColor())
  }

  const sortedLabels = [...labels].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (loading) return <CustomLoader />

  return (
    <Stack mt={4}>
      <Text fontSize={'sm'} color={sameSecondaryText}>
        {labels?.length} Labels
      </Text>
      <Stack pt={4} spacing={3}>
        {sortedLabels?.map((label, index) => (
          <Flex flexDir={'column'} key={label.id}>
            <Flex
              justifyContent='space-between'
              sx={{ gap: 2, alignItems: 'center' }}
            >
              {editingId === label.id ? (
                <Flex
                  sx={{ w: '100%', gap: 2, justifyContent: 'space-between' }}
                >
                  <Flex gap={1} alignItems={'center'}>
                    <Input
                      size='sm'
                      type='text'
                      w={'fit-content'}
                      value={editName}
                      maxLength={'20'}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <Input
                      size='sm'
                      w={'100px'}
                      value={editColor}
                      bg={hexToRGBA(editColor, 0.2)}
                      onChange={(e) => setEditColor(e.target.value)}
                    />
                  </Flex>

                  <Flex gap={2}>
                    <IconButton
                      size='sm'
                      colorScheme='blue'
                      onClick={handleNewColor}
                      title='Generate new color'
                      icon={<RepeatIcon size={18} />}
                    />

                    <IconButton
                      size='sm'
                      colorScheme='green'
                      title='Save changes'
                      icon={<CheckIcon size={18} />}
                      onClick={() => saveEdit(label.id)}
                    />

                    <IconButton
                      size='sm'
                      colorScheme='red'
                      title='Cancel editing'
                      onClick={cancelEditing}
                      icon={<CloseIcon fontSize={12} />}
                      className='text-red-500 hover:text-red-700 focus:outline-none'
                    />
                  </Flex>
                </Flex>
              ) : (
                <Flex
                  sx={{
                    w: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <ProdLabel item={label} />
                  <Flex gap={2} alignItems={'center'}>
                    <IconButton
                      size='sm'
                      icon={<EditIcon size={18} />}
                      onClick={() => startEditing(label)}
                      className='text-blue-500 hover:text-blue-700 focus:outline-none mr-2'
                      title='Edit label'
                    />

                    <IconButton
                      size='sm'
                      icon={<DeleteIcon size={18} color={primaryErrorColor} />}
                      onClick={() => onDeleteLabel(label.id)}
                      className='text-red-500 hover:text-red-700 focus:outline-none'
                      title='Delete label'
                    />
                  </Flex>
                </Flex>
              )}
            </Flex>
            <Divider mt={3} hidden={index + 1 === labels?.length} />
          </Flex>
        ))}
      </Stack>
      <Spacer />
    </Stack>
  )
}

export default LabelList
