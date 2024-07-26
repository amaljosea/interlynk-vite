import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'

import { EditIcon, InfoIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import InfoModal from 'components/InfoModal'
import LicenseField from 'components/Licenses/LicenseField'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'

import {
  authorDelete,
  sbomUpdate,
  supplierDelete,
  toolDelete
} from 'graphQL/Mutation'

const InfoLabel = ({ title, onClick }) => {
  return (
    <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
      <Text>{title}</Text>
      <Icon
        as={InfoIcon}
        color={'blue.500'}
        cursor={'pointer'}
        onClick={onClick}
      />
    </Flex>
  )
}

const General = ({ data, refetch, loading, error }) => {
  const location = useLocation()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const {
    id,
    spec,
    suppliers,
    licensesExp,
    licenses,
    authors,
    creationAt,
    tools
  } = data || ''

  const { sbomState, dispatch } = useGlobalState()
  const { expLicense } = sbomState
  const { sbomDispatch } = dispatch

  const updateComponent = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const editSboms = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const btnRef = useRef(null)
  const textColor = useColorModeValue('gray.700', 'white')
  const iconColor = useColorModeValue('blue.500', 'gray.100')
  const customerView = location?.pathname?.startsWith('/customer')
  const [selectedKey, setSelectedKey] = useState('')
  const [activeTool, setActiveTool] = useState(null)
  const [isValid, setIsValid] = useState(true)
  const [infoHeading, setInfoHeading] = useState('')
  const [infoText, setInfoText] = useState('')
  const [infoUrl, setInfoUrl] = useState('')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()
  const {
    isOpen: isSBMOpen,
    onOpen: onSBMOpen,
    onClose: onSBMClose,
    onToggle: onSBMToggle
  } = useDisclosure()
  const {
    isOpen: isSupOpen,
    onOpen: onSupOpen,
    onClose: onSupClose
  } = useDisclosure()
  const {
    isOpen: isInfoOpen,
    onOpen: onInfoOpen,
    onClose: onInfoClose
  } = useDisclosure()

  const [deleteSupplier] = useMutation(supplierDelete)
  const [deleteTool] = useMutation(toolDelete)
  const [deleteAuthor] = useMutation(authorDelete)
  const [updateSbom] = useMutation(sbomUpdate, {
    onCompleted: () => refetch()
  })

  const handleToolRemove = async (id) => {
    try {
      await deleteTool({ variables: { toolID: id, sbomID: sbomId } })
        .then((res) => res?.data && refetch())
        .finally(() => onDelClose())
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const handleAuthorRemove = async (id) => {
    try {
      await deleteAuthor({ variables: { authorId: id, sbomId } }).then(
        (res) => res?.data && refetch({ productId: productId, sbomId })
      )
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const handleClick = (ref) => {
    setSelectedKey(ref)
    onOpen()
  }

  const handleSupRemove = async (id) => {
    await deleteSupplier({ variables: { id: id } }).then(
      (res) => res.data && refetch({ productId: productId, sbomId })
    )
  }

  // const onRemoveLicense = async () => console.log('License');

  const onLicenseOpen = () => {
    sbomDispatch({ type: 'SET_LICENSES', payload: licensesExp })
    onSBMOpen()
  }

  const onUpdateLicense = async () => {
    await updateSbom({
      variables: {
        id: id,
        spec: spec,
        licenses: { licensesExp: expLicense || '' }
      }
    })
      .then((res) => res.data && sbomDispatch({ type: 'CLEAR_LICENSES' }))
      .finally(() => onSBMClose())
  }

  // ADD KEYBOARD SHORTCUT FOR TOGGLE SBOM DRAWER
  const handleSBMDown = useCallback(
    (event) => {
      if (event.altKey && event.key === '2') {
        onSBMToggle()
      }
    },
    [onSBMToggle]
  )

  const onCheckTime = () => {
    setInfoHeading(`Creation At`)
    setInfoText(
      `Created At is the date and time when the SBOM describing this version was generated. This can be different from the import time of the SBOM.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }

  const onCheckTool = () => {
    setInfoHeading(`Creation Tool`)
    setInfoText(
      `Creation Tool(s) identify all the software tools and their versions used in building the SBOM describing this version. Interlynk's SbomZen is automatically added as one of the tools to represents edits done on the platform.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }

  const onCheckAuthor = () => {
    setInfoHeading(`Author`)
    setInfoText(
      `Author(s) is the name of the entity that created the SBOM data.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }

  const onCheckSupplier = () => {
    setInfoHeading(`Supplier`)
    setInfoText(
      `Supplier identifies the name and email of the organization that built, distributed or packaged this version of the application. For open-source components, Supplier can refer to the name of the project or entity distributing the project.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }

  // KEYBOARD EVENT LISTNER FOR SBOM DRAWER
  useEffect(() => {
    window.addEventListener('keydown', handleSBMDown)
    return () => {
      window.removeEventListener('keydown', handleSBMDown)
    }
  }, [handleSBMDown])

  if (loading) {
    return (
      <Flex mt={4} width={'100%'} flexDir={'column'} gap={4}>
        {[1, 2].map((_, index) => (
          <Skeleton key={index} width={'100%'} height='20px' />
        ))}
      </Flex>
    )
  }

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <CardBody>
        <Table
          __css={{ tableLayout: 'fixed', width: 'full' }}
          variant='simple'
          color={textColor}
          size='sm'
        >
          {/* TABLE HEAD */}
          <Thead>
            <Tr>
              {[1, 2, 3].map((_, index) => (
                <Th key={index}></Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {/* CREATED AT */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <InfoLabel title={`Created At`} onClick={onCheckTime} />
              </Td>
              <Td pl={0}>
                <Text my={2}>
                  {creationAt ? getFullDateAndTime(creationAt) : ''}
                </Text>
              </Td>
              <Td pl={0}></Td>
            </Tr>
            {/* CREATION TOOLS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <InfoLabel title={`Creation Tool`} onClick={onCheckTool} />
              </Td>
              <Td pl={0}>
                <Flex
                  my={2}
                  flexDirection={'row'}
                  alignItems={'flex-start'}
                  flexWrap={'wrap'}
                  gap={2.5}
                >
                  {tools &&
                    tools.map((item, index) => (
                      <Tag
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='teal'
                        width={'fit-content'}
                      >
                        <TagLabel>
                          {item.name} - {item.version}
                        </TagLabel>
                        {updateComponent && (
                          <TagCloseButton
                            onClick={() => {
                              setActiveTool(item)
                              onDelOpen()
                            }}
                          />
                        )}
                      </Tag>
                    ))}
                </Flex>
              </Td>
              <Td pl={0}>
                <IconButton
                  size='sm'
                  isDisabled={customerView || !editSboms}
                  icon={<EditIcon color={iconColor} />}
                  onClick={() => handleClick('tools')}
                />
              </Td>
            </Tr>
            {/* AUTHORS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <InfoLabel title={`Authors`} onClick={onCheckAuthor} />
              </Td>
              <Td pl={0}>
                <Stack spacing={2} direction={'column'} my={2}>
                  {authors &&
                    authors.length > 0 &&
                    authors.map((item, index) => (
                      <Tag
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='blue'
                        width={'fit-content'}
                      >
                        <TagLabel>
                          {item.name} - {item.email}
                        </TagLabel>
                        {updateComponent && (
                          <TagCloseButton
                            onClick={() => handleAuthorRemove(item.id)}
                          />
                        )}
                      </Tag>
                    ))}
                </Stack>
              </Td>
              <Td pl={0}>
                <IconButton
                  size='sm'
                  isDisabled={customerView || !editSboms}
                  icon={<EditIcon color={iconColor} />}
                  onClick={() => handleClick('author')}
                />
              </Td>
            </Tr>
            {/* SUPPLIERS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <InfoLabel title={`Supplier`} onClick={onCheckSupplier} />
              </Td>
              <Td pl={0}>
                <HStack spacing={4}>
                  {suppliers?.length > 0 &&
                    suppliers.map((item, index) => (
                      <Tag
                        my={2}
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='orange'
                      >
                        <TagLabel>
                          {item?.contactName || ''}
                          {item?.contactEmail && ` (${item.contactEmail})`}
                          {item.url ? (
                            <Link
                              href={
                                item?.url?.startsWith('http')
                                  ? item.url
                                  : `http://${item.url}`
                              }
                              isExternal
                            >
                              {' '}
                              {item?.name || ''}
                            </Link>
                          ) : (
                            ` ${item?.name || ''}`
                          )}
                        </TagLabel>
                        {updateComponent && (
                          <TagCloseButton
                            onClick={() => handleSupRemove(item.id)}
                          />
                        )}
                      </Tag>
                    ))}
                </HStack>
              </Td>
              <Td pl={0}>
                <IconButton
                  size='sm'
                  isDisabled={customerView || !editSboms}
                  icon={<EditIcon color={iconColor} />}
                  onClick={onSupOpen}
                />
              </Td>
            </Tr>
            {/* LICENSES */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                Data License
              </Td>
              <Td pl={0}>
                <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
                  {/* SPDX */}
                  {licenses?.length > 0 &&
                    licenses?.map((item, index) => (
                      <Tag
                        my={2}
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='green'
                        width={'fit-content'}
                      >
                        <TagLabel>{item}</TagLabel>
                      </Tag>
                    ))}
                  {/* EXPRESSION */}
                  {licensesExp && licensesExp !== '' && (
                    <Tag
                      my={2}
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{licensesExp}</TagLabel>
                      {updateComponent && (
                        <TagCloseButton onClick={onUpdateLicense} />
                      )}
                    </Tag>
                  )}
                </Flex>
              </Td>
              <Td pl={0}>
                <IconButton
                  size='sm'
                  isDisabled={customerView || !editSboms}
                  icon={<EditIcon color={iconColor} />}
                  onClick={onLicenseOpen}
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </CardBody>

      {/* GENERAL DRAWER */}
      {data && isOpen && (
        <GeneralDataDrawer
          isOpen={isOpen}
          onClose={onClose}
          btnRef={btnRef}
          data={data}
          selectedKey={selectedKey}
          refetch={refetch}
          checkId={null}
        />
      )}

      {/* SBOM LICENSE DRAWER */}
      {isSBMOpen && data && (
        <Modal isOpen={isSBMOpen} onClose={onSBMClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {licensesExp?.length > 0 ? 'Update' : 'Add'} License
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <LicenseField
                sbomView={true}
                isValid={isValid}
                setIsValid={setIsValid}
                license={licensesExp}
              />
            </ModalBody>
            <ModalFooter>
              <Button fontSize={'sm'} mr={3} onClick={onSBMClose}>
                Close
              </Button>
              <Button
                fontSize={'sm'}
                colorScheme='blue'
                onClick={onUpdateLicense}
                isDisabled={!isValid}
              >
                {licensesExp?.length > 0 ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* SUPPLIER MODAL */}
      {isSupOpen && (
        <PriSupplierModal
          refetch={refetch}
          isOpen={isSupOpen}
          onClose={onSupClose}
          suppliers={suppliers}
          activeRow={null}
        />
      )}

      {/* TOOL DELETE MODAL */}
      {isDelOpen && activeTool && (
        <Modal isOpen={isDelOpen} onClose={onDelClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Remove Tool</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                You are about to delete the creator Tool : {activeTool.name}-
                {activeTool.version} from this version.
              </Text>
              <Text mt={4}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onDelClose}>
                Cancel
              </Button>
              <Button
                variant='solid'
                colorScheme='red'
                onClick={() => handleToolRemove(activeTool.id)}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* INFO MODAL */}
      {isInfoOpen && (
        <InfoModal
          isOpen={isInfoOpen}
          onClose={onInfoClose}
          heading={infoHeading}
          body={infoText}
          url={infoUrl}
        />
      )}
    </>
  )
}

export default General
