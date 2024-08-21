import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { hexToRGBA } from 'utils'

import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Skeleton,
  Tag,
  Text
} from '@chakra-ui/react'

import { UpdateProjectGroup } from 'graphQL/Mutation'

const LabelInput = ({ data, setOpen, onOpenLabel, nodes }) => {
  const { id: prodId, name, desc, labels } = data || ''
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup)

  const [selectedLabels, setSelectedLabels] = useState([])

  const addLabels = (id) => {
    let result = []
    if (selectedLabels?.includes(id)) {
      result = selectedLabels?.filter((label) => label !== id)
      setSelectedLabels(result)
    } else {
      result = [id, ...selectedLabels]
      setSelectedLabels((prev) => [id, ...prev])
    }
    projectGroupUpdate({
      variables: {
        id: prodId,
        name,
        desc,
        labelIds: result
      }
    }).then((res) => {
      const error = res?.data?.projectGroupUpdate?.errors
      if (error?.length > 0) {
        console.log(res.data.projectGroupUpdate.errors[0])
      }
    })
  }

  useEffect(() => {
    if (labels?.length > 0) {
      const result = labels?.map((item) => item?.id)
      setSelectedLabels(result)
    } else {
      setSelectedLabels([])
    }
  }, [labels])

  return (
    <>
      <Flex
        px={3}
        py={5}
        gap={4}
        minH={'auto'}
        maxH={'250px'}
        flexDir={'column'}
        overflowY={'scroll'}
        alignItems={'flex-start'}
        hidden={nodes?.length === 0}
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
      <Flex width={'100%'} flexDir={'column'} hidden={nodes?.length > 0}>
        <Text p={4} color={'gray.500'}>
          No Labels Present
        </Text>
        <Divider />
        <Button
          pl={4}
          w={'100%'}
          textAlign={'left'}
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
    </>
  )
}

export default LabelInput
