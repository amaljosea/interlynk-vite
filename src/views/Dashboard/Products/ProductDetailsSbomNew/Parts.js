import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, customStyles, envOrderList } from 'utils'
import { getSignedUrlParams, isDefaultEnv, truncatedValue } from 'utils'
import { ProductGeneralTabs } from 'utils/TabsObjects'

import { Flex, Stack, Text } from '@chakra-ui/react'
import { useColorMode, useDisclosure } from '@chakra-ui/react'
import { FormControl, FormLabel, Select } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import { useGlobalState } from 'hooks/useGlobalState'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { SbomPartCreate, SbomPartDelete } from 'graphQL/Mutation'
import { CheckDeepParts, GetProject } from 'graphQL/Queries'
import { GetProjectGroups, GetSbomParts } from 'graphQL/Queries'

import { BiLayerPlus } from 'react-icons/bi'

import ConfirmationModal from '../components/ConfirmationModal'
import PartsColumns from './Components/tableColumns/PartsColumns'
import PartsSubHeader from './Components/tableSubHeaders/PartsSubHeader'

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

const Parts = ({ data }) => {
  const params = useParams()
  const location = useLocation()
  const { colorMode } = useColorMode()
  const partsContext = usePartsContext()
  const sbomId = params.sbomid
  const prodId = params.productid
  const productGrpId = params.productgroupid
  const activeTab = useQueryParam('tab')
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const isArchived = data?.lifecycle === 'archived'

  const { totalRows, prodState, dispatch } = useGlobalState()

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const { enabled, field, direction } = prodState
  const { prodVulnDispatch } = dispatch

  const { PARTS } = ProductGeneralTabs

  // GET SBOM PARTS
  const {
    data: sbomData,
    error,
    startPolling,
    stopPolling
  } = useQuery(GetSbomParts, {
    skip: activeTab === PARTS ? false : true,
    variables: { projectId: prodId, sbomId, first: totalRows }
  })

  const { sbomParts } = sbomData?.sbom || ''

  const signedUrlParams = getSignedUrlParams()

  const updateSboms = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [activeRow, setActiveRow] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [envList, setEnvList] = useState([])

  const { data: allProjects } = useQuery(GetProjectGroups, {
    skip: activeTab === PARTS ? false : true,
    variables: {
      first: totalRows,
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

  const [createSbomPart, { loading }] = useMutation(SbomPartCreate)
  const [deleteSbomPart, { loading: dlLoading }] = useMutation(SbomPartDelete)

  const handleCreatePart = async () => {
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

  const handleRemove = async () => {
    await deleteSbomPart({
      variables: { id: activeRow.id }
    }).then((res) => res?.data && onDeleteClose())
  }

  const [getProduct] = useLazyQuery(GetProject, {
    skip: signedUrlParams ? true : false
  })

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

    const allSboms = activeEnv.sboms

    const allowedSboms = allSboms.filter((item) => {
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

  //Filters out currently selected project so that sbom from same project is not added as parts
  const projectsActual = allProjects?.organization?.projectGroups?.nodes.filter(
    (project) => project.id !== productGrpId
  )

  const versionsActual = getActualVersion(sbomVersions, sbomParts)

  const onSelectPart = () => partsContext.push()

  const onFilterSev = (part, value) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    onSelectPart(part)
  }

  const shouldPoll = sbomParts?.some(
    (item) => item?.part?.vulnRunStatus !== 'FINISHED'
  )

  useGradualPolling({ shouldPoll, startPolling, stopPolling })

  // SUB HEADER
  const subHeader = PartsSubHeader(
    isArchived,
    onOpen,
    signedUrlParams,
    updateSboms
  )

  // COLUMNS
  const columns = PartsColumns(
    onFilterSev,
    colorMode,
    updateSboms,
    signedUrlParams,
    onDeleteOpen,
    isArchived,
    setActiveRow,
    onSelectPart,
    generateProductVersionDetailPageUrlFromCurrentUrl
  )

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          data={sbomParts}
          persistTableHead
          columns={columns}
          responsive={true}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
          subHeaderComponent={subHeader}
          progressPending={sbomParts ? false : true}
        />
      </Flex>

      {isOpen && (
        <LynkModal
          isOpen={isOpen}
          buttonText='Add'
          onClose={onClose}
          Icon={BiLayerPlus}
          title={'Add Parts'}
          isLoading={loading}
          onSubmit={handleCreatePart}
          disabled={
            isExists === true ||
            existingNodes === true ||
            versionsActual?.length === 0 ||
            sbomVersions?.length === 0
          }
        >
          <Stack spacing={4} direction={'column'} gap={2}>
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
      )}

      {/* DISABLED */}
      {isDeleteOpen && (
        <ConfirmationModal
          title='Delete Part'
          isLoading={dlLoading}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={handleRemove}
          description='Deleting this version will:'
          name={`${activeRow?.part?.project?.projectGroup?.name} - ${activeRow?.part?.projectVersion}`}
          items={[
            'Remove this versions and its SBOM',
            'Remove access to this version for all users'
          ]}
        />
      )}
    </>
  )
}

export default Parts
