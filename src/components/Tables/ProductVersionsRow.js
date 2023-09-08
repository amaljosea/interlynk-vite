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
  Skeleton
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

function ProductVersionsRow(props) {
  const [projectDelete] = useMutation(DeleteProject)

  const {
    id,
    sbomId,
    name,
    active,
    description,
    updatedAt,
    vendor,
    allProjects,
    fetchProjects,
    isLoading,
    refetch
  } = props
  const textColor = useColorModeValue('gray.700', 'white')
  const [checked, setChecked] = useState(active ? true : false)

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

  // console.log(`sbomId`, sbomId)

  const uniqVersions = []

  sbomId &&
    sbomId.map((project) => {
      project.components.map((sbom) => {
        if (sbom.primary === true) {
          uniqVersions.push({
            version: sbom.version,
            id: project.id
          })
        }
      })
    })

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
              to={`/vendor/products?p=${id}&sbom=${sbomId[0].id}`}
              onClick={() => {
                window.localStorage.setItem('product', name)
              }}
            >
              <Text color={'blue.500'} minWidth='100%'>
                {name}
              </Text>
            </Link>
          ) : (
            <Text
              color={'blue.500'}
              minWidth='100%'
              onClick={() => window.location.reload()}
              cursor={'pointer'}
            >
              {name}
            </Text>
          )}
        </Td>
        <Td pl={0}>
          {isLoading ? (
            <Skeleton height='20px' />
          ) : (
            <Text>{sbomId.length}</Text>
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
                  <MenuItem onClick={onProductDelete}>Archive Product</MenuItem>
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
              vendorName={vendor}
              allProjects={allProjects}
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
            />
          )}
        </Td>
      </Tr>
    </>
  )
}

export default ProductVersionsRow
