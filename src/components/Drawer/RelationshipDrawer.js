import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { ArrowDownIcon } from '@chakra-ui/icons'
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
  VStack
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import RelDeleteModal from 'components/RelDeleteModal'
import { CreateCompRelation, DeleteCompRelation } from 'graphQL/Mutation'
import { GetCompDependency, GetAllComponents } from 'graphQL/Queries'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const findShortestPath = (pathArray, currentShortestPath = []) => {
  if (!pathArray || pathArray.length === 0) {
    return currentShortestPath
  }

  const shortestPath = pathArray.reduce((minPath, currentPath) => {
    if (currentPath.depth < minPath.depth) {
      return currentPath
    }
    return minPath
  }, pathArray[0])

  return findShortestPath(shortestPath.path, [
    ...currentShortestPath,
    shortestPath
  ])
}

const RelationshipDrawer = ({
  isOpen,
  onClose,
  data,
  total,
  fetchCompData,
  compPath
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const { name, version, id } = data

  const [dependencyOfList, setDependencyOfList] = useState([])
  const [dependsOnList, setDependsOnList] = useState([])
  const [relation, setRelation] = useState('')
  const [component, setComponent] = useState('')
  const [activeComp, setActiveComp] = useState(null)
  const [isAdded, setIsAdded] = useState(false)

  const [getAllComps, { data: allComponents }] = useLazyQuery(GetAllComponents)

  const [addRelation] = useMutation(CreateCompRelation)
  const [removeRelation] = useMutation(DeleteCompRelation)
  const { data: compDependency, refetch } = useQuery(GetCompDependency, {
    variables: {
      compId: id,
      sbomId: sbomId
    }
  })

  const shortestPath = findShortestPath(compPath)[0]

  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()

  useEffect(() => {
    if (compDependency) {
      setDependencyOfList(compDependency.component.dependencyOf)
      setDependsOnList(compDependency.component.dependsOn)
    }
  }, [compDependency])

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
          setIsAdded(true)
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
    fetchCompData()
    refetch()
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
              <Flex
                width='100%'
                direction={'row'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                wrap={'wrap'}
                gap={2}
              >
                <Text fontWeight={'medium'}>{name}</Text>
                <Tag colorScheme='blue'>{version}</Tag>
              </Flex>
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
                      <Td pl={0} width={'120px'}>
                        <Text fontSize='xs' fontWeight={'medium'}>
                          Dependency Of
                        </Text>
                      </Td>
                      <Td pl={0} width={'300px'}>
                        <Flex flexDirection={'row'} flexWrap={'wrap'} gap={2}>
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
                        </Flex>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td pl={0} width={'120px'}>
                        <Text fontSize='xs' fontWeight={'medium'}>
                          Depends On
                        </Text>
                      </Td>
                      <Td pl={0} width={'300px'}>
                        <Flex flexDirection={'row'} flexWrap={'wrap'} gap={2}>
                          {[...dependsOnList]
                            .sort(
                              (a, b) =>
                                new Date(b.updatedAt) - new Date(a.updatedAt)
                            )
                            .map((comp, index) => (
                              <Tooltip
                                key={index}
                                label={comp.toComp.name}
                                placement='top'
                              >
                                <Tag
                                  size={'sm'}
                                  variant='subtle'
                                  colorScheme={
                                    index == 0 && isAdded ? 'green' : 'blue'
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
                        </Flex>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>

                {isDelOpen && activeComp && (
                  <RelDeleteModal
                    isOpen={isOpen}
                    onClose={onClose}
                    handleRemove={handleRemove}
                    activeComp={activeComp}
                  />
                )}

                {/* PATHS */}
                <Text fontSize={'lg'} fontWeight={'medium'} mt={6}>
                  Pedigree
                </Text>
                {compPath.length > 0 ? (
                  <Stack
                    width={'100%'}
                    mt={10}
                    dir='column'
                    spacing={2}
                    alignItems={'center'}
                    justifyContent={'center'}
                  >
                    {shortestPath.path.length > 0 ? (
                      shortestPath.path.map((item, index) => (
                        <>
                          <Tag
                            key={item.id}
                            size='sm'
                            colorScheme={
                              index === 0 ||
                              index === shortestPath.path.length - 1
                                ? 'blue'
                                : 'green'
                            }
                          >
                            {item.name} - {item.version}
                          </Tag>

                          {index !== shortestPath.path.length - 1 && (
                            <ArrowDownIcon
                              width={4}
                              height={4}
                              color={'blue.500'}
                            />
                          )}
                        </>
                      ))
                    ) : (
                      <Text fontSize={'sm'}>
                        Component is not connected to Primary component
                      </Text>
                    )}
                  </Stack>
                ) : (
                  <Stack
                    width={'100%'}
                    alignItems={'center'}
                    justifyContent={'center'}
                  >
                    <Tag size='sm' colorScheme='green'>
                      {name} - {version}
                    </Tag>
                  </Stack>
                )}
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
