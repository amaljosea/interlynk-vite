import { useMutation, useQuery } from '@apollo/client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { hexToRGBA } from 'utils'

import { Button, Checkbox, Divider, Flex, Tag, Text } from '@chakra-ui/react'

import { UpdateProjectGroup } from 'graphQL/Mutation'
import { GetLabels } from 'graphQL/Queries'

const LabelInput = ({ data, setOpen, onOpenLabel }) => {
  const { id, name, desc, labels } = data || ''
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup)

  const { data: prodLabels } = useQuery(GetLabels, {
    variables: { first: 100 }
  })
  const { nodes } = prodLabels?.labels || ''

  const inputRef = useRef()
  const [selectedLabels, setSelectedLabels] = useState([])

  const addLabels = (id) => {
    if (selectedLabels?.includes(id)) {
      const result = selectedLabels?.filter((label) => label !== id)
      setSelectedLabels(result)
    } else {
      setSelectedLabels((prev) => [id, ...prev])
    }
  }

  const updateProduct = useCallback(() => {
    projectGroupUpdate({
      variables: {
        id,
        name,
        desc,
        labelIds: selectedLabels
      }
    }).then((res) => {
      const error = res?.data?.projectGroupUpdate?.errors
      if (error?.length > 0) {
        console.log(res.data.projectGroupUpdate.errors[0])
      } else {
        setOpen(false)
      }
    })
  }, [desc, id, name, projectGroupUpdate, selectedLabels, setOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        updateProduct()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [inputRef, labels?.length, selectedLabels?.length, setOpen, updateProduct])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        updateProduct()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [updateProduct])

  useEffect(() => {
    if (labels?.length > 0) {
      const result = labels?.map((item) => item?.id)
      setSelectedLabels(result)
    } else {
      setSelectedLabels([])
    }
  }, [labels])

  if (nodes?.length > 0) {
    return (
      <Flex
        px={3}
        py={5}
        gap={4}
        ref={inputRef}
        minH={'auto'}
        maxH={'250px'}
        flexDir={'column'}
        overflow={'hidden'}
        overflowY={'scroll'}
        alignItems={'flex-start'}
      >
        {nodes?.map((row, index) => (
          <Flex alignItems={'center'} gap={2} key={index}>
            <Checkbox
              ml={1}
              isChecked={selectedLabels?.includes(row?.id)}
              onChange={() => addLabels(row?.id)}
            />
            <Tag
              py={1}
              size='sm'
              width={'fit-content'}
              borderColor={row?.color}
              bg={hexToRGBA(row?.color, 0.5)}
            >
              {row?.name}
            </Tag>
          </Flex>
        ))}
      </Flex>
    )
  }

  return (
    <Flex
      width={'100%'}
      ref={inputRef}
      flexDir={'column'}
      alignItems={'center'}
    >
      <Text py={5} color={'gray.500'}>
        No Labels Present
      </Text>
      <Divider />
      <Button
        my={1}
        w={'100%'}
        color={'blue.500'}
        variant='unstyled'
        onClick={() => {
          setOpen(false)
          onOpenLabel()
        }}
      >
        Create Label
      </Button>
    </Flex>
  )
}

export default LabelInput
