import { useMutation } from '@apollo/client'
import React, { useCallback, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, hexToRGBA, timeSince } from 'utils'
import LabelInputs from 'views/Dashboard/Products/components/LabelInputs'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Stack,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
  useToast
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { LabelDelete } from 'graphQL/Mutation'
import { GetLabels } from 'graphQL/Queries'

const LabelTable = ({ isOpen }) => {
  const toast = useToast()
  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const borderColor = useColorModeValue('gray.800', 'gray.200')
  const [edit, setEdit] = useState(false)
  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState('')

  const divRef = useRef(null)
  const scrollToDiv = () => {
    if (divRef?.current) {
      divRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const { nodes, paginationProps, loading } = usePaginatatedQuery(GetLabels, {
    skip: isOpen ? false : true,
    selector: 'labels'
  })

  const [deleteLabel] = useMutation(LabelDelete)

  const handleClear = useCallback(async () => {
    setFilterText('')
  }, [])

  const onSearchInputChange = useCallback(
    (event) => {
      const { value } = event.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  const handleSearch = useCallback((event) => {
    const {
      key,
      target: { value }
    } = event
    if (key === 'Enter' && value !== '') {
      console.log(value)
    }
  }, [])

  const onEdit = (row) => {
    scrollToDiv()
    setActiveRow(row)
    setEdit(true)
  }

  const onDelete = (row) => {
    deleteLabel({ variables: { id: row?.id } }).then((res) => {
      const { errors } = res?.data?.labelDelete || ''
      if (errors?.length > 0) {
        toast({ description: errors[0], status: 'error', position: 'top' })
      }
    })
  }

  const onCreate = () => {
    setActiveRow(null)
    setEdit(true)
  }

  const Header = () => {
    if (edit) {
      return <LabelInputs setEdit={setEdit} activeRow={activeRow} />
    }

    return (
      <Flex width={'100%'} justifyContent={'space-between'}>
        <SearchFilter
          id='label'
          filterText={filterText}
          onChange={onSearchInputChange}
          onClear={handleClear}
          onFilter={handleSearch}
        />
        <Button fontSize={'sm'} colorScheme='blue' onClick={onCreate}>
          New Label
        </Button>
      </Flex>
    )
  }

  const columns = [
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => (
        <Tag
          my={3}
          py={1}
          size='sm'
          width={'fit-content'}
          borderColor={row?.color}
          bg={hexToRGBA(row?.color, 0.5)}
        >
          {row?.name}
        </Tag>
      ),
      width: '40%',
      wrap: true
    },
    {
      id: 'CREATED_AT',
      name: 'CREATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.createdAt)} placement='top'>
          <Text color={textColor} textAlign={'right'}>
            {timeSince(row?.createdAt)}
          </Text>
        </Tooltip>
      ),
      wrap: true,
      right: 'true'
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Flex gap={2} alignItems={'center'} justifyContent={'flex-end'}>
            <IconButton
              size='sm'
              icon={<EditIcon color={borderColor} />}
              onClick={() => onEdit(row)}
            />
            <IconButton
              size='sm'
              icon={<DeleteIcon color={'red.500'} />}
              onClick={() => onDelete(row)}
            />
          </Flex>
        )
      },
      right: 'true'
    }
  ]

  return (
    <Stack width={'100%'} px={6} py={0} spacing={2} ref={divRef}>
      <Header />
      <DataTable
        responsive
        persistTableHead
        columns={columns}
        data={nodes || []}
        progressPending={loading}
        progressComponent={<CustomLoader />}
        customStyles={customStyles(headColor)}
      />
      <Box mt={2}>
        <Pagination {...paginationProps} />
      </Box>
    </Stack>
  )
}

export default LabelTable
