import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'

import { Divider, Stack, Text, useDisclosure } from '@chakra-ui/react'
import {
  FormControl,
  FormErrorIcon,
  FormErrorMessage,
  FormLabel
} from '@chakra-ui/react'

import CompRelationTypes from 'components/CompRelationTypes'
import ComponentList from 'components/ComponentList'
import LynkAlert from 'components/LynkAlert'
import LynkSelect from 'components/LynkSelect'
import RelDeleteModal from 'components/RelDeleteModal'
import RelationTreeView from 'components/RelationTreeView'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateCompRelation, DeleteCompRelation } from 'graphQL/Mutation'
import { GetCompDependency } from 'graphQL/Queries'

import { FaPlus } from 'react-icons/fa6'

import ActionButton from './ActionButton'

const CompRelations = ({ data, compPath }) => {
  const { showToast } = useCustomToast()

  const { id, name, sbomId } = data || ''

  const {
    tab,
    setTabData,
    handleChange,
    saveChanges,
    unsavedChanges,
    alert,
    setAlert,
    alertMessage,
    alertMessageSetter
  } = useContext(TabContext)

  const [dependencyOfList, setDependencyOfList] = useState([])
  const [dependsOnList, setDependsOnList] = useState([])
  const [activeComp, setActiveComp] = useState(null)
  const [isAdded, setIsAdded] = useState(false)
  const [component, setComponent] = useState(null)
  const [type, setType] = useState(null)

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const [addRelation] = useMutation(CreateCompRelation)
  const [removeRelation, { loading: deleteLoading }] =
    useMutation(DeleteCompRelation)
  const { data: compDependency, loading } = useQuery(GetCompDependency, {
    skip: tab === 'relationships' ? false : true,
    variables: { compId: id, sbomId: sbomId }
  })

  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()

  const list = dependsOnList?.filter(
    (item) => item?.toComp?.id === component?.value
  )

  const handleAdd = () => {
    const isDependsOn = type === 'depends_on'
    addRelation({
      variables: {
        from: isDependsOn ? id : component?.value,
        to: isDependsOn ? component?.value : id,
        relType: 'depends_on'
      }
    }).then((res) => {
      if (res?.data) {
        saveChanges('relationships')
        setIsAdded(true)
        if (type === 'dependency_of') {
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
    setType(null)
    setTabData((prev) => ({ ...prev, relationships: { to: '', relType: '' } }))
  }

  const checkData = () => {
    // eslint-disable-next-line no-unused-vars
    const { relationships, ...rest } = unsavedChanges
    alertMessageSetter(rest)
    return Object.values(rest).some((value) => value === true)
  }

  const handleSubmit = () => {
    handleAdd()
    if (checkData()) {
      setAlert(true)
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

  const isInvalid = !type || list.length > 0 || !component

  useEffect(() => {
    if (compDependency) {
      setDependencyOfList(compDependency.component.dependencyOf)
      setDependsOnList(compDependency.component.dependsOn)
    }
  }, [compDependency])

  const typeOptions = [
    { value: '', label: '-- Select --' },
    { value: 'depends_on', label: 'Depends On' },
    { value: 'dependency_of', label: 'Dependency Of' }
  ]

  return (
    <>
      <Stack
        h={'80vh'}
        spacing={6}
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
        <Stack spacing={4} width={'100%'}>
          {alert && <LynkAlert status='warning' msg={alertMessage} />}
          {/* RELATION TYPE */}
          <FormControl>
            <FormLabel htmlFor='relType' color={headingTextColor}>
              Type
            </FormLabel>
            <LynkSelect
              id='relationType'
              onChange={(selectedOption) => {
                setType(selectedOption?.value)
                handleChange('relationships', 'relType', selectedOption?.value)
              }}
              options={typeOptions}
              value={
                typeOptions.find((option) => option.value === type) || null
              }
              placeholder='-- Select --'
              dropDown
            />
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
          {/* ACTION */}
          <ActionButton
            title={'Add Relationship'}
            isDisabled={isInvalid}
            onClick={handleSubmit}
            icon={<FaPlus />}
          />
        </Stack>
        <Divider />
        {/* RELATION TYPES */}
        <CompRelationTypes
          loading={loading}
          isAdded={isAdded}
          isEditable={true}
          handleDelete={handleDelete}
          dependsOnList={dependsOnList}
          dependencyOfList={dependencyOfList}
        />
        <Divider />
        {/* PATHS */}
        <Stack>
          <Text fontWeight={'medium'} mt={2}>
            Tree View
          </Text>
          <RelationTreeView
            compPath={compPath}
            data={{ name: data?.name, version: data?.version }}
          />
        </Stack>
      </Stack>

      {isDelOpen && activeComp && (
        <RelDeleteModal
          isOpen={isDelOpen}
          onClose={onDelClose}
          loading={deleteLoading}
          activeComp={activeComp}
          handleRemove={handleRemove}
        />
      )}
    </>
  )
}

export default CompRelations
