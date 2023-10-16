import { useMutation } from '@apollo/client'
import { EditIcon, QuestionIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  HStack,
  Icon,
  Link,
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
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import { authorDelete } from 'graphQL/Mutation'
import { toolDelete } from 'graphQL/Mutation'
import { supplierDelete } from 'graphQL/Mutation'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'
import { timeSince } from 'utils'
import { licenseOptions } from 'variables/licenses'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'

const GeneralDataRow = ({ status, type, data, refetch }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const textColor = useColorModeValue('gray.700', 'white')

  const customerView = location.pathname.startsWith('/customer')

  const [selectedKey, setSelectedKey] = useState('')

  const btnRef = useRef(null)
  const licenseBtn = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

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

  const [filteredLicense, setFilteredLicense] = useState([])

  const [deleteSupplier] = useMutation(supplierDelete)
  const [deleteTool] = useMutation(toolDelete)
  const [deleteAuthor] = useMutation(authorDelete)

  useEffect(() => {
    if (data.licenses !== null && data.licenses.length > 0) {
      // console.log(`license item`, licenses)
      const filtered = licenseOptions.filter((item) =>
        data.licenses.includes(item.licenseId)
      )
      // console.log(`filtered item`, filtered)
      setFilteredLicense(filtered)
    }
  }, [data])

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
                    <Icon as={QuestionIcon} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </Td>
              <Td pl={0}>
                <Flex
                  flexDirection={'column'}
                  alignItems={'flex-start'}
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
                        <TagCloseButton
                          onClick={() => handleToolRemove(item.id)}
                        />
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
            {/* UPDATED AT */}
            {/*             <Tr>
              <Td pl={0} fontWeight={'medium'}>
                Updated At
              </Td>
              <Td pl={0}>{timeSince(data.updatedAt)}</Td>
              <Td pl={0}></Td>
            </Tr> */}
            {/* AUTHORS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                  <Text>Author(s)</Text>
                  <Tooltip label='In case of non-automated SBOM generation, Author(s) identifies the name and email of persons invovlved in building the SBOM.'>
                    <Icon as={QuestionIcon} color={'blue.500'} />
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
                        <TagCloseButton
                          onClick={() => handleAuthorRemove(item.id)}
                        />
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
                    <Icon as={QuestionIcon} color={'blue.500'} />
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
                          {item.name} - {item.contactEmail}
                        </TagLabel>
                        <TagCloseButton
                          onClick={() => handleSupRemove(item.id)}
                        />
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
                License
              </Td>
              <Td pl={0}>
                <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
                  {filteredLicense.length > 0 &&
                    filteredLicense.map((item, index) => (
                      <Tooltip key={index} label={item.name} placement={'top'}>
                        <Link href={item.reference} target='_blank'>
                          <Tag
                            size={'md'}
                            key={index}
                            variant='subtle'
                            colorScheme='green'
                            width={'fit-content'}
                          >
                            <TagLabel>{item.licenseId}</TagLabel>
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
                    onClick={onSBMOpen}
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
          shortDesc={null}
        />
      )}

      {/* SBOM DRAWER */}
      {isSBMOpen && data && !customerView && (
        <ProductSbomDrawer
          isOpen={isSBMOpen}
          onClose={onSBMClose}
          btnRef={licenseBtn}
          projectId={productId}
          name={data.project.name}
          refetch={refetch}
          sbomData={data}
          type={type}
        />
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
    </>
  )
}

export default GeneralDataRow
