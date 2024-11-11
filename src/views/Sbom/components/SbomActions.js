import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { getSignedUrlParams } from 'utils'
import CompDrawer from 'views/Dashboard/Products/components/CompDrawer'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import { DeleteIcon, EditIcon, SearchIcon } from '@chakra-ui/icons'
import { Box, Flex, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

import { recheckHealth, sbomDelete } from 'graphQL/Mutation'
import {
  GetCheckResults,
  GetComponentData,
  GetProject,
  ShareProject
} from 'graphQL/Queries'

import { FaFileDownload } from 'react-icons/fa'
import { TbSignature, TbSignatureOff } from 'react-icons/tb'

import CheckModal from './CheckModal'
import CopyModal from './CopyModal'
import DownloadModal from './DownloadModal'
import SigningModal from './SigningModal'

const SbomActions = ({ sbom }) => {
  const signedUrlParams = getSignedUrlParams()
  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()

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

  const [status, setStatus] = useState('created')
  const [checks, setChecks] = useState(false)
  const [signedData, setSignedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)

  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const { data } = useQuery(signedUrlParams ? ShareProject : GetProject, {
    variables: {
      id: productId
    }
  })

  const [deleteSbom] = useMutation(sbomDelete)
  const [healthRecheck] = useMutation(recheckHealth)

  // DISCLOUSERS
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isSBMOpen,
    onOpen: setSBMOpen,
    onClose: setSBMClose
  } = useDisclosure()

  const {
    isOpen: isPrimaryOpen,
    onOpen: onPrimaryOpen,
    onClose: onPrimaryClose
  } = useDisclosure()

  const {
    isOpen: isVerifyOpen,
    onOpen: setVerifyOpen,
    onClose: setVerifyClose
  } = useDisclosure()

  const {
    isOpen: isDeleteOpen,
    onOpen: setDeleteOpen,
    onClose: setDeleteClose
  } = useDisclosure()

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

  const onDownload = () => {
    if (signedUrlParams) {
      onOpen()
    } else {
      healthRecheck({ variables: { sbomId } }).then(
        (res) => res?.data && onOpen()
      )
    }
  }

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

  // GET PRIMARY COMPONENT DATA
  const { nodes: primaryComponent, error } = usePaginatedQuery(
    GetComponentData,
    {
      skip: signedUrlParams,
      selector: 'sbom.components',
      variables: {
        primary: true,
        sbomId: sbomId,
        projectId: productId
      }
    }
  )
  const noPrimaryComp = primaryComponent?.length === 0

  useEffect(() => {
    if (noPrimaryComp) {
      setSBMClose()
    }
  }, [noPrimaryComp])

  const activeRow = nodes?.length > 0 ? nodes[0] : null

  const handleEditSbom = () => {
    if (sbom?.primaryComponent) {
      sbomDispatch({ type: 'SET_LICENSES', payload: sbom?.primaryComponent })
      setSBMOpen()
    } else {
      healthRecheck({ variables: { sbomId } })
        .then((res) => {
          if (res?.data) {
            setChecks(true)
          } else {
            setChecks(true)
          }
        })
        .finally(() => onPrimaryOpen())
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

  if (error) {
    return null
  }

  return (
    <Flex gap={3} alignItems={'flex-end'} justifyContent={'flex-end'}>
      {/* SBOM VERSIONS */}
      <Box className='search-version' pos={'relative'}>
        <SearchIcon
          top={3}
          left={3}
          zIndex={111}
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
      <Flex direction={'row'} gap={3} justifyContent='flex-end'>
        {/* UPDATE PRIMARY COMPONENT */}
        <Tooltip
          label={
            noPrimaryComp
              ? 'No primary component for this SBOM to edit'
              : 'Edit'
          }
          isDisabled={false}
        >
          <Box>
            <IconButton
              display={signedUrlParams ? 'none' : 'flex'}
              isDisabled={status === 'signed' || !updateSboms || noPrimaryComp}
              colorScheme='blue'
              icon={<EditIcon />}
              onClick={handleEditSbom}
            />
          </Box>
        </Tooltip>

        {/* SIGNED SBOM */}
        <Tooltip label={status === 'signed' ? 'Signed' : 'Unsigned'}>
          <IconButton
            display={signedUrlParams ? 'none' : 'flex'}
            colorScheme='blue'
            icon={
              status === 'signed' ? (
                <TbSignature size={22} />
              ) : (
                <TbSignatureOff size={22} />
              )
            }
            onClick={setVerifyOpen}
            // isDisabled={!signSboms || !updateSboms}
            isDisabled={true}
          />
        </Tooltip>

        {/* DOWNLOAD SBOM */}
        <Tooltip label='Download'>
          <IconButton
            size='md'
            colorScheme='blue'
            className='download'
            onClick={onDownload}
            icon={<FaFileDownload />}
          />
        </Tooltip>

        {/* DELETE SBOM */}
        <Tooltip label='Delete'>
          <IconButton
            colorScheme='red'
            icon={<DeleteIcon />}
            onClick={setDeleteOpen}
            isDisabled={!archiveSboms}
            display={signedUrlParams ? 'none' : 'flex'}
          ></IconButton>
        </Tooltip>
      </Flex>

      {/* {signedUrlParams ? '' : <ScoresProgress />} */}

      {/* DOWNLOAD SBOM */}
      {isOpen && (
        <DownloadModal
          initialRef={initialRef}
          finalRef={finalRef}
          isOpen={isOpen}
          onClose={onClose}
          productId={productId}
          sbomId={sbomId}
          productName={sbom?.project?.projectGroup?.name}
          version={sbom?.projectVersion}
          sbom={sbom}
        />
      )}

      {/*  SET PRIMARY COMPONENT */}
      {isPrimaryOpen && (
        <CheckModal
          ruleExists={null}
          isOpen={isPrimaryOpen}
          onClose={onPrimaryClose}
          activeRow={activeRow}
          isFreeTier={isFreeTier}
        />
      )}

      {/* UPDATE PRIMARY COMPONENT */}
      {isSBMOpen && !noPrimaryComp && (
        <CompDrawer
          data={primaryComponent[0]}
          isOpen={isSBMOpen}
          onClose={setSBMClose}
          primaryComp={sbom?.primaryComponent}
        />
      )}

      {/* VERIFY SBOM */}
      {isVerifyOpen && (
        <SigningModal
          projectId={productId}
          sbomId={sbomId}
          status={status}
          setStatus={setStatus}
          signedData={signedData}
          setSignedData={setSignedData}
          isOpen={isVerifyOpen}
          onClose={setVerifyClose}
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
      {isDeleteOpen && (
        <ConfirmationModal
          isOpen={isDeleteOpen}
          onClose={setDeleteClose}
          onConfirm={handleDelete}
          name={`${sbom?.project?.projectGroup?.name} - ${sbom?.projectVersion}`}
          title='Delete Version'
          description='Deleting this version will:'
          items={[
            'Remove this versions and its SBOM',
            'Remove access to this version for all users'
          ]}
          isLoading={isLoading}
        />
      )}
    </Flex>
  )
}

export default SbomActions
