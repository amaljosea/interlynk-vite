import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ArrowDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorIcon,
  FormErrorMessage,
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
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import LoadingSpinner from 'components/LoadingSpinner'
import RelDeleteModal from 'components/RelDeleteModal'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { CreateCompRelation, DeleteCompRelation } from 'graphQL/Mutation'
import { AutomationRuleCreate } from 'graphQL/Mutation'
import {
  GetAllComponents,
  GetCompDependency,
  GetTotalComponents
} from 'graphQL/Queries'

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
  activeRow,
  fetchCompData,
  compPath,
  ruleExists,
  comPathLoading
}) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const { name, version, id } = data || ''
  const { status, component: comp } = activeRow || ''
  const { id: compId, name: compName, version: compVersion } = comp || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'

  const isCompRelation = shortDesc === 'Component has relationship/s'

  const [dependencyOfList, setDependencyOfList] = useState([])
  const [dependsOnList, setDependsOnList] = useState([])
  const [relation, setRelation] = useState('')
  const [component, setComponent] = useState('')
  const [activeComp, setActiveComp] = useState(null)
  const [isAdded, setIsAdded] = useState(false)

  const { prodCompState } = useGlobalState()
  const { field, direction } = prodCompState

  const compState = {
    projectId: productId,
    sbomId: sbomId,
    field: field,
    direction: direction
  }

  const { data: compData } = useQuery(GetTotalComponents, {
    fetchPolicy: activeTab === 'components' ? false : true,
    variables: {
      ...compState
    }
  })

  const [createRule] = useMutation(AutomationRuleCreate)

  const { data: allComponents } = useQuery(GetAllComponents, {
    skip: compData ? false : true,
    variables: {
      ...compState,
      first: compData?.sbom?.components?.totalCount
    },
    onCompleted: (data) => {
      if (data) {
        setRelation('')
        setComponent('')
      }
    }
  })

  const isLoading = comPathLoading || !allComponents

  const [addRelation] = useMutation(CreateCompRelation)
  const [removeRelation] = useMutation(DeleteCompRelation)
  const { data: compDependency } = useQuery(GetCompDependency, {
    variables: { compId: compId || id, sbomId: sbomId }
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

  const list = dependsOnList?.filter((item) => item?.toComp?.id === component)

  const handleAdd = () => {
    addRelation({
      variables: { from: compId || id, to: component, relType: relation }
    }).then((res) => {
      if (res?.data) {
        setIsAdded(true)
        setDependsOnList((prev) => [
          ...prev,
          res?.data?.componentRelationCreate?.compRelation
        ])
      }
    })
    setRelation('')
    setComponent('')
  }

  const handleRemove = async () => {
    await removeRelation({
      variables: { relId: activeComp.id }
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
    onClose()
  }

  const getConditionsAttributes = () => {
    return [
      {
        subject: 'component',
        operator: 'is',
        field: 'component_name',
        value: compName
      },
      {
        subject: 'component',
        operator: 'is',
        field: 'component_version',
        value: compVersion
      },
      {
        subject: 'component',
        operator: 'not_exists',
        field: 'component_relationship',
        value: undefined
      }
    ]
  }

  const getActionsAttributes = () => {
    return [
      {
        subject: 'component',
        field: 'component_relationship',
        value: component
      }
    ]
  }

  const handleRuleCreate = () => {
    if (ruleExists) {
      localStorage.setItem('activeProdTab', 2)
      navigate(generateProductDetailPageUrlFromCurrentUrl())
    } else {
      createRule({
        variables: {
          active: true,
          name: shortDesc,
          projectId: productId,
          checkComponent: compName,
          checkVersion: compVersion,
          checkIdentifier: friendlyId,
          automationConditionsAttributes: getConditionsAttributes(),
          automationActionsAttributes: getActionsAttributes()
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          console.log(errors[0])
        } else {
          if (isCompRelation) {
            handleAdd()
          } else {
            onClose()
          }
        }
      })
    }
  }

  return (
    <Drawer
      size='lg'
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton onClick={handleAdd} />
        <DrawerHeader borderBottomWidth='1px'>Relationships</DrawerHeader>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
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
                    <Text fontWeight={'medium'}>{name || compName}</Text>
                    {(version || compVersion) && (
                      <Tag colorScheme='blue'>{version || compVersion}</Tag>
                    )}
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
                      mt={6}
                      gap={2}
                      width={'100%'}
                      hidden={resolved}
                      direction={'column'}
                      alignItems={'flex-start'}
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
                              .filter((com) =>
                                shortDesc
                                  ? com?.name !== compName
                                  : com?.name !== name
                              )
                              .sort((a, b) => a?.name?.localeCompare(b?.name))
                              .map((item, idx) => (
                                <option key={idx} value={item.id}>
                                  {item.name}-{item.version}
                                  {item.primary ? ` [Primary Component]` : ''}
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

                      <Flex
                        width={'100%'}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                      >
                        <Button
                          hidden
                          mr={'auto'}
                          fontSize={'sm'}
                          onClick={handleRuleCreate}
                          colorScheme={ruleExists ? 'green' : 'blue'}
                        >
                          {ruleExists ? 'View' : 'Save as'} Rule
                        </Button>
                        <Button
                          size='md'
                          width={'fit-content'}
                          colorScheme='blue'
                          onClick={handleAdd}
                          isDisabled={
                            relation === '' ||
                            component === '' ||
                            list.length > 0
                          }
                        >
                          {shortDesc ? 'Save' : 'Add'}
                        </Button>
                      </Flex>
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
                            <Flex
                              flexDirection={'row'}
                              flexWrap={'wrap'}
                              gap={2}
                            >
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
                            <Flex
                              flexDirection={'row'}
                              flexWrap={'wrap'}
                              gap={2}
                            >
                              {[...dependsOnList]
                                .sort(
                                  (a, b) =>
                                    new Date(b?.updatedAt) -
                                    new Date(a?.updatedAt)
                                )
                                .map((comp, index) => (
                                  <Tooltip
                                    key={index}
                                    label={comp?.toComp?.name}
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
                                        {comp?.toComp?.name?.substring(0, 50)}-
                                        {comp?.toComp?.version}
                                      </TagLabel>
                                      <TagCloseButton
                                        hidden={resolved}
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
                      Tree View
                    </Text>
                    {compPath?.length > 0 ? (
                      <Stack
                        width={'100%'}
                        mt={10}
                        dir='column'
                        spacing={2}
                        alignItems={'center'}
                        justifyContent={'center'}
                      >
                        {shortestPath.path?.length > 0 ? (
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
                          {name || compName} - {version || compVersion}
                        </Tag>
                      </Stack>
                    )}
                  </Flex>
                </CardBody>
              </Card>
            </DrawerBody>
            <DrawerFooter>
              <Button
                variant='solid'
                colorScheme='blue'
                onClick={handleSave}
                hidden={resolved}
              >
                Done
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default RelationshipDrawer
