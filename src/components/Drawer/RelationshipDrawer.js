import { useLazyQuery, useMutation } from '@apollo/client'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerFooter,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Stack,
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  FormErrorMessage,
  FormErrorIcon,
  useDisclosure,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  ButtonGroup
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import NodeElement from 'components/NodeElement'
import GlobalContext from 'context/GlobalContext'
import { CreateCompRelation, DeleteCompRelation } from 'graphQL/Mutation'
import { GetAllComponents } from 'graphQL/Queries'
import { useContext, useEffect, useState } from 'react'
import Tree from 'react-d3-tree'
import { useLocation } from 'react-router-dom'

const RelationshipDrawer = ({
  isOpen,
  onClose,
  data,
  total,
  refetch,
  after
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')
  const { name, version, id, dependencyOf, dependsOn } = data
  const { totalRows, compField, compDirection, compSearchInput } =
    useContext(GlobalContext)

  const [dependencyOfList, setDependencyOfList] = useState([])
  const [dependsOnList, setDependsOnList] = useState([])
  const [relation, setRelation] = useState('')
  const [component, setComponent] = useState('')
  const [activeComp, setActiveComp] = useState(null)

  const [getAllComps, { data: allComponents }] = useLazyQuery(GetAllComponents)

  const [addRelation] = useMutation(CreateCompRelation)
  const [removeRelation] = useMutation(DeleteCompRelation)

  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()

  useEffect(() => {
    if (dependencyOf) {
      setDependsOnList(dependencyOf)
    }
  }, [dependencyOf])

  useEffect(() => {
    if (dependsOn) {
      setDependsOnList(dependsOn)
    }
  }, [dependsOn])

  useEffect(() => {
    getAllComps({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: total,
        field: 'COMPONENTS_UPDATED_AT',
        direction: 'DESC'
      }
    }).then((res) => {
      if (res.data) {
        setRelation('')
        setComponent('')
      }
    })
  }, [])

  const list = dependsOnList?.filter((item) => item.toComp.id === component)

  const recentComp = Math.max(
    ...dependsOnList.map((item) => new Date(item.updatedAt).getTime())
  )

  // console.log('Most Recent', recentComp)

  const handleAdd = async () => {
    await addRelation({
      variables: {
        from: id,
        to: component,
        relType: relation
      }
    })
      .then((res) => {
        if (res.data) {
          console.log(res.data)
          setDependsOnList((prev) => [
            ...prev,
            res.data.componentRelationCreate.compRelation
          ])
        }
      })
      .finally(() => {
        setRelation('')
        setComponent('')
      })
  }

  const handleRemove = async () => {
    await removeRelation({
      variables: {
        relId: activeComp.id
      }
    })
      .then((res) => {
        if (res.data) {
          console.log(res.data)
          const filterData = dependsOnList.filter(
            (item) => item.id !== activeComp.id
          )
          setDependsOnList(filterData)
        }
      })
      .finally(() => {
        onDelClose()
      })
  }

  const handleSave = () => {
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        search: compSearchInput !== '' ? compSearchInput : undefined,
        first: totalRows,
        after: after,
        field: compField,
        direction: compDirection
      }
    })
    onClose()
  }

  return (
    <Drawer
      size='lg'
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      closeOnOverlayClick={true}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          Relationships
        </DrawerHeader>
        <DrawerBody>
          <Card px={0} mx={0}>
            <CardHeader>
              <Stack
                width='100%'
                direction={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Text fontSize={'lg'} fontWeight={'medium'}>
                  {name} - {version}
                </Text>
              </Stack>
            </CardHeader>
            <CardBody>
              <Flex
                flexDir={'column'}
                alignItems={'flex-start'}
                width={'100%'}
                gap={4}
              >
                {/* CREATE RELATIONSHIP */}
                <Stack
                  width={'100%'}
                  direction={'column'}
                  alignItems={'flex-start'}
                  gap={2}
                  mt={6}
                >
                  <FormControl>
                    <FormLabel htmlFor='relation' color='gray.600'>
                      Type
                    </FormLabel>
                    <Select
                      id='relation'
                      size='sm'
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                    >
                      <option value=''>-- Select --</option>
                      {[{ value: 'depends_on', label: 'Depends On' }].map(
                        (item, idx) => (
                          <option key={idx} value={item.value}>
                            {item.label}
                          </option>
                        )
                      )}
                    </Select>
                  </FormControl>
                  {allComponents && (
                    <FormControl isInvalid={list.length > 0}>
                      <FormLabel htmlFor='component' color='gray.600'>
                        Component
                      </FormLabel>
                      <Select
                        id='component'
                        size='sm'
                        value={component}
                        onChange={(e) => setComponent(e.target.value)}
                      >
                        <option value=''>-- Select --</option>
                        {[...allComponents.sbom.components.nodes]
                          .filter((com) => com.name !== name)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((item, idx) => (
                            <option key={idx} value={item.id}>
                              {item.name}-{item.version}
                            </option>
                          ))}
                      </Select>
                      {list.length !== 0 && (
                        <FormErrorMessage>
                          <FormErrorIcon />
                          Component dependency already exists
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  )}

                  <Button
                    size='md'
                    mt={2}
                    width={'fit-content'}
                    colorScheme='blue'
                    onClick={handleAdd}
                    isDisabled={
                      relation === '' || component === '' || list.length > 0
                    }
                  >
                    Add
                  </Button>
                </Stack>

                {/* COMONENT RELATIONSIP DATA */}
                <Table mt={6} width={'100%'}>
                  <Thead>
                    <Tr>
                      {['Type', 'Component'].map((item, index) => (
                        <Th key={index} pl={0} width={'100px'}>
                          <Box>{item}</Box>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {/* Dependency Of */}
                    <Tr>
                      <Td pl={0} width={'300px'}>
                        <Text fontSize='xs' fontWeight={'medium'}>
                          Dependency Of
                        </Text>
                      </Td>
                      <Td pl={0} width={'400px'}>
                        <Stack direction={'column'}>
                          {dependencyOfList.map((comp, index) => (
                            <Tag
                              size={'sm'}
                              key={index}
                              variant='subtle'
                              colorScheme={'blue'}
                              width={'fit-content'}
                            >
                              <TagLabel>
                                {comp.fromComp.name}-{comp.fromComp.version}
                              </TagLabel>
                              <TagCloseButton
                                onClick={() =>
                                  handleRemove('Dependency Of', index)
                                }
                              />
                            </Tag>
                          ))}
                        </Stack>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td pl={0} width={'300px'}>
                        <Text fontSize='xs' fontWeight={'medium'}>
                          Depends On
                        </Text>
                      </Td>
                      <Td pl={0} width={'400px'}>
                        <Stack direction={'column'} pos={'relative'}>
                          {[...dependsOnList]
                            .sort(
                              (a, b) =>
                                new Date(b.updatedAt) - new Date(a.updatedAt)
                            )
                            .map((comp, index) => (
                              <Tooltip label={comp.toComp.name} placement='top'>
                                <Tag
                                  size={'sm'}
                                  key={index}
                                  variant='subtle'
                                  colorScheme={
                                    new Date(comp.updatedAt).getTime() ===
                                    recentComp
                                      ? 'green'
                                      : 'blue'
                                  }
                                  width={'fit-content'}
                                >
                                  <TagLabel>
                                    {comp.toComp.name?.substring(0, 50)}-
                                    {comp.toComp.version}
                                  </TagLabel>
                                  <TagCloseButton
                                    onClick={() => {
                                      setActiveComp(comp)
                                      onDelOpen()
                                    }}
                                  />
                                </Tag>
                              </Tooltip>
                            ))}

                          <Popover
                            returnFocusOnClose={false}
                            isOpen={isDelOpen}
                            onClose={onDelClose}
                            placement='bottom'
                            closeOnBlur={true}
                          >
                            <PopoverContent>
                              <PopoverHeader
                                fontWeight='semibold'
                                fontSize={'sm'}
                              >
                                Remove
                              </PopoverHeader>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverBody>
                                <Stack
                                  direction='column'
                                  alignItems={'flex-start'}
                                  spacing={4}
                                  py={2}
                                >
                                  <Text
                                    wordBreak={'break-all'}
                                    fontWeight={'semibold'}
                                    fontSize={'sm'}
                                  >
                                    {activeComp?.toComp.name}-
                                    {activeComp?.toComp.version}
                                  </Text>
                                  <Text fontSize={'sm'}>
                                    This will remove the relationship of this
                                    component with other components and change
                                    the dependency order of this version.
                                  </Text>
                                  <Text fontSize={'sm'}>
                                    Are you sure you wish to continue?
                                  </Text>
                                </Stack>
                              </PopoverBody>
                              <PopoverFooter
                                display='flex'
                                justifyContent='flex-end'
                              >
                                <ButtonGroup size='sm'>
                                  <Button
                                    variant='outline'
                                    onClick={onDelClose}
                                  >
                                    No
                                  </Button>
                                  <Button
                                    colorScheme='red'
                                    onClick={handleRemove}
                                  >
                                    Yes
                                  </Button>
                                </ButtonGroup>
                              </PopoverFooter>
                            </PopoverContent>
                          </Popover>
                        </Stack>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Flex>
            </CardBody>
          </Card>
        </DrawerBody>
        <DrawerFooter>
          <Button variant='solid' colorScheme='blue' onClick={handleSave}>
            Done
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default RelationshipDrawer
