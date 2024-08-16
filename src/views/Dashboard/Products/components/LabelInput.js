import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { hexToRGBA, truncatedValue } from 'utils'

import {
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Tag,
  Text
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import useCustomToast from 'hooks/useCustomToast'

import { UpdateProjectGroup } from 'graphQL/Mutation'
import { GetLabels } from 'graphQL/Queries'

const LabelInput = ({ data, setOpen }) => {
  const { id, name, desc, labels } = data || ''
  const { showToast } = useCustomToast()
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup)

  const { data: prodLabels, loading } = useQuery(GetLabels, {
    variables: { first: 100 }
  })
  const { nodes } = prodLabels?.labels || ''

  const [selectedLabels, setSelectedLabels] = useState([])

  const addLabels = (id) => {
    if (selectedLabels?.includes(id)) {
      const result = selectedLabels?.filter((label) => label !== id)
      setSelectedLabels(result)
    } else {
      setSelectedLabels((prev) => [id, ...prev])
    }
  }

  const updateProduct = () => {
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
        showToast({ description: 'Label added successfully' })
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
    <Flex
      p={3}
      flexDir={'column'}
      alignItems={'flex-start'}
      gap={4}
      overflow={'hidden'}
    >
      <FormControl>
        <FormLabel>{truncatedValue(name, 30)}</FormLabel>
        <FormHelperText>Apply Labels</FormHelperText>
      </FormControl>
      <Divider />
      <Flex
        gap={4}
        w={'100%'}
        minH={'auto'}
        maxH={'250px'}
        flexDir={'column'}
        overflowY={'scroll'}
        alignItems={'flex-start'}
      >
        {loading && <CustomLoader />}
        {nodes?.length === 0 ? (
          <Text>Labels not exists</Text>
        ) : (
          nodes?.map((row, index) => (
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
          ))
        )}
      </Flex>
      <Divider hidden={nodes?.length === 0} />
      <ButtonGroup ml={'auto'} hidden={nodes?.length === 0}>
        <Button variant='ghost' fontSize={'sm'} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          fontSize='sm'
          variant='outline'
          colorScheme='blue'
          onClick={updateProduct}
        >
          Save
        </Button>
      </ButtonGroup>
    </Flex>
  )
}

export default LabelInput
