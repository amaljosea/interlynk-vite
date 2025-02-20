import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { truncatedValue } from 'utils'

import { ArrowDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Select,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/react'
import {
  FormControl,
  FormErrorIcon,
  FormErrorMessage,
  FormLabel
} from '@chakra-ui/react'

import ComponentList from 'components/ComponentList'
import LynkAlert from 'components/LynkAlert'
import RelDeleteModal from 'components/RelDeleteModal'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateCompRelation, DeleteCompRelation } from 'graphQL/Mutation'
import { GetCompDependency } from 'graphQL/Queries'

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

  const { id, name, version, sbomId } = data || ''

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
  const [component, setComponent] = useState(null)

  const { primaryBlueText, headingTextColor } = useThemeColor([
    'primaryBlueText',
    'headingTextColor'
  ])

  const [addRelation] = useMutation(CreateCompRelation)
  const [removeRelation] = useMutation(DeleteCompRelation)
  const { data: compDependency } = useQuery(GetCompDependency, {
    skip: tab === 'relationships' ? false : true,
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
    const isDependsOn = relations?.relType === 'depends_on'
    addRelation({
      variables: {
        from: isDependsOn ? id : relations?.to,
        to: isDependsOn ? relations?.to : id,
        relType: 'depends_on'
      }
    }).then((res) => {
      if (res?.data) {
        saveChanges()
        setIsAdded(true)
        if (relations?.relType === 'dependency_of') {
          setDependencyOfList((prev) => [
            ...prev,
            res?.data?.componentRelationCreate?.compRelation
          ])
        } else {
          setDependsOnList((prev) => [
            ...prev,
            res?.data?.componentRelationCreate?.compRelation
          ])
        }
        showToast({
          description: 'Relations updated successfully',
          status: 'success'
        })
      }
    })
    setComponent(null)
    setTabData((prev) => ({ ...prev, relations: { to: '', relType: '' } }))
  }

  const checkData = () => {
    // eslint-disable-next-line no-unused-vars
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
          showToast({
            description: 'Component removed successfully',
            status: 'success'
          })
        }
      })
      .finally(() => onDelClose())
  }

  const isInvalid =
    relations?.relType === '' || relations?.to === '' || list.length > 0

  return (
    <>
      <Flex
        px={6}
        pb={20}
        gap={4}
        h={'80vh'}
        flexDir={'column'}
        alignItems={'flex-start'}
      >
        {/* CREATE RELATIONSHIP */}
        <Stack
          gap={2}
          width={'100%'}
          direction={'column'}
          alignItems={'flex-start'}
        >
          <Stack w={'100%'}>
            {/* RELATION TYPE */}
            <FormControl>
              <FormLabel htmlFor='relType' color={headingTextColor}>
                Type
              </FormLabel>
              <Select
                name='relationType'
                value={relations?.relType}
                onChange={(e) =>
                  handleChange('relations', 'relType', e.target.value)
                }
              >
                <option value=''>-- Select --</option>
                {[
                  { value: 'depends_on', label: 'Depends On' },
                  { value: 'dependency_of', label: 'Dependency Of' }
                ].map((item, idx) => (
                  <option key={idx} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            {/* RELATION TO */}
            <FormControl isInvalid={list?.length > 0}>
              <FormLabel htmlFor='relationTo' color={headingTextColor}>
                Component
              </FormLabel>
              <ComponentList
                name={name}
                id='relationTo'
                value={component}
                setValue={setComponent}
              />
              <FormErrorMessage>
                <FormErrorIcon />
                Component dependency already exists
              </FormErrorMessage>
            </FormControl>
          </Stack>
          {/* ACTION */}
          {alert ? (
            <Stack spacing={4}>
              <LynkAlert
                status='warning'
                msg='Saving will apply changes to this tab only. save other tabs separately to retain their data.'
              />
              <ActionButton
                title={'Save'}
                onClick={handleAdd}
                isDisabled={isInvalid}
              />
            </Stack>
          ) : (
            <ActionButton
              title={'Save'}
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
                      <TagCloseButton
                        data-testid='delete_depends_on'
                        onClick={() => {
                          setActiveComp(comp)
                          onDelOpen()
                        }}
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
                            data-testid='delete_depends_on'
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
