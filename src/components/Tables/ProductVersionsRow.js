import {
  IconButton,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Switch,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Portal,
  useDisclosure,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Button,
  UnorderedList,
  ListItem,
  Divider
} from '@chakra-ui/react'
import { useState, useRef, useContext, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FaEllipsisV } from 'react-icons/fa'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import { useMutation } from '@apollo/client'
import { DeleteProject } from 'graphQL/Mutation'
import { timeSince } from 'utils'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import GlobalContext from 'context/GlobalContext'

function ProductVersionsRow(props) {
  const history = useHistory()
  const { setActiveProduct } = useContext(GlobalContext)
  const [projectDelete] = useMutation(DeleteProject)

  const {
    id,
    sbomId,
    name,
    description,
    updatedAt,
    allProjects,
    isLoading,
    refetch
  } = props

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isActive, setIsActive] = useState(true)

  const {
    isOpen: isOpenProduct,
    onOpen: onOpenProduct,
    onClose: onCloseProduct
  } = useDisclosure()
  const {
    isOpen: isSbomOpen,
    onOpen: onSbomOpen,
    onClose: onSbomClose
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const {
    isOpen: isWarning,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const btnRefProduct = useRef()
  const sbomBtn = useRef()

  const onProductDelete = async () => {
    try {
      await projectDelete({
        variables: {
          id
        }
      }).then((res) => window.location.reload())
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const uniqVersions = []

  sbomId &&
    sbomId.map((project) => {
      if (project.primaryComponent) {
        uniqVersions.push({
          version: project.primaryComponent.version,
          id: project.id,
          updatedAt: project.updatedAt
        })
      }
    })

  const removeDuplicatesAndLatest = (arr) => {
    const uniqueVersions = {}

    for (const item of arr) {
      if (
        !uniqueVersions[item.version] ||
        item.updatedAt > uniqueVersions[item.version].updatedAt
      ) {
        uniqueVersions[item.version] = item
      }
    }

    return Object.values(uniqueVersions)
  }

  const filteredData = uniqVersions
    ? removeDuplicatesAndLatest(uniqVersions)
    : []

  const handleChange = () => {
    onWarningOpen()
  }

  // useEffect(() => {
  // if (filteredData.length > 0) {
  //   console.log(`filteredData`, filteredData)
  // }
  // }, [])

  return (
    <>
      <Tr>
        <Td pl={0}>
          {isLoading ? (
            <Skeleton height='20px' my={2} />
          ) : (
            <Switch size='md' isChecked={isActive} onChange={handleChange} />
          )}
        </Td>
        <Td pl={0}>
          {isLoading ? (
            <Skeleton height='20px' />
          ) : sbomId.length > 0 ? (
            <Link
              to={`/vendor/products?tab=0&p=${id}&sbom=${
                filteredData.length > 0 ? filteredData[0].id : sbomId[0].id
              }`}
              onClick={() => {
                window.localStorage.setItem('activeProdTab', 0)
                window.localStorage.setItem('product', name)
              }}
            >
              <Text color={'blue.500'} minWidth='100%'>
                {name}
              </Text>
            </Link>
          ) : (
            <Text minWidth='100%'>{name}</Text>
          )}
        </Td>
        <Td pl={0}>
          {isLoading ? (
            <Skeleton height='20px' />
          ) : (
            <Text>{filteredData?.length}</Text>
          )}
        </Td>
        <Td pl={0}>{isLoading ? <Skeleton height='20px' /> : description}</Td>
        <Td pl={0}>
          {isLoading ? <Skeleton height='20px' /> : timeSince(updatedAt)}
        </Td>
        <Td pl={0}>
          {isLoading ? (
            <Skeleton height='20px' />
          ) : (
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<FaEllipsisV />}
                variant='none'
                color='gray.400'
              />
              <Portal>
                <MenuList size='sm'>
                  <MenuItem onClick={onOpen} isDisabled={!isActive}>
                    Edit Product
                  </MenuItem>
                  <MenuItem
                    isDisabled={!isActive}
                    onClick={() => {
                      window.localStorage.setItem('activeProduct', name)
                      history.push(`/vendor/autofix?id=${id}`)
                    }}
                  >
                    Edit Automation
                  </MenuItem>
                  <MenuItem
                    isDisabled={!isActive}
                    onClick={() => {
                      window.localStorage.setItem('activeProduct', name)
                      history.push(`/vendor/changelog?id=${id}`)
                    }}
                  >
                    View Change Log
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={onSbomOpen} isDisabled={!isActive}>
                    Build SBOM
                  </MenuItem>
                  <MenuItem
                    ref={btnRefProduct}
                    onClick={onOpenProduct}
                    isDisabled={!isActive}
                  >
                    Upload SBOM
                  </MenuItem>
                  <Divider />
                  <MenuItem color='red' onClick={onDeleteOpen}>
                    Archive Product
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )}

          {isOpenProduct && (
            <UploadModal
              id={id}
              isOpen={isOpenProduct}
              onClose={onCloseProduct}
            />
          )}

          {isOpen && (
            <ProductModal
              id={id}
              isOpen={isOpen}
              onClose={onClose}
              product={name}
              refetch={refetch}
              description={description}
              allProjects={allProjects}
              type={sbomId.length > 0 && sbomId[0].format}
            />
          )}

          {isSbomOpen && (
            <ProductSbomDrawer
              isOpen={isSbomOpen}
              onClose={onSbomClose}
              btnRef={sbomBtn}
              projectId={id}
              name={name}
              refetch={refetch}
              sbomData={null}
              type={sbomId.length > 0 && sbomId[0].format}
            />
          )}

          {/* delete */}
          {isDeleteOpen && (
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Archive Product</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>Archiving this product will: </Text>
                  <UnorderedList>
                    <Flex flexDir={'column'} gap={1} mt={4}>
                      {[
                        'remove this product, its versions and SBOMs',
                        'remove access to the product for all users',
                        'disable uploads of SBOMs to this product'
                      ].map((item, index) => (
                        <ListItem>{item}</ListItem>
                      ))}
                    </Flex>
                  </UnorderedList>
                  <br />
                  <Text mt={10}>Are you sure you wish to continue?</Text>
                </ModalBody>
                <ModalFooter>
                  <Button mr={3} onClick={onDeleteClose}>
                    No
                  </Button>
                  <Button colorScheme='red' onClick={onProductDelete}>
                    Yes
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )}

          {/* disable */}
          {isWarning && (
            <Modal isOpen={isWarning} onClose={onWarningClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  {isActive ? 'Disable' : 'Enable'} Product
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>
                    {isActive ? 'Disable' : 'Enable'} this product will:{' '}
                  </Text>
                  <UnorderedList>
                    <Flex flexDir={'column'} gap={1} mt={4}>
                      {[
                        `${
                          isActive ? 'Disable' : 'Enable'
                        } this product, its versions and SBOMs`,
                        `${
                          isActive ? 'Disable' : 'Enable'
                        } access to the product for all users`,
                        `${
                          isActive ? 'Disable' : 'Enable'
                        } uploads of SBOMs to this product`
                      ].map((item, index) => (
                        <ListItem>{item}</ListItem>
                      ))}
                    </Flex>
                  </UnorderedList>
                  <br />
                  <Text mt={10}>Are you sure you wish to continue?</Text>
                </ModalBody>
                <ModalFooter>
                  <Button mr={3} onClick={onWarningClose}>
                    No
                  </Button>
                  <Button
                    colorScheme={isActive ? 'red' : 'green'}
                    onClick={() => {
                      setIsActive(!isActive)
                      onWarningClose()
                    }}
                  >
                    Yes
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )}
        </Td>
      </Tr>
    </>
  )
}

export default ProductVersionsRow
