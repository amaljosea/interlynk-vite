import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'
import CompDrawer from 'views/Dashboard/Products/components/CompDrawer'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import { Flex, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import SystemLogs from 'components/Drawer/SystemLogs'
import DeleteButton from 'components/Icons/DeleteButton'
import EditButton from 'components/Icons/EditButton'
import PrimaryTreeView from 'components/PrimaryTreeView'
import ReleaseDate from 'components/ReleaseDate'
import SbomDownload from 'components/SbomDownload'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { recheckHealth, sbomDelete } from 'graphQL/Mutation'
import {
  GetCheckResults,
  GetComponentData,
  GetProject,
  ShareProject
} from 'graphQL/Queries'

import { LuCircleCheckBig } from 'react-icons/lu'

import CheckModal from './CheckModal'
import CopyModal from './CopyModal'
import SigningModal from './SigningModal'

const SbomActions = ({ sbom }) => {
  const { showToast } = useCustomToast()
  const signedUrlParams = getSignedUrlParams()

  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const { isFreeTier } = useGlobalQueryContext()

  const { dispatch } = useGlobalState()
  const { sbomDispatch } = dispatch

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

  const SBOM = useDisclosure()
  const LOGS = useDisclosure()
  const PRIMARY = useDisclosure()
  const VERIFY = useDisclosure()
  const DELETE = useDisclosure()

  const [status, setStatus] = useState('created')
  const [checks, setChecks] = useState(false)
  const [signedData, setSignedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { data } = useQuery(signedUrlParams ? ShareProject : GetProject, {
    variables: {
      id: productId
    }
  })

  const [deleteSbom] = useMutation(sbomDelete)
  const [healthRecheck] = useMutation(recheckHealth)

  const { isOpen: isCopied, onClose: onCopiedClose } = useDisclosure()

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

  const updateLabel = noPrimaryComp
    ? 'No primary component for this SBOM to edit'
    : 'Edit'

  if (error) {
    return null
  }

  return (
    <>
      <Flex gap={2} alignItems={'center'} justifyContent={'flex-end'}>
        {/* UPDATE PRIMARY COMPONENT */}
        <EditButton
          size={'md'}
          type={'primary'}
          tooltip={updateLabel}
          onClick={handleEditSbom}
          display={signedUrlParams ? 'none' : 'flex'}
          isDisabled={status === 'signed' || !updateSboms || noPrimaryComp}
        />
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
            icon={<LuCircleCheckBig size={18} />}
            onClick={LOGS.onOpen}
            display={signedUrlParams || isFreeTier ? 'none' : 'flex'}
          />
        </Tooltip>
        {/* DELETE SBOM */}
        <DeleteButton
          variant={'solid'}
          onClick={DELETE.onOpen}
          isDisabled={!archiveSboms}
          display={signedUrlParams ? 'none' : 'flex'}
          tooltip={'Delete'}
        />
      </Flex>

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
