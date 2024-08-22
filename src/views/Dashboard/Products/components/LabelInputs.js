import { useMutation } from '@apollo/client'
import React, { useCallback, useEffect, useState } from 'react'
import { hexToRGBA } from 'utils'
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
  const setData = useCallback(() => {
    const getLightValue = () => Math.floor(Math.random() * 128) + 128
    const r = getLightValue().toString(16).padStart(2, '0')
    const g = getLightValue().toString(16).padStart(2, '0')
    const b = getLightValue().toString(16).padStart(2, '0')
    setLabelData((prev) => ({ ...prev, color: `#${r}${g}${b}` }))
  }, [])

  const { showToast } = useCustomToast()
  const [labelData, setLabelData] = useState({
    id: 0,
    name: '',
    color: '#90b2e1'
  })

  const [createLabel] = useMutation(LabelCreate)
  const [updateLabel] = useMutation(LabelUpdate)

  const handleChange = (e) => {
    const { name, value } = e.target
    setLabelData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelect = (value) => {
    setLabelData((prev) => ({ ...prev, color: value }))
  }

  const handleCreate = (e) => {
    e.preventDefault()
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
        setLabelData({ id: 0, name: '', color: '#90b2e1' })
        setActiveRow(null)
      }
    })
  }

  const handleUpdate = (e) => {
    e.preventDefault()
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
        setLabelData({ id: 0, name: '', color: '#90b2e1' })
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
      <form onSubmit={activeRow ? handleUpdate : handleCreate}>
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
              <IconButton icon={<RepeatIcon />} onClick={setData} />
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
          mt={4}
          type='submit'
          fontSize={'sm'}
          variant='outline'
          colorScheme='blue'
          width={'fit-content'}
          leftIcon={activeRow ? <EditIcon /> : <AddIcon />}
          isDisabled={labelData?.name === '' || labelData.color === ''}
        >
          {activeRow ? 'Update' : 'Add'} Label
        </Button>
      </form>
    </Flex>
  )
}

export default LabelInputs
