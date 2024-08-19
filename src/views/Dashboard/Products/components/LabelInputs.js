import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { getRandomColor, hexToRGBA } from 'utils'
import { tagColors } from 'variables/general'

import { AddIcon, EditIcon, RepeatIcon } from '@chakra-ui/icons'
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
  PopoverTrigger,
  SimpleGrid,
  Tag
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { LabelCreate, LabelUpdate } from 'graphQL/Mutation'

const LabelInputs = ({ activeRow, setActiveRow }) => {
  const { showToast } = useCustomToast()
  const randomColor = getRandomColor()
  const [labelData, setLabelData] = useState({
    id: 0,
    name: '',
    color: randomColor
  })

  const [createLabel] = useMutation(LabelCreate)
  const [updateLabel] = useMutation(LabelUpdate)

  const handleRefresh = () => {
    setLabelData((prev) => ({ ...prev, color: randomColor }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setLabelData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelect = (value) => {
    setLabelData((prev) => ({ ...prev, color: value }))
  }

  const handleCreate = () => {
    const { name, color } = labelData || ''
    createLabel({ variables: { name, color } }).then((res) => {
      const { errors } = res?.data?.labelCreate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        showToast({
          description: 'Label added successfully',
          status: 'success'
        })
        setLabelData({ id: 0, name: '', color: randomColor })
        setActiveRow(null)
      }
    })
  }

  const handleUpdate = () => {
    const { id, name, color } = labelData || ''
    updateLabel({
      variables: { id, name, color }
    }).then((res) => {
      const { errors } = res?.data?.labelUpdate || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      } else {
        showToast({
          description: 'Label updated successfully',
          status: 'success'
        })
        setLabelData({ id: 0, name: '', color: randomColor })
        setActiveRow(null)
      }
    })
  }

  useEffect(() => {
    if (activeRow) {
      const { id, name, color } = activeRow || ''
      setLabelData(() => ({ id, name, color }))
    }
  }, [activeRow])

  return (
    <Flex width='100%' gap={4} flexDir={'column'}>
      <Tag
        width={'fit-content'}
        borderColor={labelData?.color}
        bg={hexToRGBA(labelData?.color, 0.5)}
      >
        {labelData?.name !== '' ? labelData?.name : 'Label preview'}
      </Tag>
      <SimpleGrid columns={2} spacing={4}>
        <FormControl>
          <FormLabel htmlFor='name'>Label name</FormLabel>
          <Input
            name='name'
            fontSize='sm'
            maxLength={'15'}
            value={labelData?.name}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='color'>Color</FormLabel>
          <Flex gap={2} alignItems={'center'}>
            <IconButton icon={<RepeatIcon />} onClick={handleRefresh} />
            <Popover>
              <PopoverTrigger>
                <Input
                  name='color'
                  value={labelData?.color}
                  onChange={handleChange}
                />
              </PopoverTrigger>
              <PopoverContent w={'fit-content'}>
                <PopoverBody columns={6} spacing={2} as={SimpleGrid}>
                  {tagColors?.map((item, index) => (
                    <Box
                      p={3}
                      bg={item}
                      key={index}
                      borderRadius={3}
                      cursor='pointer'
                      onClick={() => handleSelect(item)}
                    />
                  ))}
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Flex>
          <Box position='absolute' top='100%' zIndex='1'></Box>
        </FormControl>
      </SimpleGrid>
      <Button
        fontSize={'sm'}
        variant='outline'
        colorScheme='blue'
        width={'fit-content'}
        leftIcon={activeRow ? <EditIcon /> : <AddIcon />}
        onClick={activeRow ? handleUpdate : handleCreate}
        isDisabled={labelData?.name === '' || labelData.color === ''}
      >
        {activeRow ? 'Update' : 'Add'} Label
      </Button>
    </Flex>
  )
}

export default LabelInputs
