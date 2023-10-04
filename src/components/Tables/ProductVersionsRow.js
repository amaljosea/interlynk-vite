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
  Button
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaEllipsisV } from 'react-icons/fa'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import { useMutation } from '@apollo/client'
import { DeleteProject } from 'graphQL/Mutation'
import { timeSince } from 'utils'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import { useEffect } from 'react'

function ProductVersionsRow(props) {
  const [projectDelete] = useMutation(DeleteProject)

  const {
    id,
    sbomId,
    name,
    description,
    updatedAt,
    allProjects,
    fetchProjects,
    isLoading,
    refetch
  } = props

  const { isOpen, onOpen, onClose } = useDisclosure()
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
            <Switch size='md' defaultChecked />
          )}
        </Td>
        <Td pl={0}>
          {isLoading ? (
            <Skeleton height='20px' />
          ) : sbomId.length > 0 ? (
            <Link
              to={`/vendor/products?p=${id}&sbom=${
                filteredData.length > 0 ? filteredData[0].id : sbomId[0].id
              }`}
              onClick={() => {
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
                  <MenuItem onClick={onOpen}>Edit Product</MenuItem>
                  <MenuItem onClick={onSbomOpen}>Create SBOM</MenuItem>
                  <MenuItem ref={btnRefProduct} onClick={onOpenProduct}>
                    Upload SBOM
                  </MenuItem>
                  <MenuItem onClick={onDeleteOpen}>Archive Product</MenuItem>
                  <Link to={`/vendor/autofix?p=${name}`}>
                    <MenuItem>Settings</MenuItem>
                  </Link>
                </MenuList>
              </Portal>
            </Menu>
          )}

          {isOpenProduct && (
            <UploadModal
              id={id}
              isOpen={isOpenProduct}
              onClose={onCloseProduct}
              fetchProjects={fetchProjects}
            />
          )}

          {isOpen && (
            <ProductModal
              id={id}
              isOpen={isOpen}
              onClose={onClose}
              product={name}
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
                <ModalHeader>Archive ?</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text fontSize={'lg'}>Archiving this product will : </Text>
                  <Flex flexDir={'column'} gap={1} mt={4}>
                    {[
                      'Remove this product, associated versions and their SBOMs',
                      "Remove access to this product's details on connected Share Lynk's"
                    ].map((item, index) => (
                      <Text key={index} fontSize={'sm'}>
                        {item}
                      </Text>
                    ))}
                  </Flex>
                  <br />
                  <Text mt={4} fontSize={'sm'}>
                    Are you sure you want to continue with the deletion ?
                  </Text>
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
        </Td>
      </Tr>
    </>
  )
}

export default ProductVersionsRow
