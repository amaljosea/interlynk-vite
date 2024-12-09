import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { getSignedUrlParams } from 'utils'
import CompDrawer from 'views/Dashboard/Products/components/CompDrawer'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import { DeleteIcon, EditIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Center,
  Divider,
  Flex,
  IconButton,
  Spinner,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import PrimaryTreeView from 'components/PrimaryTreeView'
import ReleaseDate from 'components/ReleaseDate'

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
  DownloadSBOM,
  GetCheckResults,
  GetComponentData,
  GetProject,
  ShareProject,
  SignedSbomDownload
} from 'graphQL/Queries'

import { FaFileDownload } from 'react-icons/fa'
import { TbSignature, TbSignatureOff } from 'react-icons/tb'

import CheckModal from './CheckModal'
import CopyModal from './CopyModal'
import DownloadModal from './DownloadModal'
import SigningModal from './SigningModal'

const SbomActions = ({ sbom }) => {
  const { showToast } = useCustomToast()
  const signedUrlParams = getSignedUrlParams()
  const [getData] = useLazyQuery(
    signedUrlParams ? SignedSbomDownload : DownloadSBOM
  )
  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const { isFreeTier } = useGlobalQueryContext()

  const { dispatch } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch, sbomDispatch } = dispatch

  const { primaryTextColor, secondaryTextInverse, secondaryTextColor } =
    useThemeColor([
      'primaryTextColor',
      'secondaryTextInverse',
      'secondaryTextColor'
    ])

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
  const [downloadType, setDownloadType] = useState(null)

  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const { data } = useQuery(signedUrlParams ? ShareProject : GetProject, {
    variables: {
      id: productId
    }
  })

  const productName = sbom?.project?.projectGroup?.name
  const version = sbom?.projectVersion

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

  //Download Original Sbom
  const downloadOriginalSbom = async () => {
    setIsLoading(true)
    try {
      const response = await getData({
        variables: {
          sbomId,
          projectId: signedUrlParams ? undefined : productId,
          original: true
        }
      })
      if (response.data.sbom.download === null) {
        showToast({
          description: `No original SBOM present for this version.`,
          status: 'error'
        })
        setIsLoading(false)
        return
      }
      if (response.called) {
        const decodedData = signedUrlParams
          ? window.atob(response?.data?.shareLynkQuery?.sbom?.download)
          : window.atob(response?.data?.sbom?.download)

        const blob = new Blob([decodedData], { type: 'application/xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${productName}-${version}.xml`
        a.click()
        URL.revokeObjectURL(url)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error downloading original SBOM:', error)
      showToast({
        description: `Internal error during SBOM download. Please try again in a few minutes.`,
        status: 'error'
      })
      setIsLoading(false)
    }
  }

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

  //Open Modal for sbom for updated SBOM or PDF
  const onDownload = () => {
    if (primaryCompLoading) {
      showToast({
        description:
          'Primary component is still getting uploaded. Please try in some time',
        status: 'warning'
      })
      return
    }
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

  const noPrimaryComp = primaryComponent?.length === 0

  useEffect(() => {
    if (noPrimaryComp) {
      setSBMClose()
    }
  }, [noPrimaryComp, setSBMClose])

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

  const updateLabel = noPrimaryComp
    ? 'No primary component for this SBOM to edit'
    : 'Edit'

  if (error) {
    return null
  }

  return (
    <>
      {/* ---------- SBOM ACTIONS ------------- */}
      <Flex gap={2} alignItems={'center'} justifyContent={'flex-end'}>
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
        {/* UPDATE PRIMARY COMPONENT */}
        <Tooltip label={updateLabel} isDisabled={false}>
          <Box display={signedUrlParams ? 'none' : 'flex'}>
            <IconButton
              isDisabled={status === 'signed' || !updateSboms || noPrimaryComp}
              colorScheme='blue'
              icon={<EditIcon />}
              onClick={handleEditSbom}
            />
          </Box>
        </Tooltip>
        {/* GRAPH VIEW */}
        {shouldShowDemoFeatures && (
          <PrimaryTreeView
            status={status}
            updateSboms={updateSboms}
            noPrimaryComp={noPrimaryComp}
          />
        )}
        {/* RELEASE DATE */}
        {shouldShowDemoFeatures && (
          <ReleaseDate
            status={status}
            updateSboms={updateSboms}
            noPrimaryComp={noPrimaryComp}
          />
        )}
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
        <Tooltip label='Download sbom' placement='top' shouldWrapChildren>
          <Menu>
            <MenuButton
              as={IconButton}
              size='md'
              colorScheme='blue'
              className='download'
              icon={<FaFileDownload />}
              isDisabled={isLoading}
            />
            <MenuList width='220px'>
              <MenuItem onClick={downloadOriginalSbom}>
                <Box>
                  <Box
                    fontSize='14px'
                    fontWeight='bold'
                    mb='4px'
                    color={primaryTextColor}
                  >
                    Original SBOM
                  </Box>
                  <Box fontSize='12px' color={secondaryTextInverse}>
                    Download the original SBOM file that created this version
                  </Box>
                </Box>
              </MenuItem>
              <Divider />
              {/* Updated SBOM */}
              <MenuItem
                onClick={() => {
                  onDownload()
                  setDownloadType('sbom')
                }}
              >
                <Box>
                  <Box
                    fontSize='14px'
                    fontWeight='bold'
                    mb='4px'
                    color={primaryTextColor}
                  >
                    Updated SBOM
                  </Box>
                  <Box fontSize='12px' color={secondaryTextInverse}>
                    Download the current state of the version as a CycloneDX /
                    SPDX or SPDX-Lite file
                  </Box>
                </Box>
              </MenuItem>
              <Divider />
              {/* PDF */}
              <MenuItem
                isDisabled={isFreeTier}
                onClick={() => {
                  onDownload()
                  setDownloadType('pdf')
                }}
              >
                <Box>
                  <Box
                    fontSize='14px'
                    fontWeight='bold'
                    mb='4px'
                    color={primaryTextColor}
                  >
                    PDF
                  </Box>
                  <Box fontSize='12px' color={secondaryTextInverse}>
                    Download the current state of the version as PDF
                  </Box>
                </Box>
              </MenuItem>
            </MenuList>
          </Menu>
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

      {/* ---------- ACTIONS MODALS / DRAWERS ------------- */}
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
          downloadType={downloadType}
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

      {/* ---------- LOADING ------------- */}
      {isLoading && !isDeleteOpen && (
        <Center
          position='fixed'
          top='0'
          left='0'
          width='100vw'
          height='100vh'
          bg='rgba(0, 0, 0, 0.6)'
          zIndex='overlay'
          flexDirection='column'
        >
          <Spinner size='xl' color='white' mb={4} />
          <Text fontSize='lg' color='white'>
            Downloading Original Sbom...
          </Text>
        </Center>
      )}
    </>
  )
}

export default SbomActions
