import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { client } from 'context/ApolloWrapper'
import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import LynkSelect from 'components/LynkSelect'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { sbomDelete } from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'
import {
  GetCheckResults,
  GetCompFilterData,
  GetComponentData,
  GetProject,
  ShareCompFilters,
  ShareProject
} from 'graphQL/Queries'

import { FaFileDownload, FaLayerGroup } from 'react-icons/fa'
import { TbSignature, TbSignatureOff } from 'react-icons/tb'

import CheckModal from './CheckModal'
import CopyModal from './CopyModal'
import DownloadModal from './DownloadModal'
import { ScoresProgress } from './ScoresProgress'
import SigningModal from './SigningModal'

const SbomActions = ({ sbom, refetch }) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()

  const { isFreeTier, orgQueryLoading } = useGlobalQueryContext()

  const { totalRows, dispatch, prodCompState } = useGlobalState()
  const {
    field,
    direction,
    searchInput,
    ecosystems,
    kinds,
    licenses,
    suppliers,
    scope
  } = prodCompState
  const { prodCompDispatch, prodVulnDispatch, sbomDispatch } = dispatch

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
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const [status, setStatus] = useState('created')
  const [checks, setChecks] = useState(false)
  const [signedData, setSignedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)

  const btnRef = useRef(null)
  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const { data } = useQuery(signedUrlParams ? ShareProject : GetProject, {
    variables: {
      id: productId
    }
  })

  const [getCompFilters] = useLazyQuery(
    signedUrlParams ? ShareCompFilters : GetCompFilterData
  )

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

  const refetchSBOM = async (id) => {
    await refetch({
      projectId: productId,
      sbomId: id
    }).then((res) => {
      if (res.data) {
        const url = generateProductVersionDetailPageUrlFromCurrentUrl({
          sbomid: id,
          paramsObj: {
            tab: activeTab
          }
        })
        navigate(url)
      }
    })
  }

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
    refetchSBOM(select.value)
  }

  const { nodes } = usePaginatatedQuery(GetCheckResults, {
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

  const fetchCompData = async () => {
    await client
      .query({
        query: GetComponentData,
        variables: {
          projectId: productId,
          sbomId: sbomId,
          search: searchInput !== '' ? searchInput : undefined,
          ecosystem:
            ecosystems.includes('all') || ecosystems.length === 0
              ? undefined
              : ecosystems,
          kind: kinds.includes('all') || kinds.length === 0 ? undefined : kinds,
          licenses:
            licenses.includes('all') || licenses.length === 0
              ? undefined
              : licenses,
          supplierName:
            suppliers.includes('all') || suppliers.length === 0
              ? undefined
              : suppliers,
          primary: scope === 'primary' ? true : undefined,
          internal: scope === 'internal' ? true : undefined,
          first: totalRows,
          field: field,
          direction: direction
        }
      })
      .then((res) => {
        if (res.data) {
          const url = generateProductVersionDetailPageUrlFromCurrentUrl({
            paramsObj: {
              tab: activeTab
            }
          })
          navigate(url)
        }
      })
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

  return (
    <Flex gap={3} alignItems={'flex-end'} justifyContent={'flex-end'}>
      {/* SBOM VERSIONS */}
      <Flex
        gap={2}
        flexDirection={'row'}
        alignItems={'center'}
        className='search-version'
      >
        <FaLayerGroup size={21} color='#4299E1' />
        <LynkSelect
          components={{
            DropdownIndicator: () => null
          }}
          value={selectedVersion}
          onChange={handleSBOMChange}
          isSearchable={signedUrlParams ? isShareSearchable : isSearchable}
          type='text'
          placeholder='Search versions'
          name='versions'
          options={signedUrlParams ? uniqShareVersions : uniqVersions}
          noOptionsMessage={() => null}
        />
      </Flex>
      <Flex direction={'row'} gap={3} justifyContent='flex-end'>
        {/* UPDATE PRIMARY COMPONENT */}
        <Tooltip label='Edit'>
          <IconButton
            display={signedUrlParams ? 'none' : 'flex'}
            isDisabled={status === 'signed' || !updateSboms}
            colorScheme='blue'
            icon={<EditIcon />}
            onClick={handleEditSbom}
          />
        </Tooltip>

        {/* SIGNED SBOM */}
        {status === 'signed' ? (
          <Tooltip label='Signed'>
            <IconButton
              display={signedUrlParams ? 'none' : 'flex'}
              colorScheme='blue'
              icon={<TbSignature size={22} />}
              onClick={setVerifyOpen}
              // isDisabled={!signSboms || !updateSboms}
              isDisabled={true}
            />
          </Tooltip>
        ) : (
          <Tooltip label='Unsigned'>
            <IconButton
              display={signedUrlParams ? 'none' : 'flex'}
              colorScheme='blue'
              icon={<TbSignatureOff size={22} />}
              onClick={setVerifyOpen}
              // isDisabled={!signSboms || !updateSboms}
              isDisabled={true}
            />
          </Tooltip>
        )}

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
      {isSBMOpen && (
        <ComponentDrawer
          isOpen={isSBMOpen}
          onClose={setSBMClose}
          btnRef={btnRef}
          data={sbom?.primaryComponent}
          filterRefetch={getCompFilters}
          shortDesc={null}
          totalRows={null}
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
