import {
  Tag,
  Flex,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Icon,
  Stack,
  useDisclosure,
  Box,
  IconButton,
  Menu,
  MenuButton,
  Portal,
  MenuList,
  MenuItem
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import { timeSince } from 'utils'
import { FaEllipsisV } from 'react-icons/fa'
import SupplierModal from 'views/Sbom/components/SupplierModal'

function SBOMComponentRow(props) {
  const {
    id,
    component,
    version,
    purl,
    licenses,
    updatedAt,
    cpes,
    type,
    primary,
    internal,
    suppliers,
    refetch
  } = props
  const location = useLocation()

  const customerView = location.pathname.startsWith('/sharelynk')

  const compBtn = useRef(null)

  const [contains, setcontains] = useState({})

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()

  const {
    isOpen: isSupOpen,
    onOpen: onSupOpen,
    onClose: onSupClose
  } = useDisclosure()

  useEffect(() => {
    const containsData = window.localStorage.getItem('contains')
    setcontains(JSON.parse(containsData))
  }, [])

  return (
    <Tr>
      <Td pl='0px'>
        <Box py='.8rem'>{component}</Box>
      </Td>
      <Td>
        <Box>{version}</Box>
      </Td>
      <Td>{purl}</Td>
      <Td>{suppliers.length > 0 && suppliers[0].name}</Td>
      <Td>
        {licenses.length > 0 &&
          licenses.map((item, i) => (
            <Flex gap={2} alignItems={'center'} key={i}>
              <Text>{item}</Text>
            </Flex>
          ))}
      </Td>
      <Td>
        <Box>{timeSince(updatedAt)}</Box>
      </Td>
      <Td>
        {!customerView && (
          // <Stack direction={'row'} spacing='24px'>
          //   <Icon
          //     as={EditIcon}
          //     color={'blue.500'}
          //     cursor={'pointer'}
          //     onClick={onOpen}
          //   />
          //   <Icon
          //     as={DeleteIcon}
          //     color={'red.500'}
          //     cursor={'pointer'}
          //     onClick={onDelOpen}
          //   />
          // </Stack>
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
                <MenuItem onClick={onSupOpen}>
                  {suppliers.length > 0 ? 'Update' : 'Add'} Supplier
                </MenuItem>
                <MenuItem onClick={onOpen}>Edit</MenuItem>
                <MenuItem onClick={onDelOpen}>Delete</MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )}

        {isOpen && (
          <ComponentDrawer
            id={id}
            isOpen={isOpen}
            onClose={onClose}
            btnRef={compBtn}
            component={component}
            version={version}
            license={licenses}
            type={type}
            refetch={refetch}
            cpes={cpes}
            purl={purl}
            primary={primary}
            internal={internal}
            suppliers={suppliers}
          />
        )}

        {isDelOpen && (
          <ComponentModal
            isOpen={isDelOpen}
            onClose={onDelClose}
            id={id}
            refetch={refetch}
          />
        )}

        {isSupOpen && (
          <SupplierModal
            id={id}
            refetch={refetch}
            isOpen={isSupOpen}
            onClose={onSupClose}
            suppliers={suppliers}
          />
        )}
      </Td>
    </Tr>
  )
}

export default SBOMComponentRow
