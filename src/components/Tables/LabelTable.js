import { useMutation, useQuery } from '@apollo/client'
import React, { useRef, useState } from 'react'
import { hexToRGBA } from 'utils'
import LabelInputs from 'views/Dashboard/Products/components/LabelInputs'

import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Divider,
  Flex,
  IconButton,
  Stack,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Tr,
  useColorModeValue
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import useCustomToast from 'hooks/useCustomToast'

import { LabelDelete } from 'graphQL/Mutation'
import { GetLabels } from 'graphQL/Queries'

const LabelTable = ({ isOpen }) => {
  const { showToast } = useCustomToast()
  const borderColor = useColorModeValue('gray.800', 'gray.200')
  const [activeRow, setActiveRow] = useState(null)

  const divRef = useRef(null)
  const scrollToDiv = () => {
    if (divRef?.current) {
      divRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const { data, loading } = useQuery(GetLabels, {
    skip: isOpen ? false : true,
    variables: { first: 500 }
  })

  const { nodes, totalCount } = data?.labels || ''

  const [deleteLabel] = useMutation(LabelDelete)

  const onEdit = (row) => {
    scrollToDiv()
    setActiveRow(row)
  }

  const onDelete = (row) => {
    deleteLabel({ variables: { id: row?.id } }).then((res) => {
      const { errors } = res?.data?.labelDelete || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
      }
    })
  }

  const Header = () => {
    return (
      <Flex width={'100%'} flexDir={'column'} justifyContent={'space-between'}>
        <LabelInputs setActiveRow={setActiveRow} activeRow={activeRow} />
      </Flex>
    )
  }

  if (loading)
    return (
      <Stack px={6}>
        <CustomLoader />
      </Stack>
    )

  return (
    <Stack width={'100%'} spacing={4} px={6} py={0} ref={divRef}>
      <Header />
      <Divider />
      <TableContainer>
        <Text fontSize={'sm'} color={'gray.500'}>
          {totalCount} Labels
        </Text>
        <Table mt={2} size='sm' variant='simple'>
          <Tbody>
            {nodes?.map((row, index) => (
              <Tr key={index}>
                <Td pl={0}>
                  <Tag
                    py={1}
                    size='sm'
                    width={'fit-content'}
                    borderColor={row?.color}
                    bg={hexToRGBA(row?.color, 0.5)}
                  >
                    {row?.name}
                  </Tag>
                </Td>
                <Td isNumeric pr={0}>
                  <Flex
                    gap={2}
                    alignItems={'center'}
                    justifyContent={'flex-end'}
                  >
                    <IconButton
                      size='sm'
                      variant='outline'
                      icon={<EditIcon color={borderColor} />}
                      onClick={() => onEdit(row)}
                    />
                    <IconButton
                      size='sm'
                      variant='outline'
                      icon={<DeleteIcon color={'red.500'} />}
                      onClick={() => onDelete(row)}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

export default LabelTable
