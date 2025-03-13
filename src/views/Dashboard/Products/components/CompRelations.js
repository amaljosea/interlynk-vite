import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { findShortestPath, truncatedValue } from 'utils'

import { ArrowDownIcon } from '@chakra-ui/icons'
import {
  Divider,
  Flex,
  Select,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import { Tag } from '@chakra-ui/react'
import {
  FormControl,
  FormErrorIcon,
  FormErrorMessage,
  FormLabel
} from '@chakra-ui/react'

import CompRelationTypes from 'components/CompRelationTypes'
import ComponentList from 'components/ComponentList'
import LynkAlert from 'components/LynkAlert'
import RelDeleteModal from 'components/RelDeleteModal'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateCompRelation, DeleteCompRelation } from 'graphQL/Mutation'
import { GetCompDependency } from 'graphQL/Queries'

import ActionButton from './ActionButton'

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
    setAlert,
    alertMessage,
    alertMessageSetter
  } = useContext(TabContext)
  const { relationships } = tabData

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
  const { data: compDependency, loading } = useQuery(GetCompDependency, {
    skip: tab === 'relationships' ? false : true,
    variables: { compId: id, sbomId: sbomId }
  })

  const shortestPath = findShortestPath(compPath)[0]

  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()

  const list = dependsOnList?.filter(
    (item) => item?.toComp?.id === relationships?.to
  )

  const handleAdd = () => {
    const isDependsOn = relationships?.relType === 'depends_on'
    addRelation({
      variables: {
        from: isDependsOn ? id : relationships?.to,
        to: isDependsOn ? relationships?.to : id,
        relType: 'depends_on'
      }
    }).then((res) => {
      if (res?.data) {
        saveChanges('relationships')
        setIsAdded(true)
        if (relationships?.relType === 'dependency_of') {
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
    setTabData((prev) => ({ ...prev, relationships: { to: '', relType: '' } }))
  }

  const checkData = () => {
    // eslint-disable-next-line no-unused-vars
    const { relationships, ...rest } = unsavedChanges
    alertMessageSetter(rest)
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

  const handleDelete = (comp) => {
    setActiveComp(comp)
    onDelOpen()
  }

  const isInvalid =
    relationships?.relType === '' || relationships?.to === '' || list.length > 0

  useEffect(() => {
    if (compDependency) {
      setDependencyOfList(compDependency.component.dependencyOf)
      setDependsOnList(compDependency.component.dependsOn)
    }
  }, [compDependency])

  return (
    <>
      <Flex
        pb={20}
        gap={4}
        h={'80vh'}
        flexDir={'column'}
        alignItems={'flex-start'}
        overflow={'auto'}
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none'
        }}
      >
        {/* CREATE RELATIONSHIP */}
        <Stack
          gap={4}
          width={'100%'}
          direction={'column'}
          alignItems={'flex-start'}
          mb={2}
        >
          <Stack w={'100%'}>
            {/* RELATION TYPE */}
            <FormControl>
              <FormLabel htmlFor='relType' color={headingTextColor}>
                Type
              </FormLabel>
              <Select
                name='relationType'
                value={relationships?.relType}
                onChange={(e) =>
                  handleChange('relationships', 'relType', e.target.value)
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
              <LynkAlert status='warning' msg={alertMessage} />
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
        <Divider />
        {/* RELATION TYPES */}
        <CompRelationTypes
          loading={loading}
          isAdded={isAdded}
          handleDelete={handleDelete}
          dependsOnList={dependsOnList}
          dependencyOfList={dependencyOfList}
        />
        <Divider />
        {/* PATHS */}
        <Text fontSize={'lg'} fontWeight={'medium'} mt={2}>
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

      {isDelOpen && activeComp && (
        <RelDeleteModal
          isOpen={isDelOpen}
          onClose={onDelClose}
          activeComp={activeComp}
          handleRemove={handleRemove}
        />
      )}
    </>
  )
}

export default CompRelations
