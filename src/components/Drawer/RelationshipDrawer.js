import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ArrowDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  Select,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import {
  FormControl,
  FormErrorIcon,
  FormErrorMessage,
  FormLabel
} from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import LoadingSpinner from 'components/LoadingSpinner'
import LynkAlert from 'components/LynkAlert'
import CompInfo from 'components/Misc/CompInfo'

import { useGlobalState } from 'hooks/useGlobalState'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateCompRelation } from 'graphQL/Mutation'
import {
  GetAllComponents,
  GetCompDependency,
  GetComponentPath,
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

const RelationshipDrawer = (props) => {
  const { isOpen, onClose, activeRow, recheck } = props

  const params = useParams()
  const activeTab = useQueryParam('tab')
  const { prodCompState } = useGlobalState()
  const { primaryBlueText, headingTextColor } = useThemeColor([
    'primaryBlueText',
    'headingTextColor'
  ])

  const sbomId = params.sbomid
  const productId = params.productid
  const { field, direction } = prodCompState

  const { status, component: comp } = activeRow || ''
  const { id: compId, name: compName, version: compVersion } = comp || ''
  const { shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'

  const [error, setError] = useState('')
  const [dependencyOfList, setDependencyOfList] = useState([])
  const [dependsOnList, setDependsOnList] = useState([])
  const [relation, setRelation] = useState('')
  const [component, setComponent] = useState('')

  const compState = {
    projectId: productId,
    sbomId: sbomId,
    field: field,
    direction: direction
  }

  const { data: compRelation, loading: comPathLoading } = useQuery(
    GetComponentPath,
    {
      skip: isOpen ? false : true,
      variables: { compId: comp?.id, sbomId: sbomId }
    }
  )
  const { pathToPrimary } = compRelation?.component || ''

  const { data: compData } = useQuery(GetTotalComponents, {
    skip: isOpen ? false : true,
    fetchPolicy: activeTab === 'components' ? false : true,
    variables: {
      ...compState
    }
  })

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

  const isLoading = props?.comPathLoading || !allComponents
  const shortestPath =
    pathToPrimary?.length > 0 && findShortestPath(pathToPrimary)[0]

  const [addRelation, { loading: createLoading }] = useMutation(
    CreateCompRelation,
    { onCompleted: () => recheck() }
  )

  const { data: compDependency } = useQuery(GetCompDependency, {
    skip: isOpen ? false : true,
    variables: { compId: compId || activeRow?.id, sbomId: sbomId }
  })

  const list = dependsOnList?.filter((item) => item?.toComp?.id === component)

  const compInfo = {
    name: compName || '',
    version: activeRow?.version || compVersion
  }

  const disabled = relation === '' || component === '' || list.length > 0

  const handleAdd = async () => {
    await addRelation({
      variables: {
        to: component,
        relType: relation,
        from: compId || activeRow?.id
      }
    })
      .then((res) => {
        if (res?.data?.componentRelationCreate?.errors?.length > 0) {
          setError(res?.data?.componentRelationCreate?.errors[0])
        } else {
          setDependsOnList((prev) => [
            ...prev,
            res?.data?.componentRelationCreate?.compRelation
          ])
        }
      })
      .finally(() => {
        setRelation('')
        setComponent('')
        onClose()
      })
  }

  useEffect(() => {
    if (compDependency) {
      setDependencyOfList(compDependency.component.dependencyOf)
      setDependsOnList(compDependency.component.dependsOn)
    }
  }, [compDependency])

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
        <DrawerCloseButton mt={2} onClick={onClose} />
        <DrawerHeader borderBottomWidth='1px'>Relationships</DrawerHeader>
        <DrawerBody>
          {isLoading || comPathLoading ? (
            <LoadingSpinner />
          ) : (
            <Card px={0} mx={0}>
              <CardHeader>
                <CompInfo data={compInfo} />
              </CardHeader>
              <CardBody>
                <Flex
                  flexDir={'column'}
                  alignItems={'flex-start'}
                  width={'100%'}
                  gap={4}
                >
                  {/* CREATE RELATIONSHIP */}
                  <Stack mt={6} width={'100%'} spacing={4} hidden={resolved}>
                    <FormControl>
                      <FormLabel htmlFor='relation' color={headingTextColor}>
                        Type
                      </FormLabel>
                      <Select
                        id='relation'
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
                        <FormLabel htmlFor='component' color={headingTextColor}>
                          Component
                        </FormLabel>
                        <Select
                          id='component'
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
                    {error !== '' && <LynkAlert msg={error} />}
                    <Button
                      w={'fit-content'}
                      colorScheme='blue'
                      onClick={handleAdd}
                      isDisabled={disabled}
                      loadingText='Loading...'
                      isLoading={createLoading}
                      title={shortDesc ? 'Save' : 'Add'}
                    >
                      {shortDesc ? 'Save' : 'Add'}
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
                          <Flex flexDirection={'row'} flexWrap={'wrap'} gap={2}>
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
                                  <Tag size={'sm'} width={'fit-content'}>
                                    <TagLabel>
                                      {comp?.toComp?.name?.substring(0, 50)}-
                                      {comp?.toComp?.version}
                                    </TagLabel>
                                  </Tag>
                                </Tooltip>
                              ))}
                          </Flex>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  {/* PATHS */}
                  <Text fontSize={'lg'} fontWeight={'medium'} mt={6}>
                    Tree View
                  </Text>
                  {pathToPrimary?.length > 0 ? (
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
                                color={primaryBlueText}
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
                        {activeRow?.name || compName} -{' '}
                        {activeRow?.version || compVersion}
                      </Tag>
                    </Stack>
                  )}
                </Flex>
              </CardBody>
            </Card>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default RelationshipDrawer
