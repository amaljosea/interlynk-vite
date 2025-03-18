import { useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'

import { Divider, Select, Stack, Text, useDisclosure } from '@chakra-ui/react'
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
import RelationTreeView from 'components/RelationTreeView'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateCompRelation, DeleteCompRelation } from 'graphQL/Mutation'
import { GetCompDependency } from 'graphQL/Queries'

import ActionButton from './ActionButton'

const CompRelations = ({ data, compPath }) => {
  const { showToast } = useCustomToast()

  const { id, name, sbomId } = data || ''

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

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const [addRelation] = useMutation(CreateCompRelation)
  const [removeRelation] = useMutation(DeleteCompRelation)
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
          activeComp={activeComp}
          handleRemove={handleRemove}
        />
      )}
    </>
  )
}

export default CompRelations
