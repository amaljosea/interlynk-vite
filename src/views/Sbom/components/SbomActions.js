import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { client } from 'context/ApolloWrapper'
import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  IconButton,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  Tooltip,
  UnorderedList,
  useDisclosure
} from '@chakra-ui/react'

import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import LynkSelect from 'components/LynkSelect'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { sbomDelete } from 'graphQL/Mutation'
import {
  AllShareComponents,
  GetAllComponents,
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

  const { totalRows, dispatch, prodCompState, userPermissions } =
    useGlobalState()
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
  const {
    prodCompDispatch,
    prodVulnDispatch,
    prodCheckDispatch,
    sbomLogDispatch,
    sbomDispatch
  } = dispatch

  const sboms = userPermissions?.find((item) => item.key === 'view_sbom')
  const archiveSboms = sboms?.supersededBy?.some(
    (permission) =>
      permission.key === 'archive_sbom' && permission.value === true
  )
  const updateSboms = sboms?.supersededBy?.some(
    (permission) =>
      permission.key === 'update_sbom' && permission.value === true
  )

  // const signSboms = sboms?.supersededBy?.some(
  //   (permission) => permission.key === 'sign_sbom' && permission.value === true
  // )

  const navigate = useNavigate()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const [status, setStatus] = useState('created')
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

  const [getAllComps, { data: allComponents }] = useLazyQuery(
    signedUrlParams ? AllShareComponents : GetAllComponents
  )
  const [getCompFilters] = useLazyQuery(
    signedUrlParams ? ShareCompFilters : GetCompFilterData
  )

  const [deleteSbom] = useMutation(sbomDelete)

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
    isOpen: isDelete,
    onOpen: setDeleteOpen,
    onClose: setDeleteClose
  } = useDisclosure()

  const {
    isOpen: isCopied,
    onOpen: onCopiedOpen,
    onClose: onCopiedClose
  } = useDisclosure()

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
          sbomid: id
        })
        navigate(url)
      }
    })
  }

  const handleSBOMChange = (select) => {
    prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodCheckDispatch({ type: 'CLEAR_PROD_CHECK' })
    sbomLogDispatch({ type: 'CLEAR_SBOM_LOG' })
    setSelectedVersion(select)
    refetchSBOM(select.value)
  }

  const { nodes } = usePaginatatedQuery(GetCheckResults, {
    skip: isPrimaryOpen ? false : true,
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
      getAllComps({
        variables: {
          projectId: signedUrlParams ? undefined : productId,
          field: signedUrlParams ? undefined : 'COMPONENTS_UPDATED_AT',
          direction: signedUrlParams ? undefined : 'DESC',
          sbomId: sbomId,
          first: 100
        }
      }).then(() => {
        onPrimaryOpen()
      })
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
          const url = generateProductVersionDetailPageUrlFromCurrentUrl()
          navigate(url)
        }
      })
    // .finally(() => setActiveProdTab(2))
  }

  const handleDelete = async () => {
    setIsLoading(true)
    await deleteSbom({
      variables: {
        id: sbomId
      }
    }).then((res) => {
      if (res.data) {
        setTimeout(() => {
          setIsLoading(false)
          const url = generateProductDetailPageUrlFromCurrentUrl()
          navigate(url)
        }, 3000)
      }
    })
  }

  return (
    <>
      <Flex
        direction={'row'}
        gap={2}
        justifyContent='flex-end'
        ml={'auto'}
        flexWrap={'wrap'}
      >
        {/* SBOM VERSIONS */}
        <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
          <FaLayerGroup size={21} color='#4299E1' />
          <LynkSelect
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
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
            icon={<FaFileDownload />}
            onClick={onOpen}
            size='md'
            colorScheme='blue'
          />
        </Tooltip>

        {/* DELETE SBOM */}
        <Tooltip label='Delete'>
          <IconButton
            display={signedUrlParams ? 'none' : 'flex'}
            colorScheme='red'
            icon={<DeleteIcon />}
            onClick={setDeleteOpen}
            isDisabled={!archiveSboms}
          ></IconButton>
        </Tooltip>
      </Flex>
      {signedUrlParams ? '' : <ScoresProgress />}
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
      {isPrimaryOpen && allComponents && (
        <CheckModal
          ruleExists={null}
          refetch={refetch}
          isOpen={isPrimaryOpen}
          onClose={onPrimaryClose}
          activeRow={activeRow}
        />
      )}

      {/* UPDATE PRIMARY COMPONENT */}
      {isSBMOpen && (
        <ComponentDrawer
          isOpen={isSBMOpen}
          onClose={setSBMClose}
          btnRef={btnRef}
          sbomRefetch={refetch}
          data={sbom?.primaryComponent}
          fetchCompData={fetchCompData}
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
          refetch={refetch}
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
      <Modal isOpen={isDelete} onClose={setDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Version</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Deleting this version will: </Text>
            <UnorderedList>
              <Flex flexDir={'column'} gap={1} mt={4}>
                {[
                  'remove this versions and its SBOM',
                  'remove access to this version for all users'
                ].map((item, index) => (
                  <ListItem key={index}>{item}</ListItem>
                ))}
              </Flex>
            </UnorderedList>
            <br />
            <Text mt={10}>Are you sure you wish to continue?</Text>
          </ModalBody>
          <ModalFooter>
            <Flex
              width={'100%'}
              alignItems={'center'}
              justifyContent={'space-between'}
              gap={4}
            >
              <Stack>{isLoading && <Spinner color='red.500' />}</Stack>
              <Stack direction='row' alignItems='center' gap={1}>
                <Button onClick={setDeleteClose}>No</Button>
                <Button
                  colorScheme='red'
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Yes'}
                </Button>
              </Stack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SbomActions
