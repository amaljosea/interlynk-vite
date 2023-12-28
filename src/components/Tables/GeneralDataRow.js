import { useMutation } from '@apollo/client'
import { EditIcon, InfoIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
  Tooltip,
  Tr,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'
import CardBody from 'components/Card/CardBody'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import { authorDelete } from 'graphQL/Mutation'
import { toolDelete } from 'graphQL/Mutation'
import { supplierDelete } from 'graphQL/Mutation'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'
import { sbomUpdate } from 'graphQL/Mutation'
import SbomLicenseField from 'components/SbomLicenseField'
import { useGlobalState } from 'hooks/useGlobalState'

const GeneralDataRow = ({ status, data, refetch }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const { sbomState, dispatch } = useGlobalState()
  const { licenseType, spdxLicenses, expLicense, customLicenses } = sbomState
  const { sbomDispatch } = dispatch

  const textColor = useColorModeValue('gray.700', 'white')
  const customerView = location.pathname.startsWith('/customer')
  const [selectedKey, setSelectedKey] = useState('')
  const [activeTool, setActiveTool] = useState(null)
  const [isValid, setIsValid] = useState(true)

  const btnRef = useRef(null)
  const licenseBtn = useRef(null)

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

  const handleRefetch = () => {
    refetch({
      projectId: productId,
      sbomId: sbomId
    })
  }

  const [deleteSupplier] = useMutation(supplierDelete)
  const [deleteTool] = useMutation(toolDelete)
  const [deleteAuthor] = useMutation(authorDelete)
  const [updateSbom] = useMutation(sbomUpdate, {
    onCompleted: () => handleRefetch()
  })

  const handleToolRemove = async (id) => {
    try {
      await deleteTool({
        variables: {
          toolID: id,
          sbomID: sbomId
        }
      })
        .then((res) => {
          if (res) {
            refetch({
              productId: productId,
              sbomId: sbomId
            })
          }
        })
        .finally(() => onDelClose())
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const handleAuthorRemove = async (id) => {
    try {
      await deleteAuthor({
        variables: {
          authorId: id,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res) {
          refetch({
            productId: productId,
            sbomId: sbomId
          })
        }
      })
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const handleClick = (ref) => {
    setSelectedKey(ref)
    onOpen()
  }

  const handleSupRemove = async (id) => {
    await deleteSupplier({
      variables: {
        id: id
      }
    }).then(
      (res) =>
        res.data &&
        refetch({
          productId: productId,
          sbomId: sbomId
        })
    )
  }

  const onLicenseOpen = () => {
    console.log(data)
    sbomDispatch({ type: 'SET_LICENSES', payload: data })
    onSBMOpen()
  }

  const onUpdateLicense = async () => {
    console.log('expLicense', expLicense)
    await updateSbom({
      variables: {
        id: data.id,
        spec: data.spec,
        licenses: {
          licenses:
            licenseType === 'license_spdx'
              ? spdxLicenses
                ? spdxLicenses
                : []
              : undefined,
          licensesExp:
            licenseType === 'license_exp'
              ? expLicense
                ? expLicense
                : ''
              : undefined,
          licensesCustom:
            licenseType === 'license_custom'
              ? customLicenses
                ? customLicenses
                : []
              : undefined
        }
      }
    })
      .then((res) => res.data && sbomDispatch({ type: 'CLEAR_LICENSES' }))
      .finally(() => onSBMClose())
  }

  const handleRemoveSpdx = async (license) => {
    const filterList =
      data.licenses.length > 0 &&
      data.licenses.filter((item) => item !== license)
    await updateSbom({
      variables: {
        id: data.id,
        spec: data.spec,
        licenses: {
          licenses: filterList ? filterList : []
        }
      }
    }).then((res) => res.data && onSBMClose())
  }

  const handleRemoveExp = async () => {
    await updateSbom({
      variables: {
        id: data.id,
        spec: data.spec,
        licenses: {
          licensesExp: null
        }
      }
    }).then((res) => res.data && onSBMClose())
  }

  const handleRemoveCustom = async (license) => {
    const filterList =
      data.licensesCustom.length > 0 &&
      data.licensesCustom.filter((item) => item !== license)
    await updateSbom({
      variables: {
        id: data.id,
        spec: data.spec,
        licenses: {
          licensesCustom: filterList ? filterList : []
        }
      }
    }).then((res) => res.data && onSBMClose())
  }

  // ADD KEYBOARD SHORTCUT FOR TOGGLE SBOM DRAWER
  const handleSBMDown = (event) => {
    if (event.altKey && event.key === '2') {
      onSBMToggle()
    }
  }

  // KEYBOARD EVENT LISTNER FOR SBOM DRAWER
  useEffect(() => {
    window.addEventListener('keydown', handleSBMDown)

    return () => {
      window.removeEventListener('keydown', handleSBMDown)
    }
  }, [])

  return (
    <>
      <CardBody>
        <Table
          __css={{ tableLayout: 'fixed', width: 'full' }}
          variant='simple'
          color={textColor}
          size='sm'
          mt={10}
        >
          {/* TABLE HEAD */}
          <Thead>
            <Tr>
              <Th></Th>
              <Th></Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* CREATION TOOLS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                  <Text>Creation Tools</Text>
                  <Tooltip label='Creator Tool(s) identify all the software tools and their versions used in building the SBOM. Interlynk is automatically added as one of the tools'>
                    <Icon as={InfoIcon} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </Td>
              <Td pl={0}>
                <Flex
                  flexDirection={'row'}
                  alignItems={'flex-start'}
                  flexWrap={'wrap'}
                  gap={2.5}
                >
                  {data.tools &&
                    data.tools.map((item, index) => (
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
                        {!customerView && (
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
                {!customerView && (
                  <Button
                    size='sm'
                    isDisabled={status === 'signed'}
                    onClick={() => handleClick('tools')}
                  >
                    <Icon as={EditIcon} color={'blue.500'} cursor={'pointer'} />
                  </Button>
                )}
              </Td>
            </Tr>
            {/* CREATED AT */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                Created At
              </Td>
              <Td pl={0}>{getFullDateAndTime(data.creationAt)}</Td>
              <Td pl={0}></Td>
            </Tr>
            {/* AUTHORS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                  <Text>Author(s)</Text>
                  <Tooltip label='In case of non-automated SBOM generation, Author(s) identifies the name and email of persons involved in building the SBOM.'>
                    <Icon as={InfoIcon} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </Td>
              <Td pl={0}>
                <Stack spacing={2} direction={'column'}>
                  {data.authors &&
                    data.authors.length > 0 &&
                    data.authors.map((item, index) => (
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
                        {!customerView && (
                          <TagCloseButton
                            onClick={() => handleAuthorRemove(item.id)}
                          />
                        )}
                      </Tag>
                    ))}
                </Stack>
              </Td>
              <Td pl={0}>
                {!customerView && (
                  <Button
                    size='sm'
                    isDisabled={status === 'signed'}
                    onClick={() => handleClick('author')}
                  >
                    <Icon as={EditIcon} color={'blue.500'} cursor={'pointer'} />
                  </Button>
                )}
              </Td>
            </Tr>
            {/* SUPPLIERS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                  <Text>Supplier</Text>
                  <Tooltip label='Supplier identify the name and email of the organization that built, distributed or package the application. For Open-source components, it can refer to the name of the project or entity distributing the project.'>
                    <Icon as={InfoIcon} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </Td>
              <Td pl={0}>
                <HStack spacing={4}>
                  {data.suppliers &&
                    data.suppliers.map((item, index) => (
                      <Tag
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='orange'
                      >
                        <TagLabel>
                          {item.contactName}
                          {item.contactEmail && ` (${item.contactEmail})`}
                          {item.url ? (
                            <Link href={item.url} isExternal>
                              {' '}
                              {item.name}
                            </Link>
                          ) : (
                            ` ${item.name}`
                          )}
                        </TagLabel>
                        {!customerView && (
                          <TagCloseButton
                            onClick={() => handleSupRemove(item.id)}
                          />
                        )}
                      </Tag>
                    ))}
                </HStack>
              </Td>
              <Td pl={0}>
                {!customerView && (
                  <Button
                    size='sm'
                    isDisabled={status === 'signed'}
                    onClick={onSupOpen}
                  >
                    <Icon as={EditIcon} color={'blue.500'} cursor={'pointer'} />
                  </Button>
                )}
              </Td>
            </Tr>
            {/* LICENSES */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                  <Text>Data License</Text>
                  <Icon
                    as={InfoIcon}
                    color={'blue.500'}
                    onClick={onInfoOpen}
                    cursor={'pointer'}
                  />
                </Flex>
              </Td>
              <Td pl={0}>
                <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
                  {/* SPDX */}
                  {data.licenses?.length > 0 &&
                    data.licenses?.map((item, index) => (
                      <Tag
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
                  {data.licensesExp && data.licensesExp !== '' && (
                    <Tag
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{data.licensesExp}</TagLabel>
                    </Tag>
                  )}
                  {/* CUSTOM */}
                  {data.licensesCustom?.length > 0 &&
                    data.licensesCustom.map((item, index) => (
                      <Tag
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='green'
                        width={'fit-content'}
                      >
                        <TagLabel>{item}</TagLabel>
                      </Tag>
                    ))}
                </Flex>
              </Td>
              <Td pl={0}>
                {!customerView && (
                  <Button
                    size='sm'
                    ref={licenseBtn}
                    isDisabled={status === 'signed'}
                    onClick={onLicenseOpen}
                  >
                    <Icon as={EditIcon} color={'blue.500'} cursor={'pointer'} />
                  </Button>
                )}
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
      {isSBMOpen && data && !customerView && (
        <Modal isOpen={isSBMOpen} onClose={onSBMClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {data?.licenses?.length > 0 ? 'Update' : 'Add'} License
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <SbomLicenseField isValid={isValid} setIsValid={setIsValid} />
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
                {data.licenses.length > 0 ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* SUPPLIER MODAL */}
      {isSupOpen && data && (
        <PriSupplierModal
          refetch={refetch}
          isOpen={isSupOpen}
          onClose={onSupClose}
          suppliers={data.suppliers}
          checkId={null}
          shortDesc={null}
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
        <Modal
          isOpen={isInfoOpen}
          onClose={onInfoClose}
          motionPreset='slideInBottom'
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Data Licenses</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Data licence is a legal arrangement between the creator of the
                data and the end-user, or the place the data will be deposited,
                specifying what users can do with the data
              </Text>
              <Link href='https://spdx.dev/about/overview' target='_blank'>
                <Text mt={4} color='blue.500' fontWeight={'medium'}>
                  Learn more about data licenses
                </Text>
              </Link>
            </ModalBody>

            <ModalFooter>
              <Button
                variant='unstyled'
                colorScheme='red'
                onClick={onInfoClose}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default GeneralDataRow
