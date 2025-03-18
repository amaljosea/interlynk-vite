import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Button, Divider, Select, Stack, Text } from '@chakra-ui/react'
import {
  FormControl,
  FormErrorIcon,
  FormErrorMessage,
  FormLabel
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CompRelationTypes from 'components/CompRelationTypes'
import LoadingSpinner from 'components/LoadingSpinner'
import LynkAlert from 'components/LynkAlert'
import LynkDrawer from 'components/LynkDrawer'
import CompInfo from 'components/Misc/CompInfo'
import RelationTreeView from 'components/RelationTreeView'

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

const RelationshipDrawer = (props) => {
  const { isOpen, onClose, activeRow, recheck } = props

  const params = useParams()
  const activeTab = useQueryParam('tab')
  const { prodCompState } = useGlobalState()
  const { headingTextColor } = useThemeColor(['headingTextColor'])

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
    <LynkDrawer
      size='md'
      noFooter
      isOpen={isOpen}
      onClose={onClose}
      title={'Relationships'}
      subtitle={compInfo && <CompInfo data={compInfo} />}
    >
      {isLoading || comPathLoading ? (
        <LoadingSpinner />
      ) : (
        <Card
          px={0}
          mx={0}
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none'
          }}
        >
          <CardBody>
            <Stack spacing={6} width={'100%'}>
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

              {/* RELATION TYPES */}
              <CompRelationTypes
                loading={false}
                isAdded={false}
                isEditable={false}
                handleDelete={null}
                dependsOnList={dependsOnList}
                dependencyOfList={dependencyOfList}
              />
              <Divider />
              {/* PATHS */}
              <Stack spacing={4}>
                <Text fontWeight={'medium'}>Tree View</Text>
                <RelationTreeView
                  compPath={pathToPrimary}
                  data={{
                    name: activeRow?.name || compName,
                    version: activeRow?.version || compVersion
                  }}
                />
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      )}
    </LynkDrawer>
  )
}

export default RelationshipDrawer
