import { useMutation, useQuery } from '@apollo/client'
import React, { useRef, useState } from 'react'
import { hexToRGBA } from 'utils'
import LabelInputs from 'views/Dashboard/Products/components/LabelInputs'

import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Button,
  ButtonGroup,
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
  Tr
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { LabelDelete } from 'graphQL/Mutation'
import { GetLabels } from 'graphQL/Queries'

const LabelTable = ({ isOpen }) => {
  const { showToast } = useCustomToast()
  const [disabled, setDisabled] = useState(false)
  const [activeRow, setActiveRow] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { primaryErrorColor, primaryTextColor } = useThemeColor([
    'primaryErrorColor',
    'primaryTextColor'
  ])

  const disableButtonTemporarily = () => {
    setDisabled(true)
    setTimeout(() => {
      setDisabled(false)
    }, 3000)
  }

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
    disableButtonTemporarily()
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
                  {deleteItem?.name === row?.name ? (
                    <ButtonGroup>
                      <Button
                        size='sm'
                        fontSize={'sm'}
                        variant='outline'
                        onClick={() => setDeleteItem(null)}
                      >
                        No
                      </Button>
                      <Button
                        size='sm'
                        fontSize={'sm'}
                        variant='outline'
                        colorScheme='red'
                        isDisabled={disabled}
                        onClick={() => onDelete(row)}
                      >
                        Yes
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <ButtonGroup>
                      <IconButton
                        size='sm'
                        variant='outline'
                        icon={<EditIcon color={primaryTextColor} />}
                        onClick={() => onEdit(row)}
                      />
                      <IconButton
                        size='sm'
                        variant='outline'
                        icon={<DeleteIcon color={primaryErrorColor} />}
                        onClick={() => setDeleteItem(row)}
                      />
                    </ButtonGroup>
                  )}
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
