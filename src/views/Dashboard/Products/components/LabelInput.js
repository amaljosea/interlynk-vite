import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { hexToRGBA } from 'utils'

import { Button, Checkbox, Divider, Flex, Tag, Text } from '@chakra-ui/react'

import { UpdateProjectGroup } from 'graphQL/Mutation'
import { GetLabels } from 'graphQL/Queries'

const LabelInput = ({ data, setOpen, onOpenLabel }) => {
  const { id: prodId, name, desc, labels } = data || ''
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup)

  const { data: prodLabels, loading } = useQuery(GetLabels, {
    variables: { first: 100 }
  })
  const { nodes } = prodLabels?.labels || ''

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

  if (loading) return false

  return (
    <>
      <Flex
        px={3}
        py={5}
        gap={4}
        minH={'auto'}
        maxH={'250px'}
        flexDir={'column'}
        overflow={'hidden'}
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
      <Flex
        width={'100%'}
        flexDir={'column'}
        alignItems={'center'}
        hidden={nodes?.length > 0}
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
    </>
  )
}

export default LabelInput
