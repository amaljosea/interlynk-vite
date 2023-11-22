import { useMutation } from '@apollo/client'
import { EditIcon, InfoIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
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
import MultiSelect from 'react-select'
import { licenseOptions } from 'variables/licenses'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'
import { sbomUpdate } from 'graphQL/Mutation'

const GeneralDataRow = ({ status, data, refetch }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const textColor = useColorModeValue('gray.700', 'white')

  const customerView = location.pathname.startsWith('/customer')

  const [selectedKey, setSelectedKey] = useState('')
  const [licenseList, setLicenseList] = useState([])
  const [imgIds, setImgIds] = useState([])
  const [activeTool, setActiveTool] = useState(null)

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

  const handleSupRemove = async (id) => {
    try {
      await deleteSupplier({
        variables: {
          id: id
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

  const handleLicenseOpen = () => {
    if (data && data.licenses.length > 0) {
      const commonValues = licenseOptions.filter((item1) =>
        data.licenses.includes(item1.licenseId)
      )
      const finalData = commonValues.map((item) => {
        return {
          value: item.licenseId,
          label: item.name
        }
      })
      setLicenseList(finalData)
    }
    onSBMOpen()
  }

  const licenses = licenseOptions.map((option) => ({
    value: option.licenseId,
    label: option.name
  }))

  useEffect(() => {
    if (data && data.licenses.length === 0) {
      setLicenseList([
        {
          value: 'CC0-1.0',
          label: 'Creative Commons Zero v1.0 Universal'
        }
      ])
    } else {
      setImgIds(data.licenses)
    }
  }, [data])

  const onLicenseChange = (selected) => {
    setLicenseList(selected)
    const selectedIds = selected.map((option) => option.value) // Extracting IDs
    setImgIds(selectedIds)
  }

  const onUpdateLicense = async () => {
    try {
      await updateSbom({
        variables: {
          id: data.id,
          spec: 'cyclonedx',
          licenses: data && data.licenses.length === 0 ? ['CC0-1.0'] : imgIds
        }
      }).then((res) => res.data && onSBMClose())
    } catch (error) {
      console.log(`Mutation error `, error)
    }
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
                          {item.name}
                          {item.contactEmail && (
                            <>
                              {' - '}
                              {item.contactEmail}
                            </>
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
                  <Tooltip label='Data licence is a legal arrangement between the creator of the data and the end-user, or the place the data will be deposited, specifying what users can do with the data'>
                    <Icon as={InfoIcon} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </Td>
              <Td pl={0}>
                <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
                  {data.licenses.length > 0 &&
                    data.licenses.map((item, index) => (
                      <Tooltip key={index} label={item} placement={'top'}>
                        <Link
                          href={`https://spdx.org/licenses/${item}`}
                          target='_blank'
                        >
                          <Tag
                            size={'md'}
                            key={index}
                            variant='subtle'
                            colorScheme='green'
                            width={'fit-content'}
                          >
                            <TagLabel>{item}</TagLabel>
                          </Tag>
                        </Link>
                      </Tooltip>
                    ))}
                </Flex>
              </Td>
              <Td pl={0}>
                {!customerView && (
                  <Button
                    size='sm'
                    ref={licenseBtn}
                    isDisabled={status === 'signed'}
                    onClick={handleLicenseOpen}
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

      {/* SBOM DRAWER */}
      {isSBMOpen && data && !customerView && (
        <Modal isOpen={isSBMOpen} onClose={onSBMClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{data ? 'Update' : 'Save'} License</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Licenses</Text>
                    <Tooltip label='List of licenses applicable to the component'>
                      <Icon as={InfoIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <MultiSelect
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? 'inherit' : 'inherit',
                      '&:hover': {
                        borderColor: '#CBD5E0'
                      }
                    })
                  }}
                  isMulti
                  value={licenseList}
                  options={licenses}
                  onChange={onLicenseChange}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button fontSize={'sm'} mr={3} onClick={onSBMClose}>
                Close
              </Button>
              {data ? (
                <Button
                  fontSize={'sm'}
                  colorScheme='blue'
                  onClick={onUpdateLicense}
                >
                  Update
                </Button>
              ) : (
                <Button fontSize={'sm'} colorScheme='blue'>
                  Save
                </Button>
              )}
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
    </>
  )
}

export default GeneralDataRow
