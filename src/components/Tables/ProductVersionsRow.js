import {
  IconButton,
  Flex,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Icon,
  Switch,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Portal,
  useDisclosure
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaEllipsisV } from 'react-icons/fa'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import { useMutation } from '@apollo/client'
import { DeleteProject } from 'graphQL/Mutation'

function ProductVersionsRow(props) {
  const [projectDelete] = useMutation(DeleteProject)

  const { id, name, version, active, description, vendor, allProjects } = props
  const textColor = useColorModeValue('gray.700', 'white')
  const [checked, setChecked] = useState(active ? true : false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isOpenProduct,
    onOpen: onOpenProduct,
    onClose: onCloseProduct
  } = useDisclosure()

  const btnRefProduct = useRef()

  const url = `/vendor/products?p=${name}&v=${version}`

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

  return (
    <>
      <Tr>
        <Td pl={0}>
          <Switch size='md' defaultChecked />
        </Td>
        <Td pl={0}>
          <Text color={'blue.500'} minWidth='100%'>
            <Link to={url}>{name}</Link>
          </Text>
        </Td>
        <Td pl={0}>
          <Flex direction='column'>
            <Text color={textColor} minWidth='100%'>
              {description}
            </Text>
          </Flex>
        </Td>

        <Td pl={0}>
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
                <MenuItem onClick={onOpen}>Edit</MenuItem>
                <MenuItem ref={btnRefProduct} onClick={onOpenProduct}>
                  Upload
                </MenuItem>
                <MenuItem onClick={onProductDelete}>Archive</MenuItem>
              </MenuList>
            </Portal>
          </Menu>

          <UploadModal isOpen={isOpenProduct} onClose={onCloseProduct} />

          <ProductModal
            id={id}
            isOpen={isOpen}
            onClose={onClose}
            product={name}
            description={description}
            vendorName={vendor}
            allProjects={allProjects}
          />
        </Td>
      </Tr>
    </>
  )
}

export default ProductVersionsRow
