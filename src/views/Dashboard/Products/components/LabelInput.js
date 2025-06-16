import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'

import { Checkbox, Divider, Flex, Text } from '@chakra-ui/react'

import ProdLabel from 'components/Label/ProdLabel'

import { useThemeColor } from 'hooks/useThemeColors'

import { UpdateProjectGroup } from 'graphQL/Mutation'

const LabelInput = ({ data, setOpen, onOpenLabel, nodes }) => {
  const { id: prodId, name, desc, labels } = data || {}
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup, {
    refetchQueries: ['GetProductTable']
  })

  const { primaryBlueText, sameSecondaryText } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText'
  ])

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
        labelIds: result?.length > 0 ? result : ''
      }
    }).then((res) => {
      const error = res?.data?.projectGroupUpdate?.errors
      if (error?.length > 0) {
        console.warn(res.data.projectGroupUpdate.errors[0])
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
              data-testid='label_item'
              isChecked={selectedLabels?.includes(row?.id)}
              onChange={() => addLabels(row?.id)}
            />
            <ProdLabel item={row} />
          </Flex>
        ))}
      </Flex>
      <Flex width={'100%'} flexDir={'column'} hidden={nodes?.length > 0}>
        <Text fontSize={'sm'} p={4} color={sameSecondaryText}>
          No Labels Present
        </Text>
        <Divider />
        <Text
          py={3}
          pl={4}
          fontSize={'sm'}
          cursor={'pointer'}
          color={primaryBlueText}
          onClick={() => {
            setOpen(false)
            onOpenLabel()
          }}
        >
          Create Label
        </Text>
      </Flex>
    </>
  )
}

export default LabelInput
