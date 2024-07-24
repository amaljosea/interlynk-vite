import { useCallback, useState } from 'react'
import { getRandomColor, hexToRGBA } from 'utils'
import { labels } from 'variables/general'

import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  SimpleGrid,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue
} from '@chakra-ui/react'

import SearchFilter from 'components/Licenses/LicenseSearchFilter'

import { VscIssues } from 'react-icons/vsc'

const LabelDrawer = ({ isOpen, onClose }) => {
  const [data, setData] = useState(labels)
  const [edit, setEdit] = useState(false)
  const [labelName, setLabelName] = useState('')
  const [labelDesc, setLabelDesc] = useState('')
  const [filterText, setFilterText] = useState('')
  const [labelColor, setLabelColor] = useState('#AC6B86')
  const [activeRow, setActiveRow] = useState(null)

  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const randomColor = getRandomColor()

  const handleRefresh = () => {
    setLabelColor(randomColor)
  }

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

  const onSubmit = () => {
    if (activeRow?.id) {
      setData((prevData) =>
        prevData.map((item) =>
          item.id === activeRow?.id
            ? {
                ...item,
                name: labelName,
                description: labelDesc || '',
                color: labelColor || ''
              }
            : item
        )
      )
    } else {
      setData((prev) => [
        {
          id: data?.length + 1,
          name: labelName,
          description: labelDesc,
          color: labelColor,
          issues: 0
        },
        ...prev
      ])
    }
    setLabelName('')
    setLabelDesc('')
    setLabelColor(randomColor)
    setEdit(false)
  }

  console.log('data', data)

  const onDelete = (row) => {
    const filterLabels = data?.filter((item) => item?.id !== row?.id)
    setData(filterLabels)
  }

  const onEdit = (row) => {
    setActiveRow(row)
    setLabelName(row?.name)
    setLabelDesc(row?.description)
    setLabelColor(row?.color)
    setEdit(true)
  }

  return (
    <>
      <Drawer
        size='xl'
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>Edit Label</DrawerHeader>
          <DrawerBody mt={3} as={Flex} flexDirection={'column'} gap={4}>
            {/* ACTIONS AND EDIT FIELDS */}
            {edit ? (
              <Flex gap={4} flexDir={'column'}>
                <Tag
                  width={'fit-content'}
                  borderColor={labelColor}
                  bg={hexToRGBA(labelColor, 0.5)}
                >
                  {labelName !== '' ? labelName : 'Label preview'}
                </Tag>
                <SimpleGrid columns={3} spacing={10}>
                  <FormControl>
                    <FormLabel>Label name</FormLabel>
                    <Input
                      fontSize='sm'
                      value={labelName}
                      onChange={(e) => setLabelName(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Input
                      fontSize='sm'
                      value={labelDesc}
                      onChange={(e) => setLabelDesc(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Color</FormLabel>
                    <Flex gap={2} alignItems={'center'}>
                      <IconButton
                        icon={<RepeatIcon />}
                        onClick={handleRefresh}
                      />
                      <Input
                        width='fit-cotent'
                        value={labelColor}
                        onChange={(e) => setLabelColor(e.target.value)}
                      />
                    </Flex>
                  </FormControl>
                </SimpleGrid>
                <Flex gap={3} alignItems='center'>
                  <Button size='sm' onClick={() => setEdit(false)}>
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    colorScheme='blue'
                    onClick={onSubmit}
                    isDisabled={labelName === '' || labelColor === ''}
                  >
                    {activeRow ? 'Update' : 'Create'} Label
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <Flex
                width={'100%'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                {/* SEARCH PRODUCTS */}
                <SearchFilter
                  id='label'
                  filterText={filterText}
                  onChange={onSearchInputChange}
                  onClear={handleClear}
                  onFilter={handleSearch}
                />
                {/* ADD PRODUCT */}
                <Tooltip label='New Label' placement='left'>
                  <IconButton
                    icon={<AddIcon />}
                    colorScheme='blue'
                    variant='solid'
                    onClick={() => {
                      setLabelColor(randomColor)
                      setActiveRow(null)
                      setEdit(true)
                    }}
                  />
                </Tooltip>
              </Flex>
            )}
            <Divider />
            {/* TABLE */}
            <TableContainer overflowY={'scroll'}>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th px={0}>
                      <Text
                        fontSize={'sm'}
                        textAlign={'left'}
                        color={textColor}
                        textTransform={'capitalize'}
                      >
                        {data?.length} Labels
                      </Text>
                    </Th>
                    <Th></Th>
                    <Th></Th>
                    <Th px={0}>
                      {/* <Text
                        fontSize={'sm'}
                        textAlign={'right'}
                        color={textColor}
                        textTransform={'capitalize'}
                      >
                        Sort
                      </Text> */}
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data?.map((row) => (
                    <Tr key={row?.id}>
                      <Td pl={0}>
                        <Tag
                          size='sm'
                          width={'fit-content'}
                          borderColor={row?.color}
                          bg={hexToRGBA(row?.color, 0.5)}
                        >
                          {row?.name}
                        </Tag>
                      </Td>
                      <Td>
                        <Text fontSize={'xs'} color={textColor}>
                          {row?.description}
                        </Text>
                      </Td>
                      <Td>
                        <Flex
                          gap={1}
                          width={'100px'}
                          alignItems={'center'}
                          hidden={row?.issues === 0}
                        >
                          <VscIssues color={textColor} size={20} />
                          <Text fontSize='xs' color={textColor}>
                            {row?.issues}
                          </Text>
                        </Flex>
                      </Td>
                      <Td pr={2}>
                        <Flex
                          gap={1}
                          alignItems={'center'}
                          justifyContent={'flex-end'}
                        >
                          <Button
                            size='xs'
                            color={textColor}
                            onClick={() => onEdit(row)}
                          >
                            Edit
                          </Button>
                          <Button
                            size='xs'
                            color='red.500'
                            onClick={() => onDelete(row)}
                          >
                            Delete
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default LabelDrawer
