import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { getSignedUrlParams } from 'utils'
import CompDrawer from 'views/Dashboard/Products/components/CompDrawer'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import { EditIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  IconButton,
  Stack,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import SystemLogs from 'components/Drawer/SystemLogs'
import PrimaryTreeView from 'components/PrimaryTreeView'
import ReleaseDate from 'components/ReleaseDate'
import SbomDownload from 'components/SbomDownload'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'
import { useSelect } from 'hooks/useSelect'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { recheckHealth, sbomDelete } from 'graphQL/Mutation'
import {
  GetCheckResults,
  GetComponentData,
  GetProject,
  ShareProject
} from 'graphQL/Queries'

import { BiTrash } from 'react-icons/bi'
import { FaCheck } from 'react-icons/fa6'

import CheckModal from './CheckModal'
import CopyModal from './CopyModal'
import SigningModal from './SigningModal'
import { FiCheckCircle } from 'react-icons/fi'

const SbomActions = ({ sbom }) => {
  const { showToast } = useCustomToast()
  const signedUrlParams = getSignedUrlParams()

  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const { isFreeTier } = useGlobalQueryContext()

  const { dispatch } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch, sbomDispatch } = dispatch

  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  const archiveSboms = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'archive_sbom'
  })
  const updateSboms = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const navigate = useNavigate()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const SBOM = useDisclosure()
  const LOGS = useDisclosure()
  const PRIMARY = useDisclosure()
  const VERIFY = useDisclosure()
  const DELETE = useDisclosure()

  const [status, setStatus] = useState('created')
  const [checks, setChecks] = useState(false)
  const [signedData, setSignedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)

  const { data } = useQuery(signedUrlParams ? ShareProject : GetProject, {
    variables: {
      id: productId
    }
  })

  const [deleteSbom] = useMutation(sbomDelete)
  const [healthRecheck] = useMutation(recheckHealth)

  const { isOpen: isCopied, onClose: onCopiedClose } = useDisclosure()

  const filterVersion = data
    ? data?.project?.sboms.find((item) => item.id === sbomId)
    : []

  const shareFilterVersion = data
    ? data?.shareLynkQuery?.project?.sboms.find((item) => item.id === sbomId)
    : []

  const uniqVersions = []
  const uniqShareVersions = []

  data?.project?.sboms?.length > 0 &&
    [...data.project.sboms]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateB - dateA
      })
      .map((project) => {
        uniqVersions.push({
          label: project?.projectVersion,
          value: project?.id
        })
      })

  const isSearchable =
    filterVersion && filterVersion?.primaryComponent ? true : false
  const isShareSearchable =
    shareFilterVersion && shareFilterVersion?.primaryComponent ? true : false

  data?.shareLynkQuery?.project?.sboms?.length > 0 &&
    data.shareLynkQuery?.project.sboms.map((project) => {
      uniqShareVersions.push({
        label: project?.projectVersion,
        value: project?.id
      })
    })

  // GET PRIMARY COMPONENT DATA
  const {
    nodes: primaryComponent,
    loading: primaryCompLoading,
    error
  } = usePaginatedQuery(GetComponentData, {
    skip: signedUrlParams,
    selector: 'sbom.components',
    variables: {
      primary: true,
      sbomId: sbomId,
      projectId: productId
    }
  })

  const handleSBOMChange = (select) => {
    prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    setSelectedVersion(select)
    const url = generateProductVersionDetailPageUrlFromCurrentUrl({
      sbomid: select.value,
      paramsObj: {
        tab: activeTab
      }
    })
    navigate(url)
  }

  const { nodes } = usePaginatedQuery(GetCheckResults, {
    skip: !checks,
    fetchPolicy: 'network-only',
    selector: 'sbom.checkResults',
    variables: {
      sbomId: sbomId,
      projectId: productId,
      checkId: ['SB-HC-10'],
      field: 'CHECK_RESULTS_UPDATED_AT',
      direction: 'DESC'
    }
  })

  const noPrimaryComp = primaryComponent?.length === 0

  useEffect(() => {
    if (noPrimaryComp) {
      SBOM.onClose()
    }
  }, [noPrimaryComp, SBOM])

  const activeRow = nodes?.length > 0 ? nodes[0] : null

  const handleEditSbom = () => {
    if (primaryCompLoading) {
      showToast({
        description:
          'Primary component is still getting uploaded. Please try in some time',
        status: 'warning'
      })
      return
    }
    if (sbom?.primaryComponent) {
      sbomDispatch({ type: 'SET_LICENSES', payload: sbom?.primaryComponent })
      SBOM.onOpen()
    } else {
      healthRecheck({ variables: { sbomId } })
        .then((res) => {
          if (res?.data) {
            setChecks(true)
          } else {
            setChecks(true)
          }
        })
        .finally(() => PRIMARY.onOpen())
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    await deleteSbom({
      variables: {
        id: sbomId
      }
    }).then((res) => {
      if (res?.data) {
        setIsLoading(false)
        const url = generateProductDetailPageUrlFromCurrentUrl()
        navigate(url)
      }
    })
  }

  const { style } = useSelect('version')

  const updateLabel = noPrimaryComp
    ? 'No primary component for this SBOM to edit'
    : 'Edit'

  if (error) {
    return null
  }

  return (
    <>
      <Stack spacing={2} alignItems={'flex-end'}>
        {/* SELECT SBOM VERSIONS */}
        <Box className='search-version' pos={'relative'}>
          <SearchIcon
            top={3}
            left={3}
            color={secondaryTextColor}
            pos={'absolute'}
          />
          <ReactSelect
            type='text'
            name='versions'
            styles={style}
            value={selectedVersion}
            className='react-select'
            onChange={handleSBOMChange}
            placeholder='Search versions'
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            }}
            options={signedUrlParams ? uniqShareVersions : uniqVersions}
            isSearchable={signedUrlParams ? isShareSearchable : isSearchable}
          />
        </Box>
        {/*  SBOM ACTIONS */}
        <Flex gap={2} alignItems={'center'}>
          {/* UPDATE PRIMARY COMPONENT */}
          <Tooltip label={updateLabel} isDisabled={false}>
            <IconButton
              colorScheme='blue'
              icon={<EditIcon />}
              onClick={handleEditSbom}
              display={signedUrlParams ? 'none' : 'flex'}
              isDisabled={status === 'signed' || !updateSboms || noPrimaryComp}
            />
          </Tooltip>
          {/* GRAPH VIEW */}
          <PrimaryTreeView
            status={status}
            updateSboms={updateSboms}
            noPrimaryComp={noPrimaryComp}
          />
          {/* RELEASE DATE */}
          {shouldShowDemoFeatures && (
            <ReleaseDate
              status={status}
              updateSboms={updateSboms}
              noPrimaryComp={noPrimaryComp}
            />
          )}
          {/* DOWNLOAD SBOM */}
          <SbomDownload sbom={sbom} primaryLoading={primaryCompLoading} />
          {/* SYSTEM LOG */}
          <Tooltip label='System Log'>
            <IconButton
              colorScheme='blue'
              icon={<FiCheckCircle size={16} />}
              onClick={LOGS.onOpen}
              display={signedUrlParams || isFreeTier ? 'none' : 'flex'}
            />
          </Tooltip>
          {/* DELETE SBOM */}
          <Tooltip label='Delete'>
            <IconButton
              colorScheme='red'
              onClick={DELETE.onOpen}
              isDisabled={!archiveSboms}
              icon={<BiTrash size={18} />}
              display={signedUrlParams ? 'none' : 'flex'}
            />
          </Tooltip>
        </Flex>
      </Stack>

      {/* ---------- ACTIONS MODALS / DRAWERS ------------- */}

      {/* SYSTEM LOG */}
      {LOGS.isOpen && (
        <SystemLogs isOpen={LOGS.isOpen} onClose={LOGS.onClose} />
      )}

      {/*  SET PRIMARY COMPONENT */}
      {PRIMARY.isOpen && (
        <CheckModal
          ruleExists={null}
          isOpen={PRIMARY.isOpen}
          onClose={PRIMARY.onClose}
          activeRow={activeRow}
          isFreeTier={isFreeTier}
        />
      )}

      {/* UPDATE PRIMARY COMPONENT */}
      {SBOM.isOpen && !noPrimaryComp && (
        <CompDrawer
          data={primaryComponent[0]}
          isOpen={SBOM.isOpen}
          onClose={SBOM.onClose}
          primaryComp={sbom?.primaryComponent}
        />
      )}

      {/* VERIFY SBOM */}
      {VERIFY.isOpen && (
        <SigningModal
          projectId={productId}
          sbomId={sbomId}
          status={status}
          setStatus={setStatus}
          signedData={signedData}
          setSignedData={setSignedData}
          isOpen={VERIFY.isOpen}
          onClose={VERIFY.onClose}
          sbomData={sbom}
        />
      )}

      {/* COPY SBOM */}
      {isCopied && (
        <CopyModal
          isOpen={isCopied}
          onClose={onCopiedClose}
          product={sbom?.project?.name}
          version={sbom?.projectVersion}
        />
      )}

      {/* DELETE SBOM */}
      {DELETE.isOpen && (
        <ConfirmationModal
          isOpen={DELETE.isOpen}
          isLoading={isLoading}
          onClose={DELETE.onClose}
          onConfirm={handleDelete}
          name={`${sbom?.project?.projectGroup?.name} - ${sbom?.projectVersion}`}
          title='Delete Version'
          description='Deleting this version will:'
          items={[
            'Remove this versions and its SBOM',
            'Remove access to this version for all users'
          ]}
        />
      )}
    </>
  )
}

export default SbomActions
