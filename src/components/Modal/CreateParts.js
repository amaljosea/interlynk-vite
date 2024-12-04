import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  capitalizeFirstLetter,
  envOrderList,
  isDefaultEnv,
  truncatedValue
} from 'utils'
import LabelSelect from 'views/Dashboard/Analytics/Selects/LabelSelect'

import { FormControl, FormLabel, Select, Stack } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'

import { SbomPartCreate } from 'graphQL/Mutation'
import {
  CheckDeepParts,
  GetProject,
  GetProjectGroups,
  GetSbomParts
} from 'graphQL/Queries'

import { BiLayerPlus } from 'react-icons/bi'

//Function to find the array to be displayed for versions option, filters out already added version from current env
function getActualVersion(versions = [], parts = []) {
  if (!Array.isArray(versions) || !Array.isArray(parts)) {
    return []
  }
  const partIds = parts.map((part) => part.partId)

  const actualVersions = versions.filter(
    (version) => !partIds.includes(version.value)
  )
  return actualVersions
}

const LynkSelect = ({ name, value, onChange, children }) => {
  return (
    <Select
      name={name}
      value={value}
      fontSize={'sm'}
      onChange={onChange}
      data-testid={`part_${name}`}
    >
      <option value={''}>-- Select --</option>
      {children}
    </Select>
  )
}

const CreateParts = ({ parts, isOpen, onClose }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const prodId = params.productid
  const productGrpId = params.productgroupid
  const partsContext = usePartsContext()

  const { totalRows, prodState, dispatch } = useGlobalState()
  const { enabled, field, direction } = prodState
  const { prodVulnDispatch } = dispatch

  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [envList, setEnvList] = useState([])
  const [label, setLabel] = useState(null)

  const [createSbomPart, { loading }] = useMutation(SbomPartCreate)

  const [getProduct] = useLazyQuery(GetProject)

  const { data: allProjects } = useQuery(GetProjectGroups, {
    skip: isOpen ? false : true,
    variables: {
      first: totalRows,
      labelIds: label ? [label?.value] : undefined,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction
    }
  })

  const { data: partsData } = useQuery(GetSbomParts, {
    skip: selectedProd && selectedVersion ? false : true,
    variables: { projectId: selectedProd, sbomId: selectedVersion }
  })

  // GET SBOM PARTS
  const { data: deep } = useQuery(CheckDeepParts, {
    skip: selectedProd && selectedVersion ? false : true,
    variables: { projectId: selectedProd, sbomId: selectedVersion },
    onCompleted: (data) => console.log('Deep parts', data)
  })

  const isExists = partsData?.sbom?.sbomParts?.some(
    (item) => item?.part?.project?.id === prodId && item?.part?.id === sbomId
  )

  const existingNodes = deep?.sbom?.deepParts?.some(
    (item) => item?.id === sbomId
  )

  const handleChange = (value) => {
    setLabel(value)
    setSelectedGroup('')
    setSelectedProd('')
    setSelectedVersion('')
  }

  const getSbomVersions = () => {
    if (!selectedGroup) {
      return []
    }

    if (!selectedProd) {
      return []
    }

    const activeGroup = allProjects?.organization?.projectGroups?.nodes.find(
      (item) => item.id === selectedGroup
    )

    const activeEnv = activeGroup?.projects?.find(
      (item) => item.id === selectedProd
    )

    const allSboms = activeEnv?.sboms

    const allowedSboms = allSboms?.filter((item) => {
      const previousUrls = partsContext.parts.map((i) => i.url)
      const allUrl = [...previousUrls, location.pathname]
      const urlHasId = allUrl.find((url) => url.includes(item.id))
      return !urlHasId
    })

    return allowedSboms.map((sbom) => ({
      label: sbom?.projectVersion,
      value: sbom?.id,
      creationAt: sbom?.createdAt
    }))
  }

  const sbomVersions = getSbomVersions()
  const versionsActual = getActualVersion(sbomVersions, parts)
  //Filters out currently selected project so that sbom from same project is not added as parts
  const projectsActual = allProjects?.organization?.projectGroups?.nodes.filter(
    (project) => project.id !== productGrpId
  )

  const handleSelectGroup = (e) => {
    const { value } = e.target
    if (value !== '') {
      setSelectedGroup(value)
      setSelectedProd('')
      setSelectedVersion('')
      const activeGroup =
        allProjects &&
        allProjects?.organization?.projectGroups?.nodes.find(
          (item) => item.id === value
        )
      const productList =
        activeGroup &&
        activeGroup.projects
          .filter((item) => item.enabled === true)
          .map((option) => ({
            value: option.id,
            label: option.name
          }))
      setEnvList(productList)
    } else {
      setSelectedGroup('')
      setSelectedProd('')
      setSelectedVersion('')
      setEnvList('')
    }
  }

  const handleSelectProduct = (e) => {
    const { value } = e.target
    setSelectedProd(value)
    if (value === '') {
      setSelectedVersion('')
    } else {
      getProduct({
        variables: { id: value }
      })
    }
  }

  const handleSubmit = async () => {
    await createSbomPart({
      variables: { parentSbomId: sbomId, partSbomId: selectedVersion }
    })
      .then((res) => {
        if (res.data) {
          prodVulnDispatch({ type: 'FILTER_SOURCE', payload: true })
          prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
        }
      })
      .finally(() => {
        setSelectedGroup('')
        setSelectedProd('')
        setSelectedVersion('')
        onClose()
      })
  }

  return (
    <LynkModal
      isOpen={isOpen}
      buttonText='Add'
      onClose={onClose}
      Icon={BiLayerPlus}
      title={'Add Parts'}
      isLoading={loading}
      onSubmit={handleSubmit}
      disabled={
        isExists === true ||
        existingNodes === true ||
        versionsActual?.length === 0 ||
        sbomVersions?.length === 0
      }
    >
      <Stack spacing={4} direction={'column'} gap={2}>
        {/* LABEL */}
        <LabelSelect value={label} onChange={(value) => handleChange(value)} />
        {/* PROJECTS */}
        <FormControl fontSize={'sm'} isRequired>
          <FormLabel htmlFor='groups' fontSize={12}>
            Product
          </FormLabel>
          <LynkSelect
            name='groups'
            value={selectedGroup}
            onChange={handleSelectGroup}
          >
            {projectsActual?.map((item, index) => (
              <option key={index} value={item.id}>
                {truncatedValue(item.name, 30)}
              </option>
            ))}
          </LynkSelect>
        </FormControl>
        {/* ENVIRONMENTS */}
        <FormControl fontSize={'sm'} isRequired>
          <FormLabel htmlFor='products' fontSize={12}>
            Environment
          </FormLabel>
          <LynkSelect
            name='products'
            value={selectedProd}
            onChange={handleSelectProduct}
          >
            {envList?.length > 0 &&
              envOrderList(envList).map((item, index) => (
                <option
                  key={index}
                  value={item.value}
                  label={
                    isDefaultEnv(item.label)
                      ? capitalizeFirstLetter(item.label)
                      : item.label
                  }
                >
                  {item.label}
                </option>
              ))}
          </LynkSelect>
        </FormControl>
        {/* Version */}
        <FormControl fontSize={'sm'} isRequired>
          <FormLabel htmlFor='versions' fontSize={12}>
            Version
          </FormLabel>
          {versionsActual?.length === 0 && sbomVersions.length > 0 ? (
            <LynkAlert
              status='info'
              msg='All available versions from this project have already been added.'
            />
          ) : sbomVersions?.length === 0 ? (
            <LynkAlert status='info' msg='No versions available.' />
          ) : (
            <LynkSelect
              name='versions'
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
            >
              {versionsActual.map((item, index) => (
                <option key={index} value={item.value}>
                  {truncatedValue(item?.label, 30)}
                </option>
              ))}
            </LynkSelect>
          )}
        </FormControl>
        {(isExists === true || existingNodes) && (
          <LynkAlert msg='Same version already exists inside selected SBOM' />
        )}
      </Stack>
    </LynkModal>
  )
}

export default CreateParts
