import React, { useState } from 'react'
import { generateRandomColor } from 'utils'
import { tagColors } from 'variables/general'

import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  SimpleGrid,
  usePopoverContext
} from '@chakra-ui/react'

import ProdLabel from './ProdLabel'

const LabelCreator = ({ onAddLabel }) => {
  const [name, setName] = useState('')
  const [previewColor, setPreviewColor] = useState(generateRandomColor())

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      const newLabel = {
        id: Date.now(),
        name: name.trim(),
        color: previewColor,
        createdAt: new Date().toISOString()
      }
      onAddLabel(newLabel)
      setName('')
      setPreviewColor(generateRandomColor())
    }
  }

  const handleNewColor = () => {
    setPreviewColor(generateRandomColor())
  }

  return (
    <Flex width='100%' gap={4} flexDir={'column'}>
      <ProdLabel
        item={{ color: previewColor, name: name || 'Label Preview' }}
      />
      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={2} spacing={4}>
          <FormControl>
            <FormLabel htmlFor='name'>Label name</FormLabel>
            <Input
              value={name}
              name='name'
              fontSize='sm'
              maxLength={'32'}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='color'>Color</FormLabel>
            <Flex gap={2} alignItems={'center'}>
              <IconButton icon={<RepeatIcon />} onClick={handleNewColor} />
              <Popover>
                <PopoverTrigger>
                  <Input
                    name='color'
                    value={previewColor}
                    onChange={(e) => setPreviewColor(e.target.value)}
                  />
                </PopoverTrigger>
                <PopoverContent w={'fit-content'}>
                  <PopoverHeader fontSize={'xs'}>
                    Choose from default color
                  </PopoverHeader>
                  <PopoverBody>
                    <ColorBoxes setColor={setPreviewColor} />
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Flex>
            <Box position='absolute' top='100%' zIndex='1'></Box>
          </FormControl>
        </SimpleGrid>
        <Button
          type='submit'
          variant='outline'
          colorScheme='blue'
          leftIcon={<AddIcon />}
          isDisabled={name === '' || previewColor === ''}
          sx={{ mt: 4, w: 'fit-content', fontSize: 'sm' }}
        >
          Add Label
        </Button>
      </form>
    </Flex>
  )
}

const ColorBoxes = ({ setColor }) => {
  const { onClose } = usePopoverContext()
  return (
    <SimpleGrid columns={6} spacing={2}>
      {tagColors?.map((item, index) => (
        <Box
          bg={item}
          key={index}
          onClick={() => {
            setColor(item)
            onClose()
          }}
          sx={{ p: 3, cursor: 'pointer', borderRadius: 3 }}
        />
      ))}
    </SimpleGrid>
  )
}

export default LabelCreator
