import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
  Button,
  Text,
  UnorderedList,
  ListItem,
  Spinner
} from '@chakra-ui/react'
import { useGlobalState } from 'hooks/useGlobalState'
import { FaFileDownload, FaLayerGroup } from 'react-icons/fa'
import { TbSignature, TbSignatureOff } from 'react-icons/tb'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { useRef, useState } from 'react'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { GetProject } from 'graphQL/Queries'
import { removeDuplicates, getFullDateAndTime } from 'utils'
import CheckModal from './CheckModal'
import { GetAllComponents } from 'graphQL/Queries'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import SigningModal from './SigningModal'
import { sbomDelete } from 'graphQL/Mutation'
import DownloadModal from './DownloadModal'

const SbomActions = ({ sbom, refetch, getCompData, prodRefetch }) => {
  const {
    totalRows,
    setActiveSbomTab,
    dispatch,
    prodCompState,
    userPermissions
  } = useGlobalState()
  const {
    field,
    direction,
    searchInput,
    ecosystems,
    kinds,
    licenses,
    suppliers,
    scope,
    totalComp
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
  const signSboms = sboms?.supersededBy?.some(
    (permission) => permission.key === 'sign_sbom' && permission.value === true
  )

  const currentProduct = JSON.parse(localStorage.getItem(`product`))

  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const [status, setStatus] = useState('created')
  const [signedData, setSignedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)

  const urlParts = location.pathname.split('/')
  const productIndex = urlParts.indexOf('products')
  const productName =
    productIndex !== -1 ? urlParts.slice(productIndex + 1).join('/') : ''

  const btnRef = useRef(null)
  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const { data } = useQuery(GetProject, {
    variables: {
      id: productId
    }
  })

  const [getAllComps, { data: allComponents }] = useLazyQuery(GetAllComponents)

  const [deleteSbom] = useMutation(sbomDelete)

  // DISCLOUSERS
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure()

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
    ? data.project.sboms.find((item) => item.id === sbomId)
    : []

  const uniqVersions = []

  const filteredDuplicated = data ? removeDuplicates(data.project.sboms) : []

  filteredDuplicated &&
    filteredDuplicated.map((project) => {
      uniqVersions.push({
        label:
          project?.primaryComponent?.version ||
          `Uploaded ${getFullDateAndTime(project.creationAt)}`,
        value: project.id,
        creationAt: project.creationAt
      })
    })

  const refetchSBOM = async (id) => {
    await refetch({
      projectId: productId,
      sbomId: id
    })
      .then((res) => {
        if (res.data) {
          localStorage.setItem(
            'currentSBOM',
            JSON.stringify({
              version: res.data.sbom.primaryComponent?.version,
              id: res.data.sbom.id
            })
          )
        }
      })
      .finally(() => {
        navigate(`/vendor/products/${productName}?id=${productId}&sbom=${id}`)
        // setActiveProdTab(0)
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

  const handleEditSbom = () => {
    if (sbom?.primaryComponent) {
      sbomDispatch({ type: 'SET_LICENSES', payload: sbom?.primaryComponent })
      setSBMOpen()
    } else {
      getAllComps({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalComp,
          field: field,
          direction: direction
        }
      }).then(() => {
        setActiveSbomTab(2)
        onPrimaryOpen()
      })
    }
  }

  const fetchCompData = async () => {
    await getCompData({
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
    }).then((res) => {
      if (res.data) {
        navigate(
          `/vendor/products/${currentProduct.name}?id=${productId}&sbom=${sbomId}`
        )
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
          prodRefetch({ id: productId })
          navigate(`/vendor/products/${params.name}?id=${productId}`)
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
          <ReactSelect
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'inherit' : 'inherit',
                fontSize: '14px',
                padding: '2px 0',
                '&:hover': {
                  borderColor: '#CBD5E0'
                }
              })
            }}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            }}
            value={selectedVersion}
            onChange={handleSBOMChange}
            className='react-select'
            isSearchable={
              filterVersion && filterVersion.primaryComponent ? true : false
            }
            type='text'
            placeholder='Search versions'
            name='versions'
            options={uniqVersions}
            noOptionsMessage={() => null}
          />
        </Flex>

        {/* UPDATE PRIMARY COMPONENT */}
        <Tooltip label='Edit'>
          <IconButton
            isDisabled={status === 'signed'}
            colorScheme='blue'
            icon={<EditIcon />}
            onClick={handleEditSbom}
          />
        </Tooltip>

        {/* SIGNED SBOM */}
        {status === 'signed' ? (
          <Tooltip label='Signed'>
            <IconButton
              colorScheme='blue'
              icon={<TbSignature size={22} />}
              onClick={setVerifyOpen}
              isDisabled={!signSboms}
            />
          </Tooltip>
        ) : (
          <Tooltip label='Unsigned'>
            <IconButton
              colorScheme='blue'
              icon={<TbSignatureOff size={22} />}
              onClick={setVerifyOpen}
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
            colorScheme='red'
            icon={<DeleteIcon />}
            onClick={setDeleteOpen}
            isDisabled={!archiveSboms}
          ></IconButton>
        </Tooltip>
      </Flex>

      {/* DOWNLOAD SBOM */}
      {isOpen && (
        <DownloadModal
          initialRef={initialRef}
          finalRef={finalRef}
          isOpen={isOpen}
          onClose={onClose}
          productId={productId}
          sbomId={sbomId}
          productName={sbom?.project?.name}
          version={sbom?.primaryComponent?.version}
        />
      )}

      {/*  SET PRIMARY COMPONENT */}
      {isPrimaryOpen && allComponents && (
        <CheckModal
          refetch={refetch}
          shortDesc={'Document has a primary component'}
          checkId={null}
          isOpen={isPrimaryOpen}
          components={allComponents?.sbom?.components?.nodes}
          onClose={onPrimaryClose}
        />
      )}

      {/* UPDATE PRIMARY COMPONENT */}
      {isSBMOpen && (
        <ComponentDrawer
          isOpen={isSBMOpen}
          onClose={setSBMClose}
          btnRef={btnRef}
          data={sbom?.primaryComponent}
          fetchCompData={fetchCompData}
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
          version={sbom?.primaryComponent?.version}
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
