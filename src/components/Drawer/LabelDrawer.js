import { useCallback, useState } from 'react'
import { getRandomColor, hexToRGBA } from 'utils'
import { labels } from 'variables/general'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { DeleteIcon, EditIcon, RepeatIcon } from '@chakra-ui/icons'
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
  Grid,
  GridItem,
  IconButton,
  Input,
  SimpleGrid,
  Tag,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

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
  const borderColor = useColorModeValue('#E2E8F0', '#2D3748')
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
        size='lg'
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
              <Flex gap={4} mb={2} flexDir={'column'}>
                <Tag
                  width={'fit-content'}
                  borderColor={labelColor}
                  bg={hexToRGBA(labelColor, 0.5)}
                >
                  {labelName !== '' ? labelName : 'Label preview'}
                </Tag>
                <SimpleGrid columns={1} spacing={4}>
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
                  <Flex
                    alignItems={'flex-end'}
                    justifyContent={'space-between'}
                  >
                    <FormControl>
                      <FormLabel>Color</FormLabel>
                      <Flex gap={2} alignItems={'center'}>
                        <IconButton
                          icon={<RepeatIcon />}
                          onClick={handleRefresh}
                        />
                        <Input
                          width='fit-content'
                          value={labelColor}
                          onChange={(e) => setLabelColor(e.target.value)}
                        />
                      </Flex>
                    </FormControl>
                    <Flex gap={3} alignItems='center'>
                      <Button onClick={() => setEdit(false)}>Cancel</Button>
                      <Button
                        colorScheme='blue'
                        onClick={onSubmit}
                        isDisabled={labelName === '' || labelColor === ''}
                      >
                        {activeRow ? 'Update' : 'Create'} Label
                      </Button>
                    </Flex>
                  </Flex>
                </SimpleGrid>
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
                <Button
                  colorScheme='blue'
                  onClick={() => {
                    setLabelColor(randomColor)
                    setActiveRow(null)
                    setEdit(true)
                  }}
                >
                  New Label
                </Button>
              </Flex>
            )}
            <Divider />
            {/* HEADER */}
            <Flex alignItems={'center'} justifyContent={'flex-start'}>
              <Text
                fontSize={'sm'}
                color={textColor}
                textAlign={'left'}
                fontWeight={'semibold'}
                textTransform={'capitalize'}
              >
                {data?.length} Labels
              </Text>
            </Flex>
            {/* LABEL LIST */}
            {data?.map((row) => (
              <Grid
                pb={3}
                gap={4}
                key={row?.id}
                templateColumns='repeat(6, 1fr)'
                borderBottom={`1px solid ${borderColor}`}
              >
                <GridItem colSpan={2}>
                  <Tag
                    size='sm'
                    width={'fit-content'}
                    borderColor={row?.color}
                    bg={hexToRGBA(row?.color, 0.5)}
                  >
                    {row?.name}
                  </Tag>
                </GridItem>
                <GridItem colSpan={2}>
                  <Text fontSize={'xs'} color={textColor}>
                    {row?.description}
                  </Text>
                </GridItem>
                <GridItem colSpan={1}>
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
                </GridItem>
                <GridItem colSpan={1}>
                  <Flex
                    gap={2}
                    alignItems={'center'}
                    justifyContent={'flex-end'}
                  >
                    <IconButton
                      size='sm'
                      icon={<EditIcon />}
                      onClick={() => onEdit(row)}
                    />
                    <IconButton
                      size='sm'
                      icon={<DeleteIcon color={'red.500'} />}
                      onClick={() => onDelete(row)}
                    />
                  </Flex>
                </GridItem>
              </Grid>
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default LabelDrawer
