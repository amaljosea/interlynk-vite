import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { isCustomerView, truncatedValue } from 'utils'

import { AddIcon, ArrowDownIcon } from '@chakra-ui/icons'
import {
  Box,
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

import LynkAlert from 'components/LynkAlert'
import RelDeleteModal from 'components/RelDeleteModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateCompRelation, DeleteCompRelation } from 'graphQL/Mutation'
import {
  GetAllComponents,
  GetCompDependency,
  GetTotalComponents
} from 'graphQL/Queries'

import ActionButton from './ActionButton'

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

const CompRelations = ({ data, compPath }) => {
  const { showToast } = useCustomToast()
  const activeTab = useQueryParam('tab')
  const customerView = isCustomerView()

  const { id, name, version, sbomId, sbom } = data || ''
  const { id: productId } = sbom?.project || ''

  const {
    tab,
    tabData,
    setTabData,
    handleChange,
    saveChanges,
    unsavedChanges,
    alert,
    setAlert
  } = useContext(TabContext)
  const { relations } = tabData

  const [dependencyOfList, setDependencyOfList] = useState([])
  const [dependsOnList, setDependsOnList] = useState([])
  const [activeComp, setActiveComp] = useState(null)
  const [isAdded, setIsAdded] = useState(false)

  const { prodCompState } = useGlobalState()
  const { field, direction } = prodCompState
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const compState = {
    projectId: productId,
    sbomId: sbomId,
    field: field,
    direction: direction
  }

  const { data: compData } = useQuery(GetTotalComponents, {
    skip: tab === 4 ? false : true,
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
        setTabData((prev) => ({ ...prev, relations: { to: '', relType: '' } }))
      }
    }
  })

  const [addRelation] = useMutation(CreateCompRelation)
  const [removeRelation] = useMutation(DeleteCompRelation)
  const { data: compDependency } = useQuery(GetCompDependency, {
    skip: tab === 4 ? false : true,
    variables: { compId: id, sbomId: sbomId }
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

  const list = dependsOnList?.filter(
    (item) => item?.toComp?.id === relations?.to
  )

  const handleAdd = () => {
    addRelation({
      variables: { from: id, to: relations?.to, relType: relations?.relType }
    }).then((res) => {
      if (res?.data) {
        saveChanges()
        setIsAdded(true)
        setDependsOnList((prev) => [
          ...prev,
          res?.data?.componentRelationCreate?.compRelation
        ])
        showToast({
          description: 'Relations updated successfully',
          status: 'success'
        })
      }
    })
    setTabData((prev) => ({ ...prev, relations: { to: '', relType: '' } }))
  }

  const checkData = () => {
    const { relations, ...rest } = unsavedChanges
    return Object.values(rest).some((value) => value === true)
  }

  const handleSubmit = () => {
    if (checkData()) {
      setAlert(true)
    } else {
      handleAdd()
    }
  }

  const handleRemove = async () => {
    await removeRelation({
      variables: { relId: activeComp.id }
    })
      .then((res) => {
        if (res.data) {
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

  const isInvalid =
    relations?.relType === '' || relations?.to === '' || list.length > 0

  return (
    <>
      <Flex flexDir={'column'} alignItems={'flex-start'} gap={4} px={6} pb={20}>
        {/* CREATE RELATIONSHIP */}
        <Stack
          gap={2}
          width={'100%'}
          direction={'column'}
          alignItems={'flex-start'}
        >
          <FormControl>
            <FormLabel htmlFor='relType' color='gray.600'>
              Type
            </FormLabel>
            <Select
              fontSize='sm'
              name='relType'
              value={relations?.relType}
              onChange={(e) =>
                handleChange('relations', 'relType', e.target.value)
              }
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
              <FormLabel htmlFor='to' color='gray.600'>
                Component
              </FormLabel>
              <Select
                fontSize='sm'
                name='to'
                value={relations?.to}
                onChange={(e) =>
                  handleChange('relations', 'to', e.target.value)
                }
              >
                <option value=''>-- Select --</option>
                {[...allComponents.sbom.components.nodes]
                  .filter((com) => com?.name !== name)
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

          {alert ? (
            <Stack spacing={4}>
              <LynkAlert
                status='warning'
                msg='Saving will apply changes to this tab only. save other tabs separately to retain their data.'
              />
              <ActionButton
                onClick={handleAdd}
                isDisabled={isInvalid}
                title={'Save Relation'}
              />
            </Stack>
          ) : (
            <ActionButton
              title={'Add'}
              leftIcon={<AddIcon />}
              isDisabled={isInvalid}
              onClick={handleSubmit}
            />
          )}
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
                        {truncatedValue(comp?.fromComp?.name, 20)}-
                        {truncatedValue(comp?.fromComp?.version, 20)}
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
                      (a, b) => new Date(b?.updatedAt) - new Date(a?.updatedAt)
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
                          colorScheme={index == 0 && isAdded ? 'green' : 'blue'}
                          width={'fit-content'}
                        >
                          <TagLabel>
                            {truncatedValue(comp?.toComp?.name, 20)}-
                            {truncatedValue(comp?.toComp?.version, 20)}
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
            isOpen={isDelOpen}
            onClose={onDelClose}
            activeComp={activeComp}
            handleRemove={handleRemove}
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
            {shortestPath?.path?.length > 0 ? (
              shortestPath?.path?.map((item, index) => (
                <>
                  <Tag
                    key={item.id}
                    size='sm'
                    colorScheme={
                      index === 0 || index === shortestPath.path.length - 1
                        ? 'blue'
                        : 'green'
                    }
                  >
                    {item?.name} - {truncatedValue(item?.version, 20)}
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
          <Stack width={'100%'} alignItems={'center'} justifyContent={'center'}>
            <Tag size='sm' colorScheme='green'>
              {name} - {version}
            </Tag>
          </Stack>
        )}
      </Flex>
    </>
  )
}

export default CompRelations
